import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '580px'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cms-modal-backdrop" onClick={onClose}>
      <div
        className="cms-modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cms-modal-header">
          <h3 style={{ fontSize: 'var(--cms-font-md)', fontWeight: 600, color: 'var(--cms-text-primary)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--cms-text-muted)',
              display: 'flex',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="cms-modal-body">
          {children}
        </div>
        {footer && (
          <div className="cms-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
