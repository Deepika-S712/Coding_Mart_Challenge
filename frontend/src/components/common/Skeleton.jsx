import React from 'react';

export function Skeleton({ width = '100%', height = '20px', className = '', style = {} }) {
  return (
    <div
      className={`cms-skeleton ${className}`}
      style={{ width, height, ...style }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="cms-table-container" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="28px" width={`${100 / columns}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} height="36px" width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="cms-card">
      <Skeleton height="24px" width="40%" style={{ marginBottom: '12px' }} />
      <Skeleton height="16px" width="80%" style={{ marginBottom: '8px' }} />
      <Skeleton height="16px" width="60%" />
    </div>
  );
}
