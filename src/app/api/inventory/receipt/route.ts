import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReceiptSchema } from "@/lib/validators";
import {
  parseAndValidate,
  requireAuth,
  successResponse,
  errorResponse,
  serverError,
} from "@/lib/api-utils";

// ────────────────────────────────────────────────────────────
// POST /api/inventory/receipt
// Process incoming stock from a supplier.
// - Creates a VALIDATED Document + DocumentLines
// - Upserts StockQuant (increase) for each line
// - Appends immutable StockLedger entries (IN)
// All within a single ACID transaction.
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Auth guard
    const auth = requireAuth(request);
    if (auth.error) return auth.error;
    const { userId } = auth;

    // 2. Validate request body with Zod
    const parsed = await parseAndValidate(request, ReceiptSchema);
    if (parsed.error) return parsed.error;
    const { supplier, notes, lines } = parsed.data;

    // 3. Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse("User not found", 404);

    // 4. Verify all referenced products and locations exist
    const productIds = [...new Set(lines.map((l: { productId: string }) => l.productId))];
    const locationIds = [...new Set(lines.map((l: { destLocationId: string }) => l.destLocationId))];

    const [products, locations] = await Promise.all([
      prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } }),
      prisma.location.findMany({ where: { id: { in: locationIds }, isActive: true } }),
    ]);

    if (products.length !== productIds.length) {
      return errorResponse("One or more product IDs are invalid or inactive", 422);
    }
    if (locations.length !== locationIds.length) {
      return errorResponse("One or more destination location IDs are invalid or inactive", 422);
    }

    // 5. Execute within ACID transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // 5a. Create the Document (auto-validated for receipts)
        const document = await tx.document.create({
          data: {
            type: "RECEIPT",
            status: "VALIDATED",
            supplier,
            notes,
            userId,
            validatedAt: new Date(),
          },
        });

        // 5b. Process each line item
        const ledgerEntries = [];

        for (const line of lines) {
          // Create DocumentLine
          await tx.documentLine.create({
            data: {
              documentId: document.id,
              productId: line.productId,
              quantity: line.quantity,
              destLocationId: line.destLocationId,
            },
          });

          // Upsert StockQuant — atomic increment prevents race conditions
          const updatedQuant = await tx.stockQuant.upsert({
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

          // Append immutable StockLedger entry
          const ledgerEntry = await tx.stockLedger.create({
            data: {
              productId: line.productId,
              locationId: line.destLocationId,
              movement: "IN",
              quantity: line.quantity,
              balanceAfter: updatedQuant.quantity,
              documentRef: document.reference,
              description: `Receipt from supplier: ${supplier}`,
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
      "Receipt validated and stock updated successfully",
      201
    );
  } catch (error) {
    return serverError(error);
  }
}
