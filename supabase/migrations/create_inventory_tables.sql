-- SQL migration for Supabase: create minimal tables used by Click Store
-- Run this in Supabase SQL editor or via psql connected to your Supabase DB.

-- products table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  stock integer DEFAULT 0,
  category text,
  brand text,
  serial_numbers jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- customer_products linking table
CREATE TABLE IF NOT EXISTS public.customer_products (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0,
  serial_numbers jsonb,
  assigned_at timestamptz DEFAULT now()
);

-- companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- accessories table
CREATE TABLE IF NOT EXISTS public.accessories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  stock integer DEFAULT 0,
  brand text,
  serial_numbers jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- maintenance_items table
CREATE TABLE IF NOT EXISTS public.maintenance_items (
  id text PRIMARY KEY,
  original_product_id text,
  name text NOT NULL,
  description text,
  price numeric,
  stock integer DEFAULT 0,
  brand text,
  serial_numbers jsonb,
  company_id text REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- customer_accessories table
CREATE TABLE IF NOT EXISTS public.customer_accessories (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  accessory_id text NOT NULL REFERENCES public.accessories(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0,
  serial_numbers jsonb,
  assigned_at timestamptz DEFAULT now()
);

-- basic indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_accessories_brand ON public.accessories(brand);

-- simple trigger to update updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_customers
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_accessories
BEFORE UPDATE ON public.accessories
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_companies
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_maintenance
BEFORE UPDATE ON public.maintenance_items
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

-- End of migration
