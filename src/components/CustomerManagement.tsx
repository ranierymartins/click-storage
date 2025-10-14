import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Package, Minus } from 'lucide-react';
import { Customer, Product, CustomerProduct, Company, CustomerAccessory } from '../types';
import ConfirmModal from './ConfirmModal';

interface CustomerManagementProps {
  customers: Customer[];
  products: Product[];
  customerProducts: CustomerProduct[];
  accessories?: any[];
  customerAccessories?: CustomerAccessory[];
  onAssignAccessory?: (customerId: string, accessoryId: string, quantity: number) => void;
  onAssignAccessoryBySerials?: (customerId: string, accessoryId: string, serials: string[]) => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
  onAssignProduct: (customerId: string, productId: string, quantity: number) => void;
  onAssignProductBySerials?: (customerId: string, productId: string, serials: string[]) => void;
  onMoveAssignedSerialsToMaintenance?: (customerId: string, productId: string, serials: string[], companyId?: string) => void;
  companies?: Company[];
  onRemoveProductFromCustomer: (customerProductId: string) => void;
  onReturnAssignedSerials?: (customerId: string, productId: string, serials: string[]) => void;
  onRemoveAccessoryFromCustomer?: (customerAccessoryId: string) => void;
  onReturnAssignedAccessorySerials?: (customerId: string, accessoryId: string, serials: string[]) => void;
}

