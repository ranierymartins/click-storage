import { ensureDB, getState, persist } from './db.js';

(async () => {
  await ensureDB();
  const state = getState();

  function pushIfMissing(collection, item) {
    if (!collection.find(i => i.id === item.id)) collection.push(item);
  }

  pushIfMissing(state.companies, { id: 'comp-1', name: 'Click Laudos', email: 'contato@clicklaudos.com', phone: '+55 11 99999-0001', address: 'Rua Exemplo, 123' });
  pushIfMissing(state.companies, { id: 'comp-2', name: 'Servicos Gerais SA', email: 'contato@servicos.com', phone: '+55 11 99999-0002', address: 'Av. Teste, 456' });

  pushIfMissing(state.products, { id: 'prod-1', name: 'Multimetro Digital', description: 'Multimetro para medições básicas', price: 199.9, stock: 10, category: 'Equipamento', brand: 'Fluke', serial_numbers: [] });
  pushIfMissing(state.products, { id: 'prod-2', name: 'Osciloscopio 50MHz', description: 'Osciloscopio portátil', price: 2499.0, stock: 2, category: 'Equipamento', brand: 'Rigol', serial_numbers: [] });

  pushIfMissing(state.accessories, { id: 'acc-1', name: 'Ponta de prova', description: 'Ponta universal para multimetro', price: 15.5, stock: 50, brand: 'Generic', serial_numbers: [] });
  pushIfMissing(state.accessories, { id: 'acc-2', name: 'Cabo BNC', description: 'Cabo BNC 1m', price: 29.9, stock: 25, brand: 'Generic', serial_numbers: [] });

  pushIfMissing(state.customers, { id: 'cust-1', name: 'Joao Silva', email: 'joao@example.com', phone: '+55 11 98888-1111', address: 'Rua Cliente, 10' });
  pushIfMissing(state.customers, { id: 'cust-2', name: 'Maria Oliveira', email: 'maria@example.com', phone: '+55 11 97777-2222', address: 'Rua Cliente, 20' });

  pushIfMissing(state.maintenance_items, { id: 'maint-1', original_product_id: 'prod-1', name: 'Reparo Multimetro', description: 'Servico de calibracao e reparo', price: 120.0, stock: 0, brand: 'ClickLab', company_id: 'comp-1' });

  pushIfMissing(state.customer_products, { id: 'cp-1', customer_id: 'cust-1', product_id: 'prod-1', quantity: 1, serial_numbers: [] });
  pushIfMissing(state.customer_accessories, { id: 'ca-1', customer_id: 'cust-2', accessory_id: 'acc-1', quantity: 2, serial_numbers: [] });

  await persist();
  console.log('Seed applied (idempotent)');
})();
