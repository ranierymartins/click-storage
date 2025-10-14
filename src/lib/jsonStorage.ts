import { Product, Customer, CustomerProduct } from '../types';

interface DatabaseSchema {
  products: Product[];
  customers: Customer[];
  customerProducts: CustomerProduct[];
  productSerialNumbers: { productId: string; serialNumber: string }[];
}

const DB_FILE_PATH = '/data/inventory.json';

function readDatabase(): DatabaseSchema {
  try {
    const data = localStorage.getItem('inventory-db');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        products: parsed.products?.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        })) || [],
        customers: parsed.customers?.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })) || [],
        customerProducts: parsed.customerProducts?.map((cp: any) => ({
          ...cp,
          assignedAt: new Date(cp.assignedAt),
        })) || [],
        productSerialNumbers: parsed.productSerialNumbers || [],
      };
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }

  return {
    products: [],
    customers: [],
    customerProducts: [],
    productSerialNumbers: [],
  };
}

function writeDatabase(db: DatabaseSchema): void {
  try {
    localStorage.setItem('inventory-db', JSON.stringify(db));
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
}

export const db = {
  products: {
    getAll: (): Product[] => {
      const data = readDatabase();
      return data.products;
    },

    getById: (id: string): Product | undefined => {
      const data = readDatabase();
      return data.products.find(p => p.id === id);
    },

    create: (product: Omit<Product, 'id' | 'createdAt'>, serialNumbers: string[]): Product => {
      const data = readDatabase();
      const newProduct: Product = {
        ...product,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      };

      data.products.push(newProduct);

      serialNumbers.forEach(serial => {
        data.productSerialNumbers.push({
          productId: newProduct.id,
          serialNumber: serial,
        });
      });

      writeDatabase(data);
      return newProduct;
    },

    update: (id: string, updates: Partial<Product>): void => {
      const data = readDatabase();
      const index = data.products.findIndex(p => p.id === id);
      if (index !== -1) {
        data.products[index] = { ...data.products[index], ...updates };
        writeDatabase(data);
      }
    },

    delete: (id: string): void => {
      const data = readDatabase();
      data.products = data.products.filter(p => p.id !== id);
      data.customerProducts = data.customerProducts.filter(cp => cp.productId !== id);
      data.productSerialNumbers = data.productSerialNumbers.filter(sn => sn.productId !== id);
      writeDatabase(data);
    },
  },

  customers: {
    getAll: (): Customer[] => {
      const data = readDatabase();
      return data.customers;
    },

    getById: (id: string): Customer | undefined => {
      const data = readDatabase();
      return data.customers.find(c => c.id === id);
    },

    create: (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
      const data = readDatabase();
      const newCustomer: Customer = {
        ...customer,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      };
      data.customers.push(newCustomer);
      writeDatabase(data);
      return newCustomer;
    },

    update: (id: string, updates: Partial<Customer>): void => {
      const data = readDatabase();
      const index = data.customers.findIndex(c => c.id === id);
      if (index !== -1) {
        data.customers[index] = { ...data.customers[index], ...updates };
        writeDatabase(data);
      }
    },

    delete: (id: string): void => {
      const data = readDatabase();
      data.customers = data.customers.filter(c => c.id !== id);
      data.customerProducts = data.customerProducts.filter(cp => cp.customerId !== id);
      writeDatabase(data);
    },
  },

  customerProducts: {
    getAll: (): CustomerProduct[] => {
      const data = readDatabase();
      return data.customerProducts;
    },

    getByCustomerId: (customerId: string): CustomerProduct[] => {
      const data = readDatabase();
      return data.customerProducts.filter(cp => cp.customerId === customerId);
    },

    getByProductId: (productId: string): CustomerProduct[] => {
      const data = readDatabase();
      return data.customerProducts.filter(cp => cp.productId === productId);
    },

    findByCustomerAndProduct: (customerId: string, productId: string): CustomerProduct | undefined => {
      const data = readDatabase();
      return data.customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
    },

    create: (customerProduct: Omit<CustomerProduct, 'id' | 'assignedAt'>): CustomerProduct => {
      const data = readDatabase();
      const newAssignment: CustomerProduct = {
        ...customerProduct,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        assignedAt: new Date(),
      };
      data.customerProducts.push(newAssignment);
      writeDatabase(data);
      return newAssignment;
    },

    update: (id: string, updates: Partial<CustomerProduct>): void => {
      const data = readDatabase();
      const index = data.customerProducts.findIndex(cp => cp.id === id);
      if (index !== -1) {
        data.customerProducts[index] = { ...data.customerProducts[index], ...updates };
        writeDatabase(data);
      }
    },

    delete: (id: string): void => {
      const data = readDatabase();
      data.customerProducts = data.customerProducts.filter(cp => cp.id !== id);
      writeDatabase(data);
    },
  },

  serialNumbers: {
    getByProductId: (productId: string): string[] => {
      const data = readDatabase();
      return data.productSerialNumbers
        .filter(sn => sn.productId === productId)
        .map(sn => sn.serialNumber);
    },

    update: (productId: string, serialNumbers: string[]): void => {
      const data = readDatabase();
      data.productSerialNumbers = data.productSerialNumbers.filter(sn => sn.productId !== productId);
      serialNumbers.forEach(serial => {
        data.productSerialNumbers.push({ productId, serialNumber: serial });
      });
      writeDatabase(data);
    },
  },
};
