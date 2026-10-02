import React from 'react';

/**
 * CMS-DS v1.0 Loading Skeleton Components
 */
export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden p-4 space-y-4 animate-pulse">
      <div className="h-6 bg-[#E2E8F0] rounded-[6px] w-1/4 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex space-x-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-[#E2E8F0]/70 rounded-[6px] flex-1"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-6 shadow-sm animate-pulse space-y-3">
      <div className="h-4 bg-[#E2E8F0] rounded-[6px] w-1/3"></div>
      <div className="h-8 bg-[#E2E8F0] rounded-[6px] w-1/2"></div>
      <div className="h-3 bg-[#E2E8F0]/60 rounded-[6px] w-1/4"></div>
    </div>
  );
};
