-- Seed data for Click Store (Postgres SQL)
-- Run after migration to populate example data

BEGIN;

-- companies
INSERT INTO public.companies (id, name, email, phone, address)
VALUES
  ('comp-1', 'Click Laudos', 'contato@clicklaudos.com', '+55 11 99999-0001', 'Rua Exemplo, 123'),
  ('comp-2', 'Serviços Gerais SA', 'contato@servicos.com', '+55 11 99999-0002', 'Av. Teste, 456')
ON CONFLICT (id) DO NOTHING;

-- products
INSERT INTO public.products (id, name, description, price, stock, category, brand, serial_numbers)
VALUES
  ('prod-1', 'Multímetro Digital', 'Multímetro para medições básicas', 199.90, 10, 'Equipamento', 'Fluke', '[]'::jsonb),
  ('prod-2', 'Osciloscópio 50MHz', 'Osciloscópio portátil', 2499.00, 2, 'Equipamento', 'Rigol', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- accessories
INSERT INTO public.accessories (id, name, description, price, stock, brand, serial_numbers)
VALUES
  ('acc-1', 'Ponta de prova', 'Ponta universal para multímetro', 15.50, 50, 'Generic', '[]'::jsonb),
  ('acc-2', 'Cabo BNC', 'Cabo BNC 1m', 29.90, 25, 'Generic', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- customers
INSERT INTO public.customers (id, name, email, phone, address)
VALUES
  ('cust-1', 'João Silva', 'joao@example.com', '+55 11 98888-1111', 'Rua Cliente, 10'),
  ('cust-2', 'Maria Oliveira', 'maria@example.com', '+55 11 97777-2222', 'Rua Cliente, 20')
ON CONFLICT (id) DO NOTHING;

-- maintenance items
INSERT INTO public.maintenance_items (id, original_product_id, name, description, price, stock, brand, company_id)
VALUES
  ('maint-1', 'prod-1', 'Reparo Multímetro', 'Serviço de calibração e reparo', 120.00, 0, 'ClickLab', 'comp-1')
ON CONFLICT (id) DO NOTHING;

-- assign product to customer
INSERT INTO public.customer_products (id, customer_id, product_id, quantity, serial_numbers)
VALUES
  ('cp-1', 'cust-1', 'prod-1', 1, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- assign accessory to customer
INSERT INTO public.customer_accessories (id, customer_id, accessory_id, quantity, serial_numbers)
VALUES
  ('ca-1', 'cust-2', 'acc-1', 2, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- End of seeds
