import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import { Company } from '../types';
import ConfirmModal from './ConfirmModal';

interface CompanyManagementProps {
  companies: Company[];
  onAddCompany: (company: Omit<Company, 'id' | 'createdAt'>) => void;
  onUpdateCompany: (id: string, updates: Partial<Company>) => void;
  onDeleteCompany: (id: string) => void;
}

export function CompanyManagement({ companies, onAddCompany, onUpdateCompany, onDeleteCompany }: CompanyManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });

  const reset = () => {
    setForm({ name: '', email: '', phone: '', address: '' });
    setEditing(null);
    setShowForm(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      onUpdateCompany(editing.id, form);
    } else {
      onAddCompany(form);
    }
    reset();
  };

  const startEdit = (c: Company) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Empresas (Manutenção)</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Empresa</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Editar Empresa' : 'Nova Empresa'}</h3>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="md:col-span-2 flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg">{editing ? 'Atualizar' : 'Criar'}</button>
              <button type="button" onClick={reset} className="bg-gray-200 px-4 py-2 rounded">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{c.name}</h4>
              <p className="text-sm text-gray-600">{c.email}</p>
              <p className="text-sm text-gray-600">{c.phone}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => startEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="h-4 w-4" /></button>
              <button onClick={() => setConfirm({ open: true, id: c.id })} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {companies.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma empresa cadastrada</p>
          </div>
        )}
      </div>
      {confirm.open && (
        <ConfirmModal open={confirm.open} title="Excluir empresa" description="Tem certeza que deseja excluir esta empresa?" onConfirm={() => { if (confirm.id) onDeleteCompany(confirm.id); setConfirm({ open: false }); }} onCancel={() => setConfirm({ open: false })} />
      )}
    </div>
  );
}

export default CompanyManagement;
