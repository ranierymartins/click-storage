-- Insert sample companies
INSERT INTO companies (id, name, email, phone, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'TechCorp Solutions', 'contato@techcorp.com', '(11) 99999-1111', 'Rua das Tecnologias, 123 - São Paulo, SP'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Manutenção Express', 'suporte@manutencao.com', '(11) 99999-2222', 'Av. da Manutenção, 456 - São Paulo, SP');

-- Insert sample customers
INSERT INTO customers (id, name, email, phone, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'João Silva', 'joao.silva@email.com', '(11) 99999-1001', 'Rua das Flores, 100 - São Paulo, SP'),
  ('550e8400-e29b-41d4-a716-446655440011', 'Maria Santos', 'maria.santos@email.com', '(11) 99999-1002', 'Av. Paulista, 200 - São Paulo, SP'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 99999-1003', 'Rua Augusta, 300 - São Paulo, SP');

-- Insert sample products
INSERT INTO products (id, name, description, price, stock, category, brand, serial_numbers) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 'Notebook Dell Inspiron', 'Notebook Dell Inspiron 15 3000, Intel Core i5, 8GB RAM, 256GB SSD', 2500.00, 3, 'Notebooks', 'Dell', '["SN001", "SN002", "SN003"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440021', 'Mouse Logitech', 'Mouse sem fio Logitech M705', 89.90, 10, 'Periféricos', 'Logitech', '["MS001", "MS002", "MS003", "MS004", "MS005", "MS006", "MS007", "MS008", "MS009", "MS010"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440022', 'Monitor Samsung', 'Monitor Samsung 24" Full HD', 599.90, 5, 'Monitores', 'Samsung', '["MN001", "MN002", "MN003", "MN004", "MN005"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440023', 'Teclado Mecânico', 'Teclado mecânico RGB com switches azuis', 199.90, 8, 'Periféricos', 'Corsair', '["TK001", "TK002", "TK003", "TK004", "TK005", "TK006", "TK007", "TK008"]'::jsonb);

-- Insert sample accessories
INSERT INTO accessories (id, name, description, price, stock, category, brand, serial_numbers) VALUES
  ('550e8400-e29b-41d4-a716-446655440030', 'Cabo HDMI', 'Cabo HDMI 2.0 de 2 metros', 25.90, 15, 'Cabos', 'Amazon Basics', '["CB001", "CB002", "CB003", "CB004", "CB005", "CB006", "CB007", "CB008", "CB009", "CB010", "CB011", "CB012", "CB013", "CB014", "CB015"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440031', 'Adaptador USB-C', 'Adaptador USB-C para HDMI', 45.90, 12, 'Adaptadores', 'Anker', '["AD001", "AD002", "AD003", "AD004", "AD005", "AD006", "AD007", "AD008", "AD009", "AD010", "AD011", "AD012"]'::jsonb);

-- Insert sample customer assignments
INSERT INTO customer_products (customer_id, product_id, quantity, serial_numbers) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', 1, '["SN001"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440021', 2, '["MS001", "MS002"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440022', 1, '["MN001"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440023', 1, '["TK001"]'::jsonb);

-- Insert sample customer accessory assignments
INSERT INTO customer_accessories (customer_id, accessory_id, quantity, serial_numbers) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440030', 2, '["CB001", "CB002"]'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440031', 1, '["AD001"]'::jsonb);

-- Insert sample maintenance items
INSERT INTO maintenance_items (original_product_id, name, description, price, stock, brand, serial_numbers, company_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 'Notebook Dell Inspiron - Manutenção', 'Notebook em manutenção para troca de tela', 2500.00, 1, 'Dell', '["SN002"]'::jsonb, '550e8400-e29b-41d4-a716-446655440001');
