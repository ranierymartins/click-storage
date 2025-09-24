import React from 'react';
import { BarChart3, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { Product, Customer, CustomerProduct } from '../types';

interface ReportsProps {
  products: Product[];
  customers: Customer[];
  customerProducts: CustomerProduct[];
}

export function Reports({ products, customers, customerProducts }: ReportsProps) {
  // Métricas principais
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const averageProductPrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
    : 0;
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  // Métricas de associações
  const totalAssociations = customerProducts.length;
  const productsAssociated = customerProducts.reduce((acc, cp) => acc + cp.quantity, 0);

  const ReportCard = ({ title, value, subtitle, icon: Icon, color }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
        <div className="text-sm text-gray-500">
          Dados atualizados em tempo real
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Valor Total em Estoque"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Valor dos produtos em estoque"
          icon={DollarSign}
          color="bg-green-500"
        />
        <ReportCard
          title="Preço Médio dos Produtos"
          value={`R$ ${averageProductPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Média de preço por produto"
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <ReportCard
          title="Total de Produtos"
          value={totalProducts.toString()}
          subtitle="Produtos cadastrados"
          icon={Package}
          color="bg-orange-500"
        />
        <ReportCard
          title="Total de Clientes"
          value={totalCustomers.toString()}
          subtitle="Clientes cadastrados"
          icon={Users}
          color="bg-purple-500"
        />
        <ReportCard
          title="Associações Cliente-Produto"
          value={totalAssociations.toString()}
          subtitle="Total de vínculos registrados"
          icon={BarChart3}
          color="bg-pink-500"
        />
        <ReportCard
          title="Produtos Associados"
          value={productsAssociated.toString()}
          subtitle="Quantidade total associada a clientes"
          icon={Package}
          color="bg-yellow-500"
        />
      </div>
    </div>
  );
}