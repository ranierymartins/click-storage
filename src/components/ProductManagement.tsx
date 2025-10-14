import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { Product } from '../types';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}
export function ProductManagement({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: ProductManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    brand: '',
    serialNumbers: [] as string[],
  });
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      brand: '',
      serialNumbers: [],
    });
    setEditingProduct(null);
    setShowForm(false);
    setFormError(null);
  };

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // validação: quantidade deve ser igual ao número de números de série
    if (formData.stock !== formData.serialNumbers.length) {
      setFormError(`A quantidade (${formData.stock}) deve ser igual ao número de números de série (${formData.serialNumbers.length}).`);
      return;
    }

    // Prepare confirmation before executing add/update
    const exec = () => {
      if (editingProduct) {
        onUpdateProduct(editingProduct.id, formData);
      } else {
        onAddProduct(formData);
      }
      resetForm();
    };

    setConfirm({ open: true, title: editingProduct ? 'Confirmar atualização' : 'Confirmar criação', description: editingProduct ? 'Confirma atualizar este produto?' : 'Confirma criar este produto?', onConfirm: exec });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // normaliza serialNumbers que podem vir como string (ex: "a;b;c") ou array
    const rawSerials = (product as any).serialNumbers;
    const serials = Array.isArray(rawSerials)
      ? rawSerials
      : typeof rawSerials === 'string'
        ? rawSerials.split(';').map((s: string) => s.trim()).filter((s: string) => s)
        : [];

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      brand: (product as any).brand || '',
      serialNumbers: serials,
    });
    setShowForm(true);
  };

  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const addSerial = (serial: string) => {
    if (!serial) return;
    setFormData(prev => ({ ...prev, serialNumbers: [...prev.serialNumbers, serial] }));
    setFormError(null);
  };

  const removeSerialAt = (index: number) => {
    setFormData(prev => ({ ...prev, serialNumbers: prev.serialNumbers.filter((_, i) => i !== index) }));
    setFormError(null);
  };

  const handleDelete = (id: string) => {
    // open confirm modal instead
    setDeleteTarget(id);
  };

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) onDeleteProduct(deleteTarget);
    setDeleteTarget(null);
  };

  const cancelDelete = () => setDeleteTarget(null);
  // confirm state for create/update actions
  const [confirm, setConfirm] = useState<{ open: boolean; title?: string; description?: string; onConfirm?: () => void }>({ open: false });

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Estoque</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Números de Série</label>
              <div className="mb-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Adicionar número de série"
                    id="serial-input"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const el = e.target as HTMLInputElement;
                        addSerial(el.value.trim());
                        el.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('serial-input') as HTMLInputElement | null;
                      if (el) { addSerial(el.value.trim()); el.value = ''; }
                    }}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >Adicionar</button>
                </div>
              </div>
              <div className="space-y-1">
                {formData.serialNumbers.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{s}</span>
                    <button type="button" onClick={() => removeSerialAt(i)} className="text-red-600 text-sm">Remover</button>
                  </div>
                ))}
                {formData.serialNumbers.length === 0 && (
                  <p className="text-xs text-gray-500">Adicione números de série individuais. Se cadastrar 10 unidades, cadastre 10 seriais.</p>
                )}
              </div>
            </div>
            {/* helper mostrando comparação entre estoque e seriais */}
            <div className="md:col-span-2">
              <p className={`text-sm mb-2 ${formData.stock === formData.serialNumbers.length ? 'text-green-600' : 'text-red-600'}`}>
                Quantidade: {formData.stock} — Seriais cadastrados: {formData.serialNumbers.length} {formData.stock === formData.serialNumbers.length ? '✓' : ' (devem ser iguais)'}
              </p>
              {formError && <p className="text-sm text-red-600 mb-2">{formError}</p>}
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.stock !== formData.serialNumbers.length}
              >
                {editingProduct ? 'Atualizar' : 'Criar'} Produto
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Preço:</span>
                <span className="font-semibold text-green-600">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estoque:</span>
                <span className={`font-semibold ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                  {product.stock} unidades
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mb-3">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </button>
              <button
                onClick={() => setDetailProductId(detailProductId === product.id ? null : product.id)}
                className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Ver Detalhes</span>
              </button>
            </div>
            {detailProductId === product.id && (() => {
              // normaliza serialNumbers para exibição
              const rawSerials = (product as any).serialNumbers;
              const serialList: string[] = Array.isArray(rawSerials)
                ? rawSerials
                : typeof rawSerials === 'string'
                  ? rawSerials.split(';').map((s: string) => s.trim()).filter((s: string) => s)
                  : [];

              return (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Detalhes do Grupo</h4>
                  <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Marca:</span> {(product as any).brand || '-'}</p>
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-1">Números de Série</h5>
                    {serialList.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {serialList.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">Nenhum número de série cadastrado para este grupo.</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-500 mb-4">Comece adicionando seu primeiro produto ao inventário.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Adicionar Produto
            </button>
          </div>
        )}
      </div>
    </div>
    <ConfirmModal open={!!deleteTarget} title="Excluir produto" description="Tem certeza que deseja excluir este produto? Esta ação removerá o produto e todas as suas associações." onConfirm={confirmDelete} onCancel={cancelDelete} />
    {confirm.open && (
      <ConfirmModal open={confirm.open} title={confirm.title} description={confirm.description} onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); setConfirm({ open: false }); }} onCancel={() => setConfirm({ open: false })} />
    )}
    </>
  );
}