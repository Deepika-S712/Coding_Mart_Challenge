import { type SelectHTMLAttributes, forwardRef } from 'react';
import './Select.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  helperText,
  error,
  fullWidth = true,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const selectId = id || (label ? `cms-select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`cms-select-wrapper ${fullWidth ? 'cms-select-full' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="cms-select-label">
          {label}
        </label>
      )}
      <div className={`cms-select-field-container ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`cms-select-field ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="cms-select-arrow" aria-hidden="true">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      {error ? (
        <span className="cms-select-error">{error}</span>
      ) : helperText ? (
        <span className="cms-select-helper">{helperText}</span>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
