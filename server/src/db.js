import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'server', 'data');
const dbPath = path.join(dataDir, 'db.json');

const defaultData = {
  products: [],
  customers: [],
  customer_products: [],
  companies: [],
  accessories: [],
  maintenance_items: [],
  customer_accessories: []
};

let state = { ...defaultData };

async function ensureDir() {
  if (!fs.existsSync(dataDir)) await fsPromises.mkdir(dataDir, { recursive: true });
}

async function load() {
  try {
    await ensureDir();
    const raw = await fsPromises.readFile(dbPath, 'utf8');
    state = JSON.parse(raw);
    // ensure keys exist
    state = { ...defaultData, ...state };
  } catch (err) {
    // file doesn't exist or parse error -> initialize
    state = { ...defaultData };
    await save();
  }
}

let saving = false;
async function save() {
  await ensureDir();
  const tmp = dbPath + '.tmp';
  const dataStr = JSON.stringify(state, null, 2);
  // simple write (atomic via rename)
  await fsPromises.writeFile(tmp, dataStr, 'utf8');
  await fsPromises.rename(tmp, dbPath);
}

export async function ensureDB() {
  await load();
}

export function getState() {
  return state;
}

export async function persist() {
  // avoid concurrent saves if called quickly in succession
  if (saving) return;
  saving = true;
  try {
    await save();
  } finally {
    saving = false;
  }
}

export default { ensureDB, getState, persist };
