import { useEffect, useState } from 'react';
import { initSql, getDb } from '../lib/sqlite';
import { saveDatabaseToIndexedDB } from '../lib/sqlite';
import { saveDatabaseToServer } from '../lib/sqlite';
import { Product, Customer, CustomerProduct } from '../types';

export function useSqliteInventory() {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await initSql();
      if (!mounted) return;
      setReady(true);
      // Try to load authoritative dataset from server JSON sync endpoint.
      try {
        await tryLoadServerJson();
      } catch (err) {
        console.debug('No server JSON sync available or failed to load:', err);
      }
      await loadAll();
    })();
    return () => { mounted = false; };
  }, []);

  // Attempt to GET JSON dataset from server and import into local SQLite DB.
  async function tryLoadServerJson() {
    try {
      const proto = window.location.protocol;
      const host = window.location.hostname;
      const url = `${proto}//${host}:5174/api/all`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      if (!data || (!data.products && !data.customers && !data.customerProducts)) {
        throw new Error('Invalid payload');
      }
      const db = getDb();
      // Import JSON into DB: wipe tables and insert
      db.run('BEGIN');
      try {
        db.run('DELETE FROM customer_products');
        db.run('DELETE FROM products');
        db.run('DELETE FROM customers');

        const insertProduct = 'INSERT INTO products (id, name, description, price, stock, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
        for (const p of data.products || []) {
          db.run(insertProduct, [p.id, p.name, p.description, p.price, p.stock, p.category, p.createdAt ?? p.created_at]);
        }

        const insertCustomer = 'INSERT INTO customers (id, name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?)';
        for (const c of data.customers || []) {
          db.run(insertCustomer, [c.id, c.name, c.email, c.phone, c.address, c.createdAt ?? c.created_at]);
        }

        const insertCP = 'INSERT INTO customer_products (id, customer_id, product_id, quantity, assigned_at) VALUES (?, ?, ?, ?, ?)';
        for (const cp of data.customerProducts || []) {
          db.run(insertCP, [cp.id, cp.customerId ?? cp.customer_id, cp.productId ?? cp.product_id, cp.quantity, cp.assignedAt ?? cp.assigned_at]);
        }

        db.run('COMMIT');
        // Persist local copy
        await saveDatabaseToIndexedDB();
      } catch (err) {
        db.run('ROLLBACK');
        throw err;
      }
    } catch (err) {
      // bubble up so caller can decide fallback
      throw err;
    }
  }

  // POST current dataset to server JSON endpoint for cross-machine sync.
  async function postAllToServer() {
    try {
      const proto = window.location.protocol;
      const host = window.location.hostname;
      const url = `${proto}//${host}:5174/api/save-all`;
      // Ensure we send plain JSON-friendly shapes (dates as ISO strings)
      const payload = {
        products: products.map(p => ({ ...p, createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt })),
        customers: customers.map(c => ({ ...c, createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt })),
        customerProducts: customerProducts.map(cp => ({ ...cp, assignedAt: cp.assignedAt instanceof Date ? cp.assignedAt.toISOString() : cp.assignedAt })),
      };
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (err) {
      console.warn('Failed posting JSON sync to server', err);
    }
  }

  async function loadAll() {
    try {
      const db = getDb();
      const p = db.exec('SELECT * FROM products ORDER BY created_at DESC');
      const c = db.exec('SELECT * FROM customers ORDER BY created_at DESC');
      const cp = db.exec('SELECT * FROM customer_products ORDER BY assigned_at DESC');

      const rows = (res: any[]) => {
        if (!res || res.length === 0) return [];
        const cols = res[0].columns;
        return res[0].values.map((v: any[]) => { 
          const obj: any = {};
          cols.forEach((col: string, i: number) => obj[col] = v[i]);
          return obj;
        });
      };

      const mapKeys = (items: any[]) => items.map(it => {
        const out: any = {};
        for (const k of Object.keys(it)) {
          const v = it[k];
          const camel = k.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
          out[camel] = v;
        }
        return out;
      });

      setProducts(mapKeys(rows(p)));
      setCustomers(mapKeys(rows(c)));
      setCustomerProducts(mapKeys(rows(cp)));
    } catch (err) {
      console.error('Erro carregando DB SQLite', err);
    }
  }

  async function createProduct(prod: Omit<Product, 'id' | 'createdAt'>) {
    const newProduct: Product = { ...prod, id: Date.now().toString(), createdAt: new Date() } as any;
    const db = getDb();
    db.run(
      'INSERT INTO products (id, name, description, price, stock, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newProduct.id, newProduct.name, newProduct.description, newProduct.price, newProduct.stock, newProduct.category, newProduct.createdAt.toISOString()]
    );
    setProducts(prev => [newProduct, ...prev]);
    await saveDatabaseToIndexedDB();
    // ensure server copy is updated
    await saveDatabaseToServer();
  await postAllToServer();
    return newProduct;
  }

  async function updateProduct(id: string, updates: Partial<Product>) {
    const db = getDb();
    const p = products.find(x => x.id === id);
    if (!p) throw new Error('Produto não encontrado');
    const updated = { ...p, ...updates } as Product;
    db.run('UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?', [updated.name, updated.description, updated.price, updated.stock, updated.category, id]);
    setProducts(prev => prev.map(x => x.id === id ? updated : x));
    await saveDatabaseToIndexedDB();
    await saveDatabaseToServer();
  await postAllToServer();
    return updated;
  }

  async function deleteProduct(id: string) {
    const db = getDb();
    db.run('DELETE FROM products WHERE id = ?', [id]);
    db.run('DELETE FROM customer_products WHERE product_id = ?', [id]);
    setProducts(prev => prev.filter(p => p.id !== id));
    setCustomerProducts(prev => prev.filter(cp => cp.productId !== id as any));
    await saveDatabaseToIndexedDB();
    await saveDatabaseToServer();
    await postAllToServer();
  }

  async function createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>) {
    const newCustomer: Customer = { ...customer, id: Date.now().toString(), createdAt: new Date() } as any;
    const db = getDb();
    db.run('INSERT INTO customers (id, name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?)', [newCustomer.id, newCustomer.name, newCustomer.email, newCustomer.phone, newCustomer.address, newCustomer.createdAt.toISOString()]);
    setCustomers(prev => [newCustomer, ...prev]);
    await saveDatabaseToIndexedDB();
    await saveDatabaseToServer();
  await postAllToServer();
    return newCustomer;
  }

  async function updateCustomer(id: string, updates: Partial<Customer>) {
    const db = getDb();
    const c = customers.find(x => x.id === id);
    if (!c) throw new Error('Cliente não encontrado');
    const updated = { ...c, ...updates } as Customer;
    db.run('UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?', [updated.name, updated.email, updated.phone, updated.address, id]);
    setCustomers(prev => prev.map(x => x.id === id ? updated : x));
    await saveDatabaseToIndexedDB();
    await saveDatabaseToServer();
  await postAllToServer();
    return updated;
  }

  async function deleteCustomer(id: string) {
    const db = getDb();
    db.run('DELETE FROM customers WHERE id = ?', [id]);
    db.run('DELETE FROM customer_products WHERE customer_id = ?', [id]);
    setCustomers(prev => prev.filter(c => c.id !== id));
    setCustomerProducts(prev => prev.filter(cp => cp.customerId !== id as any));
    await saveDatabaseToIndexedDB();
    await saveDatabaseToServer();
    await postAllToServer();
  }

  async function assignProductToCustomer(customerId: string, productId: string, quantity: number) {
    const db = getDb();
    // check existing
    const res = db.exec('SELECT * FROM customer_products WHERE customer_id = ? AND product_id = ?', [customerId, productId]);
    if (res && res.length > 0) {
      // update
      const id = res[0].values[0][0];
      db.run('UPDATE customer_products SET quantity = quantity + ?, assigned_at = ? WHERE id = ?', [quantity, new Date().toISOString(), id]);
    } else {
      const id = Date.now().toString();
      db.run('INSERT INTO customer_products (id, customer_id, product_id, quantity, assigned_at) VALUES (?, ?, ?, ?, ?)', [id, customerId, productId, quantity, new Date().toISOString()]);
    }
    // decrease stock
    const prod = products.find(p => p.id === productId);
    if (prod) await updateProduct(productId, { stock: prod.stock - quantity });
    // reload associations
    await loadAll();
    await saveDatabaseToIndexedDB();
    await saveDatabaseToServer();
    await postAllToServer();
  }

  async function removeProductFromCustomer(customerProductId: string) {
    const db = getDb();
    const res = db.exec('SELECT * FROM customer_products WHERE id = ?', [customerProductId]);
    if (res && res.length > 0) {
      const row = res[0];
      const cols = row.columns;
      const vals = row.values[0];
      const obj: any = {};
      cols.forEach((c: string, i: number) => obj[c] = vals[i]);
      // return stock
      const prod = products.find(p => p.id === obj.product_id);
      if (prod) await updateProduct(prod.id, { stock: prod.stock + obj.quantity });
    }
    db.run('DELETE FROM customer_products WHERE id = ?', [customerProductId]);
    setCustomerProducts(prev => prev.filter(cp => cp.id !== customerProductId as any));
    await saveDatabaseToIndexedDB();
    await saveDatabaseToServer();
    await postAllToServer();
  }

  return {
    ready,
    products,
    customers,
    customerProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    assignProductToCustomer,
    removeProductFromCustomer,
    reload: loadAll,
  };
}
      await saveDatabaseToIndexedDB();
