export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
  serialNumbers?: string[];
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
  assignedAt: Date;
}

export interface InventoryStats {
  totalProducts: number;
  totalCustomers: number;
  totalStock: number;
  lowStockProducts: number;
  totalValue: number;
  recentAssignments: number;
}