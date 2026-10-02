import React from 'react';

/**
 * CMS-DS v1.0 Compliant Badge Component
 * STRICT COLORS:
 * Success: #16A34A / #DCFCE7
 * Warning: #F59E0B / #FEF3C7
 * Error:   #DC2626 / #FEE2E2
 * Info:    #0284C7 / #E0F2FE
 */
export const Badge = ({ status, children }) => {
  const text = children || status;
  if (!text) return null;

  const upper = String(text).toUpperCase();

  let styles = 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]'; // Info default

  if (['PAID', 'ACTIVE', 'COMPLETED', 'SUCCESS'].includes(upper)) {
    styles = 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';
  } else if (['PARTIAL', 'PENDING', 'WARNING'].includes(upper)) {
    styles = 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]';
  } else if (['OVERDUE', 'FAILED', 'INACTIVE', 'ERROR', 'CANCELLED'].includes(upper)) {
    styles = 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[12px] font-semibold tracking-wide border ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {text}
    </span>
  );
};
