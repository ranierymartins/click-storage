import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'app.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Migrations (idempotentes)
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  category TEXT,
  brand TEXT,
  serial_numbers TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`);

const app = express();
app.use(cors());
app.use(express.json());

// Helpers
function nowIso() { return new Date().toISOString(); }
function jsonOrArray(value) {
  if (!value) return [];
  try { return JSON.parse(value); } catch { return Array.isArray(value) ? value : []; }
}

// Products
app.get('/products', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  const mapped = rows.map(r => ({ ...r, serial_numbers: jsonOrArray(r.serial_numbers) }));
  res.json(mapped);
});

app.post('/products', (req, res) => {
  const id = uuidv4();
  const { name, description = '', price = 0, stock = 0, category = '', brand = null, serial_numbers = [] } = req.body || {};
  db.prepare(`INSERT INTO products (id, name, description, price, stock, category, brand, serial_numbers, created_at, updated_at)
              VALUES (@id, @name, @description, @price, @stock, @category, @brand, @serial_numbers, @created_at, @updated_at)`) 
    .run({ id, name, description, price, stock, category, brand, serial_numbers: JSON.stringify(serial_numbers), created_at: nowIso(), updated_at: nowIso() });
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json({ ...row, serial_numbers: jsonOrArray(row.serial_numbers) });
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).send('Not found');
  const updated = { ...existing, ...req.body };
  db.prepare(`UPDATE products SET name=@name, description=@description, price=@price, stock=@stock, category=@category, brand=@brand, serial_numbers=@serial_numbers, updated_at=@updated_at WHERE id=@id`)
    .run({ ...updated, serial_numbers: JSON.stringify(updated.serial_numbers ?? jsonOrArray(existing.serial_numbers)), updated_at: nowIso(), id });
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json({ ...row, serial_numbers: jsonOrArray(row.serial_numbers) });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.status(204).send();
});

// Customers
app.get('/customers', (req, res) => {
  const rows = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/customers', (req, res) => {
  const id = uuidv4();
  const { name, email, phone = '', address = '' } = req.body || {};
  db.prepare(`INSERT INTO customers (id, name, email, phone, address, created_at, updated_at)
              VALUES (@id, @name, @email, @phone, @address, @created_at, @updated_at)`) 
    .run({ id, name, email, phone, address, created_at: nowIso(), updated_at: nowIso() });
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  res.status(201).json(row);
});

app.put('/customers/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!existing) return res.status(404).send('Not found');
  const updated = { ...existing, ...req.body };
  db.prepare(`UPDATE customers SET name=@name, email=@email, phone=@phone, address=@address, updated_at=@updated_at WHERE id=@id`)
    .run({ ...updated, updated_at: nowIso(), id });
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  res.json(row);
});

app.delete('/customers/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  res.status(204).send();
});

// Companies
app.get('/companies', (req, res) => {
  const rows = db.prepare('SELECT * FROM companies ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/companies', (req, res) => {
  const id = uuidv4();
  const { name, email = '', phone = '', address = '' } = req.body || {};
  db.prepare(`INSERT INTO companies (id, name, email, phone, address, created_at, updated_at)
              VALUES (@id, @name, @email, @phone, @address, @created_at, @updated_at)`) 
    .run({ id, name, email, phone, address, created_at: nowIso(), updated_at: nowIso() });
  const row = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
  res.status(201).json(row);
});

app.put('/companies/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
  if (!existing) return res.status(404).send('Not found');
  const updated = { ...existing, ...req.body };
  db.prepare(`UPDATE companies SET name=@name, email=@email, phone=@phone, address=@address, updated_at=@updated_at WHERE id=@id`)
    .run({ ...updated, updated_at: nowIso(), id });
  const row = db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
  res.json(row);
});

app.delete('/companies/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM companies WHERE id = ?').run(id);
  res.status(204).send();
});

// Silence devtools /.well-known calls that may be blocked by CSP on the page
app.all('/.well-known/*', (req, res) => res.status(204).send());

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
