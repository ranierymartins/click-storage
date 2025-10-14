import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { Reports } from './components/Reports';
import { useJsonInventory } from './hooks/useJsonInventory';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    products,
    customers,
    customerProducts,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    assignProductToCustomer,
    removeProductFromCustomer,
  } = useJsonInventory();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

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
            onCreateProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
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