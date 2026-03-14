import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransferSchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const body = await validateBody(req, TransferSchema);

    // ────────────────────────────────────────────────────────────
    // ACID Transaction: Internal Transfer
    // ────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Document
      const doc = await tx.document.create({
        data: {
          type: "INTERNAL_TRANSFER",
          status: "VALIDATED",
          reference: `TRF-${Date.now()}`,
          notes: body.notes,
          userId: user.id,
          validatedAt: new Date(),
        },
      });

      for (const line of body.lines) {
        // 2. Verify Source Stock
        const sourceStock = await tx.stockQuant.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.sourceLocationId,
            },
          },
        });

        if (!sourceStock || sourceStock.quantity < line.quantity) {
          throw new Error(`Insufficient stock for product ID ${line.productId} at the source location.`);
        }

        // 3. Move Stock: Decrease Source
        await tx.stockQuant.update({
          where: { id: sourceStock.id },
          data: { quantity: { decrement: line.quantity } },
        });

        // 4. Move Stock: Increase Destination (Upsert)
        await tx.stockQuant.upsert({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.destLocationId,
            },
          },
          update: { quantity: { increment: line.quantity } },
          create: {
            productId: line.productId,
            locationId: line.destLocationId,
            quantity: line.quantity,
          },
        });

        // 5. Create Line
        await tx.documentLine.create({
          data: {
            documentId: doc.id,
            productId: line.productId,
            quantity: line.quantity,
            sourceLocationId: line.sourceLocationId,
            destLocationId: line.destLocationId,
          },
        });

        // 6. Double Ledger Entry (Audit)
        // a. OUT from source
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

        // b. IN to destination
        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.destLocationId,
            quantity: line.quantity,
            movement: "IN",
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
    console.error("[API] POST /api/operations/transfers error:", error);
    return apiResponse.error(error.message || "Failed to process transfer");
  }
}

export async function GET() {
  try {
    const transfers = await prisma.document.findMany({
      where: { type: "INTERNAL_TRANSFER" },
      include: {
        lines: { include: { product: true, sourceLocation: true, destLocation: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiResponse.success(transfers);
  } catch (error) {
    console.error("[API] GET /api/operations/transfers error:", error);
    return apiResponse.error("Failed to fetch transfers");
  }
}
