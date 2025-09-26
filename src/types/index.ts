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

export interface CustomerProduct {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  serialNumbers?: string[]; // números de série associados a essa alocação
  assignedAt: Date;
}

export interface InventoryStats {
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  totalValue: number;
  recentAssignments: number;
}