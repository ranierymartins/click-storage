import fs from 'fs';
import path from 'path';
import { Low, JSONFile } from 'lowdb';

const dataDir = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'db.json');

type Schema = {
  products: any[];
  customers: any[];
  customer_products: any[];
  companies: any[];
  accessories: any[];
  maintenance_items: any[];
  customer_accessories?: any[];
};

const adapter = new JSONFile<Schema>(dbPath);
export const db = new Low<Schema>(adapter);

export async function ensureDB() {
  await db.read();
  db.data ||= { products: [], customers: [], customer_products: [], companies: [], accessories: [], maintenance_items: [], customer_accessories: [] };
  await db.write();
}

