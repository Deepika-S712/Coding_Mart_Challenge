import React, { useState, useEffect } from 'react';
import { X, GraduationCap, DollarSign, History, AlertCircle, PlusCircle } from 'lucide-react';
import { Badge } from '../common/Badge';
import { accountantApi } from '../../api/accountantApi';

export const StudentFeeDetailModal = ({
  isOpen,
  onClose,
  studentId,
  onRecordPayment,
}) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && studentId) {
      loadDetails(studentId);
    } else {
      setDetails(null);
      setError('');
    }
  }, [isOpen, studentId]);

  const loadDetails = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await accountantApi.getStudentFeeDetails(id);
      setDetails(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load student fee ledger.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] shadow-2xl max-w-3xl w-full p-6 border border-[#E2E8F0] my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#DBEAFE] text-[#2563EB] rounded-[8px]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#0F172A]">
                Student Fee Account Statement
              </h3>
              <p className="text-[12px] text-[#475569]">
                Complete fee assessment, component breakdown, and transaction ledger.
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

        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="mt-4 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-[8px] text-[14px] text-[#DC2626]">
            {error}
          </div>
        ) : details ? (
          <div className="mt-4 space-y-6">
            {/* Student Info Card */}
            <div className="bg-[#F8FAFC] p-4 rounded-[8px] border border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[14px]">
              <div>
                <span className="text-[12px] text-[#94A3B8] block">Student Name</span>
                <span className="font-semibold text-[#0F172A]">
                  {details.student.student_name}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-[#94A3B8] block">Student ID</span>
                <span className="font-mono font-semibold text-[#0F172A]">
                  {details.student.student_id}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-[#94A3B8] block">Department</span>
                <span className="font-medium text-[#475569]">
                  {details.student.department}
                </span>
              </div>
              <div>
                <span className="text-[12px] text-[#94A3B8] block">Current Standing</span>
                <span className="font-medium text-[#475569]">
                  Year {details.student.year} • Sem {details.student.semester}
                </span>
              </div>
            </div>

            {/* Fee Assessments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[16px] font-bold text-[#0F172A] flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-[#2563EB]" />
                  Assigned Fee Structures
                </h4>
                {details.fees?.some((f) => parseFloat(f.pending_amount) > 0) && (
                  <button
                    onClick={() => {
                      onClose();
                      onRecordPayment(details.student.student_id);
                    }}
                    className="inline-flex items-center px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium rounded-[8px] shadow-sm transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Record Payment
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {details.fees?.map((fee) => (
                  <div
                    key={fee.id}
                    className="border border-[#E2E8F0] rounded-[8px] p-4 bg-white space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                      <div>
                        <span className="font-semibold text-[#0F172A]">
                          Academic Year: {fee.academic_year}
                        </span>
                        <span className="text-[12px] text-[#475569] ml-2">
                          (Due Date: {fee.due_date})
                        </span>
                      </div>
                      <div>
                        <Badge status={fee.status} />
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[12px] bg-[#F8FAFC] p-2.5 rounded-[6px]">
                      <div>
                        <span className="text-[#94A3B8] block">Tuition</span>
                        <span className="font-medium text-[#0F172A]">
                          ${parseFloat(fee.tuition_fee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block">Exam</span>
                        <span className="font-medium text-[#0F172A]">
                          ${parseFloat(fee.exam_fee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block">Library</span>
                        <span className="font-medium text-[#0F172A]">
                          ${parseFloat(fee.library_fee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block">Transport</span>
                        <span className="font-medium text-[#0F172A]">
                          ${parseFloat(fee.transport_fee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block">Hostel</span>
                        <span className="font-medium text-[#0F172A]">
                          ${parseFloat(fee.hostel_fee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block">Other</span>
                        <span className="font-medium text-[#0F172A]">
                          ${parseFloat(fee.other_fee || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-between items-center text-[14px] pt-1">
                      <div className="space-x-4">
                        <span>
                          Total: <strong className="text-[#0F172A]">${parseFloat(fee.total_fee).toLocaleString()}</strong>
                        </span>
                        <span>
                          Paid: <strong className="text-[#16A34A]">${parseFloat(fee.paid_amount).toLocaleString()}</strong>
                        </span>
                      </div>
                      <div>
                        Pending:{' '}
                        <strong className="text-[#DC2626] font-bold text-[16px]">
                          ${parseFloat(fee.pending_amount).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h4 className="text-[16px] font-bold text-[#0F172A] mb-2 flex items-center">
                <History className="w-4 h-4 mr-1 text-[#2563EB]" />
                Payment Ledger & Receipts
              </h4>

              {details.payments?.length === 0 ? (
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[14px] text-[#475569] text-center">
                  No payment transactions recorded for this student yet.
                </div>
              ) : (
                <div className="border border-[#E2E8F0] rounded-[8px] overflow-hidden">
                  <table className="w-full text-left text-[14px]">
                    <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-medium text-[#475569]">
                      <tr>
                        <th className="py-2.5 px-3">Receipt / Txn</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {details.payments?.map((p) => (
                        <tr key={p.id} className="hover:bg-[#F8FAFC]/50">
                          <td className="py-2.5 px-3 font-mono text-[12px]">
                            <span className="font-semibold text-[#2563EB]">
                              {p.receipt_number || 'N/A'}
                            </span>
                            <span className="text-[#94A3B8] block text-[11px]">
                              {p.transaction_id}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#475569] text-[12px]">
                            {new Date(p.payment_date).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 text-[#475569]">{p.payment_method}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-[#0F172A]">
                            ${parseFloat(p.amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Badge status={p.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#CBD5E1] rounded-[8px] text-[14px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
