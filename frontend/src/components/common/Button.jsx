import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // primary | secondary | outline | danger
  size = 'default',    // default | sm
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = { 
    primary: 'cms-btn-primary',
    secondary: 'cms-btn-secondary',
    outline: 'cms-btn-outline',
    danger: 'cms-btn-danger'
  }[variant] || 'cms-btn-primary';

  const sizeClass = size === 'sm' ? 'cms-btn-sm' : '';

  return (
    <button
      type={type}
      className={`cms-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
          {children}
        </>
      )}
    </button>
  );
}
