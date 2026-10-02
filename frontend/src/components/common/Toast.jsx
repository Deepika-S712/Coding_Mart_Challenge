import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const typeStyles = {
            success: 'bg-white border-l-4 border-success text-[#0F172A]',
            error: 'bg-white border-l-4 border-error text-[#0F172A]',
            warning: 'bg-white border-l-4 border-warning text-[#0F172A]',
            info: 'bg-white border-l-4 border-primary text-[#0F172A]'
          };

          const IconComponent = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info
          }[t.type] || Info;

          const iconColor = {
            success: 'text-success',
            error: 'text-error',
            warning: 'text-warning',
            info: 'text-primary'
          }[t.type] || 'text-primary';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border border-[#E2E8F0] shadow-lg text-sm transition-all duration-300 transform translate-y-0 ${typeStyles[t.type]}`}
            >
              <div className="flex items-center gap-2.5">
                <IconComponent className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                <span className="font-medium text-xs sm:text-sm">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-3 text-[#64748B] hover:text-[#0F172A] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
