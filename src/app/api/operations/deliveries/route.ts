import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DeliverySchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const body = await validateBody(req, DeliverySchema);

    // ────────────────────────────────────────────────────────────
    // ACID Transaction: Process Delivery
    // ────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Document
      const doc = await tx.document.create({
        data: {
          type: "DELIVERY",
          status: "VALIDATED",
          reference: `DEL-${Date.now()}`,
          customer: body.customer,
          notes: body.notes,
          userId: user.id,
          validatedAt: new Date(),
        },
      });

      for (const line of body.lines) {
        // 2. Verify Stock Availability
        const stockRecord = await tx.stockQuant.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.sourceLocationId,
            },
          },
        });

        if (!stockRecord || stockRecord.quantity < line.quantity) {
          throw new Error(`Insufficient stock for product ID ${line.productId} at the selected location.`);
        }

        // 3. Update/Decrease StockQuant
        await tx.stockQuant.update({
          where: { id: stockRecord.id },
          data: {
            quantity: { decrement: line.quantity },
          },
        });

        // 4. Create Line
        await tx.documentLine.create({
          data: {
            documentId: doc.id,
            productId: line.productId,
            quantity: line.quantity,
            sourceLocationId: line.sourceLocationId,
          },
        });

        // 5. Append to Immutable StockLedger (movement OUT)
        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.sourceLocationId,
            quantity: line.quantity,
            movement: "OUT",
            documentRef: doc.reference,
            userId: user.id,
          },
        });
      }

      return doc;
    });

    return apiResponse.success(result, 201);
  } catch (error: any) {
    if (error.name === "ZodError") return apiResponse.validationError(error.errors);
    console.error("[API] POST /api/operations/deliveries error:", error);
    return apiResponse.error(error.message || "Failed to process delivery");
  }
}

export async function GET() {
  try {
    const deliveries = await prisma.document.findMany({
      where: { type: "DELIVERY" },
      include: {
        lines: { include: { product: true, sourceLocation: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiResponse.success(deliveries);
  } catch (error) {
    console.error("[API] GET /api/operations/deliveries error:", error);
    return apiResponse.error("Failed to fetch deliveries");
  }
}
