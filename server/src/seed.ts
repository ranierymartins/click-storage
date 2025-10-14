import { db, ensureDB } from './db';
import { v4 as uuidv4 } from 'uuid';

(async () => {
	await ensureDB();
	db.data!.companies.push({ id: 'comp-1', name: 'Click Laudos', email: 'contato@clicklaudos.com', phone: '+55 11 99999-0001', address: 'Rua Exemplo, 123' });
	db.data!.companies.push({ id: 'comp-2', name: 'Servicos Gerais SA', email: 'contato@servicos.com', phone: '+55 11 99999-0002', address: 'Av. Teste, 456' });

	db.data!.products.push({ id: 'prod-1', name: 'Multimetro Digital', description: 'Multimetro para medições básicas', price: 199.9, stock: 10, category: 'Equipamento', brand: 'Fluke', serial_numbers: [] });
	db.data!.products.push({ id: 'prod-2', name: 'Osciloscopio 50MHz', description: 'Osciloscopio portátil', price: 2499.0, stock: 2, category: 'Equipamento', brand: 'Rigol', serial_numbers: [] });

	db.data!.accessories.push({ id: 'acc-1', name: 'Ponta de prova', description: 'Ponta universal para multimetro', price: 15.5, stock: 50, brand: 'Generic', serial_numbers: [] });
	db.data!.accessories.push({ id: 'acc-2', name: 'Cabo BNC', description: 'Cabo BNC 1m', price: 29.9, stock: 25, brand: 'Generic', serial_numbers: [] });

	db.data!.customers.push({ id: 'cust-1', name: 'Joao Silva', email: 'joao@example.com', phone: '+55 11 98888-1111', address: 'Rua Cliente, 10' });
	db.data!.customers.push({ id: 'cust-2', name: 'Maria Oliveira', email: 'maria@example.com', phone: '+55 11 97777-2222', address: 'Rua Cliente, 20' });

	db.data!.maintenance_items.push({ id: 'maint-1', original_product_id: 'prod-1', name: 'Reparo Multimetro', description: 'Servico de calibracao e reparo', price: 120.0, stock: 0, brand: 'ClickLab', company_id: 'comp-1' });

	db.data!.customer_products.push({ id: 'cp-1', customer_id: 'cust-1', product_id: 'prod-1', quantity: 1, serial_numbers: [] });
	db.data!.customer_accessories!.push({ id: 'ca-1', customer_id: 'cust-2', accessory_id: 'acc-1', quantity: 2, serial_numbers: [] });

	await db.write();
	console.log('Seed applied');
})();
