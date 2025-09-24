import { useState, useEffect } from 'react';
import { supabase, Product, Customer, CustomerProduct, ProductInsert, CustomerInsert, CustomerProductInsert } from '../lib/supabase';

export function useSupabaseInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResult, customersResult, customerProductsResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('customer_products').select('*').order('assigned_at', { ascending: false })
      ]);

      if (productsResult.error) throw productsResult.error;
      if (customersResult.error) throw customersResult.error;
      if (customerProductsResult.error) throw customerProductsResult.error;

      setProducts(productsResult.data || []);
      setCustomers(customersResult.data || []);
      setCustomerProducts(customerProductsResult.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Funções para produtos
  const addProduct = async (productData: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar produto');
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<ProductInsert>) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      setCustomerProducts(prev => prev.filter(cp => cp.product_id !== id));
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto');
      throw err;
    }
  };

  // Funções para clientes
  const addCustomer = async (customerData: Omit<CustomerInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao adicionar cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar cliente');
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<CustomerInsert>) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente');
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.filter(c => c.id !== id));
      setCustomerProducts(prev => prev.filter(cp => cp.customer_id !== id));
    } catch (err) {
      console.error('Erro ao deletar cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar cliente');
      throw err;
    }
  };

  // Funções para associações cliente-produto
  const assignProductToCustomer = async (customerId: string, productId: string, quantity: number) => {
    try {
      setError(null);

      // Verificar se já existe uma associação
      const { data: existingAssignment } = await supabase
        .from('customer_products')
        .select('*')
        .eq('customer_id', customerId)
        .eq('product_id', productId)
        .single();

      if (existingAssignment) {
        // Atualizar quantidade existente
        const { data, error } = await supabase
          .from('customer_products')
          .update({ quantity: existingAssignment.quantity + quantity })
          .eq('id', existingAssignment.id)
          .select()
          .single();

        if (error) throw error;

        setCustomerProducts(prev => 
          prev.map(cp => cp.id === existingAssignment.id ? data : cp)
        );
      } else {
        // Criar nova associação
        const { data, error } = await supabase
          .from('customer_products')
          .insert([{ customer_id: customerId, product_id: productId, quantity }])
          .select()
          .single();

        if (error) throw error;

        setCustomerProducts(prev => [data, ...prev]);
      }

      // Atualizar estoque do produto
      const product = products.find(p => p.id === productId);
      if (product) {
        await updateProduct(productId, { stock: product.stock - quantity });
      }
    } catch (err) {
      console.error('Erro ao associar produto ao cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro ao associar produto ao cliente');
      throw err;
    }
  };

  const removeProductFromCustomer = async (customerProductId: string) => {
    try {
      setError(null);

      // Buscar a associação para recuperar o estoque
      const assignment = customerProducts.find(cp => cp.id === customerProductId);
      if (!assignment) throw new Error('Associação não encontrada');

      const { error } = await supabase
        .from('customer_products')
        .delete()
        .eq('id', customerProductId);

      if (error) throw error;

      // Retornar estoque ao produto
      const product = products.find(p => p.id === assignment.product_id);
      if (product) {
        await updateProduct(assignment.product_id, { 
          stock: product.stock + assignment.quantity 
        });
      }

      setCustomerProducts(prev => prev.filter(cp => cp.id !== customerProductId));
    } catch (err) {
      console.error('Erro ao remover produto do cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover produto do cliente');
      throw err;
    }
  };

  return {
    products,
    customers,
    customerProducts,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    assignProductToCustomer,
    removeProductFromCustomer,
    refreshData: loadAllData,
  };
}