import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransferSchema } from "@/lib/validators";
import {
  parseAndValidate,
  requireAuth,
  successResponse,
  errorResponse,
  serverError,
} from "@/lib/api-utils";

// ────────────────────────────────────────────────────────────
// POST /api/inventory/transfer
// Move stock between internal locations.
// - Verifies sufficient stock at source BEFORE moving
// - Decrements source StockQuant
// - Increments destination StockQuant
// - Appends TWO StockLedger entries per line (OUT from source, IN to dest)
// - Global stock total remains unchanged
// All within a single ACID Serializable transaction.
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Auth guard
    const auth = requireAuth(request);
    if (auth.error) return auth.error;
    const { userId } = auth;

    // 2. Validate request body with Zod
    const parsed = await parseAndValidate(request, TransferSchema);
    if (parsed.error) return parsed.error;
    const { notes, lines } = parsed.data;

    // 3. Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse("User not found", 404);

    // 4. Verify all referenced products and locations exist
    const productIds = [...new Set(lines.map((l: { productId: string }) => l.productId))];
    const allLocationIds = [
      ...new Set([
        ...lines.map((l: { sourceLocationId: string }) => l.sourceLocationId),
        ...lines.map((l: { destLocationId: string }) => l.destLocationId),
      ]),
    ];

    const [products, locations] = await Promise.all([
      prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } }),
      prisma.location.findMany({ where: { id: { in: allLocationIds }, isActive: true } }),
    ]);

    if (products.length !== productIds.length) {
      return errorResponse("One or more product IDs are invalid or inactive", 422);
    }
    if (locations.length !== allLocationIds.length) {
      return errorResponse("One or more location IDs are invalid or inactive", 422);
    }

    // 5. Validate no self-transfers
    for (const line of lines) {
      if (line.sourceLocationId === line.destLocationId) {
        return errorResponse(
          `Cannot transfer product ${line.productId} to the same location`,
          422
        );
      }
    }

    // 6. Execute within ACID transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // 6a. Pre-check: Verify sufficient stock for ALL lines at source
        for (const line of lines) {
          const currentStock = await tx.stockQuant.findUnique({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: line.sourceLocationId,
              },
            },
          });

          const availableQty = currentStock
            ? currentStock.quantity - currentStock.reservedQty
            : 0;

          if (availableQty < line.quantity) {
            const product = products.find((p: { id: string }) => p.id === line.productId);
            throw new Error(
              `Insufficient stock for "${product?.name ?? line.productId}" ` +
              `at source location. Available: ${availableQty}, Requested: ${line.quantity}`
            );
          }
        }

        // 6b. Create the Document
        const document = await tx.document.create({
          data: {
            type: "INTERNAL_TRANSFER",
            status: "VALIDATED",
            notes,
            userId,
            validatedAt: new Date(),
          },
        });

        // 6c. Process each line item
        const ledgerEntries = [];

        for (const line of lines) {
          // Create DocumentLine
          await tx.documentLine.create({
            data: {
              documentId: document.id,
              productId: line.productId,
              quantity: line.quantity,
              sourceLocationId: line.sourceLocationId,
              destLocationId: line.destLocationId,
            },
          });

          // Decrement source StockQuant
          const updatedSource = await tx.stockQuant.update({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: line.sourceLocationId,
              },
            },
            data: {
              quantity: { decrement: line.quantity },
            },
          });

          // Safety: source must not go negative
          if (updatedSource.quantity < 0) {
            throw new Error(
              `Race condition detected: stock for product ${line.productId} went negative at source. Transaction rolled back.`
            );
          }

          // Upsert destination StockQuant (increment)
          const updatedDest = await tx.stockQuant.upsert({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: line.destLocationId,
              },
            },
            create: {
              productId: line.productId,
              locationId: line.destLocationId,
              quantity: line.quantity,
              reservedQty: 0,
            },
            update: {
              quantity: { increment: line.quantity },
            },
          });

          // Append TWO immutable StockLedger entries (OUT from source, IN to dest)
          const destLocation = locations.find((loc: { id: string }) => loc.id === line.destLocationId);
          const sourceLocation = locations.find((loc: { id: string }) => loc.id === line.sourceLocationId);

          const outEntry = await tx.stockLedger.create({
            data: {
              productId: line.productId,
              locationId: line.sourceLocationId,
              movement: "OUT",
              quantity: line.quantity,
              balanceAfter: updatedSource.quantity,
              documentRef: document.reference,
              description: `Internal transfer OUT to ${destLocation?.name ?? line.destLocationId}`,
              userId,
            },
          });

          const inEntry = await tx.stockLedger.create({
            data: {
              productId: line.productId,
              locationId: line.destLocationId,
              movement: "IN",
              quantity: line.quantity,
              balanceAfter: updatedDest.quantity,
              documentRef: document.reference,
              description: `Internal transfer IN from ${sourceLocation?.name ?? line.sourceLocationId}`,
              userId,
            },
          });

          ledgerEntries.push(outEntry, inEntry);
        }

        return { document, ledgerEntries };
      },
      {
        isolationLevel: "Serializable" as const,
        timeout: 15000,
      }
    );

    return successResponse(
      {
        documentId: result.document.id,
        reference: result.document.reference,
        ledgerEntriesCreated: result.ledgerEntries.length,
      },
      "Transfer validated. Stock moved between locations successfully",
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Insufficient stock")) {
      return errorResponse(error.message, 409);
    }
    if (error instanceof Error && error.message.startsWith("Race condition")) {
      return errorResponse(error.message, 409);
    }
    return serverError(error);
  }
}
