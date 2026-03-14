import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdjustmentSchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const body = await validateBody(req, AdjustmentSchema);

    // ────────────────────────────────────────────────────────────
    // ACID Transaction: Stock Adjustment
    // ────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Document
      const doc = await tx.document.create({
        data: {
          type: "ADJUSTMENT",
          status: "VALIDATED",
          reference: `ADJ-${Date.now()}`,
          notes: body.notes,
          userId: user.id,
          validatedAt: new Date(),
        },
      });

      for (const line of body.lines) {
        // 2. Get Current Stock
        const currentStock = await tx.stockQuant.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.locationId,
            },
          },
        });

        const currentQty = currentStock?.quantity || 0;
        const delta = line.countedQuantity - currentQty;

        if (delta === 0) continue; // No change needed

        // 3. Update StockQuant to the Counted Quantity
        await tx.stockQuant.upsert({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.locationId,
            },
          },
          update: { quantity: line.countedQuantity },
          create: {
            productId: line.productId,
            locationId: line.locationId,
            quantity: line.countedQuantity,
          },
        });

        // 4. Create DocumentLine
        await tx.documentLine.create({
          data: {
            documentId: doc.id,
            productId: line.productId,
            quantity: Math.abs(delta),
            sourceLocationId: line.locationId, // sourceLocation used for adjustments
          },
        });

        // 5. Append to Immutable StockLedger (with discrepancy delta)
        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.locationId,
            quantity: Math.abs(delta),
            movement: delta > 0 ? "IN" : "OUT",
            reference: doc.reference,
            userId: user.id,
          },
        });
      }

      return doc;
    });

    return apiResponse.success(result, 201);
  } catch (error: any) {
    if (error.name === "ZodError") return apiResponse.validationError(error.errors);
    console.error("[API] POST /api/operations/adjustments error:", error);
    return apiResponse.error("Failed to process adjustment");
  }
}

export async function GET() {
  try {
    const adjustments = await prisma.document.findMany({
      where: { type: "ADJUSTMENT" },
      include: {
        lines: { include: { product: true, sourceLocation: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiResponse.success(adjustments);
  } catch (error) {
    console.error("[API] GET /api/operations/adjustments error:", error);
    return apiResponse.error("Failed to fetch adjustments");
  }
}
