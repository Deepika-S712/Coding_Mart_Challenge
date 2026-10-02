import React from 'react';

export const MethodBreakdown = ({ methods = [] }) => {
  if (!methods || methods.length === 0) {
    return <div className="text-[14px] text-[#94A3B8]">No method breakdown recorded.</div>;
  }

  const grandTotal = methods.reduce((acc, m) => acc + (parseFloat(m.total) || 0), 0) || 1;

  return (
    <div className="space-y-4">
      {methods.map((m, idx) => {
        const amt = parseFloat(m.total) || 0;
        const pct = Math.round((amt / grandTotal) * 100);

        return (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center text-[14px]">
              <span className="font-medium text-[#0F172A]">{m.payment_method}</span>
              <div className="space-x-2 text-right">
                <span className="font-semibold text-[#0F172A]">${amt.toLocaleString()}</span>
                <span className="text-[12px] text-[#475569]">({pct}%)</span>
              </div>
            </div>
            <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
