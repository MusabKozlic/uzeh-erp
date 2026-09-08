// ==============================================================================
// UZEH.BA ERP - SUPABASE POSTGRESQL PRODUCTION MIGRATION SCRIPT
// ==============================================================================
// Complete, idempotent DDL migration script with UUID PKs, foreign keys,
// event-sourced stock movements, versioned price tracking, atomic procedures,
// and role-based Row Level Security (RLS) policies.
// ==============================================================================

export const SUPABASE_MIGRATION_SQL = `-- ==============================================================================
-- UZEH.BA ERP - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Author: Uzeh ERP Architecture & Engineering Team
-- Standards: UUID PKs, Event Sourcing, Versioned Pricing, Strict Foreign Keys,
--            RLS (ADMIN, MANAGER, WAREHOUSE, SALES, ACCOUNTING)
-- Currency: BAM (KM), VAT: 17% Standard Rate (BiH Tax System)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS & BASICS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'WAREHOUSE', 'SALES', 'ACCOUNTING');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
    CREATE TYPE document_status AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_count_status') THEN
    CREATE TYPE inventory_count_status AS ENUM ('DRAFT', 'COUNTING', 'CONFIRMED', 'POSTED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_type') THEN
    CREATE TYPE movement_type AS ENUM (
      'PURCHASE',
      'SALE',
      'CUSTOMER_RETURN',
      'SUPPLIER_RETURN',
      'WRITE_OFF',
      'INVENTORY_ADJUSTMENT',
      'TRANSFER_IN',
      'TRANSFER_OUT'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_type') THEN
    CREATE TYPE price_type AS ENUM ('REGULAR', 'ACTION', 'SPECIAL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'write_off_reason') THEN
    CREATE TYPE write_off_reason AS ENUM (
      'DAMAGED',
      'EXPIRED',
      'MISSING',
      'THEFT',
      'DONATION',
      'OTHER'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_role_enum') THEN
    CREATE TYPE partner_role_enum AS ENUM ('SUPPLIER', 'CUSTOMER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
    CREATE TYPE payment_method_enum AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'VOUCHER');
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. CORE USERS & RBAC
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  role user_role NOT NULL DEFAULT 'SALES',
  phone VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. MASTER DATA: TAX RATES, UNITS, BRANDS, CATEGORIES, WAREHOUSES, PARTNERS
-- ------------------------------------------------------------------------------

-- Tax Rates (Standard rate in Bosnia and Herzegovina is 17%)
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  rate NUMERIC(5,2) NOT NULL CHECK (rate >= 0),
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_to DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Units of Measure
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  decimal_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories (Hierarchical self-referencing tree)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  meta_title VARCHAR(200),
  meta_description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Partners (Suppliers & Customers with Bosnian JIB / PIB identifiers)
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL DEFAULT 'LEGAL', -- 'LEGAL' (Pravno lice) or 'INDIVIDUAL' (Fizičko lice)
  name VARCHAR(200) NOT NULL,
  jib VARCHAR(20), -- 13 cifara Jedinstveni Identifikacioni Broj
  pib VARCHAR(20), -- 12 cifara PDV broj
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'Bosna i Hercegovina',
  phone VARCHAR(50),
  email VARCHAR(100),
  contact_person VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partners_jib ON partners(jib);
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);

CREATE TABLE IF NOT EXISTS partner_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  role partner_role_enum NOT NULL,
  UNIQUE(partner_id, role)
);

-- Warehouses (Retail outlets and central depots)
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Sarajevo',
  is_retail BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PRODUCTS MASTER CATALOG
-- ------------------------------------------------------------------------------
-- Product is the master catalog entity.
-- Inventory quantity is NEVER directly stored or edited on the product record.
-- Instead, it is event-sourced from stock_movements.
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) NOT NULL UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  tax_rate_id UUID NOT NULL REFERENCES tax_rates(id) ON DELETE RESTRICT,
  min_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
  weight_kg NUMERIC(8,3),
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- ------------------------------------------------------------------------------
-- 5. ARTICLE PRICING & NIVELACIJE (Immutable Versioned Pricing)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS article_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  purchase_price NUMERIC(12,4) NOT NULL DEFAULT 0.0000 CHECK (purchase_price >= 0),
  retail_price NUMERIC(12,2) NOT NULL CHECK (retail_price >= 0),
  price_type price_type NOT NULL DEFAULT 'REGULAR',
  valid_from DATE NOT NULL,
  valid_to DATE,
  reason VARCHAR(255),
  source_document_id UUID,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_article_prices_lookup ON article_prices(product_id, valid_from, valid_to);

-- Nivelacije maloprodajnih cijena (Price Adjustments on stock)
CREATE TABLE IF NOT EXISTS price_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_number VARCHAR(100) NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  reason VARCHAR(255) NOT NULL,
  status document_status NOT NULL DEFAULT 'DRAFT',
  total_difference NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_price_adjustments_doc ON price_adjustments(document_number);
CREATE INDEX IF NOT EXISTS idx_price_adjustments_status ON price_adjustments(status);

CREATE TABLE IF NOT EXISTS price_adjustment_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_adjustment_id UUID NOT NULL REFERENCES price_adjustments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity >= 0),
  old_price NUMERIC(12,2) NOT NULL,
  new_price NUMERIC(12,2) NOT NULL,
  difference NUMERIC(12,2) NOT NULL, -- (new_price - old_price)
  total_difference NUMERIC(14,2) NOT NULL -- quantity * difference
);
CREATE INDEX IF NOT EXISTS idx_adj_lines_product ON price_adjustment_lines(product_id);

-- ------------------------------------------------------------------------------
-- 6. STOCK MOVEMENTS (SOURCE OF TRUTH FOR ALL INVENTORY)
-- ------------------------------------------------------------------------------
-- Never manually updated or deleted. Only appended via atomic posting functions.
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  quantity NUMERIC(12,3) NOT NULL, -- Positive = Inflow, Negative = Outflow
  movement_type movement_type NOT NULL,
  reference_type VARCHAR(100) NOT NULL, -- 'RETAIL_CALCULATION', 'SALE', 'INVENTORY', 'WRITE_OFF'
  reference_id UUID NOT NULL,
  unit_cost NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_movements_lookup ON stock_movements(product_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ref ON stock_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at);

-- ------------------------------------------------------------------------------
-- 7. DATABASE VIEWS (Derived Stock & TKM)
-- ------------------------------------------------------------------------------
-- View: Product stock per warehouse
CREATE OR REPLACE VIEW product_stock_view AS
SELECT
  product_id,
  warehouse_id,
  COALESCE(SUM(quantity), 0) AS quantity
FROM stock_movements
GROUP BY product_id, warehouse_id;

-- View: Total product stock across all warehouses
CREATE OR REPLACE VIEW product_total_stock_view AS
SELECT
  product_id,
  COALESCE(SUM(quantity), 0) AS total_quantity
FROM stock_movements
GROUP BY product_id;

-- View: Active retail price per product
CREATE OR REPLACE VIEW active_article_prices_view AS
SELECT DISTINCT ON (product_id)
  product_id,
  purchase_price,
  retail_price,
  valid_from,
  valid_to,
  price_type
FROM article_prices
WHERE (valid_to IS NULL OR valid_to >= CURRENT_DATE)
ORDER BY product_id, valid_from DESC, created_at DESC;

-- ------------------------------------------------------------------------------
-- 8. PURCHASING & RETAIL CALCULATIONS (Kalkulacije / Ulaz robe)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS retail_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_number VARCHAR(100) NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id UUID REFERENCES partners(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(100),
  invoice_date DATE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  status document_status NOT NULL DEFAULT 'DRAFT',
  total_purchase_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_margin_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_retail_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_retail_calculations_doc ON retail_calculations(document_number);
CREATE INDEX IF NOT EXISTS idx_retail_calculations_date ON retail_calculations(date);
CREATE INDEX IF NOT EXISTS idx_retail_calculations_status ON retail_calculations(status);

CREATE TABLE IF NOT EXISTS retail_calculation_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calculation_id UUID NOT NULL REFERENCES retail_calculations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  purchase_price NUMERIC(12,4) NOT NULL CHECK (purchase_price >= 0),
  additional_cost NUMERIC(12,4) NOT NULL DEFAULT 0 CHECK (additional_cost >= 0),
  cost_price NUMERIC(12,4) NOT NULL CHECK (cost_price >= 0),
  margin_percent NUMERIC(8,2) NOT NULL,
  margin_amount NUMERIC(12,2) NOT NULL,
  selling_price NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
  tax_rate_id UUID NOT NULL REFERENCES tax_rates(id) ON DELETE RESTRICT,
  total_value NUMERIC(14,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_calc_lines_product ON retail_calculation_lines(product_id);

-- ------------------------------------------------------------------------------
-- 9. SALES, POINT OF SALE (Kasa) & FISCAL PAYMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_number VARCHAR(100) NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  status document_status NOT NULL DEFAULT 'DRAFT',
  subtotal_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'BAM',
  fiscal_receipt_number VARCHAR(100),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sales_doc ON sales(document_number);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

CREATE TABLE IF NOT EXISTS sale_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_rate_id UUID NOT NULL REFERENCES tax_rates(id) ON DELETE RESTRICT,
  tax_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(14,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sale_lines_product ON sale_lines(product_id);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  payment_method payment_method_enum NOT NULL DEFAULT 'CASH',
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  reference VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. INVENTORY COUNTS (Popisi) & WRITE-OFFS (Otpis)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_number VARCHAR(100) NOT NULL UNIQUE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status inventory_count_status NOT NULL DEFAULT 'DRAFT',
  total_surplus_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deficit_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory_count_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  system_quantity NUMERIC(12,3) NOT NULL,
  counted_quantity NUMERIC(12,3) NOT NULL,
  difference NUMERIC(12,3) NOT NULL, -- counted - system
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  difference_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS write_offs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_number VARCHAR(100) NOT NULL UNIQUE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason write_off_reason NOT NULL,
  notes TEXT,
  status document_status NOT NULL DEFAULT 'DRAFT',
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS write_off_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  write_off_id UUID NOT NULL REFERENCES write_offs(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(12,4) NOT NULL,
  total_cost NUMERIC(14,2) NOT NULL,
  reason write_off_reason NOT NULL
);

-- ------------------------------------------------------------------------------
-- 11. AUDIT LOG & WEBSHOP INTEGRATION ARCHITECTURE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(150),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  details TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- External mappings for Uzeh.ba Webshop Integration
CREATE TABLE IF NOT EXISTS external_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  system VARCHAR(100) NOT NULL DEFAULT 'UZEH_WEBSHOP',
  external_id VARCHAR(100) NOT NULL,
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, system)
);
CREATE INDEX IF NOT EXISTS idx_external_mappings_lookup ON external_mappings(system, external_id);

CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at);

-- ------------------------------------------------------------------------------
-- 12. TRANSACTIONAL STORED PROCEDURES (ATOMIC POSTING & IMMUTABILITY)
-- ------------------------------------------------------------------------------

-- Procedure 1: Knjiženje maloprodajne kalkulacije
CREATE OR REPLACE FUNCTION post_retail_calculation(p_calc_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_calc RECORD;
  v_line RECORD;
BEGIN
  -- Lock the calculation row
  SELECT * INTO v_calc FROM retail_calculations WHERE id = p_calc_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kalkulacija sa ID % nije pronađena.', p_calc_id;
  END IF;

  IF v_calc.status <> 'DRAFT' THEN
    RAISE EXCEPTION 'Nije moguće knjižiti dokument koji nije u statusu DRAFT.';
  END IF;

  -- Create positive stock movement for each line
  FOR v_line IN SELECT * FROM retail_calculation_lines WHERE calculation_id = p_calc_id LOOP
    INSERT INTO stock_movements (
      product_id,
      warehouse_id,
      quantity,
      movement_type,
      reference_type,
      reference_id,
      unit_cost,
      created_by
    ) VALUES (
      v_line.product_id,
      v_calc.warehouse_id,
      v_line.quantity,
      'PURCHASE',
      'RETAIL_CALCULATION',
      p_calc_id,
      v_line.cost_price,
      p_user_id
    );

    -- Close any previous active price by setting valid_to = CURRENT_DATE
    UPDATE article_prices
    SET valid_to = v_calc.date - INTERVAL '1 day'
    WHERE product_id = v_line.product_id
      AND valid_to IS NULL
      AND valid_from <= v_calc.date;

    -- Record new versioned selling price
    INSERT INTO article_prices (
      product_id,
      purchase_price,
      retail_price,
      price_type,
      valid_from,
      reason,
      source_document_id,
      created_by
    ) VALUES (
      v_line.product_id,
      v_line.cost_price,
      v_line.selling_price,
      'REGULAR',
      v_calc.date,
      'Kalkulacija ' || v_calc.document_number,
      p_calc_id,
      p_user_id
    );
  END LOOP;

  -- Lock calculation into POSTED status
  UPDATE retail_calculations
  SET status = 'POSTED', posted_at = NOW()
  WHERE id = p_calc_id;

  -- Audit entry
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    p_user_id,
    'POST',
    'RETAIL_CALCULATION',
    p_calc_id::text,
    'Proknjižena kalkulacija ' || v_calc.document_number || ' na skladište ' || v_calc.warehouse_id::text
  );
END;
$$ LANGUAGE plpgsql;

-- Procedure 2: Knjiženje nivelacije cijena
CREATE OR REPLACE FUNCTION post_price_adjustment(p_adjustment_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_adj RECORD;
  v_line RECORD;
BEGIN
  SELECT * INTO v_adj FROM price_adjustments WHERE id = p_adjustment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nivelacija sa ID % nije pronađena.', p_adjustment_id;
  END IF;

  IF v_adj.status <> 'DRAFT' THEN
    RAISE EXCEPTION 'Nije moguće knjižiti nivelaciju koja nije u statusu DRAFT.';
  END IF;

  FOR v_line IN SELECT * FROM price_adjustment_lines WHERE price_adjustment_id = p_adjustment_id LOOP
    -- Close previous price
    UPDATE article_prices
    SET valid_to = v_adj.date - INTERVAL '1 day'
    WHERE product_id = v_line.product_id
      AND valid_to IS NULL
      AND valid_from <= v_adj.date;

    -- Insert new adjusted price
    INSERT INTO article_prices (
      product_id,
      retail_price,
      price_type,
      valid_from,
      reason,
      source_document_id,
      created_by
    ) VALUES (
      v_line.product_id,
      v_line.new_price,
      'REGULAR',
      v_adj.date,
      'Nivelacija ' || v_adj.document_number,
      p_adjustment_id,
      p_user_id
    );
  END LOOP;

  UPDATE price_adjustments
  SET status = 'POSTED', posted_at = NOW()
  WHERE id = p_adjustment_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    p_user_id,
    'POST',
    'PRICE_ADJUSTMENT',
    p_adjustment_id::text,
    'Proknjižena nivelacija ' || v_adj.document_number || ' - ukupna razlika: ' || v_adj.total_difference::text || ' KM'
  );
END;
$$ LANGUAGE plpgsql;

-- Procedure 3: Knjiženje maloprodajnog računa (POS Kasa)
CREATE OR REPLACE FUNCTION post_sale(p_sale_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_sale RECORD;
  v_line RECORD;
  v_current_stock NUMERIC;
BEGIN
  SELECT * INTO v_sale FROM sales WHERE id = p_sale_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Račun sa ID % nije pronađen.', p_sale_id;
  END IF;

  IF v_sale.status <> 'DRAFT' THEN
    RAISE EXCEPTION 'Račun je već proknjižen ili storniran.';
  END IF;

  FOR v_line IN SELECT * FROM sale_lines WHERE sale_id = p_sale_id LOOP
    -- Check available stock before committing
    SELECT COALESCE(SUM(quantity), 0) INTO v_current_stock
    FROM stock_movements
    WHERE product_id = v_line.product_id AND warehouse_id = v_sale.warehouse_id;

    IF v_current_stock < v_line.quantity THEN
      RAISE EXCEPTION 'Nedovoljno zaliha za artikal ID %. Raspoloživo: %, Traženo: %',
        v_line.product_id, v_current_stock, v_line.quantity;
    END IF;

    -- Append negative stock movement (Outflow)
    INSERT INTO stock_movements (
      product_id,
      warehouse_id,
      quantity,
      movement_type,
      reference_type,
      reference_id,
      unit_cost,
      created_by
    ) VALUES (
      v_line.product_id,
      v_sale.warehouse_id,
      -v_line.quantity,
      'SALE',
      'SALE_DOCUMENT',
      p_sale_id,
      v_line.unit_price,
      p_user_id
    );
  END LOOP;

  UPDATE sales
  SET status = 'POSTED', posted_at = NOW()
  WHERE id = p_sale_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    p_user_id,
    'POST',
    'SALE',
    p_sale_id::text,
    'Fiskalna prodaja ' || v_sale.document_number || ' - iznos: ' || v_sale.total_amount::text || ' KM'
  );
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Helper function to inspect current user role from Supabase auth.jwt()
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS VARCHAR AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'user_role'),
    (SELECT role::text FROM users WHERE id = auth.uid()),
    'ANONYMOUS'
  );
$$ LANGUAGE sql STABLE;

-- Enable RLS across all business tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE retail_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE retail_calculation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_adjustment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_count_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE write_offs ENABLE ROW LEVEL SECURITY;
ALTER TABLE write_off_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_mappings ENABLE ROW LEVEL SECURITY;

-- Products: Read for all authenticated staff; Write for ADMIN, MANAGER, WAREHOUSE
CREATE POLICY "p_products_select" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "p_products_write" ON products FOR ALL TO authenticated
  USING (auth_user_role() IN ('ADMIN', 'MANAGER', 'WAREHOUSE'))
  WITH CHECK (auth_user_role() IN ('ADMIN', 'MANAGER', 'WAREHOUSE'));

-- Stock Movements: Read for all; Write ONLY via service role / stored functions; NEVER delete or update
CREATE POLICY "p_stock_movements_select" ON stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "p_stock_movements_no_update" ON stock_movements FOR UPDATE TO authenticated USING (false);
CREATE POLICY "p_stock_movements_no_delete" ON stock_movements FOR DELETE TO authenticated USING (false);

-- Retail Calculations: Select for all; Write for ADMIN, MANAGER, WAREHOUSE when DRAFT
CREATE POLICY "p_calculations_select" ON retail_calculations FOR SELECT TO authenticated USING (true);
CREATE POLICY "p_calculations_insert" ON retail_calculations FOR INSERT TO authenticated
  WITH CHECK (auth_user_role() IN ('ADMIN', 'MANAGER', 'WAREHOUSE'));
CREATE POLICY "p_calculations_update" ON retail_calculations FOR UPDATE TO authenticated
  USING (status = 'DRAFT' AND auth_user_role() IN ('ADMIN', 'MANAGER', 'WAREHOUSE'));

-- Sales: Select for all; Insert for SALES, ADMIN, MANAGER; Update only when DRAFT
CREATE POLICY "p_sales_select" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "p_sales_insert" ON sales FOR INSERT TO authenticated
  WITH CHECK (auth_user_role() IN ('SALES', 'ADMIN', 'MANAGER'));
CREATE POLICY "p_sales_update" ON sales FOR UPDATE TO authenticated
  USING (status = 'DRAFT' AND auth_user_role() IN ('SALES', 'ADMIN', 'MANAGER'));

-- Audit Logs: Select only for ADMIN and MANAGER; Strictly immutable (no UPDATE or DELETE)
CREATE POLICY "p_audit_select" ON audit_logs FOR SELECT TO authenticated
  USING (auth_user_role() IN ('ADMIN', 'MANAGER'));
CREATE POLICY "p_audit_no_update" ON audit_logs FOR UPDATE TO authenticated USING (false);
CREATE POLICY "p_audit_no_delete" ON audit_logs FOR DELETE TO authenticated USING (false);

-- ==============================================================================
-- END OF MIGRATION SCRIPT
-- ==============================================================================
`;

export const fullSqlSchema = SUPABASE_MIGRATION_SQL;
