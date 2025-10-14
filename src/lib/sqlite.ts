// Helper to initialize sql.js (SQLite compiled to WASM) in the browser and expose a simple DB API

import initSqlJs, { SqlJsStatic, Database } from 'sql.js';
import Database from 'better-sqlite3';
import path from 'path';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

const IDB_NAME = 'click-storage-sqlite';
const IDB_STORE = 'databases';
const IDB_KEY = 'sqlite-db';

const dbPath = path.resolve(__dirname, '../../data/database.sqlite');
db = new Database(dbPath, { verbose: console.log });

// Inicializar tabelas, se necessário
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_serial_numbers (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    FOREIGN KEY (product_id) REFERENCES products (id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customer_products (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );
`);

async function openIdb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(IDB_STORE)) d.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDatabaseToIndexedDB(key = IDB_KEY) {
  if (!db) return;
  try {
    const bytes = db.export();
    const idb = await openIdb();
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(bytes.buffer, key);
    return new Promise<void>((res, rej) => {
      tx.oncomplete = () => {
        // After IndexedDB write completes, also try to persist to server
        (async () => {
          try {
            await saveDatabaseToServer();
          } catch (e) {
            // ignore server save failures, but continue
          } finally {
            idb.close();
            res();
          }
        })();
      };
      tx.onerror = () => { idb.close(); rej(tx.error); };
    });
  } catch (err) {
    console.error('Erro ao salvar DB no IndexedDB', err);
  }
}

// Save to server file (POST /db) — non-blocking if server isn't present
export async function saveDatabaseToServer(url?: string) {
  if (!db) return;
  try {
    const bytes = db.export();
    // build server URL if not provided: use current hostname and port 5174
    if (!url) {
      const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
      const scheme = (typeof window !== 'undefined' && window.location && window.location.protocol) ? window.location.protocol : 'http:';
      url = `${scheme}//${hostname}:5174/db`;
    }
    const res = await fetch(url, { method: 'POST', body: bytes, headers: { 'Content-Type': 'application/octet-stream' } });
    if (!res.ok) {
      const text = await res.text().catch(() => '<no body>');
      console.warn('Saving DB to server failed', res.status, text, 'url', url);
    } else {
      console.log('Saved DB to server', url);
    }
  } catch (err) {
    console.warn('Could not save DB to server', err);
  }
}

export async function loadDatabaseFromIndexedDB(key = IDB_KEY): Promise<Uint8Array | null> {
  try {
    const idb = await openIdb();
    return new Promise<Uint8Array | null>((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => {
        const result = req.result;
        idb.close();
        if (!result) return resolve(null);
        // result is an ArrayBuffer
        resolve(new Uint8Array(result));
      };
      req.onerror = () => { idb.close(); reject(req.error); };
    });
  } catch (err) {
    console.error('Erro ao carregar DB do IndexedDB', err);
    return null;
  }
}

export async function deleteDatabaseFromIndexedDB(key = IDB_KEY) {
  try {
    const idb = await openIdb();
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    return new Promise<void>((res, rej) => {
      tx.oncomplete = () => { idb.close(); res(); };
      tx.onerror = () => { idb.close(); rej(tx.error); };
    });
  } catch (err) {
    console.warn('Erro ao deletar DB corrompido do IndexedDB', err);
  }
}

