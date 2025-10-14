// Simple server to persist the sqlite file to disk so the browser app can load/save it
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import initSqlJs from 'sql.js';

const app = express();
app.use(cors());

// raw body parser for binary uploads
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'click-storage.sqlite');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

app.get('/db', (req, res) => {
  if (fs.existsSync(DB_PATH)) {
    res.setHeader('Content-Type', 'application/octet-stream');
    const stream = fs.createReadStream(DB_PATH);
    stream.pipe(res);
  } else {
    res.status(404).send('Not found');
  }
});

// status endpoint to help debugging
app.get('/db/status', (req, res) => {
  if (fs.existsSync(DB_PATH)) {
    const stat = fs.statSync(DB_PATH);
    res.json({ exists: true, size: stat.size, path: DB_PATH });
  } else {
    res.json({ exists: false });
  }
});

app.post('/db', (req, res) => {
  try {
    console.log('POST /db received, bytes:', req.body ? req.body.length : 0);
    const buf = req.body;
    fs.writeFileSync(DB_PATH, Buffer.from(buf));
    console.log('Wrote DB to', DB_PATH, 'size', Buffer.from(buf).length);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Error saving DB', err);
    res.status(500).send('Error');
  }
});

// API endpoints to read/write structured data as JSON (used for sync across clients)
app.get('/api/all', async (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) return res.json({ products: [], customers: [], customer_products: [] });
    const buf = fs.readFileSync(DB_PATH);
    const SQL = await initSqlJs();
    const db = new SQL.Database(new Uint8Array(buf));

    const exec = (sql) => {
      const r = db.exec(sql);
      if (!r || r.length === 0) return [];
      const cols = r[0].columns;
      return r[0].values.map(v => {
        const o = {};
        cols.forEach((c, i) => o[c] = v[i]);
        return o;
      });
    };

    const products = exec("SELECT * FROM products ORDER BY created_at DESC");
    const customers = exec("SELECT * FROM customers ORDER BY created_at DESC");
    const customer_products = exec("SELECT * FROM customer_products ORDER BY assigned_at DESC");

    res.json({ products, customers, customer_products });
  } catch (err) {
    console.error('Error in /api/all', err);
    res.status(500).send('Error');
  }
});

app.post('/api/save-all', express.json({ limit: '5mb' }), async (req, res) => {
  try {
    const { products = [], customers = [], customer_products = [] } = req.body || {};
    const SQL = await initSqlJs();
    let db;
    if (fs.existsSync(DB_PATH)) {
      const buf = fs.readFileSync(DB_PATH);
      db = new SQL.Database(new Uint8Array(buf));
    } else {
      db = new SQL.Database();
    }

    // ensure tables
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        category TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS customer_products (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        assigned_at TEXT NOT NULL
      );
    `);

    // replace data: delete and insert
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM customer_products');
    db.run('DELETE FROM customers');
    db.run('DELETE FROM products');

    const insert = (table, cols, rows) => {
      if (!rows || rows.length === 0) return;
      const q = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(_=>'?').join(',')})`;
      const stmt = db.prepare(q);
      rows.forEach(r => {
        const vals = cols.map(c => r[c]);
        stmt.run(vals);
      });
      try { stmt.free && stmt.free(); } catch(e){}
    };

    insert('products', ['id','name','description','price','stock','category','created_at'], products);
    insert('customers', ['id','name','email','phone','address','created_at'], customers);
    insert('customer_products', ['id','customer_id','product_id','quantity','assigned_at'], customer_products);

    db.run('COMMIT');

    // export and write file
    const bytes = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(bytes));
    console.log('Saved JSON into DB file, size', Buffer.from(bytes).length);

    res.json({ ok: true });
  } catch (err) {
    console.error('Error in /api/save-all', err);
    res.status(500).send('Error');
  }
});

const port = process.env.PORT || 5174;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`DB server listening on http://${host === '0.0.0.0' ? '0.0.0.0' : host}:${port}`));
