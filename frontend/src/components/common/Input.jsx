import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`block w-full rounded-md border text-sm text-[#0F172A] placeholder-[#64748B]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            Icon ? 'pl-9' : 'pl-3'
          } pr-3 py-2 bg-white ${
            error
              ? 'border-error text-error focus:border-error focus:ring-error/20'
              : 'border-[#E2E8F0] focus:border-primary'
          } disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
