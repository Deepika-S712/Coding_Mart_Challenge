import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // primary | success | warning | danger | neutral
  className = ''
}) {
  const variantClass = {
    primary: 'cms-badge-primary',
    success: 'cms-badge-success',
    warning: 'cms-badge-warning',
    danger: 'cms-badge-danger',
    neutral: 'cms-badge-neutral'
  }[variant] || 'cms-badge-neutral';

  return (
    <span className={`cms-badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
