// ============================================================
// CoreInventory — Shared TypeScript Types
// These are inferred FROM the Prisma schema + Zod validators.
// Import Zod-inferred types from @/lib/validators for input payloads.
// Import Prisma-generated types from @prisma/client for DB models.
// ============================================================

// Re-export Prisma-generated types for convenience
export type {
  User,
  Product,
  Warehouse,
  Location,
  Document,
  DocumentLine,
  StockQuant,
  StockLedger,
  UserRole,
  DocumentType,
  DocumentStatus,
  LocationType,
  LedgerMovement,
} from "@prisma/client";

// Re-export Zod-inferred input types
export type {
  SignUpInput,
  LoginInput,
  CreateProductInput,
  UpdateProductInput,
  CreateWarehouseInput,
  CreateLocationInput,
  ReceiptInput,
  DeliveryInput,
  TransferInput,
  AdjustmentInput,
  DashboardFilterInput,
} from "@/lib/validators";

// ────────────────────────────────────────────────────────────
// Dashboard KPI Types (used by the UI in Phase 3)
// ────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
}

export interface RecentOperation {
  id: string;
  reference: string;
  type: string;
  status: string;
  productName: string;
  quantity: number;
  locationName: string;
  userName: string;
  createdAt: string;
}

// ────────────────────────────────────────────────────────────
// API Response Wrapper
// ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