export async function initSql() {
  if (SQL && db) return { SQL, db };
  SQL = await initSqlJs({ locateFile: (file: any) => `/node_modules/sql.js/dist/${file}` });

  // Try to load persisted DB from IndexedDB
  const saved = await loadDatabaseFromIndexedDB();
  if (saved) {
    // Validate the saved bytes — guard against corrupted/HTML content
    const isSqlite = (bytes: Uint8Array) => {
      try {
        const header = String.fromCharCode(...Array.from(bytes.slice(0, 16)));
        return header.startsWith('SQLite format 3');
      } catch (e) {
        return false;
      }
    };

    if (isSqlite(saved)) {
      try {
        db = new SQL.Database(saved);
      } catch (err) {
        console.warn('IndexedDB DB bytes looked like sqlite but failed to open, deleting and falling back:', err);
        await deleteDatabaseFromIndexedDB();
        db = null as any;
      }
    } else {
      console.warn('IndexedDB entry is not a SQLite file, deleting and falling back');
      await deleteDatabaseFromIndexedDB();
      db = null as any;
    }
  }

  if (!db) {
  // try to fetch from server endpoint /db (server must be running)
  // candidates: same origin, then using current hostname with port 5174
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
  const scheme = (typeof window !== 'undefined' && window.location && window.location.protocol) ? window.location.protocol : 'http:';
  const candidates = ['/db', `${scheme}//${hostname}:5174/db`, `${scheme}//${hostname}:5174/db`];
    let loaded = false;
    const isSqlite = (bytes: Uint8Array) => {
      try { return String.fromCharCode(...Array.from(bytes.slice(0,16))).startsWith('SQLite format 3'); } catch { return false; }
    };

    for (const url of candidates) {
      try {
  const res = await fetch(url);
  console.log('Attempted fetch', url, 'status', res.status, 'content-type', res.headers.get('content-type'));
  if (!res.ok) continue;
  const ab = await res.arrayBuffer();
        const bytes = new Uint8Array(ab);
        if (!isSqlite(bytes)) {
          console.warn(`Fetched file from ${url} does not have SQLite header — skipping`);
          continue;
        }
        try {
          db = new SQL.Database(bytes);
          loaded = true;
          break;
        } catch (err) {
          console.warn(`Fetched file from ${url} looked like sqlite but failed to open:`, err);
        }
      } catch (e) {
        // fetch failed, try next
      }
    }
    if (!loaded) {
      db = new SQL.Database();
    }
  }

  // Ensure tables exist
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

  // Expose debug helpers on window for convenience
  try {
    (window as any).__exportDatabase = () => db ? db.export() : null;
    (window as any).__saveDatabaseToIndexedDB = saveDatabaseToIndexedDB;
    (window as any).__loadDatabaseFromIndexedDB = async () => {
      const data = await loadDatabaseFromIndexedDB();
      if (data) importDatabase(data);
      return !!data;
    };
    // Auto-save DB when the page is about to be unloaded (new window/tab will have persisted copy)
    window.addEventListener('beforeunload', () => {
      try {
        // do not await in unload, fire-and-forget
        saveDatabaseToIndexedDB().catch(() => {});
      } catch (e) {
        // ignore
      }
    });
  } catch (e) {
    // ignore if not in browser env
  }

  return { SQL, db };
}

// Método para obter registros (GET)
export function getRecords(table: string) {
  try {
    const stmt = db.prepare(`SELECT * FROM ${table}`);
    return stmt.all();
  } catch (error) {
    console.error(`Erro ao obter registros da tabela ${table}:`, error);
    throw error;
  }
}

// Método para inserir registros (POST)
export function postRecord(table: string, data: Record<string, any>) {
  try {
    const keys = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const stmt = db.prepare(`INSERT INTO ${table} (${keys}) VALUES (${placeholders})`);
    stmt.run(values);
    console.log(`Registro inserido na tabela ${table}:`, data);
  } catch (error) {
    console.error(`Erro ao inserir registro na tabela ${table}:`, error);
    throw error;
  }
}

// Exportar o banco de dados para uso direto, se necessário
export function getDb() {
  return db;
}

export function exportDatabase(): Uint8Array | null {
  if (!db) return null;
  return db!.export();
}

export function importDatabase(data: Uint8Array) {
  if (!SQL) throw new Error('SQL not initialized');
  db = new SQL.Database(data);
}

export function downloadDatabase(filename = 'click-storage.sqlite') {
  const bytes = exportDatabase();
  if (!bytes) return;
  // ensure we pass a real ArrayBuffer to Blob
  const arrBuffer = (bytes && (bytes as any).buffer) ? (bytes as any).buffer as ArrayBuffer : Uint8Array.from(bytes).buffer;
  const blob = new Blob([arrBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importDatabaseFromFile(file: File) {
  const ab = await file.arrayBuffer();
  importDatabase(new Uint8Array(ab));
  // after import, save to indexedDB so it persists
  await saveDatabaseToIndexedDB();
}
