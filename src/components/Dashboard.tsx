import React from 'react';
import { Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Product, Customer, CustomerProduct, InventoryStats } from '../types';

interface DashboardProps {
  products: Product[];
  customers: Customer[];
  customerProducts: CustomerProduct[];
}

export function Dashboard({ products, customers, customerProducts }: DashboardProps) {
  const stats: InventoryStats = {
    totalProducts: products.length,
    totalCustomers: customers.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    lowStockProducts: products.filter(p => p.stock < 10).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    recentAssignments: customerProducts.filter(
      cp => new Date(cp.assignedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length,
  };

  const StatCard = ({ icon: Icon, title, value, color }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total de Produtos"
          value={stats.totalProducts}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Total de Clientes"
          value={stats.totalCustomers}
          color="bg-green-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Valor Total do Estoque"
          value={`R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="bg-purple-500"
        />
        <StatCard
          icon={AlertTriangle}
          title="Produtos com Pouco Estoque"
          value={stats.lowStockProducts}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos com Baixo Estoque</h3>
          <div className="space-y-3">
            {products
              .filter(p => p.stock < 10)
              .slice(0, 5)
              .map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">Categoria: {product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{product.stock}</p>
                    <p className="text-xs text-gray-500">em estoque</p>
                  </div>
                </div>
              ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum produto com baixo estoque!</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {customerProducts
              .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
              .slice(0, 5)
              .map(assignment => {
                const customer = customers.find(c => c.id === assignment.customerId);
                const product = products.find(p => p.id === assignment.productId);
                return (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product?.name}</p>
                      <p className="text-sm text-gray-600">Cliente: {customer?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{assignment.quantity}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            {customerProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}