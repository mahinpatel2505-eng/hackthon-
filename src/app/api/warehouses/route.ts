import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateWarehouseSchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { locations: true }
        }
      },
      orderBy: { name: "asc" },
    });
    return apiResponse.success(warehouses);
  } catch (error) {
    console.error("[API] GET /api/warehouses error:", error);
    return apiResponse.error("Failed to fetch warehouses");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const body = await validateBody(req, CreateWarehouseSchema);

    const warehouse = await prisma.warehouse.create({
      data: {
        name: body.name,
        address: body.address,
      },
    });

    return apiResponse.success(warehouse, 201);
  } catch (error: any) {
    if (error.name === "ZodError") return apiResponse.validationError(error.errors);
    console.error("[API] POST /api/warehouses error:", error);
    return apiResponse.error("Failed to create warehouse");
  }
}
