import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

// Acessories mirrors ProductManagement but uses a simpler 'accessory' shape stored by useInventory
interface AcessoriesProps {
  accessories: any[];
  onAddAccessory: (a: any) => void;
  onUpdateAccessory: (id: string, updates: any) => void;
  onDeleteAccessory: (id: string) => void;
}

export default function Acessories({ accessories, onAddAccessory, onUpdateAccessory, onDeleteAccessory }: AcessoriesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, stock: 0, brand: '', serialNumbers: [] as string[] });
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; title?: string; description?: string; onConfirm?: () => void }>({ open: false });
  const [detailId, setDetailId] = useState<string | null>(null);

  const reset = () => { setFormData({ name: '', description: '', price: 0, stock: 0, brand: '', serialNumbers: [] }); setEditing(null); setShowForm(false); setFormError(null); };

  const addSerial = (s: string) => { if (!s) return; setFormData(prev => ({ ...prev, serialNumbers: [...prev.serialNumbers, s] })); setFormError(null); };
  const removeSerialAt = (i: number) => setFormData(prev => ({ ...prev, serialNumbers: prev.serialNumbers.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exec = () => {
      if (editing) onUpdateAccessory(editing.id, formData); else onAddAccessory(formData);
      reset();
    };
    setConfirm({ open: true, title: editing ? 'Confirmar atualização' : 'Confirmar criação', description: editing ? 'Confirma atualizar este acessório?' : 'Confirma criar este acessório?', onConfirm: exec });
  };

  const handleEdit = (a: any) => {
    setEditing(a);
    const raw = (a as any).serialNumbers;
    const serials = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : [];
    setFormData({ name: a.name || '', description: a.description || '', price: a.price || 0, stock: a.stock || 0, brand: a.brand || '', serialNumbers: serials });
    setShowForm(true);
  };

  const confirmDelete = () => { if (deleteTarget) onDeleteAccessory(deleteTarget); setDeleteTarget(null); };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Acessórios</h2>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"><Plus className="h-4 w-4" /><span>Novo Acessório</span></button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Editar Acessório' : 'Novo Acessório'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input required type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                <input type="number" step="0.01" value={formData.price} onChange={(e)=>setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estoque</label>
                <input type="number" value={formData.stock} onChange={(e)=>setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <input type="text" value={formData.brand} onChange={(e)=>setFormData({...formData, brand: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Números de Série (opcional)</label>
                <div className="mb-2">
                  <div className="flex space-x-2">
                    <input type="text" placeholder="Adicionar número de série" id="serial-input-accessory" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" onKeyDown={(e)=>{ if (e.key === 'Enter') { e.preventDefault(); const el = e.target as HTMLInputElement; addSerial(el.value.trim()); el.value = ''; } }} />
                    <button type="button" onClick={()=>{ const el = document.getElementById('serial-input-accessory') as HTMLInputElement | null; if (el) { addSerial(el.value.trim()); el.value = ''; } }} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">Adicionar</button>
                  </div>
                </div>
                <div className="space-y-1">
                  {formData.serialNumbers.map((s,i)=>(<div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded"><span className="text-sm">{s}</span><button type="button" onClick={()=>removeSerialAt(i)} className="text-red-600 text-sm">Remover</button></div>))}
                  {formData.serialNumbers.length === 0 && (<p className="text-xs text-gray-500">Números de série são opcionais para acessórios.</p>)}
                </div>
              </div>

              {formError && <div className="md:col-span-2"><p className="text-sm text-red-600">{formError}</p></div>}

              <div className="md:col-span-2 flex space-x-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">{editing ? 'Atualizar' : 'Criar'} Acessório</button>
                <button type="button" onClick={reset} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancelar</button>
              </div>

            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessories.map((a)=> (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2"><Package className="h-5 w-5 text-blue-500" /><h3 className="text-lg font-semibold text-gray-900">{a.name}</h3></div>
                  <p className="text-gray-600 text-sm mb-2">{a.description}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between"><span className="text-sm text-gray-600">Preço:</span><span className="font-semibold text-green-600">R$ {a.price?.toLocaleString?.('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">Estoque:</span><span className={`font-semibold ${a.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>{a.stock} unidades</span></div>
              </div>

              <div className="flex space-x-2 mb-3">
                <button onClick={()=>handleEdit(a)} className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"><Edit className="h-4 w-4" /><span>Editar</span></button>
                <button onClick={()=>setDeleteTarget(a.id)} className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"><Trash2 className="h-4 w-4" /><span>Excluir</span></button>
                <button onClick={()=>setDetailId(detailId === a.id ? null : a.id)} className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"><span>Ver Detalhes</span></button>
              </div>

              {detailId === a.id && (()=>{
                const raw = (a as any).serialNumbers;
                const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(';').map((s:string)=>s.trim()).filter((s:string)=>s) : [];
                return (
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-2">Detalhes</h4>
                    <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Marca:</span> {(a as any).brand || '-'}</p>
                    <div>
                      <h5 className="text-sm font-medium text-gray-800 mb-1">Números de Série</h5>
                      {list.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-700">{list.map((s:string,i:number)=>(<li key={i}>{s}</li>))}</ul>
                      ) : (
                        <p className="text-xs text-gray-500">Nenhum número de série cadastrado para este acessório.</p>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>
          ))}

          {accessories.length === 0 && (
            <div className="col-span-full text-center py-12"><Package className="h-12 w-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum acessório cadastrado</h3><p className="text-gray-500 mb-4">Comece adicionando seu primeiro acessório.</p><button onClick={()=>setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Adicionar Acessório</button></div>
          )}
        </div>
      </div>

      <ConfirmModal open={!!deleteTarget} title="Excluir acessório" description="Tem certeza que deseja excluir este acessório?" onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)} />
      {confirm.open && <ConfirmModal open={confirm.open} title={confirm.title} description={confirm.description} onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); setConfirm({ open: false }); }} onCancel={() => setConfirm({ open: false })} />}
    </>
  );
}
