export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string; // marca do produto
  serialNumbers?: string[]; // lista de números de série individuais
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface MaintenanceItem {
  id: string;
  originalProductId?: string; // when created from a product, original id is stored here
  name: string;
  description?: string;
  price?: number;
  stock: number;
  brand?: string;
  serialNumbers?: string[];
  companyId?: string; // responsible company for the maintenance
  createdAt: Date;
}

export interface CustomerProduct {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  serialNumbers?: string[]; // números de série associados a essa alocação
  assignedAt: Date;
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  serialNumbers?: string[];
  createdAt: Date;
}

export interface CustomerAccessory {
  id: string;
  customerId: string;
  accessoryId: string;
  quantity: number;
  serialNumbers?: string[];
  assignedAt: Date;
}

export interface InventoryStats {
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  totalValue: number;
  recentAssignments: number;
}