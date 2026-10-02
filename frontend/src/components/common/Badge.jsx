import React from 'react';

const badgeVariants = {
  primary: 'bg-blue-50 text-primary border-blue-200',
  success: 'bg-emerald-50 text-success border-emerald-200',
  warning: 'bg-amber-50 text-warning border-amber-200',
  error: 'bg-red-50 text-error border-red-200',
  info: 'bg-sky-50 text-info border-sky-200',
  neutral: 'bg-slate-100 text-[#64748B] border-slate-200'
};

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false
}) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${badgeVariants[variant] || badgeVariants.neutral} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          variant === 'success' ? 'bg-success' :
          variant === 'warning' ? 'bg-warning' :
          variant === 'error' ? 'bg-error' :
          variant === 'primary' ? 'bg-primary' : 'bg-slate-400'
        }`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
