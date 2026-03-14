import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse, authGuard } from "@/lib/api-utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authGuard(req);
    if (!user) return apiResponse.unauthorized();

    const warehouseId = params.id;

    // Check if there are active locations in this warehouse
    const locationsCount = await prisma.location.count({
      where: {
        warehouseId,
        isActive: true,
      },
    });

    if (locationsCount > 0) {
      return apiResponse.error(
        "Cannot delete warehouse with active locations. Please delete locations first.",
        400
      );
    }

    // Soft delete the warehouse
    await prisma.warehouse.update({
      where: { id: warehouseId },
      data: { isActive: false },
    });

    return apiResponse.success({ message: "Warehouse deleted successfully" });
  } catch (error) {
    console.error("[API] DELETE /api/warehouses/[id] error:", error);
    return apiResponse.error("Failed to delete warehouse");
  }
}
