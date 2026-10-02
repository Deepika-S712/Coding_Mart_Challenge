import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * CMS-DS v1.0 Empty State Component
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no records matching your criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[12px] border border-[#E2E8F0]">
      <div className="p-4 bg-[#F8FAFC] rounded-full text-[#94A3B8] mb-4 border border-[#E2E8F0]">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-[14px] text-[#475569] max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-[8px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
