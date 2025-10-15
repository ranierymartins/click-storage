import { useState, useEffect } from 'react';
import { Product, Customer, CustomerProduct, Company, MaintenanceItem, CustomerAccessory } from '../types';
import { 
  productsApi, 
  customersApi, 
  companiesApi, 
  customerProductsApi, 
  accessoriesApi, 
  customerAccessoriesApi, 
  maintenanceApi 
} from '../lib/api';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accessories, setAccessories] = useState<any[]>([]);
  const [customerAccessories, setCustomerAccessories] = useState<CustomerAccessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para mapear dados do Supabase para os tipos locais
  const mapSupabaseProduct = (sp: any): Product => ({
    id: sp.id,
    name: sp.name,
    description: sp.description || '',
    price: typeof sp.price === 'number' ? sp.price : Number(sp.price || 0),
    stock: typeof sp.stock === 'number' ? sp.stock : Number(sp.stock || 0),
    category: sp.category || '',
    brand: sp.brand || undefined,
    serialNumbers: Array.isArray(sp.serial_numbers) ? sp.serial_numbers : [],
    createdAt: sp.created_at ? new Date(sp.created_at) : new Date(),
  });

  const mapSupabaseCustomer = (sc: any): Customer => ({
    id: sc.id,
    name: sc.name,
    email: sc.email,
    phone: sc.phone || '',
    address: sc.address || '',
    createdAt: sc.created_at ? new Date(sc.created_at) : new Date(),
  });

  const mapSupabaseCompany = (sc: any): Company => ({
    id: sc.id,
    name: sc.name,
    email: sc.email || '',
    phone: sc.phone || '',
    address: sc.address || '',
    createdAt: sc.created_at ? new Date(sc.created_at) : new Date(),
  });

  const mapSupabaseCustomerProduct = (scp: any): CustomerProduct => ({
    id: scp.id,
    customerId: scp.customer_id,
    productId: scp.product_id,
    quantity: scp.quantity,
    serialNumbers: Array.isArray(scp.serial_numbers) ? scp.serial_numbers : [],
    assignedAt: scp.assigned_at ? new Date(scp.assigned_at) : new Date(),
  });

  const mapSupabaseAccessory = (sa: any): any => ({
    id: sa.id,
    name: sa.name,
    description: sa.description || '',
    price: typeof sa.price === 'number' ? sa.price : Number(sa.price || 0),
    stock: typeof sa.stock === 'number' ? sa.stock : Number(sa.stock || 0),
    category: sa.category || '',
    brand: sa.brand || undefined,
    serialNumbers: Array.isArray(sa.serial_numbers) ? sa.serial_numbers : [],
    createdAt: sa.created_at ? new Date(sa.created_at) : new Date(),
  });

  const mapSupabaseCustomerAccessory = (sca: any): CustomerAccessory => ({
    id: sca.id,
    customerId: sca.customer_id,
    accessoryId: sca.accessory_id,
    quantity: sca.quantity,
    serialNumbers: Array.isArray(sca.serial_numbers) ? sca.serial_numbers : [],
    assignedAt: sca.assigned_at ? new Date(sca.assigned_at) : new Date(),
  });

  const mapSupabaseMaintenanceItem = (smi: any): MaintenanceItem => ({
    id: smi.id,
    originalProductId: smi.original_product_id,
    name: smi.name,
    description: smi.description || '',
    price: typeof smi.price === 'number' ? smi.price : Number(smi.price || 0),
    stock: typeof smi.stock === 'number' ? smi.stock : Number(smi.stock || 0),
    brand: smi.brand || undefined,
    serialNumbers: Array.isArray(smi.serial_numbers) ? smi.serial_numbers : [],
    companyId: smi.company_id,
    createdAt: smi.created_at ? new Date(smi.created_at) : new Date(),
  });

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsData, customersData, companiesData, customerProductsData, accessoriesData, customerAccessoriesData, maintenanceData] = await Promise.all([
          productsApi.getAll(),
          customersApi.getAll(),
          companiesApi.getAll(),
          customerProductsApi.getAll(),
          accessoriesApi.getAll(),
          customerAccessoriesApi.getAll(),
          maintenanceApi.getAll(),
        ]);

        setProducts(productsData.map(mapSupabaseProduct));
        setCustomers(customersData.map(mapSupabaseCustomer));
        setCompanies(companiesData.map(mapSupabaseCompany));
        setCustomerProducts(customerProductsData.map(mapSupabaseCustomerProduct));
        setAccessories(accessoriesData.map(mapSupabaseAccessory));
        setCustomerAccessories(customerAccessoriesData.map(mapSupabaseCustomerAccessory));
        setMaintenanceItems(maintenanceData.map(mapSupabaseMaintenanceItem));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Funções para Produtos
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
    const payload = {
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || '',
      brand: (product as any).brand || null,
      serial_numbers: Array.isArray((product as any).serialNumbers) ? (product as any).serialNumbers : [],
    };
      
      const result = await productsApi.create(payload);
      const mapped = mapSupabaseProduct(result);
    setProducts(prev => [mapped, ...prev]);
    return mapped;
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const payload: any = { ...updates };
      if ('serialNumbers' in payload) {
        payload.serial_numbers = payload.serialNumbers;
        delete payload.serialNumbers;
      }
      
      const result = await productsApi.update(id, payload);
      const mapped = mapSupabaseProduct(result);
      setProducts(prev => prev.map(p => p.id === id ? mapped : p));
      return mapped;
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setCustomerProducts(prev => prev.filter(cp => cp.productId !== id));
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      throw err;
    }
  };

  // Funções para Clientes
  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const result = await customersApi.create(customer);
      const mapped = mapSupabaseCustomer(result);
      setCustomers(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('Erro ao adicionar cliente:', err);
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const result = await customersApi.update(id, updates);
      const mapped = mapSupabaseCustomer(result);
      setCustomers(prev => prev.map(c => c.id === id ? mapped : c));
      return mapped;
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customersApi.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      setCustomerProducts(prev => prev.filter(cp => cp.customerId !== id));
    } catch (err) {
      console.error('Erro ao deletar cliente:', err);
      throw err;
    }
  };

  // Funções para Empresas
  const addCompany = async (company: Omit<Company, 'id' | 'createdAt'>) => {
    try {
      const result = await companiesApi.create(company);
      const mapped = mapSupabaseCompany(result);
      setCompanies(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('Erro ao adicionar empresa:', err);
      throw err;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const result = await companiesApi.update(id, updates);
      const mapped = mapSupabaseCompany(result);
      setCompanies(prev => prev.map(c => c.id === id ? mapped : c));
      return mapped;
    } catch (err) {
      console.error('Erro ao atualizar empresa:', err);
      throw err;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await companiesApi.delete(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erro ao deletar empresa:', err);
      throw err;
    }
  };

  // Funções para Acessórios
  const addAccessory = async (accessory: Omit<any, 'id' | 'createdAt'>) => {
    try {
      const payload = {
        name: accessory.name,
        description: accessory.description || '',
        price: accessory.price || 0,
        stock: accessory.stock || 0,
        category: accessory.category || '',
        brand: accessory.brand || null,
        serial_numbers: Array.isArray(accessory.serialNumbers) ? accessory.serialNumbers : [],
      };
      
      const result = await accessoriesApi.create(payload);
      const mapped = mapSupabaseAccessory(result);
      setAccessories(prev => [mapped, ...prev]);
      return mapped;
    } catch (err) {
      console.error('Erro ao adicionar acessório:', err);
      throw err;
    }
  };

  const updateAccessory = async (id: string, updates: Partial<any>) => {
    try {
    const payload: any = { ...updates };
    if ('serialNumbers' in payload) {
      payload.serial_numbers = payload.serialNumbers;
      delete payload.serialNumbers;
    }
      
      const result = await accessoriesApi.update(id, payload);
      const mapped = mapSupabaseAccessory(result);
      setAccessories(prev => prev.map(a => a.id === id ? mapped : a));
    return mapped;
    } catch (err) {
      console.error('Erro ao atualizar acessório:', err);
      throw err;
    }
  };

  const deleteAccessory = async (id: string) => {
    try {
      await accessoriesApi.delete(id);
      setAccessories(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Erro ao deletar acessório:', err);
      throw err;
    }
  };

  // Funções para Manutenção
  const moveProductToMaintenance = async (productId: string, serials?: string[], companyId?: string) => {
    try {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (serials && serials.length > 0) {
        // Mover apenas seriais específicos
        const currentSerials = Array.isArray((product as any).serialNumbers) 
          ? (product as any).serialNumbers 
          : [];

        const remainingSerials = currentSerials.filter((s: string) => !serials.includes(s));
        
        // Atualizar produto original
        await updateProduct(productId, { stock: remainingSerials.length, serialNumbers: remainingSerials });

        // Criar item de manutenção
        const maintenanceItem = {
          original_product_id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: serials.length,
        brand: product.brand,
          serial_numbers: serials,
          company_id: companyId,
      };

        const result = await maintenanceApi.create(maintenanceItem);
        const mapped = mapSupabaseMaintenanceItem(result);
        setMaintenanceItems(prev => [...prev, mapped]);
    } else {
        // Mover produto inteiro
        const maintenanceItem = {
          original_product_id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        brand: product.brand,
          serial_numbers: Array.isArray((product as any).serialNumbers) ? (product as any).serialNumbers : [],
          company_id: companyId,
        };

        const result = await maintenanceApi.create(maintenanceItem);
        const mapped = mapSupabaseMaintenanceItem(result);
        setMaintenanceItems(prev => [...prev, mapped]);

        // Remover produto do estoque
        await deleteProduct(productId);
      }
    } catch (err) {
      console.error('Erro ao mover produto para manutenção:', err);
      throw err;
    }
  };

  const restoreFromMaintenance = async (maintenanceId: string) => {
    try {
      const maintenanceItem = maintenanceItems.find(m => m.id === maintenanceId);
      if (!maintenanceItem) return;

      const originalId = maintenanceItem.originalProductId;
    const existing = products.find(p => p.id === originalId);

    if (existing) {
        // Mesclar com produto existente
        const existingSerials = Array.isArray((existing as any).serialNumbers) 
          ? (existing as any).serialNumbers 
          : [];
        const maintenanceSerials = Array.isArray((maintenanceItem as any).serialNumbers) 
          ? (maintenanceItem as any).serialNumbers 
          : [];

        await updateProduct(existing.id, { 
          stock: existing.stock + maintenanceItem.stock, 
          serialNumbers: [...existingSerials, ...maintenanceSerials] 
        });
    } else {
        // Restaurar como novo produto
      const restored: Product = {
          id: originalId || Date.now().toString(),
          name: maintenanceItem.name,
          description: maintenanceItem.description,
          price: maintenanceItem.price,
          stock: maintenanceItem.stock,
          category: 'uncategorized',
          brand: maintenanceItem.brand,
          serialNumbers: Array.isArray((maintenanceItem as any).serialNumbers) 
            ? (maintenanceItem as any).serialNumbers 
            : [],
        createdAt: new Date(),
      };

        await addProduct(restored);
    }

      // Remover item de manutenção
      await maintenanceApi.delete(maintenanceId);
    setMaintenanceItems(prev => prev.filter(x => x.id !== maintenanceId));
    } catch (err) {
      console.error('Erro ao restaurar da manutenção:', err);
      throw err;
    }
  };

  // Funções para Associações Cliente-Produto
  const assignProductToCustomer = async (customerId: string, productId: string, quantity: number) => {
    try {
    const product = products.find(p => p.id === productId);
    if (!product) return;

      const currentSerials = Array.isArray((product as any).serialNumbers) 
        ? (product as any).serialNumbers 
        : [];

      const assignedSerials = currentSerials.slice(0, quantity);
      const remainingSerials = currentSerials.slice(assignedSerials.length);

      // Verificar se já existe associação
    const existingAssignment = customerProducts.find(
      cp => cp.customerId === customerId && cp.productId === productId
    );

    if (existingAssignment) {
        // Atualizar associação existente
        const updatedAssignment = {
          quantity: existingAssignment.quantity + (assignedSerials.length > 0 ? assignedSerials.length : quantity),
          serial_numbers: assignedSerials.length > 0 
            ? [...(existingAssignment.serialNumbers || []), ...assignedSerials] 
            : existingAssignment.serialNumbers,
        };

        const result = await customerProductsApi.update(existingAssignment.id, updatedAssignment);
        const mapped = mapSupabaseCustomerProduct(result);
        setCustomerProducts(prev => prev.map(cp => cp.id === existingAssignment.id ? mapped : cp));
    } else {
        // Criar nova associação
        const newAssignment = {
          customer_id: customerId,
          product_id: productId,
        quantity: assignedSerials.length > 0 ? assignedSerials.length : quantity,
          serial_numbers: assignedSerials.length > 0 ? assignedSerials : [],
      };

        const result = await customerProductsApi.create(newAssignment);
        const mapped = mapSupabaseCustomerProduct(result);
        setCustomerProducts(prev => [...prev, mapped]);
    }

      // Atualizar produto
    const newStock = Math.max(0, product.stock - (assignedSerials.length > 0 ? assignedSerials.length : quantity));
    const updates: Partial<Product> = { stock: newStock };
    if (assignedSerials.length > 0) updates.serialNumbers = remainingSerials;
      await updateProduct(productId, updates);
    } catch (err) {
      console.error('Erro ao associar produto ao cliente:', err);
      throw err;
    }
  };

  const assignProductToCustomerBySerials = async (customerId: string, productId: string, serials: string[]) => {
    try {
    if (!serials || serials.length === 0) return;
      
    const product = products.find(p => p.id === productId);
    if (!product) return;

      const currentSerials = Array.isArray((product as any).serialNumbers) 
        ? (product as any).serialNumbers 
        : [];
      const remainingSerials = currentSerials.filter((s: string) => !serials.includes(s));

      // Atualizar produto
      await updateProduct(productId, { 
        stock: Math.max(0, product.stock - serials.length), 
        serialNumbers: remainingSerials 
      });

      // Criar ou atualizar associação
    const existingAssignment = customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
      
    if (existingAssignment) {
        const updatedAssignment = {
          quantity: existingAssignment.quantity + serials.length,
          serial_numbers: [...(existingAssignment.serialNumbers || []), ...serials],
        };

        const result = await customerProductsApi.update(existingAssignment.id, updatedAssignment);
        const mapped = mapSupabaseCustomerProduct(result);
        setCustomerProducts(prev => prev.map(cp => cp.id === existingAssignment.id ? mapped : cp));
    } else {
        const newAssignment = {
          customer_id: customerId,
          product_id: productId,
        quantity: serials.length,
          serial_numbers: serials,
        };

        const result = await customerProductsApi.create(newAssignment);
        const mapped = mapSupabaseCustomerProduct(result);
        setCustomerProducts(prev => [...prev, mapped]);
      }
    } catch (err) {
      console.error('Erro ao associar produto por seriais:', err);
      throw err;
    }
  };

  const removeProductFromCustomer = async (customerProductId: string) => {
    try {
      const assignment = customerProducts.find(cp => cp.id === customerProductId);
      if (!assignment) return;

      // Retornar estoque ao produto
      const product = products.find(p => p.id === assignment.productId);
      if (product) {
        const assignmentSerials = Array.isArray((assignment as any).serialNumbers) 
          ? (assignment as any).serialNumbers 
          : [];
        const productSerials = Array.isArray((product as any).serialNumbers) 
          ? (product as any).serialNumbers 
          : [];
        const newSerials = [...productSerials, ...assignmentSerials];
        
        await updateProduct(product.id, { 
          stock: product.stock + assignment.quantity, 
          serialNumbers: newSerials 
        });
      }

      // Remover associação
      await customerProductsApi.delete(customerProductId);
      setCustomerProducts(prev => prev.filter(cp => cp.id !== customerProductId));
    } catch (err) {
      console.error('Erro ao remover produto do cliente:', err);
      throw err;
    }
  };

  const returnAssignedSerialsToProduct = async (customerId: string, productId: string, serials: string[]) => {
    try {
    if (!serials || serials.length === 0) return;
      
    const assignment = customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
    if (!assignment) return;

      const assignmentSerials = Array.isArray((assignment as any).serialNumbers) 
        ? (assignment as any).serialNumbers 
        : [];
      const toReturn = assignmentSerials.filter((s: string) => serials.includes(s));
      if (toReturn.length === 0) return;

      const remainingAssignmentSerials = assignmentSerials.filter((s: string) => !toReturn.includes(s));
      const remainingQuantity = Math.max(0, assignment.quantity - toReturn.length);

    if (remainingQuantity === 0) {
        // Remover associação
        await customerProductsApi.delete(assignment.id);
      setCustomerProducts(prev => prev.filter(cp => cp.id !== assignment.id));
    } else {
        // Atualizar associação
        const updatedAssignment = {
          quantity: remainingQuantity,
          serial_numbers: remainingAssignmentSerials,
        };

        const result = await customerProductsApi.update(assignment.id, updatedAssignment);
        const mapped = mapSupabaseCustomerProduct(result);
        setCustomerProducts(prev => prev.map(cp => cp.id === assignment.id ? mapped : cp));
      }

      // Retornar seriais ao produto
      const product = products.find(p => p.id === productId);
      if (product) {
        const productSerials = Array.isArray((product as any).serialNumbers) 
          ? (product as any).serialNumbers 
          : [];
        const newProductSerials = [...productSerials, ...toReturn];
        
        await updateProduct(product.id, { 
          stock: product.stock + toReturn.length, 
          serialNumbers: newProductSerials 
        });
      }
    } catch (err) {
      console.error('Erro ao retornar seriais ao produto:', err);
      throw err;
    }
  };

  const moveAssignedSerialsToMaintenance = async (customerId: string, productId: string, serials: string[], companyId?: string) => {
    try {
    if (!serials || serials.length === 0) return;
      
    const assignment = customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
    if (!assignment) return;

      const assignmentSerials = Array.isArray((assignment as any).serialNumbers) 
        ? (assignment as any).serialNumbers 
        : [];
      const remainingAssignmentSerials = assignmentSerials.filter((s: string) => !serials.includes(s));
      const remainingQuantity = Math.max(0, assignment.quantity - serials.length);

    if (remainingQuantity === 0) {
        // Remover associação
        await customerProductsApi.delete(assignment.id);
      setCustomerProducts(prev => prev.filter(cp => cp.id !== assignment.id));
    } else {
        // Atualizar associação
        const updatedAssignment = {
          quantity: remainingQuantity,
          serial_numbers: remainingAssignmentSerials,
        };

        const result = await customerProductsApi.update(assignment.id, updatedAssignment);
        const mapped = mapSupabaseCustomerProduct(result);
        setCustomerProducts(prev => prev.map(cp => cp.id === assignment.id ? mapped : cp));
      }

      // Mover seriais para manutenção
      await moveProductToMaintenance(productId, serials, companyId);
    } catch (err) {
      console.error('Erro ao mover seriais para manutenção:', err);
      throw err;
    }
  };

  // Funções para Acessórios
  const assignAccessoryToCustomer = async (customerId: string, accessoryId: string, quantity: number) => {
    try {
      const accessory = accessories.find(a => a.id === accessoryId);
      if (!accessory) return;

      const currentSerials = Array.isArray((accessory as any).serialNumbers)
        ? (accessory as any).serialNumbers
        : [];

      const assignedSerials = currentSerials.slice(0, quantity);
      const remainingSerials = currentSerials.slice(assignedSerials.length);

      // Verificar se já existe associação
      const existingAssignment = customerAccessories.find(
        ca => ca.customerId === customerId && ca.accessoryId === accessoryId
      );

      if (existingAssignment) {
        const updatedAssignment = {
          quantity: existingAssignment.quantity + (assignedSerials.length > 0 ? assignedSerials.length : quantity),
          serial_numbers: assignedSerials.length > 0
            ? [...(existingAssignment.serialNumbers || []), ...assignedSerials]
            : existingAssignment.serialNumbers,
        } as any;

        const result = await customerAccessoriesApi.update(existingAssignment.id, updatedAssignment);
        const mapped = mapSupabaseCustomerAccessory(result);
        setCustomerAccessories(prev => prev.map(ca => ca.id === existingAssignment.id ? mapped : ca));
      } else {
        const newAssignment = {
          customer_id: customerId,
          accessory_id: accessoryId,
          quantity: assignedSerials.length > 0 ? assignedSerials.length : quantity,
          serial_numbers: assignedSerials.length > 0 ? assignedSerials : [],
        } as any;

        const result = await customerAccessoriesApi.create(newAssignment);
        const mapped = mapSupabaseCustomerAccessory(result);
        setCustomerAccessories(prev => [...prev, mapped]);
      }

      // Atualizar acessório (estoque e seriais)
      const newStock = Math.max(0, accessory.stock - (assignedSerials.length > 0 ? assignedSerials.length : quantity));
      const updates: any = { stock: newStock };
      if (assignedSerials.length > 0) updates.serial_numbers = remainingSerials;
      const updated = await accessoriesApi.update(accessoryId, updates);
      const mappedAccessory = mapSupabaseAccessory(updated);
      setAccessories(prev => prev.map(a => a.id === accessoryId ? mappedAccessory : a));
    } catch (err) {
      console.error('Erro ao associar acessório ao cliente:', err);
      throw err;
    }
  };

  const assignAccessoryToCustomerBySerials = async (customerId: string, accessoryId: string, serials: string[]) => {
    try {
      if (!serials || serials.length === 0) return;

      const accessory = accessories.find(a => a.id === accessoryId);
      if (!accessory) return;

      const currentSerials = Array.isArray((accessory as any).serialNumbers)
        ? (accessory as any).serialNumbers
        : [];
      const remainingSerials = currentSerials.filter((s: string) => !serials.includes(s));

      // Atualizar acessório no estoque
      const updated = await accessoriesApi.update(accessoryId, {
        stock: Math.max(0, accessory.stock - serials.length),
        serial_numbers: remainingSerials,
      } as any);
      const mappedAccessory = mapSupabaseAccessory(updated);
      setAccessories(prev => prev.map(a => a.id === accessoryId ? mappedAccessory : a));

      // Criar ou atualizar associação
      const existingAssignment = customerAccessories.find(ca => ca.customerId === customerId && ca.accessoryId === accessoryId);
      if (existingAssignment) {
        const updatedAssignment = {
          quantity: existingAssignment.quantity + serials.length,
          serial_numbers: [...(existingAssignment.serialNumbers || []), ...serials],
        } as any;

        const result = await customerAccessoriesApi.update(existingAssignment.id, updatedAssignment);
        const mapped = mapSupabaseCustomerAccessory(result);
        setCustomerAccessories(prev => prev.map(ca => ca.id === existingAssignment.id ? mapped : ca));
      } else {
        const newAssignment = {
          customer_id: customerId,
          accessory_id: accessoryId,
          quantity: serials.length,
          serial_numbers: serials,
        } as any;

        const result = await customerAccessoriesApi.create(newAssignment);
        const mapped = mapSupabaseCustomerAccessory(result);
        setCustomerAccessories(prev => [...prev, mapped]);
      }
    } catch (err) {
      console.error('Erro ao associar acessório por seriais:', err);
      throw err;
    }
  };

  const removeAccessoryFromCustomer = async (customerAccessoryId: string) => {
    try {
      const assignment = customerAccessories.find(ca => ca.id === customerAccessoryId);
      if (!assignment) return;

      // Retornar estoque ao acessório
      const accessory = accessories.find(a => a.id === assignment.accessoryId);
      if (accessory) {
        const assignmentSerials = Array.isArray((assignment as any).serialNumbers)
          ? (assignment as any).serialNumbers
          : [];
        const accessorySerials = Array.isArray((accessory as any).serialNumbers)
          ? (accessory as any).serialNumbers
          : [];
        const newSerials = [...accessorySerials, ...assignmentSerials];

        const updated = await accessoriesApi.update(accessory.id, {
          stock: accessory.stock + assignment.quantity,
          serial_numbers: newSerials,
        } as any);
        const mappedAccessory = mapSupabaseAccessory(updated);
        setAccessories(prev => prev.map(a => a.id === accessory.id ? mappedAccessory : a));
      }

      // Remover associação
      await customerAccessoriesApi.delete(customerAccessoryId);
      setCustomerAccessories(prev => prev.filter(ca => ca.id !== customerAccessoryId));
    } catch (err) {
      console.error('Erro ao remover acessório do cliente:', err);
      throw err;
    }
  };

  const returnAssignedAccessorySerialsToStock = async (customerId: string, accessoryId: string, serials: string[]) => {
    try {
      if (!serials || serials.length === 0) return;

      const assignment = customerAccessories.find(ca => ca.customerId === customerId && ca.accessoryId === accessoryId);
      if (!assignment) return;

      const assignmentSerials = Array.isArray((assignment as any).serialNumbers)
        ? (assignment as any).serialNumbers
        : [];
      const toReturn = assignmentSerials.filter((s: string) => serials.includes(s));
      if (toReturn.length === 0) return;

      const remainingAssignmentSerials = assignmentSerials.filter((s: string) => !toReturn.includes(s));
      const remainingQuantity = Math.max(0, assignment.quantity - toReturn.length);

      if (remainingQuantity === 0) {
        await customerAccessoriesApi.delete(assignment.id);
        setCustomerAccessories(prev => prev.filter(ca => ca.id !== assignment.id));
      } else {
        const updatedAssignment = {
          quantity: remainingQuantity,
          serial_numbers: remainingAssignmentSerials,
        } as any;

        const result = await customerAccessoriesApi.update(assignment.id, updatedAssignment);
        const mapped = mapSupabaseCustomerAccessory(result);
        setCustomerAccessories(prev => prev.map(ca => ca.id === assignment.id ? mapped : ca));
      }

      // Retornar seriais ao acessório
      const accessory = accessories.find(a => a.id === accessoryId);
      if (accessory) {
        const accessorySerials = Array.isArray((accessory as any).serialNumbers)
          ? (accessory as any).serialNumbers
          : [];
        const newAccessorySerials = [...accessorySerials, ...toReturn];

        const updated = await accessoriesApi.update(accessory.id, {
          stock: accessory.stock + toReturn.length,
          serial_numbers: newAccessorySerials,
        } as any);
        const mappedAccessory = mapSupabaseAccessory(updated);
        setAccessories(prev => prev.map(a => a.id === accessory.id ? mappedAccessory : a));
      }
    } catch (err) {
      console.error('Erro ao retornar seriais ao estoque do acessório:', err);
      throw err;
    }
  };

  return {
    // Estados
    products,
    customers,
    customerProducts,
    maintenanceItems,
    companies,
    accessories,
    customerAccessories,
    loading,
    error,
    
    // Funções de Produtos
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Funções de Clientes
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Funções de Empresas
    addCompany,
    updateCompany,
    deleteCompany,
    
    // Funções de Acessórios
    addAccessory,
    updateAccessory,
    deleteAccessory,
    
    // Funções de Manutenção
    moveProductToMaintenance,
    restoreFromMaintenance,
    
    // Funções de Associações
    assignProductToCustomer,
    assignProductToCustomerBySerials,
    removeProductFromCustomer,
    returnAssignedSerialsToProduct,
    moveAssignedSerialsToMaintenance,
    
    // Funções de Acessórios (parcialmente implementadas)
    assignAccessoryToCustomer,
    assignAccessoryToCustomerBySerials,
    removeAccessoryFromCustomer,
    returnAssignedAccessorySerialsToStock,
  };
}