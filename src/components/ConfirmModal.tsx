import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ open, title = 'Confirmação', description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="bg-gray-200 px-3 py-2 rounded">{cancelLabel}</button>
          <button onClick={onConfirm} className="bg-red-600 text-white px-3 py-2 rounded">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
