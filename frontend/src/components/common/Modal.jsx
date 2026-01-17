import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-surface rounded-lg shadow-card max-w-lg w-full mx-4 z-10 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="text-lg font-semibold text-text-main">{title}</h3>
          <button onClick={onClose} className="text-text-sub hover:text-text-main">✕</button>
        </div>
        <div className="p-4 text-text-sub">{children}</div>
      </div>
    </div>
  );
}
