import React from 'react';
import Icon from './Icon';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' 
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          icon: 'bg-red-500',
          textColor: 'text-red-900',
          confirmBtn: 'bg-red-500 hover:bg-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          icon: 'bg-yellow-500',
          textColor: 'text-yellow-900',
          confirmBtn: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          icon: 'bg-blue-500',
          textColor: 'text-blue-900',
          confirmBtn: 'bg-blue-500 hover:bg-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-500',
          icon: 'bg-gray-500',
          textColor: 'text-gray-900',
          confirmBtn: 'bg-gray-500 hover:bg-gray-600'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`${styles.bg} border-2 ${styles.border} rounded-lg shadow-2xl max-w-md w-full overflow-hidden`}>
        {/* Header */}
        <div className={`${styles.icon} text-white px-6 py-4 flex items-center justify-between`}>
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className={`${styles.textColor} text-base`}>{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 ${styles.confirmBtn} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
