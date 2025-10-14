import React from 'react';
import { Package, Users, BarChart3, Settings, Wrench, Home, HomeIcon } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'products', name: 'Produtos', icon: Package },
  { id: 'customers', name: 'Clientes', icon: Users },
  { id: 'maintenance', name: 'Manutenção', icon: Wrench },
  { id: 'companies', name: 'Empresas', icon: Home },
  { id: 'reports', name: 'Relatórios', icon: BarChart3 },
  { id: 'acessories', name: 'Acessorios', icon: HomeIcon },
];

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <nav className="bg-gray-900 text-white h-screen w-64 fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <img src="src\img\clicklaudos_logo.jpeg" alt="Logo" className="h-8 w-8"/>
          <h1 className="text-xl font-bold">Click Store</h1>
        </div>
        
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}