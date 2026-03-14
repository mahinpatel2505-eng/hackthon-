import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdjustmentSchema } from "@/lib/validators";
import {
  parseAndValidate,
  requireAuth,
  successResponse,
  errorResponse,
  serverError,
} from "@/lib/api-utils";

// ────────────────────────────────────────────────────────────
// POST /api/inventory/adjustment
// Fix physical stock mismatches.
// - For each line, takes the COUNTED physical quantity
// - Calculates delta = countedQuantity - currentSystemQuantity
// - Updates StockQuant to the counted value
// - Appends a StockLedger entry with the EXACT delta
//   (positive delta = IN, negative delta = OUT)
// All within a single ACID Serializable transaction.
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Auth guard
    const auth = requireAuth(request);
    if (auth.error) return auth.error;
    const { userId } = auth;

    // 2. Validate request body with Zod
    const parsed = await parseAndValidate(request, AdjustmentSchema);
    if (parsed.error) return parsed.error;
    const { notes, lines } = parsed.data;

    // 3. Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse("User not found", 404);

    // 4. Verify all referenced products and locations exist
    const productIds = [...new Set(lines.map((l: { productId: string }) => l.productId))];
    const locationIds = [...new Set(lines.map((l: { locationId: string }) => l.locationId))];

    const [products, locations] = await Promise.all([
      prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } }),
      prisma.location.findMany({ where: { id: { in: locationIds }, isActive: true } }),
    ]);

    if (products.length !== productIds.length) {
      return errorResponse("One or more product IDs are invalid or inactive", 422);
    }
    if (locations.length !== locationIds.length) {
      return errorResponse("One or more location IDs are invalid or inactive", 422);
    }

    // 5. Check for duplicate product-location pairs in request (prevent tampering)
    const seen = new Set<string>();
    for (const line of lines) {
      const key = `${line.productId}:${line.locationId}`;
      if (seen.has(key)) {
        return errorResponse(
          `Duplicate adjustment for product ${line.productId} at location ${line.locationId}`,
          422
        );
      }
      seen.add(key);
    }

    // 6. Execute within ACID transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // 6a. Create the Adjustment Document
        const document = await tx.document.create({
          data: {
            type: "ADJUSTMENT",
            status: "VALIDATED",
            notes: notes ?? "Stock adjustment based on physical count",
            userId,
            validatedAt: new Date(),
          },
        });

        // 6b. Process each adjustment line
        const adjustments = [];

        for (const line of lines) {
          // Read current system quantity
          const currentQuant = await tx.stockQuant.findUnique({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: line.locationId,
              },
            },
          });

          const currentQty = currentQuant?.quantity ?? 0;
          const delta = line.countedQuantity - currentQty;

          // Skip if no delta (stock matches physical count)
          if (delta === 0) {
            adjustments.push({
              productId: line.productId,
              locationId: line.locationId,
              previousQty: currentQty,
              countedQty: line.countedQuantity,
              delta: 0,
              skipped: true,
            });
            continue;
          }

          // Create DocumentLine with the absolute delta as quantity
          await tx.documentLine.create({
            data: {
              documentId: document.id,
              productId: line.productId,
              quantity: Math.abs(delta),
              sourceLocationId: delta < 0 ? line.locationId : null,
              destLocationId: delta > 0 ? line.locationId : null,
            },
          });

          // Update StockQuant to the exact counted value
          const updatedQuant = await tx.stockQuant.upsert({
            where: {
              productId_locationId: {
                productId: line.productId,
                locationId: line.locationId,
              },
            },
            create: {
              productId: line.productId,
              locationId: line.locationId,
              quantity: line.countedQuantity,
              reservedQty: 0,
            },
            update: {
              quantity: line.countedQuantity,
            },
          });

          // Append immutable StockLedger entry with exact delta
          await tx.stockLedger.create({
            data: {
              productId: line.productId,
              locationId: line.locationId,
              movement: delta > 0 ? "IN" : "OUT",
              quantity: Math.abs(delta),
              balanceAfter: updatedQuant.quantity,
              documentRef: document.reference,
              description: `Stock adjustment: system had ${currentQty}, physical count ${line.countedQuantity} (delta: ${delta > 0 ? "+" : ""}${delta})`,
              userId,
            },
          });

          adjustments.push({
            productId: line.productId,
            locationId: line.locationId,
            previousQty: currentQty,
            countedQty: line.countedQuantity,
            delta,
            skipped: false,
          });
        }

        return { document, adjustments };
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
        adjustments: result.adjustments,
      },
      "Stock adjustment validated and applied successfully",
      201
    );
  } catch (error) {
    return serverError(error);
  }
}
