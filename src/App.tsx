import { useState, useEffect } from 'react';
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
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('pinUnlocked');
    if (saved === 'true') setUnlocked(true);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '147852') {
      setUnlocked(true);
      sessionStorage.setItem('pinUnlocked', 'true');
      setPinError(null);
    } else {
      setPinError('PIN incorreto');
    }
  };
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

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
          <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">Digite o PIN para continuar</h1>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {pinError && (
              <div className="text-sm text-red-600">{pinError}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Desbloquear
            </button>
          </form>
        </div>
      </div>
    );
  }

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