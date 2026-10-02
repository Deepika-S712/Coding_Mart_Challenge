import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function Alert({ type = 'info', message, children }) {
  if (!message && !children) return null;

  const icons = {
    error: <AlertCircle size={18} className="flex-shrink-0" />,
    success: <CheckCircle2 size={18} className="flex-shrink-0" />,
    warning: <AlertTriangle size={18} className="flex-shrink-0" />,
    info: <Info size={18} className="flex-shrink-0" />,
  };

  return (
    <div className={`alert alert-${type}`}>
      {icons[type] || icons.info}
      <div>{message || children}</div>
    </div>
  );
}
