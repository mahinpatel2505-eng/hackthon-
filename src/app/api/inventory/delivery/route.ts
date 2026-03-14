import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DeliverySchema } from "@/lib/validators";
import {
  parseAndValidate,
  requireAuth,
  successResponse,
  errorResponse,
  serverError,
} from "@/lib/api-utils";

// ────────────────────────────────────────────────────────────
// POST /api/inventory/delivery
// Process outgoing stock to a customer.
// - Verifies sufficient stock exists BEFORE decrementing
// - Creates a VALIDATED Document + DocumentLines
// - Decrements StockQuant for each line
// - Appends immutable StockLedger entries (OUT)
// All within a single ACID Serializable transaction.
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Auth guard
    const auth = requireAuth(request);
    if (auth.error) return auth.error;
    const { userId } = auth;

    // 2. Validate request body with Zod
    const parsed = await parseAndValidate(request, DeliverySchema);
    if (parsed.error) return parsed.error;
    const { customer, notes, lines } = parsed.data;

    // 3. Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse("User not found", 404);

    // 4. Verify all referenced products and locations exist
    const productIds = [...new Set(lines.map((l: { productId: string }) => l.productId))];
    const locationIds = [...new Set(lines.map((l: { sourceLocationId: string }) => l.sourceLocationId))];

    const [products, locations] = await Promise.all([
      prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } }),
      prisma.location.findMany({ where: { id: { in: locationIds }, isActive: true } }),
    ]);

    if (products.length !== productIds.length) {
      return errorResponse("One or more product IDs are invalid or inactive", 422);
    }
    if (locations.length !== locationIds.length) {
      return errorResponse("One or more source location IDs are invalid or inactive", 422);
    }

    // 5. Execute within ACID transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // 5a. Pre-check: Verify sufficient stock for ALL lines before any mutation
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
              `at this location. Available: ${availableQty}, Requested: ${line.quantity}`
            );
          }
        }

        // 5b. Create the Document
        const document = await tx.document.create({
          data: {
            type: "DELIVERY",
            status: "VALIDATED",
            customer,
            notes,
            userId,
            validatedAt: new Date(),
          },
        });

        // 5c. Process each line item
        const ledgerEntries = [];

        for (const line of lines) {
          // Create DocumentLine
          await tx.documentLine.create({
            data: {
              documentId: document.id,
              productId: line.productId,
              quantity: line.quantity,
              sourceLocationId: line.sourceLocationId,
            },
          });

          // Decrement StockQuant — atomic decrement prevents race conditions
          const updatedQuant = await tx.stockQuant.update({
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

          // Safety: double-check quantity never goes negative
          if (updatedQuant.quantity < 0) {
            throw new Error(
              `Race condition detected: stock for product ${line.productId} went negative. Transaction rolled back.`
            );
          }

          // Append immutable StockLedger entry
          const ledgerEntry = await tx.stockLedger.create({
            data: {
              productId: line.productId,
              locationId: line.sourceLocationId,
              movement: "OUT",
              quantity: line.quantity,
              balanceAfter: updatedQuant.quantity,
              documentRef: document.reference,
              description: `Delivery to customer: ${customer}`,
              userId,
            },
          });

          ledgerEntries.push(ledgerEntry);
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
      "Delivery validated and stock decreased successfully",
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
