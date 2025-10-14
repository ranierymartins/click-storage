import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { MaintenanceItem, Company } from '../types';
import ConfirmModal from './ConfirmModal';

interface MaintenanceProps {
  items: MaintenanceItem[];
  companies?: Company[];
  onRestore: (id: string) => void;
  onRemove: (id: string) => void;
}

export function Maintenance({ items, companies = [], onRestore, onRemove }: MaintenanceProps) {
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Produtos em Manutenção</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">Marca: {(item as any).brand || '-'}</p>
                <p className="text-sm text-gray-600">Empresa responsável: {item.companyId ? (companies.find(c => c.id === item.companyId)?.name || item.companyId) : '-'}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600">Qtd:</span>
                <div className="font-semibold">{item.stock}</div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-800 mb-1">Números de Série</h5>
              {((item as any).serialNumbers || []).length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 mb-3">
                  {((item as any).serialNumbers || []).map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 mb-3">Sem números de série registrados.</p>
              )}
            </div>

            <div className="flex space-x-2">
              <button onClick={() => onRestore(item.id)} className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100">Restaurar</button>
              <button onClick={() => setConfirm({ open: true, id: item.id })} className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100">Remover</button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto em manutenção</h3>
            <p className="text-gray-500">Produtos em manutenção aparecerão aqui.</p>
          </div>
        )}
      </div>
      {confirm.open && (
        <ConfirmModal open={confirm.open} title="Remover item de manutenção" description="Tem certeza que deseja remover este item de manutenção?" onConfirm={() => { if (confirm.id) onRemove(confirm.id); setConfirm({ open: false }); }} onCancel={() => setConfirm({ open: false })} />
      )}
    </div>
  );
}
