import { z } from "zod";

// ────────────────────────────────────────────────────────────
// Shared Enums (mirrors Prisma enums for runtime validation)
// ────────────────────────────────────────────────────────────

export const UserRoleEnum = z.enum(["ADMIN", "MANAGER", "STAFF"]);
export const DocumentTypeEnum = z.enum([
  "RECEIPT",
  "DELIVERY",
  "INTERNAL_TRANSFER",
  "ADJUSTMENT",
]);
export const DocumentStatusEnum = z.enum(["DRAFT", "VALIDATED", "CANCELLED"]);
export const LocationTypeEnum = z.enum(["WAREHOUSE", "RACK", "BIN", "STAGING"]);
export const LedgerMovementEnum = z.enum(["IN", "OUT"]);

// ────────────────────────────────────────────────────────────
// Auth Schemas
// ────────────────────────────────────────────────────────────

export const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a digit"
    ),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const OtpRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const OtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8),
});

// ────────────────────────────────────────────────────────────
// Product Schemas
// ────────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .regex(/^[A-Z0-9\-]+$/, "SKU must be uppercase alphanumeric with dashes"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  costPrice: z.number().min(0).optional().default(0),
  salePrice: z.number().min(0).optional().default(0),
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  uom: z.string().default("pcs"),
  unitOfMeasure: z.string().optional(), // backward compatibility
  barcode: z.string().optional(),
  reorderLevel: z.number().int().min(0).default(10),
});

export const UpdateProductSchema = productSchema.partial().extend({
  id: z.string().cuid(),
});

// ────────────────────────────────────────────────────────────
// Location / Warehouse Schemas
// ────────────────────────────────────────────────────────────

export const CreateWarehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  address: z.string().optional(),
});

export const CreateLocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  type: LocationTypeEnum.default("RACK"),
  warehouseId: z.string().cuid("Invalid warehouse ID"),
});

// ────────────────────────────────────────────────────────────
// Inventory Operation Schemas (Phase 2 API inputs)
// ────────────────────────────────────────────────────────────

const DocumentLineSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  sourceLocationId: z.string().cuid().optional(),
  destLocationId: z.string().cuid().optional(),
});

export const ReceiptSchema = z.object({
  supplier: z.string().min(1, "Supplier name is required"),
  notes: z.string().optional(),
  lines: z
    .array(
      DocumentLineSchema.extend({
        destLocationId: z.string().cuid("Destination location is required"),
      })
    )
    .min(1, "At least one product line is required"),
});

export const DeliverySchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  notes: z.string().optional(),
  lines: z
    .array(
      DocumentLineSchema.extend({
        sourceLocationId: z.string().cuid("Source location is required"),
      })
    )
    .min(1, "At least one product line is required"),
});

export const TransferSchema = z.object({
  notes: z.string().optional(),
  lines: z
    .array(
      DocumentLineSchema.extend({
        sourceLocationId: z.string().cuid("Source location is required"),
        destLocationId: z.string().cuid("Destination location is required"),
      })
    )
    .min(1, "At least one product line is required"),
});

export const AdjustmentSchema = z.object({
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().cuid("Invalid product ID"),
        locationId: z.string().cuid("Invalid location ID"),
        countedQuantity: z.number().min(0, "Counted quantity cannot be negative"),
      })
    )
    .min(1, "At least one adjustment line is required"),
});

// ────────────────────────────────────────────────────────────
// Query / Filter Schemas
// ────────────────────────────────────────────────────────────

export const DashboardFilterSchema = z.object({
  documentType: DocumentTypeEnum.optional(),
  status: DocumentStatusEnum.optional(),
  locationId: z.string().cuid().optional(),
  category: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// ────────────────────────────────────────────────────────────
// Type Exports (inferred from Zod schemas)
// ────────────────────────────────────────────────────────────

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateWarehouseInput = z.infer<typeof CreateWarehouseSchema>;
export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type ReceiptInput = z.infer<typeof ReceiptSchema>;
export type DeliveryInput = z.infer<typeof DeliverySchema>;
export type TransferInput = z.infer<typeof TransferSchema>;
export type AdjustmentInput = z.infer<typeof AdjustmentSchema>;
export type DashboardFilterInput = z.infer<typeof DashboardFilterSchema>;
