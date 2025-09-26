import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { Reports } from './components/Reports';
import { useInventory } from './hooks/useInventory';
// csvUtils not used here anymore; persistence handled by useInventory hook

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // useInventory fornece produtos e operações (persistidas no hook)
  const {
    products,
    customers,
    customerProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    assignProductToCustomer,
    assignProductToCustomerBySerials,
    removeProductFromCustomer,
  } = useInventory();

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
            onAddProduct={addProduct}
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
            onAssignProductBySerials={assignProductToCustomerBySerials}
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