export function CustomerManagement({
  customers,
  products = [],
  accessories = [],
  customerProducts,
  customerAccessories = [],
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAssignProduct,
  onAssignProductBySerials,
  onMoveAssignedSerialsToMaintenance,
  onAssignAccessory,
  onAssignAccessoryBySerials,
  onRemoveProductFromCustomer,
  onReturnAssignedSerials,
  onRemoveAccessoryFromCustomer,
  onReturnAssignedAccessorySerials,
  companies = [],
}: CustomerManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showProductAssignment, setShowProductAssignment] = useState<string | null>(null);
  const [showAccessoryAssignment, setShowAccessoryAssignment] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    productId: '',
    quantity: 1,
  });
  const [accessoryAssignmentForm, setAccessoryAssignmentForm] = useState({ accessoryId: '', quantity: 1 });
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>(undefined);
  const [confirmConfig, setConfirmConfig] = useState<{ open: boolean; title?: string; description?: string; onConfirm?: () => void }>({ open: false });
  const [defectSelector, setDefectSelector] = useState<{ customerId: string; productId: string } | null>(null);
  const [removeSelector, setRemoveSelector] = useState<{ customerId: string; productId: string } | null>(null);
  const [removeAccessorySelector, setRemoveAccessorySelector] = useState<{ customerId: string; accessoryId: string } | null>(null);
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
      // if user selected serials and handler provided, assign by serials
      if (selectedSerials.length > 0 && onAssignProductBySerials) {
        onAssignProductBySerials(customerId, assignmentForm.productId, selectedSerials);
      } else {
        onAssignProduct(customerId, assignmentForm.productId, assignmentForm.quantity);
      }
      setAssignmentForm({ productId: '', quantity: 1 });
      setSelectedSerials([]);
      setShowProductAssignment(null);
    }
  };

  const handleAccessoryAssignment = (customerId: string) => {
    if (accessoryAssignmentForm.accessoryId && accessoryAssignmentForm.quantity > 0) {
      if (selectedSerials.length > 0 && onAssignAccessoryBySerials) {
        onAssignAccessoryBySerials(customerId, accessoryAssignmentForm.accessoryId, selectedSerials);
      } else if (onAssignAccessory) {
        onAssignAccessory(customerId, accessoryAssignmentForm.accessoryId, accessoryAssignmentForm.quantity);
      }
      setAccessoryAssignmentForm({ accessoryId: '', quantity: 1 });
      setSelectedSerials([]);
      setShowAccessoryAssignment(null);
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

  const getCustomerAccessories = (customerId: string) => {
    return (customerAccessories || [])
      .filter(ca => ca.customerId === customerId)
      .map(ca => ({ ...ca, accessory: (accessories || []).find(a => a.id === ca.accessoryId) }));
  };

  return (
    <>
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
                Nome Fantasia
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
          // total value = sum of product price * quantity for this customer's assignments
          const totalValue = customerProductsList.reduce((acc, cp) => acc + ((cp.product?.price ?? 0) * cp.quantity), 0);
          const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue);
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
                    onClick={() => setConfirmConfig({ open: true, title: 'Excluir cliente', description: 'Tem certeza que deseja excluir este cliente e todas as associações?', onConfirm: () => { onDeleteCustomer(customer.id); setConfirmConfig({ open: false }); } })}
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
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Valor Total:</span> {formattedTotal}
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
                    {/* Se o produto selecionado tiver seriais, mostrar lista para seleção */}
                    {assignmentForm.productId && (() => {
                      const prod = products.find(p => p.id === assignmentForm.productId);
                      if (!prod) return null;
                      const rawSerials = (prod as any).serialNumbers;
                      const availableSerials: string[] = Array.isArray(rawSerials)
                        ? rawSerials
                        : typeof rawSerials === 'string'
                          ? rawSerials.split(';').map((s: string) => s.trim()).filter((s: string) => s)
                          : [];

                      if (availableSerials.length === 0) return null;

                      return (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Selecione os números de série para associar (máx {assignmentForm.quantity}):</p>
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                            {availableSerials.map((s) => (
                              <label key={s} className="flex items-center space-x-2 bg-white p-2 rounded border">
                                <input
                                  type="checkbox"
                                  checked={selectedSerials.includes(s)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSerials(prev => prev.includes(s) ? prev : [...prev, s]);
                                    } else {
                                      setSelectedSerials(prev => prev.filter(x => x !== s));
                                    }
                                  }}
                                />
                                <span className="text-sm">{s}</span>
                              </label>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Selecionados: {selectedSerials.length}</p>
                        </div>
                      );
                    })()}
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
                      <div className="flex items-center space-x-2">
                            <button onClick={() => { setSelectedSerials([]); setSelectedCompany(undefined); setDefectSelector({ customerId: customer.id, productId: cp.productId }); }} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors text-sm">Selecionar defeitos</button>
                            <button onClick={() => setRemoveSelector({ customerId: customer.id, productId: cp.productId })} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors text-sm">Remover produtos</button>
                            
                            {/* Botão para deletar os produtos de Debug*/}
                            <button
                              onClick={() => setConfirmConfig({ open: true, title: 'Remover produto do cliente', description: 'Confirma remover este produto do cliente (retorna ao estoque)?', onConfirm: () => { onRemoveProductFromCustomer(cp.id); setConfirmConfig({ open: false }); } })}
                              className="h-4 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Minus className="h-3 w-3" />*Debug
                            </button>
                      </div>
                    </div>
                  ))}
                  {customerProductsList.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Nenhum produto associado
                    </p>
                  )}
                </div>
              </div>
                {/* Acessórios associados (não entram em manutenção) */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Acessórios Associados</h4>
                    <button
                      onClick={() => setShowAccessoryAssignment(showAccessoryAssignment === customer.id ? null : customer.id)}
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Associar</span>
                    </button>
                  </div>

                  {showAccessoryAssignment === customer.id && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex space-x-2">
                        <select
                          value={accessoryAssignmentForm.accessoryId}
                          onChange={(e) => setAccessoryAssignmentForm({ ...accessoryAssignmentForm, accessoryId: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="">Selecione um acessório</option>
                          {(accessories || []).filter(a => a.stock > 0).map(a => (
                            <option key={a.id} value={a.id}>{a.name} (Estoque: {a.stock})</option>
                          ))}
                        </select>
                        <input type="number" min="1" value={accessoryAssignmentForm.quantity} onChange={(e)=>setAccessoryAssignmentForm({...accessoryAssignmentForm, quantity: parseInt(e.target.value)})} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        <button onClick={() => handleAccessoryAssignment(customer.id)} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">Associar</button>
                      </div>
                      {/* if accessory has serials, show selection */}
                      {accessoryAssignmentForm.accessoryId && (() => {
                        const acc = (accessories || []).find(a => a.id === accessoryAssignmentForm.accessoryId);
                        if (!acc) return null;
                        const rawSerials = (acc as any).serialNumbers;
                        const availableSerials: string[] = Array.isArray(rawSerials) ? rawSerials : typeof rawSerials === 'string' ? rawSerials.split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : [];
                        if (availableSerials.length === 0) return null;
                        return (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Selecione os números de série para associar (máx {accessoryAssignmentForm.quantity}):</p>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                              {availableSerials.map((s) => (
                                <label key={s} className="flex items-center space-x-2 bg-white p-2 rounded border">
                                  <input type="checkbox" checked={selectedSerials.includes(s)} onChange={(e)=>{ if (e.target.checked) setSelectedSerials(prev => prev.includes(s) ? prev : [...prev, s]); else setSelectedSerials(prev => prev.filter(x=>x!==s)); }} />
                                  <span className="text-sm">{s}</span>
                                </label>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Selecionados: {selectedSerials.length}</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="space-y-2">
                    {getCustomerAccessories(customer.id).map((ca) => (
                      <div key={ca.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{ca.accessory?.name || 'Acessório'}</span>
                          <span className="text-xs text-gray-500">x{ca.quantity}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setRemoveAccessorySelector({ customerId: customer.id, accessoryId: ca.accessoryId })} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors text-sm">Remover seriais</button>
                          <button onClick={() => { if (onRemoveAccessoryFromCustomer) onRemoveAccessoryFromCustomer(ca.id); }} className="h-4 text-red-600 hover:bg-red-50 rounded transition-colors">Remover</button>
                        </div>
                      </div>
                    ))}
                    {(getCustomerAccessories(customer.id).length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-2">Nenhum acessório associado</p>
                    )}
                  </div>
                </div>
            </div>
          );
        })}

        {/* Painel de seleção de equipamentos com defeito */}
        {defectSelector && (() => {
          const { customerId, productId } = defectSelector;
          const assignment = customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
          if (!assignment) return null;
          const assignmentRaw: any = (assignment as any).serialNumbers;
          const assignmentSerials: string[] = Array.isArray(assignmentRaw) ? assignmentRaw : (typeof assignmentRaw === 'string' ? (assignmentRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);

          return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl">
                <h3 className="text-lg font-medium mb-3">Selecionar equipamentos com defeito</h3>
                <p className="text-sm text-gray-600 mb-3">Selecione os números de série que serão enviados para manutenção para este cliente.</p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-auto mb-4">
                  {assignmentSerials.map(s => (
                    <label key={s} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                      <input type="checkbox" checked={selectedSerials.includes(s)} onChange={(e) => {
                        if (e.target.checked) setSelectedSerials(prev => prev.includes(s) ? prev : [...prev, s]);
                        else setSelectedSerials(prev => prev.filter(x => x !== s));
                      }} />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empresa responsável pela manutenção</label>
                  <select
                    value={selectedCompany ?? ''}
                    onChange={(e) => setSelectedCompany(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2">
                  <button onClick={() => { setDefectSelector(null); setSelectedSerials([]); setSelectedCompany(undefined); }} className="bg-gray-200 px-3 py-2 rounded">Cancelar</button>
                  <button
                    onClick={() => {
                      if (selectedSerials.length > 0 && typeof onMoveAssignedSerialsToMaintenance === 'function' && selectedCompany) {
                        setConfirmConfig({ open: true, title: 'Enviar para manutenção', description: 'Confirma enviar os itens selecionados para manutenção?', onConfirm: () => { onMoveAssignedSerialsToMaintenance(customerId, productId, selectedSerials, selectedCompany); setDefectSelector(null); setSelectedSerials([]); setSelectedCompany(undefined); setConfirmConfig({ open: false }); } });
                      }
                    }}
                    disabled={!selectedCompany || selectedSerials.length === 0}
                    className={`px-3 py-2 rounded ${selectedSerials.length > 0 && selectedCompany ? 'bg-yellow-600 text-white' : 'bg-yellow-200 text-yellow-800 cursor-not-allowed'}`}
                  >Enviar para manutenção</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Painel de seleção de seriais para remover e devolver ao estoque */}
        {removeSelector && (() => {
          const { customerId, productId } = removeSelector;
          const assignment = customerProducts.find(cp => cp.customerId === customerId && cp.productId === productId);
          if (!assignment) return null;
          const assignmentRaw: any = (assignment as any).serialNumbers;
          const assignmentSerials: string[] = Array.isArray(assignmentRaw) ? assignmentRaw : (typeof assignmentRaw === 'string' ? (assignmentRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);

          return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl">
                <h3 className="text-lg font-medium mb-3">Remover seriais do cliente</h3>
                <p className="text-sm text-gray-600 mb-3">Selecione os números de série que deverão voltar para o estoque.</p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-auto mb-4">
                  {assignmentSerials.map(s => (
                    <label key={s} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                      <input type="checkbox" checked={selectedSerials.includes(s)} onChange={(e) => {
                        if (e.target.checked) setSelectedSerials(prev => prev.includes(s) ? prev : [...prev, s]);
                        else setSelectedSerials(prev => prev.filter(x => x !== s));
                      }} />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => { setRemoveSelector(null); setSelectedSerials([]); }} className="bg-gray-200 px-3 py-2 rounded">Cancelar</button>
                  <button onClick={() => {
                    if (selectedSerials.length > 0 && typeof onReturnAssignedSerials === 'function') {
                      setConfirmConfig({ open: true, title: 'Confirmar devolução', description: 'Confirma devolver os seriais selecionados ao estoque?', onConfirm: () => { onReturnAssignedSerials(customerId, productId, selectedSerials); setRemoveSelector(null); setSelectedSerials([]); setConfirmConfig({ open: false }); } });
                    }
                  }} className="bg-red-600 text-white px-3 py-2 rounded">Confirmar devolução</button>
                </div>
              </div>
            </div>
          );
        })()}

        {removeAccessorySelector && (() => {
          const { customerId, accessoryId } = removeAccessorySelector;
          const assignment = (customerAccessories || []).find(ca => ca.customerId === customerId && ca.accessoryId === accessoryId);
          if (!assignment) return null;
          const assignmentRaw: any = (assignment as any).serialNumbers;
          const assignmentSerials: string[] = Array.isArray(assignmentRaw) ? assignmentRaw : (typeof assignmentRaw === 'string' ? (assignmentRaw as string).split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : []);

          return (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl">
                <h3 className="text-lg font-medium mb-3">Remover seriais do acessório</h3>
                <p className="text-sm text-gray-600 mb-3">Selecione os números de série que deverão voltar para o estoque.</p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-auto mb-4">
                  {assignmentSerials.map(s => (
                    <label key={s} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                      <input type="checkbox" checked={selectedSerials.includes(s)} onChange={(e) => { if (e.target.checked) setSelectedSerials(prev => prev.includes(s) ? prev : [...prev, s]); else setSelectedSerials(prev => prev.filter(x => x !== s)); }} />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => { setRemoveAccessorySelector(null); setSelectedSerials([]); }} className="bg-gray-200 px-3 py-2 rounded">Cancelar</button>
                  <button onClick={() => {
                    if (selectedSerials.length > 0 && typeof onReturnAssignedAccessorySerials === 'function') {
                      setConfirmConfig({ open: true, title: 'Confirmar devolução', description: 'Confirma devolver os seriais selecionados ao estoque?', onConfirm: () => { onReturnAssignedAccessorySerials(customerId, accessoryId, selectedSerials); setRemoveAccessorySelector(null); setSelectedSerials([]); setConfirmConfig({ open: false }); } });
                    }
                  }} className="bg-red-600 text-white px-3 py-2 rounded">Confirmar devolução</button>
                </div>
              </div>
            </div>
          );
        })()}

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
    {confirmConfig.open && (
      <ConfirmModal open={confirmConfig.open} title={confirmConfig.title} description={confirmConfig.description} onConfirm={() => { confirmConfig.onConfirm && confirmConfig.onConfirm(); }} onCancel={() => setConfirmConfig({ open: false })} />
    )}
    </>
  );
}