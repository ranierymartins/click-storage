import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Product, Customer, CustomerProduct, ProductInsert, CustomerInsert, CustomerProductInsert } from '../lib/supabase';

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
        api.get('/products'),
        api.get('/customers'),
        api.get('/customer_products')
      ]);

      setProducts(productsResult || []);
      setCustomers(customersResult || []);
      setCustomerProducts(customerProductsResult || []);
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
      const data = await api.post('/products', productData);
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
      const data = await api.put(`/products/${id}`, updates);
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
      await api.del(`/products/${id}`);
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
      const data = await api.post('/customers', customerData);
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
      const data = await api.put(`/customers/${id}`, updates);
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
      await api.del(`/customers/${id}`);
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
      // check existing via API and create/update
      const cps = await api.get(`/customer_products?customer_id=${customerId}&product_id=${productId}`);
      if (Array.isArray(cps) && cps.length > 0) {
        const existing = cps[0];
        const updated = await api.post('/customer_products', { customer_id: customerId, product_id: productId, quantity });
        setCustomerProducts(prev => prev.map(cp => cp.id === existing.id ? updated : cp));
      } else {
        const created = await api.post('/customer_products', { customer_id: customerId, product_id: productId, quantity });
        setCustomerProducts(prev => [created, ...prev]);
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

      await api.del(`/customer_products/${customerProductId}`);
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