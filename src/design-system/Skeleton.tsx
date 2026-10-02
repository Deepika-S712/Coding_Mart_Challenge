import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'table-row';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`cms-skeleton cms-skeleton-${variant} animate-pulse ${className}`}
          style={{ width, height }}
        />
      ))}
    </>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="cms-table-skeleton">
    <div className="cms-table-skeleton-header">
      {Array.from({ length: cols }).map((_, c) => (
        <Skeleton key={c} variant="text" width="80px" height="14px" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="cms-table-skeleton-row">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} variant="text" width={c === 0 ? '120px' : '90%'} height="16px" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="cms-card-skeleton">
    <Skeleton variant="title" width="60%" height="20px" />
    <Skeleton variant="text" width="90%" height="14px" />
    <Skeleton variant="text" width="40%" height="14px" />
  </div>
);
