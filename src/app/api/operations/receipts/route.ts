import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReceiptSchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const body = await validateBody(req, ReceiptSchema);

    // ────────────────────────────────────────────────────────────
    // ACID Transaction: Process Receipt
    // 1. Create Document (RECEIPT)
    // 2. For each line: 
    //    a. Create DocumentLine
    //    b. Update/Upsert StockQuant
    //    c. Create StockLedger entry
    // ────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      const doc = await tx.document.create({
        data: {
          type: "RECEIPT",
          status: "VALIDATED",
          reference: `REC-${Date.now()}`,
          supplier: body.supplier,
          notes: body.notes,
          userId: user.id,
          validatedAt: new Date(),
        },
      });

      for (const line of body.lines) {
        // a. Create Line
        await tx.documentLine.create({
          data: {
            documentId: doc.id,
            productId: line.productId,
            quantity: line.quantity,
            destLocationId: line.destLocationId,
          },
        });

        // b. Upsert StockQuant (increase quantity)
        await tx.stockQuant.upsert({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: line.destLocationId,
            },
          },
          update: {
            quantity: { increment: line.quantity },
          },
          create: {
            productId: line.productId,
            locationId: line.destLocationId,
            quantity: line.quantity,
          },
        });

        // c. Append to Immutable StockLedger
        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: line.destLocationId,
            quantity: line.quantity,
            movement: "IN",
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
    console.error("[API] POST /api/operations/receipts error:", error);
    return apiResponse.error("Failed to process receipt");
  }
}

export async function GET() {
  try {
    const receipts = await prisma.document.findMany({
      where: { type: "RECEIPT" },
      include: {
        lines: { include: { product: true, destLocation: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiResponse.success(receipts);
  } catch (error) {
    console.error("[API] GET /api/operations/receipts error:", error);
    return apiResponse.error("Failed to fetch receipts");
  }
}
