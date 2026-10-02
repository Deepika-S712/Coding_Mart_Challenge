import React, { type InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? `cms-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`cms-input-wrapper ${fullWidth ? 'cms-input-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="cms-input-label">
          {label}
        </label>
      )}
      <div className={`cms-input-field-container ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        {leftIcon && <span className="cms-input-icon cms-input-icon-left">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`cms-input-field ${leftIcon ? 'has-left-icon' : ''} ${rightIcon ? 'has-right-icon' : ''} ${className}`}
          {...props}
        />
        {rightIcon && <span className="cms-input-icon cms-input-icon-right">{rightIcon}</span>}
      </div>
      {error ? (
        <span className="cms-input-error">{error}</span>
      ) : helperText ? (
        <span className="cms-input-helper">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
