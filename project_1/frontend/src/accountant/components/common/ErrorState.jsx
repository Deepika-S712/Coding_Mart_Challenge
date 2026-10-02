import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * CMS-DS v1.0 Error State Component
 */
export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We could not load the requested data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-[#FEE2E2]/30 rounded-[12px] border border-[#FEE2E2]">
      <div className="p-3 bg-[#FEE2E2] rounded-full text-[#DC2626] mb-3">
        <AlertTriangle className="w-8 h-8 stroke-[1.75]" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-[14px] text-[#475569] max-w-md mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-[8px] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};
