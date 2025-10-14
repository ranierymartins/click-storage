import express from 'express';
import cors from 'cors';
import { db, ensureDB } from './db';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// Helpers
function jsonFieldToObj(row: any, field: string) {
  if (!row[field]) return [];
  try { return JSON.parse(row[field]); } catch { return row[field]; }
}

// Products
app.get('/products', async (req, res) => {
  await db.read();
  const rows = db.data!.products.slice().reverse();
  res.json(rows);
});

app.post('/products', async (req, res) => {
  await db.read();
  const id = uuidv4();
  const { name, description, price = 0, stock = 0, category, brand, serial_numbers = [] } = req.body;
  const row = { id, name, description, price, stock, category, brand, serial_numbers };
  db.data!.products.unshift(row);
  await db.write();
  res.status(201).json(row);
});

app.put('/products/:id', async (req, res) => {
  await db.read();
  const { id } = req.params;
  const idx = db.data!.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).send('Not found');
  const updated = { ...db.data!.products[idx], ...req.body, updated_at: new Date().toISOString() };
  db.data!.products[idx] = updated;
  await db.write();
  res.json(updated);
});

app.delete('/products/:id', async (req, res) => {
  await db.read();
  const { id } = req.params;
  db.data!.products = db.data!.products.filter(p => p.id !== id);
  // remove related customer_products
  db.data!.customer_products = db.data!.customer_products.filter(cp => cp.product_id !== id);
  await db.write();
  res.status(204).send();
});

// Customers
app.get('/customers', async (req, res) => {
  await db.read();
  const rows = db.data!.customers.slice().reverse();
  res.json(rows);
});

app.post('/customers', async (req, res) => {
  await db.read();
  const id = uuidv4();
  const { name, email, phone, address } = req.body;
  const row = { id, name, email, phone, address };
  db.data!.customers.unshift(row);
  await db.write();
  res.status(201).json(row);
});

app.put('/customers/:id', async (req, res) => {
  await db.read();
  const { id } = req.params;
  const idx = db.data!.customers.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).send('Not found');
  const updated = { ...db.data!.customers[idx], ...req.body, updated_at: new Date().toISOString() };
  db.data!.customers[idx] = updated;
  await db.write();
  res.json(updated);
});

app.delete('/customers/:id', async (req, res) => {
  await db.read();
  const { id } = req.params;
  db.data!.customers = db.data!.customers.filter(c => c.id !== id);
  db.data!.customer_products = db.data!.customer_products.filter(cp => cp.customer_id !== id);
  db.data!.customer_accessories = db.data!.customer_accessories!.filter(ca => ca.customer_id !== id);
  await db.write();
  res.status(204).send();
});

// Customer products (assign/remove)
app.get('/customer_products', async (req, res) => {
  await db.read();
  const rows = db.data!.customer_products.slice().reverse();
  res.json(rows);
});

app.post('/customer_products', async (req, res) => {
  await db.read();
  const id = uuidv4();
  const { customer_id, product_id, quantity, serial_numbers = [] } = req.body;
  const existingIdx = db.data!.customer_products.findIndex(cp => cp.customer_id === customer_id && cp.product_id === product_id);
  if (existingIdx !== -1) {
    db.data!.customer_products[existingIdx].quantity += quantity;
    db.data!.customer_products[existingIdx].serial_numbers = serial_numbers;
    // update product stock
    const prodIdx = db.data!.products.findIndex(p => p.id === product_id);
    if (prodIdx !== -1) db.data!.products[prodIdx].stock -= quantity;
    await db.write();
    return res.json(db.data!.customer_products[existingIdx]);
  }

  const row = { id, customer_id, product_id, quantity, serial_numbers, assigned_at: new Date().toISOString() };
  db.data!.customer_products.unshift(row);
  const prodIdx = db.data!.products.findIndex(p => p.id === product_id);
  if (prodIdx !== -1) db.data!.products[prodIdx].stock -= quantity;
  await db.write();
  res.status(201).json(row);
});

app.delete('/customer_products/:id', async (req, res) => {
  await db.read();
  const { id } = req.params;
  const assignmentIdx = db.data!.customer_products.findIndex(cp => cp.id === id);
  if (assignmentIdx === -1) return res.status(404).send('Not found');
  const assignment = db.data!.customer_products[assignmentIdx];
  const prodIdx = db.data!.products.findIndex(p => p.id === assignment.product_id);
  if (prodIdx !== -1) db.data!.products[prodIdx].stock += assignment.quantity;
  db.data!.customer_products.splice(assignmentIdx, 1);
  await db.write();
  res.status(204).send();
});

// Basic health
app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
(async () => {
  await ensureDB();
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
})();
