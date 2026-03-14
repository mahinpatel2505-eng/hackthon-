import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-utils";

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
