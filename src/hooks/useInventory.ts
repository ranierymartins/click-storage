import { useState, useEffect } from 'react';
import { Product, Customer, CustomerProduct } from '../types';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('inventory-products');
    const savedCustomers = localStorage.getItem('inventory-customers');
    const savedCustomerProducts = localStorage.getItem('inventory-customer-products');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
    if (savedCustomerProducts) {
      setCustomerProducts(JSON.parse(savedCustomerProducts));
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('inventory-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inventory-customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('inventory-customer-products', JSON.stringify(customerProducts));
  }, [customerProducts]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    // Also remove any customer associations
    setCustomerProducts(prev => prev.filter(cp => cp.productId !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
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
    // Check if assignment already exists
    const existingAssignment = customerProducts.find(
      cp => cp.customerId === customerId && cp.productId === productId
    );

    if (existingAssignment) {
      // Update quantity
      setCustomerProducts(prev => 
        prev.map(cp => 
          cp.id === existingAssignment.id 
            ? { ...cp, quantity: cp.quantity + quantity }
            : cp
        )
      );
    } else {
      // Create new assignment
      const newAssignment: CustomerProduct = {
        id: Date.now().toString(),
        customerId,
        productId,
        quantity,
        assignedAt: new Date(),
      };
      setCustomerProducts(prev => [...prev, newAssignment]);
    }

    // Update product stock
    updateProduct(productId, { 
      stock: products.find(p => p.id === productId)!.stock - quantity 
    });
  };

  const removeProductFromCustomer = (customerProductId: string) => {
    const assignment = customerProducts.find(cp => cp.id === customerProductId);
    if (assignment) {
      // Return stock to product
      const product = products.find(p => p.id === assignment.productId);
      if (product) {
        updateProduct(product.id, { stock: product.stock + assignment.quantity });
      }
      setCustomerProducts(prev => prev.filter(cp => cp.id !== customerProductId));
    }
  };

  return {
    products,
    customers,
    customerProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    assignProductToCustomer,
    removeProductFromCustomer,
  };
}