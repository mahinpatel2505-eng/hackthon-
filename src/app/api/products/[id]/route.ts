import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";
import { z } from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const id = params.id;
    const body = await validateBody(req, productSchema);

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id, isActive: true }
    });

    if (!existingProduct) {
      return apiResponse.error("Product not found", 404);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
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
      } as any,
    });

    return apiResponse.success(updatedProduct);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiResponse.validationError(error.issues);
    }
    
    if (error.code === "P2002") {
      return apiResponse.error("A product with this SKU already exists.", 409);
    }

    console.error(`[API] PATCH /api/products/${params.id} error:`, error);
    return apiResponse.error("Failed to update product");
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id, isActive: true },
      include: {
        stockQuants: {
          include: {
            location: true,
          }
        }
      }
    });

    if (!product) return apiResponse.error("Product not found", 404);

    return apiResponse.success(product);
  } catch (error) {
    console.error(`[API] GET /api/products/${params.id} error:`, error);
    return apiResponse.error("Failed to fetch product");
  }
}
