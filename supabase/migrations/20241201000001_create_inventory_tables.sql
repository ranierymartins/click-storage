-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  category TEXT,
  brand TEXT,
  serial_numbers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_products table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS customer_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  serial_numbers JSONB DEFAULT '[]'::jsonb,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- Create accessories table
CREATE TABLE IF NOT EXISTS accessories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  category TEXT,
  brand TEXT,
  serial_numbers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_accessories table
CREATE TABLE IF NOT EXISTS customer_accessories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  accessory_id UUID NOT NULL REFERENCES accessories(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  serial_numbers JSONB DEFAULT '[]'::jsonb,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, accessory_id)
);

-- Create maintenance_items table
CREATE TABLE IF NOT EXISTS maintenance_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  brand TEXT,
  serial_numbers JSONB DEFAULT '[]'::jsonb,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customer_products_customer_id ON customer_products(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_products_product_id ON customer_products(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_accessories_customer_id ON customer_accessories(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_accessories_accessory_id ON customer_accessories(accessory_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_items_company_id ON maintenance_items(company_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accessories_updated_at BEFORE UPDATE ON accessories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your security needs)
CREATE POLICY "Enable all operations for all users" ON products FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON companies FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON customer_products FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON accessories FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON customer_accessories FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON maintenance_items FOR ALL USING (true);
