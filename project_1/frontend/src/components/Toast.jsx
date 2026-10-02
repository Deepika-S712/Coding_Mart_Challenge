import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-lg animate-slide-up">
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
      )}
      <div className="text-sm font-medium text-gray-800">{message}</div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
