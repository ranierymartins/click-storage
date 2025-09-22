/*
  # Sistema de Inventário - Schema Completo

  1. Novas Tabelas
    - `products` - Armazena informações dos produtos
      - `id` (uuid, primary key)
      - `name` (text, nome do produto)
      - `description` (text, descrição detalhada)
      - `price` (decimal, preço unitário)
      - `stock` (integer, quantidade em estoque)
      - `category` (text, categoria do produto)
      - `created_at` (timestamp, data de criação)
      - `updated_at` (timestamp, data de atualização)

    - `customers` - Armazena informações dos clientes
      - `id` (uuid, primary key)
      - `name` (text, nome completo)
      - `email` (text, email único)
      - `phone` (text, telefone)
      - `address` (text, endereço)
      - `created_at` (timestamp, data de criação)
      - `updated_at` (timestamp, data de atualização)

    - `customer_products` - Tabela de relacionamento entre clientes e produtos
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key para customers)
      - `product_id` (uuid, foreign key para products)
      - `quantity` (integer, quantidade associada)
      - `assigned_at` (timestamp, data da associação)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados poderem gerenciar seus dados
    - Índices para otimização de consultas

  3. Funcionalidades
    - Triggers para atualização automática de timestamps
    - Constraints para garantir integridade dos dados
    - Índices para melhor performance
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  stock integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT products_price_positive CHECK (price >= 0),
  CONSTRAINT products_stock_non_negative CHECK (stock >= 0),
  CONSTRAINT products_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT customers_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT customers_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabela de relacionamento cliente-produto
CREATE TABLE IF NOT EXISTS customer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  assigned_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT customer_products_quantity_positive CHECK (quantity > 0),
  CONSTRAINT customer_products_unique_assignment UNIQUE (customer_id, product_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_products_customer_id ON customer_products(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_products_product_id ON customer_products(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_products_assigned_at ON customer_products(assigned_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática de updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_products ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para products
CREATE POLICY "Usuários autenticados podem ver todos os produtos"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir produtos"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar produtos"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar produtos"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas de segurança para customers
CREATE POLICY "Usuários autenticados podem ver todos os clientes"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir clientes"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar clientes"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas de segurança para customer_products
CREATE POLICY "Usuários autenticados podem ver todas as associações"
  ON customer_products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir associações"
  ON customer_products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar associações"
  ON customer_products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar associações"
  ON customer_products
  FOR DELETE
  TO authenticated
  USING (true);