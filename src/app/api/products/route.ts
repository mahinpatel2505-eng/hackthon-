import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Guard (Stub for hackathon)
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    // 2. Validate Body
    const body = await validateBody(req, productSchema);

    // 3. Create Product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        category: body.category,
        uom: body.uom,
        barcode: body.barcode,
        reorderLevel: body.reorderLevel,
      },
    });

    return apiResponse.success(product, 201);
  } catch (error: any) {
    if (error.name === "ZodError") return apiResponse.validationError(error.errors);
    
    // Handle unique constraint (SKU)
    if (error.code === "P2002") {
      return apiResponse.error("A product with this SKU already exists.", 409);
    }

    console.error("[API] POST /api/products error:", error);
    return apiResponse.error("Failed to create product");
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    return apiResponse.success(products);
  } catch (error) {
    console.error("[API] GET /api/products error:", error);
    return apiResponse.error("Failed to fetch products");
  }
}
