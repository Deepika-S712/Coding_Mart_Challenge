import React from 'react';

export const Select = ({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  value,
  onChange,
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={`block w-full rounded-md border text-sm text-[#0F172A] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 px-3 py-2 bg-white ${
            error
              ? 'border-error text-error focus:border-error focus:ring-error/20'
              : 'border-[#E2E8F0] focus:border-primary'
          } disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Select;
