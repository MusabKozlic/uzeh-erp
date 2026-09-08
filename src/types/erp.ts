export type MovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'CUSTOMER_RETURN'
  | 'SUPPLIER_RETURN'
  | 'WRITE_OFF'
  | 'INVENTORY_ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export type DocumentStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

export type InventoryCountStatus = 'DRAFT' | 'COUNTING' | 'CONFIRMED' | 'POSTED';

export type PriceType = 'REGULAR' | 'ACTION' | 'SPECIAL';

export type WriteOffReason =
  | 'DAMAGED'
  | 'EXPIRED'
  | 'MISSING'
  | 'THEFT'
  | 'DONATION'
  | 'OTHER';

export type PartnerType = 'LEGAL' | 'INDIVIDUAL';
export type PartnerRole = 'SUPPLIER' | 'CUSTOMER';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  display_order: number;
  is_active: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  decimal_allowed: boolean;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number; // e.g. 17 for 17%
  valid_from: string;
  valid_to?: string | null;
  active: boolean;
}

export interface Partner {
  id: string;
  type: PartnerType;
  name: string;
  jib?: string | null;
  pib?: string | null;
  address: string;
  city: string;
  phone: string;
  email: string;
  roles: PartnerRole[];
  active: boolean;
  created_at: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  active: boolean;
  created_at: string;
}

export interface ProductIdentifier {
  id: string;
  product_id: string;
  type: 'BARCODE' | 'EAN' | 'SUPPLIER_CODE' | 'INTERNAL_CODE';
  value: string;
  is_primary: boolean;
}

export interface ArticlePrice {
  id: string;
  product_id: string;
  price: number;
  price_type: PriceType;
  valid_from: string;
  valid_to?: string | null;
  reason?: string;
  source_document_id?: string | null;
  created_by: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  category_id: string;
  category_name?: string;
  brand_id?: string | null;
  unit_id: string;
  unit_code?: string;
  tax_rate_id: string;
  tax_rate?: number;
  active: boolean;
  // Computed fields (from stock movements & article_prices)
  current_purchase_price: number;
  current_price: number;
  stock_quantity: number;
  stock_value: number;
  created_at: string;
  updated_at: string;
  identifiers?: ProductIdentifier[];
}

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number; // positive = increase, negative = decrease
  movement_type: MovementType;
  reference_type: string;
  reference_id: string;
  reference_number?: string;
  unit_cost: number;
  created_at: string;
  created_by: string;
}

export interface RetailCalculationLine {
  id: string;
  calculation_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  unit: string;
  quantity: number;
  purchase_price: number; // Fakturna cijena
  additional_cost: number; // Trošak nabave
  cost_price: number; // NC = Fakturna + Trošak
  margin_percent: number; // marža %
  margin_amount: number; // RUC KM
  selling_price: number; // MPC
  tax_rate_id: string;
  total_value: number; // količina * MPC
}

export interface RetailCalculation {
  id: string;
  document_number: string; // npr. KAL-01/2026
  date: string;
  supplier_id?: string;
  supplier_name?: string;
  invoice_number?: string; // npr. BF: 57983
  invoice_date?: string;
  warehouse_id: string;
  warehouse_name?: string;
  status: DocumentStatus;
  lines: RetailCalculationLine[];
  total_purchase_value: number;
  total_margin_value: number;
  total_retail_value: number;
  created_by: string;
  created_at: string;
  posted_at?: string | null;
}

export interface PriceAdjustmentLine {
  id: string;
  price_adjustment_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  old_price: number;
  new_price: number;
  difference: number;
  total_difference: number;
}

export interface PriceAdjustment {
  id: string;
  document_number: string; // npr. NIV-01/2026
  date: string;
  reason: string;
  status: DocumentStatus;
  lines: PriceAdjustmentLine[];
  total_difference: number;
  created_by: string;
  created_at: string;
  posted_at?: string | null;
}

export interface SaleLine {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate_id: string;
  tax_amount: number;
  total_amount: number;
}

export interface Payment {
  id: string;
  sale_id: string;
  payment_method_id: string;
  payment_method_name: string;
  amount: number;
  reference?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  document_number: string; // npr. RAC-2026-000001
  date: string;
  warehouse_id: string;
  warehouse_name?: string;
  customer_id?: string | null;
  customer_name?: string;
  status: DocumentStatus;
  lines: SaleLine[];
  payments: Payment[];
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  created_by: string;
  created_at: string;
  posted_at?: string | null;
}

export interface InventoryCountLine {
  id: string;
  inventory_count_id: string;
  product_id: string;
  product_name: string;
  system_quantity: number;
  counted_quantity: number;
  difference: number;
  unit_price: number;
  difference_value: number;
  notes?: string;
}

export interface InventoryCount {
  id: string;
  document_number: string; // npr. INV-2026-000001
  warehouse_id: string;
  warehouse_name?: string;
  date: string;
  status: InventoryCountStatus;
  lines: InventoryCountLine[];
  total_surplus_value: number;
  total_deficit_value: number;
  created_by: string;
  created_at: string;
  posted_at?: string | null;
}

export interface WriteOffLine {
  id: string;
  write_off_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  reason: WriteOffReason;
}

export interface WriteOff {
  id: string;
  document_number: string; // npr. OTP-2026-000001
  warehouse_id: string;
  warehouse_name?: string;
  date: string;
  reason: WriteOffReason;
  notes?: string;
  status: DocumentStatus;
  lines: WriteOffLine[];
  total_amount: number;
  created_by: string;
  created_at: string;
  posted_at?: string | null;
}

export interface StockTransferLine {
  id: string;
  transfer_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  document_number: string; // npr. PRE-2026-000001
  date: string;
  source_warehouse_id: string;
  source_warehouse_name: string;
  target_warehouse_id: string;
  target_warehouse_name: string;
  status: DocumentStatus;
  lines: StockTransferLine[];
  notes?: string;
  created_by: string;
  created_at: string;
  posted_at?: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'POST' | 'CANCEL' | 'PRICE_CHANGE' | 'LOGIN';
  entity_type: string;
  entity_id: string;
  details: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  created_at: string;
}

export interface ExternalMapping {
  id: string;
  product_id: string;
  system: 'UZEH_WEBSHOP';
  external_id: string;
  last_synced_at: string;
  sync_status: 'SYNCED' | 'PENDING' | 'ERROR';
  sync_error?: string;
}

export interface SyncLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  name: 'ADMIN' | 'MANAGER' | 'WAREHOUSE' | 'SALES' | 'ACCOUNTING';
  description: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'MANAGER' | 'WAREHOUSE' | 'SALES' | 'ACCOUNTING';
  avatar_url?: string;
  active: boolean;
}
