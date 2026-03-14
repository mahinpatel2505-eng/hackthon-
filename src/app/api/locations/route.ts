import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateLocationSchema } from "@/lib/validators";
import { apiResponse, validateBody, authGuard } from "@/lib/api-utils";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      include: {
        warehouse: {
          select: { name: true }
        }
      },
      orderBy: { name: "asc" },
    });
    return apiResponse.success(locations);
  } catch (error) {
    console.error("[API] GET /api/locations error:", error);
    return apiResponse.error("Failed to fetch locations");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const body = await validateBody(req, CreateLocationSchema);

    const location = await prisma.location.create({
      data: {
        name: body.name,
        type: body.type,
        warehouseId: body.warehouseId,
      },
    });

    return apiResponse.success(location, 201);
  } catch (error: any) {
    if (error.name === "ZodError") return apiResponse.validationError(error.errors);
    console.error("[API] POST /api/locations error:", error);
    return apiResponse.error("Failed to create location");
  }
}
