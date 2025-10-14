import { useState, useEffect, useRef } from 'react';
import { Product, Customer, CustomerProduct, Company, MaintenanceItem, CustomerAccessory } from '../types';
import { api } from '../lib/api';

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

  // Load initial data from API
  useEffect(() => {
    (async () => {
      try {
        const [productsResp, customersResp, companiesResp] = await Promise.all([
          api.get('/products'),
          api.get('/customers'),
          api.get('/companies'),
        ]);
        const mappedProducts: Product[] = (productsResp || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
          price: typeof p.price === 'number' ? p.price : Number(p.price || 0),
          stock: typeof p.stock === 'number' ? p.stock : Number(p.stock || 0),
            category: p.category || '',
          brand: p.brand || undefined,
          serialNumbers: Array.isArray(p.serial_numbers) ? p.serial_numbers : [],
            createdAt: p.created_at ? new Date(p.created_at) : new Date(),
          }));
        const mappedCustomers: Customer[] = (customersResp || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          address: c.address || '',
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
        }));
        const mappedCompanies: Company[] = (companiesResp || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          address: c.address || '',
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
        }));
        setProducts(mappedProducts);
        setCustomers(mappedCustomers);
        setCompanies(mappedCompanies);
      } catch (err) {
        console.error('[useInventory] failed to load from API', err);
      } finally {
        initializedRef.current = true;
      }
    })();
  }, []);

  // No persistence: state changes are in-memory only
  useEffect(() => {
    if (!initializedRef.current) return;
  }, [products]);

  useEffect(() => {
    if (!initializedRef.current) return;
  }, [companies]);

  useEffect(() => {
    if (!initializedRef.current) return;
  }, [accessories]);

  useEffect(() => {
    if (!initializedRef.current) return;
  }, [customerAccessories]);

  useEffect(() => {
    if (!initializedRef.current) return;
  }, [customers]);

  useEffect(() => {
    if (!initializedRef.current) return;
  }, [customerProducts]);

  useEffect(() => {
    if (!initializedRef.current) return;
  }, [maintenanceItems]);

  useEffect(() => {
    if (!initializedRef.current) return;
  }, [customerAccessories]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const payload = {
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || '',
      brand: (product as any).brand || null,
      serial_numbers: Array.isArray((product as any).serialNumbers) ? (product as any).serialNumbers : [],
    };
    const res = await api.post('/products', payload);
    const mapped: Product = {
      id: res.id,
      name: res.name,
      description: res.description || '',
      price: typeof res.price === 'number' ? res.price : Number(res.price || 0),
      stock: typeof res.stock === 'number' ? res.stock : Number(res.stock || 0),
      category: res.category || '',
      brand: res.brand || undefined,
      serialNumbers: Array.isArray(res.serial_numbers) ? res.serial_numbers : [],
      createdAt: res.created_at ? new Date(res.created_at) : new Date(),
    };
    setProducts(prev => [mapped, ...prev]);
    return mapped;
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

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const payload: any = { ...updates };
    if ('serialNumbers' in payload) {
      payload.serial_numbers = payload.serialNumbers;
      delete payload.serialNumbers;
    }
    const res = await api.put(`/products/${id}`, payload);
    const mapped: Product = {
      id: res.id,
      name: res.name,
      description: res.description || '',
      price: typeof res.price === 'number' ? res.price : Number(res.price || 0),
      stock: typeof res.stock === 'number' ? res.stock : Number(res.stock || 0),
      category: res.category || '',
      brand: res.brand || undefined,
      serialNumbers: Array.isArray(res.serial_numbers) ? res.serial_numbers : [],
      createdAt: res.created_at ? new Date(res.created_at) : new Date(),
    };
    setProducts(prev => prev.map(p => p.id === id ? mapped : p));
    return mapped;
  };

  const deleteProduct = async (id: string) => {
    await api.del(`/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
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

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const res = await api.post('/customers', customer);
    const mapped: Customer = { id: res.id, name: res.name, email: res.email, phone: res.phone || '', address: res.address || '', createdAt: res.created_at ? new Date(res.created_at) : new Date() };
    setCustomers(prev => [mapped, ...prev]);
    return mapped;
  };

  const addCompany = async (company: Omit<Company, 'id' | 'createdAt'>) => {
    const res = await api.post('/companies', company);
    const mapped: Company = { id: res.id, name: res.name, email: res.email || '', phone: res.phone || '', address: res.address || '', createdAt: res.created_at ? new Date(res.created_at) : new Date() };
    setCompanies(prev => [mapped, ...prev]);
    return mapped;
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    const res = await api.put(`/companies/${id}`, updates);
    const mapped: Company = { id: res.id, name: res.name, email: res.email || '', phone: res.phone || '', address: res.address || '', createdAt: res.created_at ? new Date(res.created_at) : new Date() };
    setCompanies(prev => prev.map(c => c.id === id ? mapped : c));
    return mapped;
  };

  const deleteCompany = async (id: string) => {
    await api.del(`/companies/${id}`);
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const res = await api.put(`/customers/${id}`, updates);
    const mapped: Customer = { id: res.id, name: res.name, email: res.email, phone: res.phone || '', address: res.address || '', createdAt: res.created_at ? new Date(res.created_at) : new Date() };
    setCustomers(prev => prev.map(c => c.id === id ? mapped : c));
    return mapped;
  };

  const deleteCustomer = async (id: string) => {
    await api.del(`/customers/${id}`);
    setCustomers(prev => prev.filter(c => c.id !== id));
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