BEGIN TRANSACTION;

INSERT OR IGNORE INTO companies (id, name, email, phone, address) VALUES
  ('comp-1', 'Click Laudos', 'contato@clicklaudos.com', '+55 11 99999-0001', 'Rua Exemplo, 123'),
  ('comp-2', 'Servicos Gerais SA', 'contato@servicos.com', '+55 11 99999-0002', 'Av. Teste, 456');

INSERT OR IGNORE INTO products (id, name, description, price, stock, category, brand, serial_numbers) VALUES
  ('prod-1', 'Multimetro Digital', 'Multimetro para medições básicas', 199.90, 10, 'Equipamento', 'Fluke', '[]'),
  ('prod-2', 'Osciloscopio 50MHz', 'Osciloscopio portátil', 2499.00, 2, 'Equipamento', 'Rigol', '[]');

INSERT OR IGNORE INTO accessories (id, name, description, price, stock, brand, serial_numbers) VALUES
  ('acc-1', 'Ponta de prova', 'Ponta universal para multimetro', 15.50, 50, 'Generic', '[]'),
  ('acc-2', 'Cabo BNC', 'Cabo BNC 1m', 29.90, 25, 'Generic', '[]');

INSERT OR IGNORE INTO customers (id, name, email, phone, address) VALUES
  ('cust-1', 'Joao Silva', 'joao@example.com', '+55 11 98888-1111', 'Rua Cliente, 10'),
  ('cust-2', 'Maria Oliveira', 'maria@example.com', '+55 11 97777-2222', 'Rua Cliente, 20');

INSERT OR IGNORE INTO maintenance_items (id, original_product_id, name, description, price, stock, brand, company_id) VALUES
  ('maint-1', 'prod-1', 'Reparo Multimetro', 'Servico de calibracao e reparo', 120.00, 0, 'ClickLab', 'comp-1');

INSERT OR IGNORE INTO customer_products (id, customer_id, product_id, quantity, serial_numbers) VALUES
  ('cp-1', 'cust-1', 'prod-1', 1, '[]');

INSERT OR IGNORE INTO customer_accessories (id, customer_id, accessory_id, quantity, serial_numbers) VALUES
  ('ca-1', 'cust-2', 'acc-1', 2, '[]');

COMMIT;
