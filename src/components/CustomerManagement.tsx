import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Package, Minus } from 'lucide-react';
import { Customer, Product, CustomerProduct } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  products: Product[];
  customerProducts: CustomerProduct[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
  onAssignProduct: (customerId: string, productId: string, quantity: number) => void;
  onRemoveProductFromCustomer: (customerProductId: string) => void;
}

export function CustomerManagement({
  customers,
  products = [],
  customerProducts,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAssignProduct,
  onRemoveProductFromCustomer,
}: CustomerManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showProductAssignment, setShowProductAssignment] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    productId: '',
    quantity: 1,
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, formData);
    } else {
      onAddCustomer(formData);
    }
    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setShowForm(true);
  };

  const handleProductAssignment = (customerId: string) => {
    if (assignmentForm.productId && assignmentForm.quantity > 0) {
      onAssignProduct(customerId, assignmentForm.productId, assignmentForm.quantity);
      setAssignmentForm({ productId: '', quantity: 1 });
      setShowProductAssignment(null);
    }
  };

  const getCustomerProducts = (customerId: string) => {
    return customerProducts
      .filter(cp => cp.customerId === customerId)
      .map(cp => ({
        ...cp,
        product: products.find(p => p.id === cp.productId)!,
      }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingCustomer ? 'Atualizar' : 'Criar'} Cliente
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {customers.map((customer) => {
          const customerProductsList = getCustomerProducts(customer.id);
          return (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCustomer(customer.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telefone:</span> {customer.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Endereço:</span> {customer.address}
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Produtos Associados</h4>
                  <button
                    onClick={() => setShowProductAssignment(
                      showProductAssignment === customer.id ? null : customer.id
                    )}
                    className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Associar</span>
                  </button>
                </div>

                {showProductAssignment === customer.id && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex space-x-2">
                      <select
                        value={assignmentForm.productId}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, productId: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Selecione um produto</option>
                        {products.filter(p => p.stock > 0).map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Estoque: {product.stock})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={assignmentForm.quantity}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, quantity: parseInt(e.target.value) })}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Qtd"
                      />
                      <button
                        onClick={() => handleProductAssignment(customer.id)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Associar
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {customerProductsList.map((cp) => (
                    <div key={cp.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">{cp.product.name}</span>
                        <span className="text-xs text-gray-500">x{cp.quantity}</span>
                      </div>
                      <button
                        onClick={() => onRemoveProductFromCustomer(cp.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {customerProductsList.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Nenhum produto associado
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {customers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-gray-500 mb-4">Comece adicionando seu primeiro cliente.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Adicionar Cliente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}