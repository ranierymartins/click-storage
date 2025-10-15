import { supabase } from './supabase';
import type { Database } from './database.types';

// Tipos para facilitar o uso
type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

type Company = Database['public']['Tables']['companies']['Row'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

type CustomerProduct = Database['public']['Tables']['customer_products']['Row'];
type CustomerProductInsert = Database['public']['Tables']['customer_products']['Insert'];
type CustomerProductUpdate = Database['public']['Tables']['customer_products']['Update'];

type Accessory = Database['public']['Tables']['accessories']['Row'];
type AccessoryInsert = Database['public']['Tables']['accessories']['Insert'];
type AccessoryUpdate = Database['public']['Tables']['accessories']['Update'];

type CustomerAccessory = Database['public']['Tables']['customer_accessories']['Row'];
type CustomerAccessoryInsert = Database['public']['Tables']['customer_accessories']['Insert'];
type CustomerAccessoryUpdate = Database['public']['Tables']['customer_accessories']['Update'];

type MaintenanceItem = Database['public']['Tables']['maintenance_items']['Row'];
type MaintenanceItemInsert = Database['public']['Tables']['maintenance_items']['Insert'];
type MaintenanceItemUpdate = Database['public']['Tables']['maintenance_items']['Update'];

// Função auxiliar para tratar erros do Supabase
function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Erro na operação do banco de dados');
}

// API para Produtos
export const productsApi = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    return data;
  },

  async create(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error);
  }
};

// API para Clientes
export const customersApi = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    return data;
  },

  async create(customer: CustomerInsert): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: CustomerUpdate): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error);
  }
};

// API para Empresas
export const companiesApi = {
  async getAll(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    return data;
  },

  async create(company: CompanyInsert): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: CompanyUpdate): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error);
  }
};

// API para Relacionamentos Cliente-Produto
export const customerProductsApi = {
  async getAll(): Promise<CustomerProduct[]> {
    const { data, error } = await supabase
      .from('customer_products')
      .select('*')
      .order('assigned_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getByCustomer(customerId: string): Promise<CustomerProduct[]> {
    const { data, error } = await supabase
      .from('customer_products')
      .select('*')
      .eq('customer_id', customerId)
      .order('assigned_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getByProduct(productId: string): Promise<CustomerProduct[]> {
    const { data, error } = await supabase
      .from('customer_products')
      .select('*')
      .eq('product_id', productId)
      .order('assigned_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async create(assignment: CustomerProductInsert): Promise<CustomerProduct> {
    const { data, error } = await supabase
      .from('customer_products')
      .insert(assignment)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: CustomerProductUpdate): Promise<CustomerProduct> {
    const { data, error } = await supabase
      .from('customer_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customer_products')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error);
  }
};

// API para Acessórios
export const accessoriesApi = {
  async getAll(): Promise<Accessory[]> {
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getById(id: string): Promise<Accessory | null> {
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    return data;
  },

  async create(accessory: AccessoryInsert): Promise<Accessory> {
    const { data, error } = await supabase
      .from('accessories')
      .insert(accessory)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: AccessoryUpdate): Promise<Accessory> {
    const { data, error } = await supabase
      .from('accessories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accessories')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error);
  }
};

// API para Relacionamentos Cliente-Acessório
export const customerAccessoriesApi = {
  async getAll(): Promise<CustomerAccessory[]> {
    const { data, error } = await supabase
      .from('customer_accessories')
      .select('*')
      .order('assigned_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getByCustomer(customerId: string): Promise<CustomerAccessory[]> {
    const { data, error } = await supabase
      .from('customer_accessories')
      .select('*')
      .eq('customer_id', customerId)
      .order('assigned_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async create(assignment: CustomerAccessoryInsert): Promise<CustomerAccessory> {
    const { data, error } = await supabase
      .from('customer_accessories')
      .insert(assignment)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: CustomerAccessoryUpdate): Promise<CustomerAccessory> {
    const { data, error } = await supabase
      .from('customer_accessories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customer_accessories')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error);
  }
};

// API para Itens de Manutenção
export const maintenanceApi = {
  async getAll(): Promise<MaintenanceItem[]> {
    const { data, error } = await supabase
      .from('maintenance_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getById(id: string): Promise<MaintenanceItem | null> {
    const { data, error } = await supabase
      .from('maintenance_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') handleSupabaseError(error);
    return data;
  },

  async create(item: MaintenanceItemInsert): Promise<MaintenanceItem> {
    const { data, error } = await supabase
      .from('maintenance_items')
      .insert(item)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: MaintenanceItemUpdate): Promise<MaintenanceItem> {
    const { data, error } = await supabase
      .from('maintenance_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_items')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error);
  }
};

// API unificada para compatibilidade com o código existente
export const api = {
  // Produtos
  async get(path: string) {
    if (path === '/products') return productsApi.getAll();
    if (path.startsWith('/products/')) {
      const id = path.split('/')[2];
      return productsApi.getById(id);
    }
    throw new Error(`Endpoint não encontrado: ${path}`);
  },

  async post(path: string, body: any) {
    if (path === '/products') return productsApi.create(body);
    if (path === '/customers') return customersApi.create(body);
    if (path === '/companies') return companiesApi.create(body);
    if (path === '/customer_products') return customerProductsApi.create(body);
    if (path === '/accessories') return accessoriesApi.create(body);
    if (path === '/customer_accessories') return customerAccessoriesApi.create(body);
    if (path === '/maintenance_items') return maintenanceApi.create(body);
    throw new Error(`Endpoint não encontrado: ${path}`);
  },

  async put(path: string, body: any) {
    const id = path.split('/')[2];
    if (path.startsWith('/products/')) return productsApi.update(id, body);
    if (path.startsWith('/customers/')) return customersApi.update(id, body);
    if (path.startsWith('/companies/')) return companiesApi.update(id, body);
    if (path.startsWith('/customer_products/')) return customerProductsApi.update(id, body);
    if (path.startsWith('/accessories/')) return accessoriesApi.update(id, body);
    if (path.startsWith('/customer_accessories/')) return customerAccessoriesApi.update(id, body);
    if (path.startsWith('/maintenance_items/')) return maintenanceApi.update(id, body);
    throw new Error(`Endpoint não encontrado: ${path}`);
  },

  async del(path: string) {
    const id = path.split('/')[2];
    if (path.startsWith('/products/')) return productsApi.delete(id);
    if (path.startsWith('/customers/')) return customersApi.delete(id);
    if (path.startsWith('/companies/')) return companiesApi.delete(id);
    if (path.startsWith('/customer_products/')) return customerProductsApi.delete(id);
    if (path.startsWith('/accessories/')) return accessoriesApi.delete(id);
    if (path.startsWith('/customer_accessories/')) return customerAccessoriesApi.delete(id);
    if (path.startsWith('/maintenance_items/')) return maintenanceApi.delete(id);
    throw new Error(`Endpoint não encontrado: ${path}`);
  }
};