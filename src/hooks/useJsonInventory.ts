import { useState, useEffect } from 'react';
import { Product, Customer, CustomerProduct } from '../types';
import { db } from '../lib/jsonStorage';

export function useJsonInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    try {
      setLoading(true);
      setError(null);
      const loadedProducts = db.products.getAll();
      const loadedCustomers = db.customers.getAll();
      const loadedCustomerProducts = db.customerProducts.getAll();

      const productsWithSerials = loadedProducts.map(product => ({
        ...product,
        serialNumbers: db.serialNumbers.getByProductId(product.id),
      }));

      setProducts(productsWithSerials);
      setCustomers(loadedCustomers);
      setCustomerProducts(loadedCustomerProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>, serialNumbers: string[]) => {
    try {
      const newProduct = db.products.create(product, serialNumbers);
      const productWithSerials = {
        ...newProduct,
        serialNumbers,
      };
      setProducts(prev => [...prev, productWithSerials]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>, serialNumbers?: string[]) => {
    try {
      db.products.update(id, updates);
      if (serialNumbers) {
        db.serialNumbers.update(id, serialNumbers);
      }
      setProducts(prev => prev.map(p =>
        p.id === id
          ? { ...p, ...updates, serialNumbers: serialNumbers || p.serialNumbers }
          : p
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = (id: string) => {
    try {
      db.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setCustomerProducts(prev => prev.filter(cp => cp.productId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const newCustomer = db.customers.create(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
      throw err;
    }
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    try {
      db.customers.update(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      throw err;
    }
  };

  const deleteCustomer = (id: string) => {
    try {
      db.customers.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      setCustomerProducts(prev => prev.filter(cp => cp.customerId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      throw err;
    }
  };

  const assignProductToCustomer = (customerId: string, productId: string, serialNumbers: string[]) => {
    try {
      const quantity = serialNumbers.length;
      const existingAssignment = db.customerProducts.findByCustomerAndProduct(customerId, productId);

      if (existingAssignment) {
        const newQuantity = existingAssignment.quantity + quantity;
        db.customerProducts.update(existingAssignment.id, { quantity: newQuantity });
        setCustomerProducts(prev =>
          prev.map(cp =>
            cp.id === existingAssignment.id ? { ...cp, quantity: newQuantity } : cp
          )
        );
      } else {
        const newAssignment = db.customerProducts.create({
          customerId,
          productId,
          quantity,
        });
        setCustomerProducts(prev => [...prev, newAssignment]);
      }

      const product = products.find(p => p.id === productId);
      if (product) {
        const newStock = product.stock - quantity;
        const remainingSerialNumbers = (product.serialNumbers || []).filter(
          sn => !serialNumbers.includes(sn)
        );
        db.products.update(productId, { stock: newStock });
        db.serialNumbers.update(productId, remainingSerialNumbers);
        setProducts(prev =>
          prev.map(p =>
            p.id === productId
              ? { ...p, stock: newStock, serialNumbers: remainingSerialNumbers }
              : p
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign product');
      throw err;
    }
  };

  const removeProductFromCustomer = (customerProductId: string) => {
    try {
      const assignment = customerProducts.find(cp => cp.id === customerProductId);
      if (assignment) {
        const product = products.find(p => p.id === assignment.productId);
        if (product) {
          const newStock = product.stock + assignment.quantity;
          db.products.update(product.id, { stock: newStock });
          setProducts(prev =>
            prev.map(p => (p.id === product.id ? { ...p, stock: newStock } : p))
          );
        }
        db.customerProducts.delete(customerProductId);
        setCustomerProducts(prev => prev.filter(cp => cp.id !== customerProductId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove product assignment');
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
    refresh: loadData,
  };
}
