import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import Acessories from './components/Acessories';
import { CustomerManagement } from './components/CustomerManagement';
import CompanyManagement from './components/CompanyManagement';
import { Reports } from './components/Reports';
import { Maintenance } from './components/Maintenance';
import { useInventory } from './hooks/useInventory';
// csvUtils not used here anymore; persistence handled by useInventory hook

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // useInventory fornece produtos e operações (persistidas no hook)
  const {
    products,
    customers,
    customerProducts,
    companies,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addCompany,
    updateCompany,
    deleteCompany,
    assignProductToCustomer,
    assignProductToCustomerBySerials,
    removeProductFromCustomer,
    returnAssignedSerialsToProduct,
    maintenanceItems,
    moveProductToMaintenance,
    restoreFromMaintenance,
    moveAssignedSerialsToMaintenance,
    accessories,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    customerAccessories,
    assignAccessoryToCustomer,
    assignAccessoryToCustomerBySerials,
    removeAccessoryFromCustomer,
    returnAssignedAccessorySerialsToStock,
  } = useInventory();
  // NOTE: accessories functions are provided by useInventory

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
      case 'acessories':
          return (
            <Acessories
              accessories={accessories}
              onAddAccessory={addAccessory}
              onUpdateAccessory={updateAccessory}
              onDeleteAccessory={deleteAccessory}
            />
          );
      case 'customers':
        return (
          <CustomerManagement
            customers={customers}
            products={products}
            accessories={accessories}
            customerProducts={customerProducts}
            customerAccessories={customerAccessories}
            onAddCustomer={addCustomer}
            onUpdateCustomer={updateCustomer}
            onDeleteCustomer={deleteCustomer}
            onAssignProduct={assignProductToCustomer}
            onAssignProductBySerials={assignProductToCustomerBySerials}
            onMoveAssignedSerialsToMaintenance={moveAssignedSerialsToMaintenance}
            onAssignAccessory={assignAccessoryToCustomer}
            onAssignAccessoryBySerials={assignAccessoryToCustomerBySerials}
            onRemoveProductFromCustomer={removeProductFromCustomer}
            onReturnAssignedSerials={returnAssignedSerialsToProduct}
            onRemoveAccessoryFromCustomer={removeAccessoryFromCustomer}
            onReturnAssignedAccessorySerials={returnAssignedAccessorySerialsToStock}
            companies={companies}
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
      case 'companies':
        return (
          <CompanyManagement
            companies={companies}
            onAddCompany={addCompany}
            onUpdateCompany={updateCompany}
            onDeleteCompany={deleteCompany}
          />
        );
        case 'maintenance':
          return (
            <Maintenance
              items={maintenanceItems}
              companies={companies}
              onRestore={restoreFromMaintenance}
              onRemove={(id) => { restoreFromMaintenance(id); }}
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