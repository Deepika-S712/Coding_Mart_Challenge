import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { accountantApi } from '../../api/accountantApi';

export const RecordPaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedStudentId = null,
  preselectedFeeId = null,
}) => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || '');
  const [studentFees, setStudentFees] = useState([]);
  const [selectedFeeId, setSelectedFeeId] = useState(preselectedFeeId || '');
  const [selectedFee, setSelectedFee] = useState(null);

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  const [loadingLookups, setLoadingLookups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch students on modal open
  useEffect(() => {
    if (isOpen) {
      loadStudents();
      // Generate a default transaction ID
      setTransactionId(`TXN-${Date.now().toString().slice(-6)}`);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [isOpen]);

  // When preselected props change
  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  // When student selection changes, fetch their pending fees
  useEffect(() => {
    if (selectedStudentId) {
      loadStudentPendingFees(selectedStudentId);
    } else {
      setStudentFees([]);
      setSelectedFeeId('');
      setSelectedFee(null);
    }
  }, [selectedStudentId]);

  // When selected fee changes
  useEffect(() => {
    if (selectedFeeId && studentFees.length > 0) {
      const match = studentFees.find((f) => String(f.id) === String(selectedFeeId));
      setSelectedFee(match || null);
      if (match) {
        setAmount(String(match.pending_amount));
      }
    } else {
      setSelectedFee(null);
    }
  }, [selectedFeeId, studentFees]);

  const loadStudents = async () => {
    setLoadingLookups(true);
    try {
      const res = await accountantApi.getStudents();
      setStudents(res.data || []);
      if (!selectedStudentId && res.data?.length > 0 && !preselectedStudentId) {
        setSelectedStudentId(res.data[0].student_id);
      }
    } catch (err) {
      setError('Could not load student list.');
    } finally {
      setLoadingLookups(false);
    }
  };

  const loadStudentPendingFees = async (stuId) => {
    try {
      const res = await accountantApi.getStudentPendingFees(stuId);
      const fees = res.data || [];
      setStudentFees(fees);
      if (fees.length > 0) {
        const target = preselectedFeeId && fees.some((f) => f.id === preselectedFeeId)
          ? preselectedFeeId
          : fees[0].id;
        setSelectedFeeId(target);
      } else {
        setSelectedFeeId('');
        setSelectedFee(null);
        setAmount('');
      }
    } catch (err) {
      setError('Could not retrieve fee dues for selected student.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }
    if (!selectedFeeId) {
      setError('Please select an active fee record.');
      return;
    }

    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    if (selectedFee && payAmt > parseFloat(selectedFee.pending_amount)) {
      setError(
        `Payment amount cannot exceed outstanding balance of $${parseFloat(
          selectedFee.pending_amount
        ).toFixed(2)}.`
      );
      return;
    }

    if (!transactionId.trim()) {
      setError('Transaction reference ID is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        student_id: selectedStudentId,
        student_fee_id: parseInt(selectedFeeId, 10),
        amount: payAmt,
        payment_method: paymentMethod,
        transaction_id: transactionId.trim(),
        payment_date: paymentDate,
        remarks: remarks.trim(),
      };

      const response = await accountantApi.recordPayment(payload);
      setIsSubmitting(false);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Payment processing failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] shadow-2xl max-w-xl w-full p-6 border border-[#E2E8F0] my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#DCFCE7] text-[#16A34A] rounded-[8px]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#0F172A]">Record Student Payment</h3>
              <p className="text-[12px] text-[#475569]">
                Process tuition & academic fee collection and generate instant receipt.
              </p>
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

        {error && (
          <div className="mt-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[8px] flex items-center space-x-2 text-[14px] text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Picker */}
            <div className="sm:col-span-2">
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Select Student *
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={Boolean(preselectedStudentId)}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_id} — {s.student_name} ({s.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Fee Record Picker */}
            <div className="sm:col-span-2">
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Applicable Fee Due *
              </label>
              {studentFees.length === 0 ? (
                <div className="p-3 bg-[#FEF3C7] text-[#F59E0B] text-[12px] font-medium rounded-[8px] border border-[#FDE68A]">
                  {selectedStudentId
                    ? 'This student has no outstanding fees currently recorded.'
                    : 'Select a student to load outstanding fees.'}
                </div>
              ) : (
                <select
                  required
                  value={selectedFeeId}
                  onChange={(e) => setSelectedFeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  {studentFees.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.academic_year} (Due: {f.due_date}) — Pending: $
                      {parseFloat(f.pending_amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Outstanding Summary Chip */}
            {selectedFee && (
              <div className="sm:col-span-2 p-3 bg-[#DBEAFE]/40 border border-[#BAE6FD] rounded-[8px] flex items-center justify-between text-[14px]">
                <span className="text-[#0284C7] font-medium">Total Pending Fee:</span>
                <span className="font-bold text-[#1D4ED8] text-[16px]">
                  ${parseFloat(selectedFee.pending_amount).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Payment Amount ($) *
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Transaction / Ref ID *
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-123456"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] font-mono text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="block text-[14px] font-medium text-[#0F172A] mb-1">
                Remarks / Notes
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional payment notes or installment details"
                className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#CBD5E1] rounded-[8px] text-[14px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFeeId}
              className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[8px] text-[14px] font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Issue Receipt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
