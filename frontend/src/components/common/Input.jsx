import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  helperText,
  id,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`cms-form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="cms-label">
          {label} {required && <span style={{ color: 'var(--cms-danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`cms-input ${error ? 'cms-input-error' : ''}`}
          style={isPassword ? { paddingRight: '40px' } : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--cms-text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="cms-error-text">{error}</p>}
      {helperText && !error && (
        <p style={{ fontSize: 'var(--cms-font-xs)', color: 'var(--cms-text-secondary)', marginTop: '4px' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
