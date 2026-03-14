import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const body = await validateBody(req, productSchema);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        category: body.category,
        brand: body.brand,
        manufacturer: body.manufacturer,
        costPrice: body.costPrice,
        salePrice: body.salePrice,
        weight: body.weight,
        dimensions: body.dimensions,
        uom: body.uom,
        barcode: body.barcode,
        reorderLevel: body.reorderLevel,
      } as any, // Use any casting to avoid potential Prisma type lag during generation
    });

    return apiResponse.success(product, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiResponse.validationError(error.issues);
    }
    
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
