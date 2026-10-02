import React from 'react';
import { X, Printer, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.issue_date || receipt.created_at
    ? new Date(receipt.issue_date || receipt.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-US');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-[12px] shadow-2xl max-w-xl w-full border border-[#E2E8F0] overflow-hidden my-8 print:border-none print:shadow-none print:m-0 animate-scale-in">
        {/* Top Controls (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] print:hidden">
          <div className="flex items-center space-x-2 text-[14px] font-semibold text-[#0F172A]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>Official Payment Receipt</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium rounded-[8px] transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-[6px] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Document Area */}
        <div className="p-8 space-y-6 text-[#0F172A] font-sans print:p-6" id="printable-receipt">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-[#E2E8F0]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-[#2563EB] text-white mb-2 shadow-sm">
              <Building className="w-6 h-6" />
            </div>
            <h2 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
              {receipt.college_name || 'CMS COLLEGE OF ENGINEERING & TECHNOLOGY'}
            </h2>
            <p className="text-[12px] text-[#475569] mt-0.5">
              Office of Accounts & Finance • Institutional Fee Acknowledgment
            </p>
          </div>

          {/* Receipt Meta & Number */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#F8FAFC] p-4 rounded-[8px] border border-[#E2E8F0] text-[14px]">
            <div>
              <span className="text-[12px] text-[#475569] block">Receipt Number</span>
              <span className="font-mono font-bold text-[#2563EB] text-[16px]">
                {receipt.receipt_number}
              </span>
            </div>
            <div className="mt-2 sm:mt-0 text-left sm:text-right">
              <span className="text-[12px] text-[#475569] block">Issue Date</span>
              <span className="font-medium text-[#0F172A]">{formattedDate}</span>
            </div>
          </div>

          {/* Student & Department Details */}
          <div className="grid grid-cols-2 gap-4 text-[14px]">
            <div>
              <span className="text-[12px] text-[#94A3B8] block">Student Name</span>
              <span className="font-semibold text-[#0F172A]">{receipt.student_name}</span>
            </div>
            <div>
              <span className="text-[12px] text-[#94A3B8] block">Student ID</span>
              <span className="font-semibold font-mono text-[#0F172A]">{receipt.student_id}</span>
            </div>
            <div>
              <span className="text-[12px] text-[#94A3B8] block">Department</span>
              <span className="font-medium text-[#475569]">{receipt.department}</span>
            </div>
            <div>
              <span className="text-[12px] text-[#94A3B8] block">Academic Year</span>
              <span className="font-medium text-[#475569]">{receipt.academic_year || '2026-2027'}</span>
            </div>
          </div>

          {/* Payment Breakdown Box */}
          <div className="border border-[#E2E8F0] rounded-[8px] overflow-hidden">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-medium text-[12px]">
                <tr>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Payment Method</th>
                  <th className="py-2.5 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                <tr>
                  <td className="py-3 px-4 font-medium text-[#0F172A]">
                    Tuition & Academic Term Fee
                  </td>
                  <td className="py-3 px-4 text-[#475569]">{receipt.payment_method}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#0F172A]">
                    ${parseFloat(receipt.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-4 text-[12px] bg-[#F8FAFC] p-3.5 rounded-[8px] border border-[#E2E8F0]">
            <div>
              <span className="text-[#94A3B8] block">Transaction Reference ID</span>
              <span className="font-mono font-medium text-[#0F172A]">
                {receipt.transaction_id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#94A3B8] block">Status</span>
              <span className="font-semibold text-[#16A34A]">VERIFIED & PAID</span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 flex justify-between items-end text-[12px] text-[#475569]">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-[#16A34A] font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Computer Generated Voucher</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">Valid without physical signature</p>
            </div>
            <div className="text-right border-t border-[#CBD5E1] pt-1 min-w-[140px]">
              <div className="font-semibold text-[#0F172A]">
                {receipt.accountant_name || 'Accounts Officer'}
              </div>
              <div className="text-[11px] text-[#94A3B8]">Authorized Signatory</div>
            </div>
          </div>
        </div>

        {/* Bottom Close Action (Screen only) */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#CBD5E1] rounded-[8px] text-[14px] font-medium text-[#475569] hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
