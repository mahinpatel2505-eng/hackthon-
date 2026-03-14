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

    const locationId = params.id;

    // Check if there's any pending or historical stock in this location
    // In a real system, you might only check of current quantity > 0
    // But for hackathon safety, we'll check if any StockQuant exists with quantity > 0
    const stockCount = await prisma.stockQuant.aggregate({
      where: {
        locationId,
      },
      _sum: {
        quantity: true,
      },
    });

    const totalQuantity = stockCount._sum.quantity || 0;

    if (totalQuantity > 0) {
      return apiResponse.error(
        `Cannot delete location with existing stock (${totalQuantity} units). Move stock before deleting.`,
        400
      );
    }

    // Soft delete the location
    await prisma.location.update({
      where: { id: locationId },
      data: { isActive: false },
    });

    return apiResponse.success({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("[API] DELETE /api/locations/[id] error:", error);
    return apiResponse.error("Failed to delete location");
  }
}
