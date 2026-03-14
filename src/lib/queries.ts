import { prisma } from "@/lib/prisma";

// ────────────────────────────────────────────────────────────
// Dashboard KPI Queries (Server-side only)
// ────────────────────────────────────────────────────────────

export async function getDashboardKPIs() {
  const [
    totalProducts,
    lowStockItems,
    outOfStockItems,
    pendingReceipts,
    pendingDeliveries,
    pendingTransfers,
  ] = await Promise.all([
    // Total active products
    prisma.product.count({ where: { isActive: true } }),

    // Products below reorder level (but > 0)
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT sq."productId")::bigint as count
      FROM stock_quants sq
      JOIN products p ON p.id = sq."productId"
      WHERE p."isActive" = true
        AND sq.quantity > 0
        AND sq.quantity <= p."reorderLevel"
    `.then((r: [{ count: bigint }]) => Number(r[0]?.count ?? 0)),

    // Products with zero stock across all locations
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint as count FROM products p
      WHERE p."isActive" = true
        AND NOT EXISTS (
          SELECT 1 FROM stock_quants sq
          WHERE sq."productId" = p.id AND sq.quantity > 0
        )
    `.then((r: [{ count: bigint }]) => Number(r[0]?.count ?? 0)),

    // Pending receipts (DRAFT status)
    prisma.document.count({
      where: { type: "RECEIPT", status: "DRAFT" },
    }),

    // Pending deliveries (DRAFT status)
    prisma.document.count({
      where: { type: "DELIVERY", status: "DRAFT" },
    }),

    // Pending transfers (DRAFT status)
    prisma.document.count({
      where: { type: "INTERNAL_TRANSFER", status: "DRAFT" },
    }),
  ]);

  return {
    totalProducts,
    lowStockItems,
    outOfStockItems,
    pendingReceipts,
    pendingDeliveries,
    pendingTransfers,
  };
}

// ────────────────────────────────────────────────────────────
// Recent Operations Query (with dynamic filters)
// ────────────────────────────────────────────────────────────

interface OperationFilters {
  documentType?: "RECEIPT" | "DELIVERY" | "INTERNAL_TRANSFER" | "ADJUSTMENT";
  status?: "DRAFT" | "VALIDATED" | "CANCELLED";
  locationId?: string;
  category?: string;
  limit: number;
  offset: number;
}

export async function getRecentOperations(filters: OperationFilters) {
  const where: Record<string, unknown> = {};

  if (filters.documentType) {
    where.type = filters.documentType;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const documents = await prisma.document.findMany({
    where,
    include: {
      user: { select: { name: true } },
      lines: {
        include: {
          product: { select: { name: true, sku: true, category: true } },
          sourceLocation: { select: { name: true } },
          destLocation: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit,
    skip: filters.offset,
  });

  return documents.map((doc: typeof documents[number]) => ({
    id: doc.id,
    reference: doc.reference,
    type: doc.type,
    status: doc.status,
    supplier: doc.supplier,
    customer: doc.customer,
    notes: doc.notes,
    userName: doc.user.name,
    createdAt: doc.createdAt.toISOString(),
    validatedAt: doc.validatedAt?.toISOString() ?? null,
    lineCount: doc.lines.length,
    totalQuantity: doc.lines.reduce((sum: number, l: typeof doc.lines[number]) => sum + l.quantity, 0),
    lines: doc.lines.map((line: typeof doc.lines[number]) => ({
      productName: line.product.name,
      productSku: line.product.sku,
      category: line.product.category,
      quantity: line.quantity,
      sourceLocation: line.sourceLocation?.name ?? null,
      destLocation: line.destLocation?.name ?? null,
    })),
  }));
}

// ────────────────────────────────────────────────────────────
// Filter Options Queries (for dropdowns)
// ────────────────────────────────────────────────────────────

export async function getFilterOptions() {
  const [categories, locations] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    categories: categories.map((c: { category: string }) => c.category),
    locations: locations.map((l: { id: string; name: string; type: string }) => ({
      id: l.id,
      name: l.name,
      type: l.type,
    })),
  };
}

export async function getProducts(search?: string) {
  try {
    const products = await prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        stockQuants: {
          include: {
            location: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return products.map((p: any) => ({
      ...p,
      totalStock: p.stockQuants.reduce((sum: number, sq: any) => sum + sq.quantity, 0),
    }));
  } catch (error) {
    console.error("[QUERIES] getProducts error:", error);
    return [];
  }
}

export async function getReceipts() {
  try {
    return await prisma.document.findMany({
      where: { type: "RECEIPT" },
      include: {
        lines: {
          include: {
            product: true,
            destLocation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[QUERIES] getReceipts error:", error);
    return [];
  }
}

export async function getWarehouses() {
  try {
    return await prisma.warehouse.findMany({
      include: {
        locations: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("[QUERIES] getWarehouses error:", error);
    return [];
  }
}
export async function getDeliveries() {
  try {
    return await prisma.document.findMany({
      where: { type: "DELIVERY" },
      include: {
        lines: {
          include: {
            product: true,
            sourceLocation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[QUERIES] getDeliveries error:", error);
    return [];
  }
}

export async function getTransfers() {
  try {
    return await prisma.document.findMany({
      where: { type: "INTERNAL_TRANSFER" },
      include: {
        lines: {
          include: {
            product: true,
            sourceLocation: true,
            destLocation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[QUERIES] getTransfers error:", error);
    return [];
  }
}

export async function getAdjustments() {
  try {
    return await prisma.document.findMany({
      where: { type: "ADJUSTMENT" },
      include: {
        lines: {
          include: {
            product: true,
            sourceLocation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[QUERIES] getAdjustments error:", error);
    return [];
  }
}

export async function getLedgerEntries() {
  try {
    return await prisma.stockLedger.findMany({
      include: {
        product: true,
        location: { include: { warehouse: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to recent 100 movements for performance
    });
  } catch (error) {
    console.error("[QUERIES] getLedgerEntries error:", error);
    return [];
  }
}
