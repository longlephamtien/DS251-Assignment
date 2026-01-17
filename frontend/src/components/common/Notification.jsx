import React from 'react';
import Icon from './Icon';

export default function Notification({ isOpen, onClose, title, message, type = 'info' }) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          icon: 'bg-red-500',
          textColor: 'text-red-900'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          icon: 'bg-yellow-500',
          textColor: 'text-yellow-900'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          icon: 'bg-green-500',
          textColor: 'text-green-900'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          icon: 'bg-blue-500',
          textColor: 'text-blue-900'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`${styles.bg} border-2 ${styles.border} rounded-lg shadow-2xl max-w-md w-full overflow-hidden`}>
        {/* Header */}
        <div className={`${styles.icon} text-white px-6 py-4 flex items-center justify-between`}>
          <h3 className="text-lg font-bold">{title || 'Notification'}</h3>
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
        <div className="px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className={`${styles.icon} text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
