import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className={`relative w-full ${maxWidth} bg-military-green-surface border border-military-khaki/30 shadow-2xl rounded-sm z-10 overflow-hidden transform transition-all`}>
        {/* Header line & title */}
        <div className="flex items-center justify-between px-6 py-4 bg-military-green-dark border-b border-military-green-border">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-military-khaki rounded-full animate-pulse" />
            <h3 className="text-base font-stencil uppercase tracking-wider text-military-khaki font-bold">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-military-text-muted hover:text-military-khaki transition-colors p-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-military-khaki"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
