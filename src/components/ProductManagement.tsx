import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductManagementProps {
  products: Product[];
  onCreateProduct?: (prod: Omit<Product, 'id' | 'createdAt'>, serialNumbers: string[]) => void;
  onUpdateProduct?: (id: string, updates: Partial<Product>, serialNumbers?: string[]) => void;
  onDeleteProduct?: (id: string) => void;
}

export function ProductManagement({ products, onCreateProduct, onUpdateProduct, onDeleteProduct }: ProductManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
  });
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
    });
    setSerialNumbers([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleQuantityChange = (quantity: number) => {
    setFormData({ ...formData, stock: quantity });
    const newSerialNumbers = Array.from({ length: quantity }, (_, i) => serialNumbers[i] || '');
    setSerialNumbers(newSerialNumbers);
  };

  const handleSerialNumberChange = (index: number, value: string) => {
    const updatedSerialNumbers = [...serialNumbers];
    updatedSerialNumbers[index] = value;
    setSerialNumbers(updatedSerialNumbers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serialNumbers.length !== formData.stock) {
      alert('O número de números de série deve corresponder à quantidade em estoque.');
      return;
    }

    if (editingProduct) {
      onUpdateProduct?.(editingProduct.id, formData, serialNumbers);
    } else {
      onCreateProduct?.(formData, serialNumbers);
    }
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
    });
    setSerialNumbers(product.serialNumbers || []);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      onDeleteProduct?.(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h2>
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
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Números de Série
              </label>
              <div className="space-y-2">
                {serialNumbers.map((serial, index) => (
                  <input
                    key={index}
                    type="text"
                    value={serial}
                    onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Número de Série ${index + 1}`}
                    required
                  />
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
              <div>
                <span className="text-sm text-gray-600">Números de Série:</span>
                <ul className="list-disc list-inside text-gray-900">
                  {(product.serialNumbers || []).map((serial, index) => (
                    <li key={index}>{serial}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex space-x-2">
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
            </div>
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
  );
}