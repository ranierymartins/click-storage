import express from 'express';
import cors from 'cors';
import dbModule, { ensureDB, getState, persist } from './db.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/products', async (req, res) => {
  const state = getState();
  const rows = (state.products || []).slice().reverse();
  res.json(rows);
});

app.post('/products', async (req, res) => {
  const state = getState();
  const id = uuidv4();
  const { name, description, price = 0, stock = 0, category, brand, serial_numbers = [] } = req.body;
  const row = { id, name, description, price, stock, category, brand, serial_numbers };
  state.products.unshift(row);
  await persist();
  res.status(201).json(row);
});

app.put('/products/:id', async (req, res) => {
  const state = getState();
  const { id } = req.params;
  const idx = state.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).send('Not found');
  const updated = { ...state.products[idx], ...req.body, updated_at: new Date().toISOString() };
  state.products[idx] = updated;
  await persist();
  res.json(updated);
});

app.delete('/products/:id', async (req, res) => {
  const state = getState();
  const { id } = req.params;
  state.products = state.products.filter(p => p.id !== id);
  state.customer_products = state.customer_products.filter(cp => cp.product_id !== id);
  await persist();
  res.status(204).send();
});

app.get('/customers', async (req, res) => {
  const state = getState();
  const rows = (state.customers || []).slice().reverse();
  res.json(rows);
});

app.post('/customers', async (req, res) => {
  const state = getState();
  const id = uuidv4();
  const { name, email, phone, address } = req.body;
  const row = { id, name, email, phone, address };
  state.customers.unshift(row);
  await persist();
  res.status(201).json(row);
});

app.put('/customers/:id', async (req, res) => {
  const state = getState();
  const { id } = req.params;
  const idx = state.customers.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).send('Not found');
  const updated = { ...state.customers[idx], ...req.body, updated_at: new Date().toISOString() };
  state.customers[idx] = updated;
  await persist();
  res.json(updated);
});

app.delete('/customers/:id', async (req, res) => {
  const state = getState();
  const { id } = req.params;
  state.customers = state.customers.filter(c => c.id !== id);
  state.customer_products = state.customer_products.filter(cp => cp.customer_id !== id);
  state.customer_accessories = state.customer_accessories.filter(ca => ca.customer_id !== id);
  await persist();
  res.status(204).send();
});

app.get('/customer_products', async (req, res) => {
  const state = getState();
  const rows = (state.customer_products || []).slice().reverse();
  res.json(rows);
});

app.post('/customer_products', async (req, res) => {
  const state = getState();
  const id = uuidv4();
  const { customer_id, product_id, quantity, serial_numbers = [] } = req.body;
  const existingIdx = state.customer_products.findIndex(cp => cp.customer_id === customer_id && cp.product_id === product_id);
  if (existingIdx !== -1) {
    state.customer_products[existingIdx].quantity += quantity;
    state.customer_products[existingIdx].serial_numbers = serial_numbers;
    const prodIdx = state.products.findIndex(p => p.id === product_id);
    if (prodIdx !== -1) state.products[prodIdx].stock -= quantity;
    await persist();
    return res.json(state.customer_products[existingIdx]);
  }

  const row = { id, customer_id, product_id, quantity, serial_numbers, assigned_at: new Date().toISOString() };
  state.customer_products.unshift(row);
  const prodIdx = state.products.findIndex(p => p.id === product_id);
  if (prodIdx !== -1) state.products[prodIdx].stock -= quantity;
  await persist();
  res.status(201).json(row);
});

app.delete('/customer_products/:id', async (req, res) => {
  const state = getState();
  const { id } = req.params;
  const assignmentIdx = state.customer_products.findIndex(cp => cp.id === id);
  if (assignmentIdx === -1) return res.status(404).send('Not found');
  const assignment = state.customer_products[assignmentIdx];
  const prodIdx = state.products.findIndex(p => p.id === assignment.product_id);
  if (prodIdx !== -1) state.products[prodIdx].stock += assignment.quantity;
  state.customer_products.splice(assignmentIdx, 1);
  await persist();
  res.status(204).send();
});

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
(async () => {
  await ensureDB();
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
})();
