// 🏆 THE GOLDEN RULE TYPES
// Every AI prompt from every team member must be given these exact types!

export type Product = {
  id: string; // UUID
  sku: string; // Unique Barcode/SKU string
  name: string;
  category: string;
  uom: string; // Unit of Measure (e.g., 'kg', 'boxes', 'units')
  reorder_level?: number;
};

export type Location = {
  id: string; // UUID
  name: string; // e.g., 'Main Warehouse', 'Rack A'
  type: 'Warehouse' | 'Rack' | 'Production Floor';
};

export type StockQuantity = {
  id: string; // UUID
  product_id: string;
  location_id: string;
  quantity: number; // Current physical amount at this exact location
};

export type TransactionType = 'Receipt' | 'Delivery' | 'Internal' | 'Adjustment';
export type TransactionStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';

export type Transaction = {
  id: string; // UUID
  type: TransactionType;
  status: TransactionStatus;
  product_id: string;
  quantity: number; // Amount being moved
  
  // A Receipt only has a 'to_location' (coming from Vendor)
  // A Delivery only has a 'from_location' (going to Customer)
  // An Internal Transfer has both!
  from_location_id?: string | null; 
  to_location_id?: string | null;
  
  created_at: string; // ISO Date String
  updated_at: string;
};
