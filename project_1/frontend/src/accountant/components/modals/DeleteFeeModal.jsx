import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteFeeModal = ({ isOpen, onClose, onConfirm, feeStructure, isDeleting = false }) => {
  if (!isOpen || !feeStructure) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] shadow-2xl max-w-md w-full p-6 border border-[#E2E8F0] animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3 text-[#DC2626]">
            <div className="p-2 bg-[#FEE2E2] rounded-[8px]">
              <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#0F172A]">Delete Fee Structure</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-[14px] text-[#475569] leading-relaxed">
            Are you sure you want to delete the fee schedule for{' '}
            <span className="font-semibold text-[#0F172A]">
              {feeStructure.department} — Year {feeStructure.year}, Sem {feeStructure.semester} ({feeStructure.academic_year})
            </span>
            ? This action cannot be undone if no students have been linked.
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#CBD5E1] rounded-[8px] text-[14px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-[8px] text-[14px] font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#DC2626] disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
