import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular', // 'text', 'circular', 'rectangular'
  width,
  height
}) => {
  const baseClasses = 'animate-pulse bg-slate-200';
  
  let variantClasses = 'rounded-md';
  if (variant === 'circular') variantClasses = 'rounded-full';
  if (variant === 'text') variantClasses = 'rounded h-4 my-1';

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={{ width, height }}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border border-[#E2E8F0]">
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
