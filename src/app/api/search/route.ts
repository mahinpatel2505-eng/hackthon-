import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return apiResponse.success([]);
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      take: 10,
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
      },
    });

    return apiResponse.success(products);
  } catch (error) {
    console.error("[API] GET /api/search error:", error);
    return apiResponse.error("Search failed");
  }
}
