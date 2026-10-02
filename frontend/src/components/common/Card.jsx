import React from 'react';

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  style = {}
}) {
  return (
    <div className={`cms-card ${className}`} style={style}>
      {(title || action) && (
        <div className="cms-card-header">
          <div>
            {title && <h3 className="cms-card-title">{title}</h3>}
            {subtitle && <p style={{ fontSize: 'var(--cms-font-xs)', color: 'var(--cms-text-secondary)', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
