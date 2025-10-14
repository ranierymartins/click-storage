import { useState, useEffect, useRef } from 'react';
import { Product, Customer, CustomerProduct, Company, MaintenanceItem, CustomerAccessory } from '../types';

// Enable remote sync by setting VITE_REMOTE_SYNC=true in your .env
const REMOTE_SYNC_ENABLED = import.meta.env.VITE_REMOTE_SYNC === 'true';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accessories, setAccessories] = useState<any[]>([]);
  const [customerAccessories, setCustomerAccessories] = useState<CustomerAccessory[]>([]);
  // Ref to avoid writing to localStorage during the initial load
  const initializedRef = useRef(false);
  const remoteReadyRef = useRef(false);

  // Load data from localStorage on mount
  useEffect(() => {
    let supabase: any | null = null;
    const tryLoadRemote = async () => {
      if (!REMOTE_SYNC_ENABLED) return;
      try {
        const mod = await import('../lib/supabase');
        supabase = mod.supabase;
        // pull remote tables (products/customers/customer_products)
        const [
          { data: remoteProducts },
          { data: remoteCustomers },
          { data: remoteCustomerProducts },
          { data: remoteCompanies },
          { data: remoteAccessories },
          { data: remoteMaintenance },
          { data: remoteCustomerAccessories },
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('customers').select('*'),
          supabase.from('customer_products').select('*'),
          supabase.from('companies').select('*'),
          supabase.from('accessories').select('*'),
          supabase.from('maintenance_items').select('*'),
          supabase.from('customer_accessories').select('*'),
        ]);

        if (remoteProducts && Array.isArray(remoteProducts) && remoteProducts.length > 0) {
          const normalized = remoteProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: p.price || 0,
            stock: p.stock || 0,
            category: p.category || '',
            brand: (p as any).brand || undefined,
            serialNumbers: (p as any).serial_numbers || [],
            createdAt: p.created_at ? new Date(p.created_at) : new Date(),
          }));
          setProducts(normalized as Product[]);
        }

        if (remoteCustomers && Array.isArray(remoteCustomers) && remoteCustomers.length > 0) {
          const normalized = remoteCustomers.map((c: any) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone || '', address: c.address || '', createdAt: c.created_at ? new Date(c.created_at) : new Date() }));
          setCustomers(normalized as Customer[]);
        }

        if (remoteCustomerProducts && Array.isArray(remoteCustomerProducts) && remoteCustomerProducts.length > 0) {
          const normalized = remoteCustomerProducts.map((cp: any) => ({ id: cp.id, customerId: cp.customer_id, productId: cp.product_id, quantity: cp.quantity || 0, assignedAt: cp.assigned_at ? new Date(cp.assigned_at) : new Date() }));
          setCustomerProducts(normalized as CustomerProduct[]);
        }

        if (remoteCompanies && Array.isArray(remoteCompanies) && remoteCompanies.length > 0) {
          const normalized = remoteCompanies.map((c: any) => ({ id: c.id, name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '', createdAt: c.created_at ? new Date(c.created_at) : new Date() }));
          setCompanies(normalized as Company[]);
        }

        if (remoteAccessories && Array.isArray(remoteAccessories) && remoteAccessories.length > 0) {
          const normalized = remoteAccessories.map((a: any) => ({ id: a.id, name: a.name, description: a.description || '', price: a.price || 0, stock: a.stock || 0, brand: a.brand || undefined, serialNumbers: Array.isArray(a.serial_numbers) ? a.serial_numbers : (typeof a.serial_numbers === 'string' ? a.serial_numbers.split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []), createdAt: a.created_at ? new Date(a.created_at) : new Date() }));
          setAccessories(normalized as any[]);
        }

        if (remoteMaintenance && Array.isArray(remoteMaintenance) && remoteMaintenance.length > 0) {
          const normalized = remoteMaintenance.map((m: any) => ({ id: m.id, originalProductId: m.original_product_id || undefined, name: m.name, description: m.description || '', price: m.price || 0, stock: m.stock || 0, brand: m.brand || undefined, serialNumbers: Array.isArray(m.serial_numbers) ? m.serial_numbers : (typeof m.serial_numbers === 'string' ? m.serial_numbers.split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []), companyId: m.company_id || undefined, createdAt: m.created_at ? new Date(m.created_at) : new Date() }));
          setMaintenanceItems(normalized as MaintenanceItem[]);
        }

        if (remoteCustomerAccessories && Array.isArray(remoteCustomerAccessories) && remoteCustomerAccessories.length > 0) {
          const normalized = remoteCustomerAccessories.map((ca: any) => ({ id: ca.id, customerId: ca.customer_id, accessoryId: ca.accessory_id, quantity: ca.quantity || 0, serialNumbers: Array.isArray(ca.serial_numbers) ? ca.serial_numbers : (typeof ca.serial_numbers === 'string' ? ca.serial_numbers.split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []), assignedAt: ca.assigned_at ? new Date(ca.assigned_at) : new Date() }));
          setCustomerAccessories(normalized as CustomerAccessory[]);
        }

        remoteReadyRef.current = true;
        console.debug('[useInventory] loaded remote data from Supabase');
      } catch (err) {
        console.warn('[useInventory] remote sync enabled but failed to load Supabase client or data', err);
      }
    };

    tryLoadRemote();
  const savedProducts = localStorage.getItem('inventory-products');
  const savedCustomers = localStorage.getItem('inventory-customers');
  const savedCompanies = localStorage.getItem('inventory-companies');
  const savedAccessories = localStorage.getItem('inventory-accessories');
  const savedCustomerProducts = localStorage.getItem('inventory-customer-products');
  const savedCustomerAccessories = localStorage.getItem('inventory-customer-accessories');
  // legacy storage keys (older versions / csv utils)
  const legacyProducts = localStorage.getItem('produtos');
  const legacyCustomers = localStorage.getItem('clientes');
  const legacyCompanies = localStorage.getItem('empresas');

    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts) as any[];
        const normalized = parsed.map(p => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          // normalize serialNumbers stored as string to array
          serialNumbers: Array.isArray(p.serialNumbers)
            ? p.serialNumbers
            : typeof p.serialNumbers === 'string'
              ? (p.serialNumbers as string).split(';').map((s: string) => s.trim()).filter((s: string) => s)
              : p.serialNumbers || [],
        }));
        setProducts(normalized as Product[]);
      } catch (err) {
        setProducts(JSON.parse(savedProducts));
      }
    }
    // If inventory-products not found, try migrating legacy 'produtos'
    if (!savedProducts && legacyProducts) {
      try {
        const parsed = JSON.parse(legacyProducts) as any[];
        const normalized = parsed.map(p => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          serialNumbers: Array.isArray(p.serialNumbers)
            ? p.serialNumbers
            : typeof p.serialNumbers === 'string'
              ? (p.serialNumbers as string).split(';').map((s: string) => s.trim()).filter((s: string) => s)
              : p.serialNumbers || [],
        }));
        setProducts(normalized as Product[]);
        // also write it back to new key to ensure future loads are from inventory-*
        try { localStorage.setItem('inventory-products', JSON.stringify(normalized)); } catch (e) {}
      } catch (err) {
        setProducts(JSON.parse(legacyProducts));
      }
    }
    if (savedCustomers) {
      try {
        const parsed = JSON.parse(savedCustomers) as any[];
        const normalized = parsed.map(c => ({ ...c, createdAt: c.createdAt ? new Date(c.createdAt) : new Date() }));
        setCustomers(normalized as Customer[]);
      } catch (err) {
        setCustomers(JSON.parse(savedCustomers));
      }
    }
    // If inventory-customers not found, try migrating legacy 'clientes'
    if (!savedCustomers && legacyCustomers) {
      try {
        const parsed = JSON.parse(legacyCustomers) as any[];
        const normalized = parsed.map(c => ({ ...c, createdAt: c.createdAt ? new Date(c.createdAt) : new Date() }));
        setCustomers(normalized as Customer[]);
        try { localStorage.setItem('inventory-customers', JSON.stringify(normalized)); } catch (e) {}
      } catch (err) {
        setCustomers(JSON.parse(legacyCustomers));
      }
    }
    if (savedCompanies) {
      try {
        const parsed = JSON.parse(savedCompanies) as any[];
        const normalized = parsed.map(c => ({ ...c, createdAt: c.createdAt ? new Date(c.createdAt) : new Date() }));
        setCompanies(normalized as Company[]);
      } catch (err) {
        setCompanies(JSON.parse(savedCompanies));
      }
    }
    // load accessories
    if (savedAccessories) {
      try {
        const parsed = JSON.parse(savedAccessories) as any[];
        const normalized = parsed.map(a => ({
          ...a,
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
          serialNumbers: Array.isArray(a.serialNumbers)
            ? a.serialNumbers
            : typeof a.serialNumbers === 'string'
              ? (a.serialNumbers as string).split(';').map((s: string) => s.trim()).filter((s: string) => s)
              : a.serialNumbers || [],
        }));
        setAccessories(normalized);
      } catch (err) {
        setAccessories(JSON.parse(savedAccessories));
      }
    }
    // If inventory-companies not found, try migrating legacy 'empresas'
    if (!savedCompanies && legacyCompanies) {
      try {
        const parsed = JSON.parse(legacyCompanies) as any[];
        const normalized = parsed.map(c => ({ ...c, createdAt: c.createdAt ? new Date(c.createdAt) : new Date() }));
        setCompanies(normalized as Company[]);
        try { localStorage.setItem('inventory-companies', JSON.stringify(normalized)); } catch (e) {}
      } catch (err) {
        setCompanies(JSON.parse(legacyCompanies));
      }
    }
    if (savedCustomerProducts) {
      try {
        const parsed = JSON.parse(savedCustomerProducts) as any[];
        const normalized = parsed.map(cp => ({
          ...cp,
          assignedAt: cp.assignedAt ? new Date(cp.assignedAt) : new Date(),
          serialNumbers: Array.isArray(cp.serialNumbers)
            ? cp.serialNumbers
            : typeof cp.serialNumbers === 'string'
              ? (cp.serialNumbers as string).split(';').map((s: string) => s.trim()).filter((s: string) => s)
              : cp.serialNumbers || [],
        }));
        setCustomerProducts(normalized as CustomerProduct[]);
      } catch (err) {
        setCustomerProducts(JSON.parse(savedCustomerProducts));
      }
    }
    if (savedCustomerAccessories) {
      try {
        const parsed = JSON.parse(savedCustomerAccessories) as any[];
        const normalized = parsed.map(ca => ({
          ...ca,
          assignedAt: ca.assignedAt ? new Date(ca.assignedAt) : new Date(),
          serialNumbers: Array.isArray(ca.serialNumbers)
            ? ca.serialNumbers
            : typeof ca.serialNumbers === 'string'
              ? (ca.serialNumbers as string).split(';').map((s: string) => s.trim()).filter((s: string) => s)
              : ca.serialNumbers || [],
        }));
        setCustomerAccessories(normalized as CustomerAccessory[]);
      } catch (err) {
        setCustomerAccessories(JSON.parse(savedCustomerAccessories));
      }
    }
  const savedMaintenance = localStorage.getItem('inventory-maintenance-items');
  if (savedMaintenance) {
      try {
        const parsed = JSON.parse(savedMaintenance) as any[];
        const normalized = parsed.map(m => ({
          ...m,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
          serialNumbers: Array.isArray(m.serialNumbers)
            ? m.serialNumbers
            : typeof m.serialNumbers === 'string'
              ? (m.serialNumbers as string).split(';').map((s: string) => s.trim()).filter((s: string) => s)
              : m.serialNumbers || [],
        }));
        setMaintenanceItems(normalized as MaintenanceItem[]);
      } catch (err) {
        setMaintenanceItems(JSON.parse(savedMaintenance));
      }
    }
    console.debug('[useInventory] loaded from localStorage', {
      products: (savedProducts ? JSON.parse(savedProducts) : []).length,
      customers: (savedCustomers ? JSON.parse(savedCustomers) : []).length,
      companies: (savedCompanies ? JSON.parse(savedCompanies) : []).length,
      customerProducts: (savedCustomerProducts ? JSON.parse(savedCustomerProducts) : []).length,
      maintenance: (savedMaintenance ? JSON.parse(savedMaintenance) : []).length,
      accessories: (savedAccessories ? JSON.parse(savedAccessories) : []).length,
      customerAccessories: (savedCustomerAccessories ? JSON.parse(savedCustomerAccessories) : []).length,
    });
    // mark initialization complete so subsequent state changes are saved
    setTimeout(() => { initializedRef.current = true; }, 0);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!initializedRef.current) return;
    console.debug('[useInventory] saving products', products.length);
    const json = JSON.stringify(products);
    localStorage.setItem('inventory-products', json);
    // mirror to legacy key for compatibility with csvUtils
    try { localStorage.setItem('produtos', json); } catch (e) {}
    // optionally push to remote
    (async () => {
      if (!REMOTE_SYNC_ENABLED) return;
      try {
        const mod = await import('../lib/supabase');
        const supabase = mod.supabase;
        // upsert products into remote table
        const payload = products.map(p => ({ id: p.id, name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, brand: (p as any).brand || null, created_at: p.createdAt.toISOString() }));
        await supabase.from('products').upsert(payload);
        console.debug('[useInventory] pushed products to remote');
      } catch (err) {
        console.warn('[useInventory] failed pushing products remote', err);
      }
    })();
  }, [products]);

  useEffect(() => {
    if (!initializedRef.current) return;
    console.debug('[useInventory] saving companies', companies.length);
    const json = JSON.stringify(companies);
    localStorage.setItem('inventory-companies', json);
    // mirror to legacy 'empresas' key if present in other tools
    try { localStorage.setItem('empresas', json); } catch (e) {}
    // optionally push companies to remote
    (async () => {
      if (!REMOTE_SYNC_ENABLED) return;
      try {
        const mod = await import('../lib/supabase');
        const supabase = mod.supabase;
        const payload = companies.map(c => ({ id: c.id, name: c.name, email: c.email || undefined, phone: c.phone || undefined, address: c.address || undefined, created_at: c.createdAt.toISOString() }));
        await supabase.from('companies').upsert(payload);
        console.debug('[useInventory] pushed companies to remote');
      } catch (err) {
        console.warn('[useInventory] failed pushing companies remote', err);
      }
    })();
  }, [companies]);

  useEffect(() => {
    if (!initializedRef.current) return;
    console.debug('[useInventory] saving accessories', accessories.length);
    const json = JSON.stringify(accessories);
    localStorage.setItem('inventory-accessories', json);
    // mirror legacy key 'acessorios' for older tools (best-effort)
    try { localStorage.setItem('acessorios', json); } catch (e) {}
    (async () => {
      if (!REMOTE_SYNC_ENABLED) return;
      try {
        const mod = await import('../lib/supabase');
        const supabase = mod.supabase;
        const payload = accessories.map(a => ({ id: a.id, name: a.name, description: a.description || undefined, price: a.price || 0, stock: a.stock || 0, brand: (a as any).brand || undefined, serial_numbers: Array.isArray((a as any).serialNumbers) ? (a as any).serialNumbers : undefined, created_at: a.createdAt.toISOString() }));
        await supabase.from('accessories').upsert(payload);
        console.debug('[useInventory] pushed accessories to remote');
      } catch (err) {
        console.warn('[useInventory] failed pushing accessories remote', err);
      }
    })();
  }, [accessories]);

  useEffect(() => {
    if (!initializedRef.current) return;
    console.debug('[useInventory] saving customerAccessories', customerAccessories.length);
    const json = JSON.stringify(customerAccessories);
    localStorage.setItem('inventory-customer-accessories', json);
  }, [customerAccessories]);

  useEffect(() => {
    if (!initializedRef.current) return;
    console.debug('[useInventory] saving customers', customers.length);
    const json = JSON.stringify(customers);
    localStorage.setItem('inventory-customers', json);
    try { localStorage.setItem('clientes', json); } catch (e) {}
    (async () => {
      if (!REMOTE_SYNC_ENABLED) return;
      try {
        const mod = await import('../lib/supabase');
        const supabase = mod.supabase;
  const payload = customers.map(c => ({ id: c.id, name: c.name, email: c.email, phone: c.phone || undefined, address: c.address || undefined, created_at: c.createdAt.toISOString() }));
        await supabase.from('customers').upsert(payload);
        console.debug('[useInventory] pushed customers to remote');
      } catch (err) {
        console.warn('[useInventory] failed pushing customers remote', err);
      }
    })();
  }, [customers]);

  useEffect(() => {
    if (!initializedRef.current) return;
    console.debug('[useInventory] saving customerProducts', customerProducts.length);
    const json = JSON.stringify(customerProducts);
    localStorage.setItem('inventory-customer-products', json);
    (async () => {
      if (!REMOTE_SYNC_ENABLED) return;
      try {
        const mod = await import('../lib/supabase');
        const supabase = mod.supabase;
  const payload = customerProducts.map(cp => ({ id: cp.id, customer_id: cp.customerId, product_id: cp.productId, quantity: cp.quantity, assigned_at: cp.assignedAt.toISOString() }));
        await supabase.from('customer_products').upsert(payload);
        console.debug('[useInventory] pushed customerProducts to remote');
      } catch (err) {
        console.warn('[useInventory] failed pushing customerProducts remote', err);
      }
    })();
  }, [customerProducts]);

  useEffect(() => {
    if (!initializedRef.current) return;
    console.debug('[useInventory] saving maintenanceItems', maintenanceItems.length);
    const json = JSON.stringify(maintenanceItems);
    localStorage.setItem('inventory-maintenance-items', json);
    (async () => {
      if (!REMOTE_SYNC_ENABLED) return;
      try {
        const mod = await import('../lib/supabase');
        const supabase = mod.supabase;
        const payload = maintenanceItems.map(m => ({ id: m.id, original_product_id: m.originalProductId || undefined, name: m.name, description: m.description || undefined, price: m.price || undefined, stock: m.stock || 0, brand: m.brand || undefined, serial_numbers: Array.isArray((m as any).serialNumbers) ? (m as any).serialNumbers : undefined, company_id: m.companyId || undefined, created_at: m.createdAt.toISOString() }));
        await supabase.from('maintenance_items').upsert(payload);
        console.debug('[useInventory] pushed maintenance items to remote');
      } catch (err) {
        console.warn('[useInventory] failed pushing maintenance remote', err);
      }
    })();
  }, [maintenanceItems]);

  useEffect(() => {
    if (!initializedRef.current) return;
    console.debug('[useInventory] saving customerAccessories', customerAccessories.length);
    const json = JSON.stringify(customerAccessories);
    localStorage.setItem('inventory-customer-accessories', json);
    (async () => {
      if (!REMOTE_SYNC_ENABLED) return;
      try {
        const mod = await import('../lib/supabase');
        const supabase = mod.supabase;
        const payload = customerAccessories.map(ca => ({ id: ca.id, customer_id: ca.customerId, accessory_id: ca.accessoryId, quantity: ca.quantity, serial_numbers: Array.isArray(ca.serialNumbers) ? ca.serialNumbers : undefined, assigned_at: ca.assignedAt.toISOString() }));
        await supabase.from('customer_accessories').upsert(payload);
        console.debug('[useInventory] pushed customer accessories to remote');
      } catch (err) {
        console.warn('[useInventory] failed pushing customer accessories remote', err);
      }
    })();
  }, [customerAccessories]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  // Accessories CRUD
  const addAccessory = (accessory: Omit<any, 'id' | 'createdAt'>) => {
    const newAccessory = { ...accessory, id: Date.now().toString(), createdAt: new Date() };
    setAccessories(prev => [...prev, newAccessory]);
  };

  const assignAccessoryToCustomer = (customerId: string, accessoryId: string, quantity: number) => {
    const accessory = accessories.find(a => a.id === accessoryId);
    if (!accessory) return;

    const rawSerials: any = (accessory as any).serialNumbers;
    const currentSerials: string[] = Array.isArray(rawSerials)
      ? rawSerials
      : typeof rawSerials === 'string'
        ? (rawSerials as string).split(';').map((s: string) => s.trim()).filter((s: string) => s)
        : [];

    const assignedSerials: string[] = currentSerials.slice(0, quantity);
    const remainingSerials: string[] = currentSerials.slice(assignedSerials.length);

    const existing = customerAccessories.find(ca => ca.customerId === customerId && ca.accessoryId === accessoryId);
    if (existing) {
      setCustomerAccessories(prev => prev.map(ca => ca.id === existing.id ? { ...ca, quantity: ca.quantity + (assignedSerials.length > 0 ? assignedSerials.length : quantity), serialNumbers: assignedSerials.length > 0 ? [...(ca.serialNumbers || []), ...assignedSerials] : ca.serialNumbers } : ca));
    } else {
      const newAssignment: CustomerAccessory = {
        id: Date.now().toString(),
        customerId,
        accessoryId,
        quantity: assignedSerials.length > 0 ? assignedSerials.length : quantity,
        serialNumbers: assignedSerials.length > 0 ? assignedSerials : undefined,
        assignedAt: new Date(),
      };
      setCustomerAccessories(prev => [...prev, newAssignment]);
    }

    // update accessory stock and serials
    const newStock = Math.max(0, accessory.stock - (assignedSerials.length > 0 ? assignedSerials.length : quantity));
    updateAccessory(accessoryId, { stock: newStock, serialNumbers: remainingSerials });
  };

  const assignAccessoryToCustomerBySerials = (customerId: string, accessoryId: string, serials: string[]) => {
    if (!serials || serials.length === 0) return;
    const accessory = accessories.find(a => a.id === accessoryId);
    if (!accessory) return;

    const rawSerials: any = (accessory as any).serialNumbers;
    const currentSerials: string[] = Array.isArray(rawSerials)
      ? rawSerials
      : typeof rawSerials === 'string'
        ? rawSerials.split(';').map((s: string) => s.trim()).filter((s: string) => s)
        : [];
    const remainingSerials: string[] = currentSerials.filter((s: string) => !serials.includes(s));

    updateAccessory(accessoryId, { stock: Math.max(0, accessory.stock - serials.length), serialNumbers: remainingSerials });

    const existing = customerAccessories.find(ca => ca.customerId === customerId && ca.accessoryId === accessoryId);
    if (existing) {
      setCustomerAccessories(prev => prev.map(ca => ca.id === existing.id ? { ...ca, quantity: ca.quantity + serials.length, serialNumbers: [...(ca.serialNumbers || []), ...serials] } : ca));
    } else {
      const newAssignment: CustomerAccessory = { id: Date.now().toString(), customerId, accessoryId, quantity: serials.length, serialNumbers: serials, assignedAt: new Date() };
      setCustomerAccessories(prev => [...prev, newAssignment]);
    }
  };

  const removeAccessoryFromCustomer = (customerAccessoryId: string) => {
    const assignment = customerAccessories.find(ca => ca.id === customerAccessoryId);
    if (!assignment) return;
    const accessory = accessories.find(a => a.id === assignment.accessoryId);
    if (accessory) {
      const assignmentRaw: any = (assignment as any).serialNumbers;
      const assignmentSerials: string[] = Array.isArray(assignmentRaw) ? assignmentRaw : (typeof assignmentRaw === 'string' ? (assignmentRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);
      const accessoryRaw: any = (accessory as any).serialNumbers;
      const accessorySerials: string[] = Array.isArray(accessoryRaw) ? accessoryRaw : (typeof accessoryRaw === 'string' ? (accessoryRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);
      const newSerials = [...accessorySerials, ...assignmentSerials];
      updateAccessory(accessory.id, { stock: accessory.stock + assignment.quantity, serialNumbers: newSerials });
    }
    setCustomerAccessories(prev => prev.filter(ca => ca.id !== customerAccessoryId));
  };

  const returnAssignedAccessorySerialsToStock = (customerId: string, accessoryId: string, serials: string[]) => {
    if (!serials || serials.length === 0) return;
    const assignment = customerAccessories.find(ca => ca.customerId === customerId && ca.accessoryId === accessoryId);
    if (!assignment) return;
    const assignmentRaw: any = (assignment as any).serialNumbers;
    const assignmentSerials: string[] = Array.isArray(assignmentRaw) ? assignmentRaw : (typeof assignmentRaw === 'string' ? (assignmentRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);
    const toReturn = assignmentSerials.filter(s => serials.includes(s));
    if (toReturn.length === 0) return;

    const remainingAssignmentSerials = assignmentSerials.filter(s => !toReturn.includes(s));
    const remainingQuantity = Math.max(0, assignment.quantity - toReturn.length);

    if (remainingQuantity === 0) {
      setCustomerAccessories(prev => prev.filter(ca => ca.id !== assignment.id));
    } else {
      setCustomerAccessories(prev => prev.map(ca => ca.id === assignment.id ? { ...ca, quantity: remainingQuantity, serialNumbers: remainingAssignmentSerials } : ca));
    }

    const accessory = accessories.find(a => a.id === accessoryId);
    if (accessory) {
      const accessoryRaw: any = (accessory as any).serialNumbers;
      const accessorySerials: string[] = Array.isArray(accessoryRaw) ? accessoryRaw : (typeof accessoryRaw === 'string' ? (accessoryRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);
      const newAccessorySerials = [...accessorySerials, ...toReturn];
      updateAccessory(accessory.id, { stock: accessory.stock + toReturn.length, serialNumbers: newAccessorySerials });
    }
  };

  const updateAccessory = (id: string, updates: Partial<any>) => {
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccessory = (id: string) => {
    setAccessories(prev => prev.filter(a => a.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    // Also remove any customer associations
    setCustomerProducts(prev => prev.filter(cp => cp.productId !== id));
  };

  const moveProductToMaintenance = (productId: string, serials?: string[], companyId?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // If serials are provided, split the product into remaining and maintenance items
    if (serials && serials.length > 0) {
      const rawSerials = (product as any).serialNumbers;
      const currentSerials: string[] = Array.isArray(rawSerials)
        ? rawSerials
        : typeof rawSerials === 'string'
          ? rawSerials.split(';').map((s: string) => s.trim()).filter((s: string) => s)
          : [];

      const remainingSerials = currentSerials.filter(s => !serials.includes(s));

      // update original product
      updateProduct(productId, { stock: remainingSerials.length, serialNumbers: remainingSerials });

      // create maintenance item for each serial
      const maintenanceProduct: MaintenanceItem = {
        id: `${product.id}-mnt-${Date.now()}`,
        originalProductId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: serials.length,
        brand: product.brand,
        serialNumbers: serials,
        companyId: companyId,
        createdAt: new Date(),
      };
      setMaintenanceItems(prev => [...prev, maintenanceProduct]);
    } else {
      // move whole product to maintenance
      // when moving whole product, keep reference to original id
      const maintenanceProduct: MaintenanceItem = {
        id: `${product.id}-mnt-${Date.now()}`,
        originalProductId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        brand: product.brand,
        serialNumbers: Array.isArray((product as any).serialNumbers) ? (product as any).serialNumbers : [],
        companyId: companyId,
        createdAt: new Date(),
      };
      setProducts(prev => prev.filter(p => p.id !== productId));
      setMaintenanceItems(prev => [...prev, maintenanceProduct]);
      // remove customer associations
      setCustomerProducts(prev => prev.filter(cp => cp.productId !== productId));
    }
  };

  const restoreFromMaintenance = (maintenanceId: string) => {
    const m = maintenanceItems.find(m => m.id === maintenanceId);
    if (!m) return;
    // when restoring, if original product id present in products, merge serials and stock
    const originalIdParts = m.id.split('-mnt-');
    const originalId = originalIdParts[0];
    const existing = products.find(p => p.id === originalId);
    if (existing) {
  const existingRaw: any = (existing as any).serialNumbers;
  const existingSerials: string[] = Array.isArray(existingRaw) ? existingRaw : (typeof existingRaw === 'string' ? (existingRaw as string).split(';').map((s: string) => s.trim()).filter((s: string) => s) : []);
  const mRaw: any = (m as any).serialNumbers;
  const mSerials: string[] = Array.isArray(mRaw) ? mRaw : (typeof mRaw === 'string' ? (mRaw as string).split(';').map((s: string) => s.trim()).filter((s: string) => s) : []);
      updateProduct(existing.id, { stock: existing.stock + m.stock, serialNumbers: [...existingSerials, ...mSerials] });
    } else {
      // restore as new product with original id
      const restored: Product = {
        id: originalId,
        name: (m as any).name || 'Restored product',
        description: (m as any).description || '',
        price: (m as any).price || 0,
        stock: m.stock,
        category: (m as any).category || 'uncategorized',
        brand: (m as any).brand,
        serialNumbers: (m as any).serialNumbers || [],
        createdAt: new Date(),
      };
      setProducts(prev => [...prev, restored]);
    }
    setMaintenanceItems(prev => prev.filter(x => x.id !== maintenanceId));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const addCompany = (company: Omit<Company, 'id' | 'createdAt'>) => {
    const newCompany: Company = { ...company, id: Date.now().toString(), createdAt: new Date() };
    setCompanies(prev => [...prev, newCompany]);
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    // Also remove any product associations
    setCustomerProducts(prev => prev.filter(cp => cp.customerId !== id));
  };

  const assignProductToCustomer = (customerId: string, productId: string, quantity: number) => {
    // Assigning by quantity: if the product has serialNumbers available,
    // automatically take up to `quantity` serials and attach them to the
    // customer's assignment. Otherwise fallback to quantity-only assignment.
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const rawSerials: any = (product as any).serialNumbers;
    const currentSerials: string[] = Array.isArray(rawSerials)
      ? rawSerials
      : typeof rawSerials === 'string'
        ? (rawSerials as string).split(';').map((s: string) => s.trim()).filter((s: string) => s)
        : [];

    // take serials to assign (may be empty)
    const assignedSerials: string[] = currentSerials.slice(0, quantity);
    const remainingSerials: string[] = currentSerials.slice(assignedSerials.length);

    // Update or create customer assignment, including serialNumbers if any
    const existingAssignment = customerProducts.find(
      cp => cp.customerId === customerId && cp.productId === productId
    );

    if (existingAssignment) {
      setCustomerProducts(prev => 
        prev.map(cp => 
          cp.id === existingAssignment.id 
            ? {
                ...cp,
                quantity: cp.quantity + (assignedSerials.length > 0 ? assignedSerials.length : quantity),
                serialNumbers: assignedSerials.length > 0 ? [...(cp.serialNumbers || []), ...assignedSerials] : cp.serialNumbers,
              }
            : cp
        )
      );
    } else {
      const newAssignment: CustomerProduct = {
        id: Date.now().toString(),
        customerId,
        productId,
        quantity: assignedSerials.length > 0 ? assignedSerials.length : quantity,
        serialNumbers: assignedSerials.length > 0 ? assignedSerials : undefined,
        assignedAt: new Date(),
      };
      setCustomerProducts(prev => [...prev, newAssignment]);
    }

    // Update product: decrease stock and update serialNumbers
    const newStock = Math.max(0, product.stock - (assignedSerials.length > 0 ? assignedSerials.length : quantity));
    const updates: Partial<Product> = { stock: newStock };
    if (assignedSerials.length > 0) updates.serialNumbers = remainingSerials;
    updateProduct(productId, updates);
  };

  const assignProductToCustomerBySerials = (customerId: string, productId: string, serials: string[]) => {
    if (!serials || serials.length === 0) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Remove the provided serials from the product's serialNumbers list
    const rawSerials: string[] | string | undefined = (product as any).serialNumbers;
    const currentSerials: string[] = Array.isArray(rawSerials)
      ? rawSerials
      : typeof rawSerials === 'string'
        ? rawSerials.split(';').map((s: string) => s.trim()).filter((s: string) => s)
        : [];
    const remainingSerials: string[] = currentSerials.filter((s: string) => !serials.includes(s));

    // Update product: decrease stock and update serialNumbers
    updateProduct(productId, { stock: Math.max(0, product.stock - serials.length), serialNumbers: remainingSerials });

    // Create or update customerProducts entry with associated serialNumbers
    const existingAssignment = customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
    if (existingAssignment) {
      setCustomerProducts(prev => prev.map(cp => cp.id === existingAssignment.id ? { ...cp, quantity: cp.quantity + serials.length, serialNumbers: [...(cp.serialNumbers || []), ...serials] } : cp));
    } else {
      const newAssignment: CustomerProduct = {
        id: Date.now().toString(),
        customerId,
        productId,
        quantity: serials.length,
        serialNumbers: serials,
        assignedAt: new Date(),
      };
      setCustomerProducts(prev => [...prev, newAssignment]);
    }
  };

  const moveAssignedSerialsToMaintenance = (customerId: string, productId: string, serials: string[], companyId?: string) => {
    if (!serials || serials.length === 0) return;
    // Find the customerProduct assignment
    const assignment = customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
    if (!assignment) return;

    // Remove the serials from the assignment's serialNumbers and decrease quantity
    const assignmentRaw: any = (assignment as any).serialNumbers;
    const assignmentSerials: string[] = Array.isArray(assignmentRaw) ? assignmentRaw : (typeof assignmentRaw === 'string' ? (assignmentRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);

    const remainingAssignmentSerials = assignmentSerials.filter(s => !serials.includes(s));
    const remainingQuantity = Math.max(0, assignment.quantity - serials.length);

    if (remainingQuantity === 0) {
      // remove the assignment
      setCustomerProducts(prev => prev.filter(cp => cp.id !== assignment.id));
    } else {
      setCustomerProducts(prev => prev.map(cp => cp.id === assignment.id ? { ...cp, quantity: remainingQuantity, serialNumbers: remainingAssignmentSerials } : cp));
    }

    // Move the serials from global product to maintenance and update product stock
    moveProductToMaintenance(productId, serials, companyId);
  };


  const removeProductFromCustomer = (customerProductId: string) => {
    const assignment = customerProducts.find(cp => cp.id === customerProductId);
    if (assignment) {
      // Return stock to product
      const product = products.find(p => p.id === assignment.productId);
      if (product) {
        // if assignment had serialNumbers, return them to product.serialNumbers
        const assignmentRaw: any = (assignment as any).serialNumbers;
        const assignmentSerials: string[] = Array.isArray(assignmentRaw) ? assignmentRaw : (typeof assignmentRaw === 'string' ? (assignmentRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);
        const productRaw: any = (product as any).serialNumbers;
        const productSerials: string[] = Array.isArray(productRaw) ? productRaw : (typeof productRaw === 'string' ? (productRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);
        const newSerials = [...productSerials, ...assignmentSerials];
        updateProduct(product.id, { stock: product.stock + assignment.quantity, serialNumbers: newSerials });
      }
      setCustomerProducts(prev => prev.filter(cp => cp.id !== customerProductId));
    }
  };

  const returnAssignedSerialsToProduct = (customerId: string, productId: string, serials: string[]) => {
    if (!serials || serials.length === 0) return;
    const assignment = customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
    if (!assignment) return;

    const assignmentRaw: any = (assignment as any).serialNumbers;
    const assignmentSerials: string[] = Array.isArray(assignmentRaw) ? assignmentRaw : (typeof assignmentRaw === 'string' ? (assignmentRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);
    // ensure we only return serials that actually belong to the assignment
    const toReturn = assignmentSerials.filter(s => serials.includes(s));
    if (toReturn.length === 0) return;

    const remainingAssignmentSerials = assignmentSerials.filter(s => !toReturn.includes(s));
    const remainingQuantity = Math.max(0, assignment.quantity - toReturn.length);

    if (remainingQuantity === 0) {
      // remove assignment
      setCustomerProducts(prev => prev.filter(cp => cp.id !== assignment.id));
    } else {
      setCustomerProducts(prev => prev.map(cp => cp.id === assignment.id ? { ...cp, quantity: remainingQuantity, serialNumbers: remainingAssignmentSerials } : cp));
    }

    // Return serials to product
    const product = products.find(p => p.id === productId);
    if (product) {
      const productRaw: any = (product as any).serialNumbers;
      const productSerials: string[] = Array.isArray(productRaw) ? productRaw : (typeof productRaw === 'string' ? (productRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);
      const newProductSerials = [...productSerials, ...toReturn];
      updateProduct(product.id, { stock: product.stock + toReturn.length, serialNumbers: newProductSerials });
    }
  };

  return {
    products,
    customers,
    customerProducts,
    maintenanceItems,
    companies,
    accessories,
    customerAccessories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addCompany,
    updateCompany,
    deleteCompany,
    assignProductToCustomer,
    assignProductToCustomerBySerials,
    moveProductToMaintenance,
    moveAssignedSerialsToMaintenance,
    restoreFromMaintenance,
    removeProductFromCustomer,
    returnAssignedSerialsToProduct,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    assignAccessoryToCustomer,
    assignAccessoryToCustomerBySerials,
    removeAccessoryFromCustomer,
    returnAssignedAccessorySerialsToStock,
  };
}