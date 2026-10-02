import React from 'react';
import { X, CreditCard, Receipt, Calendar, User, FileText } from 'lucide-react';
import { Badge } from '../common/Badge';

export const PaymentDetailModal = ({ isOpen, onClose, payment, onViewReceipt }) => {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] shadow-2xl max-w-lg w-full p-6 border border-[#E2E8F0] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#DBEAFE] text-[#2563EB] rounded-[8px]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#0F172A]">Payment Transaction Details</h3>
              <p className="text-[12px] text-[#475569]">Transaction reference #{payment.transaction_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-[12px] text-[#475569] block">Amount Paid</span>
              <span className="text-[24px] font-bold text-[#16A34A]">
                ${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[12px] text-[#475569] block mb-1">Status</span>
              <Badge status={payment.status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[14px]">
            <div>
              <span className="text-[12px] text-[#94A3B8] block">Student</span>
              <span className="font-semibold text-[#0F172A]">{payment.student_name || payment.student}</span>
              <span className="text-[12px] text-[#475569] block font-mono">{payment.student_id}</span>
            </div>
            <div>
              <span className="text-[12px] text-[#94A3B8] block">Payment Method</span>
              <span className="font-medium text-[#0F172A]">{payment.payment_method}</span>
            </div>
            <div>
              <span className="text-[12px] text-[#94A3B8] block">Payment Date</span>
              <span className="font-medium text-[#0F172A]">
                {new Date(payment.payment_date).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[12px] text-[#94A3B8] block">Generated Receipt</span>
              <span className="font-mono font-semibold text-[#2563EB]">
                {payment.receipt_number || `REC-${payment.id}`}
              </span>
            </div>
          </div>

          {payment.remarks && (
            <div className="p-3 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] text-[14px]">
              <span className="text-[12px] text-[#94A3B8] block mb-0.5">Remarks</span>
              <p className="text-[#475569]">{payment.remarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
          {payment.receipt_id && (
            <button
              onClick={() => {
                onClose();
                onViewReceipt(payment.receipt_id);
              }}
              className="inline-flex items-center text-[14px] text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              <Receipt className="w-4 h-4 mr-1.5" />
              View Printable Receipt
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 border border-[#CBD5E1] rounded-[8px] text-[14px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
