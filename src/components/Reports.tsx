import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { Product, Customer, CustomerProduct } from '../types';

interface ReportsProps {
  products: Product[];
  customers: Customer[];
  customerProducts: CustomerProduct[];
}

export function Reports({ products, customers, customerProducts }: ReportsProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');

  // filtered customerProducts based on selection
  const filteredCustomerProducts = useMemo(() => {
    if (selectedCustomerId === 'all') return customerProducts;
    return customerProducts.filter(cp => cp.customerId === selectedCustomerId);
  }, [customerProducts, selectedCustomerId]);

  // products associated for selected customer(s)
  const productsAssociated = filteredCustomerProducts.reduce((acc, cp) => acc + cp.quantity, 0);

  const totalAssociations = filteredCustomerProducts.length;

  // total spent and total items for the filtered selection
  const totalSpent = useMemo(() => {
    return filteredCustomerProducts.reduce((acc, cp) => {
      const product = products.find(p => p.id === cp.productId);
      const price = product ? product.price : 0;
      return acc + price * cp.quantity;
    }, 0);
  }, [filteredCustomerProducts, products]);

  const totalItems = productsAssociated; // alias

  // helper: get last N months labels (YYYY-MM)
  function lastNMonths(n: number) {
    const res: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
      res.push({ key, label });
    }
    return res;
  }

  const months = lastNMonths(12);

  // aggregate monthly spending and items for filteredCustomerProducts
  const monthlyData = useMemo(() => {
    const map: Record<string, { spent: number; items: number }> = {};
    months.forEach(m => { map[m.key] = { spent: 0, items: 0 }; });

    filteredCustomerProducts.forEach(cp => {
      const assigned = (cp as any).assignedAt ? new Date(cp.assignedAt) : new Date();
      const key = `${assigned.getFullYear()}-${String(assigned.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) return; // ignore out-of-range
      const product = products.find(p => p.id === cp.productId);
      const price = product ? product.price : 0;
      map[key].spent += price * cp.quantity;
      map[key].items += cp.quantity;
    });

    return months.map(m => ({ key: m.key, label: m.label, spent: map[m.key].spent, items: map[m.key].items }));
  }, [filteredCustomerProducts, products, months]);

  // Simple SVG bar chart component
  const BarChart = ({ data, valueKey, color = '#4F46E5' }: { data: { label: string; [k: string]: any }[]; valueKey: string; color?: string }) => {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    const width = 600; const height = 160; const padding = 24;
    const barW = (width - padding * 2) / data.length - 6;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        {data.map((d, i) => {
          const val = d[valueKey];
          const h = (val / max) * (height - padding * 2);
          const x = padding + i * (barW + 6);
          const y = height - padding - h;
          return (
            <g key={d.key}>
              <rect x={x} y={y} width={barW} height={h} rx={4} fill={color} />
              <text x={x + barW / 2} y={height - padding + 14} fontSize={10} textAnchor="middle" fill="#374151">{d.label.split(' ')[0]}</text>
            </g>
          );
        })}
      </svg>
    );
  };
  // Métricas principais
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const averageProductPrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
    : 0;
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  // Métricas de associações
  

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
      <div className="flex items-center space-x-4">
        <label className="text-sm text-gray-700">Filtrar por cliente:</label>
        <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="px-3 py-2 border rounded">
          <option value="all">Todos os clientes</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
          subtitle={selectedCustomerId === 'all' ? 'Total de vínculos registrados' : 'Vínculos para o cliente selecionado'}
          icon={BarChart3}
          color="bg-pink-500"
        />
        <ReportCard
          title="Produtos Associados"
          value={productsAssociated.toString()}
          subtitle={selectedCustomerId === 'all' ? 'Quantidade total associada a clientes' : 'Quantidade associada ao cliente selecionado'}
          icon={Package}
          color="bg-yellow-500"
        />
        <ReportCard
          title="Total Gasto"
          value={`R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={selectedCustomerId === 'all' ? 'Gasto total de todos os clientes' : 'Gasto do cliente selecionado'}
          icon={DollarSign}
          color="bg-emerald-500"
        />
        <ReportCard
          title="Total de Itens"
          value={totalItems.toString()}
          subtitle={selectedCustomerId === 'all' ? 'Itens vendidos/associados total' : 'Itens do cliente selecionado'}
          icon={Package}
          color="bg-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h4 className="text-lg font-medium mb-2">Acompanhamento Mensal — Gasto</h4>
          <BarChart data={monthlyData} valueKey="spent" color="#10B981" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h4 className="text-lg font-medium mb-2">Acompanhamento Mensal — Itens</h4>
          <BarChart data={monthlyData} valueKey="items" color="#3B82F6" />
        </div>
      </div>
    </div>
  );
}