import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { Reports } from './components/Reports';
import { useInventory } from './hooks/useInventory';
import { useSqliteInventory } from './hooks/useSqliteInventory';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Usar SQLite hook se disponível
  const sqlite = useSqliteInventory();
  const [products, setProducts] = useState<any[]>([]);

  // sync products when sqlite ready
  React.useEffect(() => {
    if (sqlite.ready) setProducts(sqlite.products as any[]);
  }, [sqlite.ready, sqlite.products]);

  const {
    customers,
    customerProducts,
    createCustomer: addCustomer,
    updateCustomer,
    deleteCustomer,
    assignProductToCustomer,
    removeProductFromCustomer,
  } = sqlite as any;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            products={products}
            customers={customers}
            customerProducts={customerProducts}
          />
        );
      case 'products':
        return (
          <ProductManagement
              products={products}
              onCreateProduct={sqlite.createProduct}
              onUpdateProduct={sqlite.updateProduct}
              onDeleteProduct={sqlite.deleteProduct}
            />
        );
      case 'customers':
        return (
          <CustomerManagement
            customers={customers}
            products={products}
            customerProducts={customerProducts}
            onAddCustomer={addCustomer}
            onUpdateCustomer={updateCustomer}
            onDeleteCustomer={deleteCustomer}
            onAssignProduct={assignProductToCustomer}
            onRemoveProductFromCustomer={removeProductFromCustomer}
          />
        );
      case 'reports':
        return (
          <Reports
            products={products}
            customers={customers}
            customerProducts={customerProducts}
          />
        );
      default:
        return <Dashboard products={products} customers={customers} customerProducts={customerProducts} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;