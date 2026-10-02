import React, { useState } from 'react';

/**
 * Lightweight, strictly CMS-DS v1.0 compliant SVG Bar Chart
 */
export const CollectionBarChart = ({ data = [], height = 220, labelKey = 'date', valueKey = 'total' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-[14px] text-[#94A3B8]">
        No trend data available for selected period.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => parseFloat(d[valueKey]) || 0), 1000);
  const chartHeight = height - 40;

  return (
    <div className="w-full">
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between gap-2 pt-6 pb-6 px-2">
          {data.map((item, idx) => {
            const val = parseFloat(item[valueKey]) || 0;
            const barHeight = Math.max(8, (val / maxValue) * chartHeight);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 z-20 px-2.5 py-1 bg-[#0F172A] text-white text-[11px] font-medium rounded-[6px] shadow-lg whitespace-nowrap pointer-events-none">
                    <div>{item[labelKey]}</div>
                    <div className="font-bold text-[#DBEAFE]">${val.toLocaleString()}</div>
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{ height: `${barHeight}px` }}
                  className={`w-full max-w-[42px] rounded-t-[6px] transition-all duration-200 cursor-pointer ${
                    isHovered ? 'bg-[#1D4ED8]' : 'bg-[#2563EB]'
                  }`}
                />

                {/* X Axis Label */}
                <span className="text-[11px] text-[#475569] mt-2 truncate w-full text-center">
                  {item[labelKey].length > 7 ? item[labelKey].slice(5) : item[labelKey]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
