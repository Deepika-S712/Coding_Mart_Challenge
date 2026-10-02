import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  Calendar,
  AlertCircle,
  PlusCircle,
  Eye,
  ArrowRight,
  Receipt,
  CreditCard
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/SkeletonLoading';
import { ErrorState } from '../components/common/ErrorState';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { PaymentDetailModal } from '../components/modals/PaymentDetailModal';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { StudentFeeDetailModal } from '../components/modals/StudentFeeDetailModal';
import { Toast } from '../../components/Toast';
import { accountantApi } from '../api/accountantApi';

export const AccountantDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await accountantApi.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load accountant dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    setToastMessage('Payment recorded successfully! Receipt issued.');
    fetchDashboard();
    if (result?.receipt) {
      setSelectedReceipt(result.receipt);
    }
  };

  const handleViewReceiptById = async (receiptId) => {
    try {
      const res = await accountantApi.getReceiptById(receiptId);
      setSelectedReceipt(res.data);
    } catch (err) {
      setToastMessage('Could not load receipt details.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-[12px] border border-[#E2E8F0] animate-pulse"></div>
          ))}
        </div>
        <TableSkeleton rows={4} cols={7} />
        <TableSkeleton rows={4} cols={8} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const { stats, recentPayments, pendingFeesSummary } = dashboardData || {
    stats: {},
    recentPayments: [],
    pendingFeesSummary: [],
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
            Accountant Dashboard
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Real-time financial status, fee collections, transactions, and outstanding dues.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setSelectedStudentForPay(null);
              setIsRecordModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-[8px] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards (Section 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collection"
          value={`$${(stats.totalCollected || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          subtitle="Cumulative verified fees"
          icon={DollarSign}
          color="blue"
        />

        <StatCard
          title="Pending Fees"
          value={`$${(stats.pendingFees || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          subtitle={`${stats.pendingCount || 0} students with pending dues`}
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Today's Collection"
          value={`$${(stats.todayCollection || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          subtitle="Collected today"
          icon={Calendar}
          color="green"
        />

        <StatCard
          title="Monthly Collection"
          value={`$${(stats.monthlyCollection || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          subtitle="Current calendar month"
          icon={CreditCard}
          color="purple"
        />
      </div>

      {/* Recent Payments Table (Section 4) */}
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#0F172A]">Recent Payments</h2>
            <p className="text-[12px] text-[#475569]">Latest recorded fee transactions</p>
          </div>
          <Link
            to="/accountant/payments"
            className="text-[14px] text-[#2563EB] hover:text-[#1D4ED8] font-medium inline-flex items-center"
          >
            View All Payments
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {recentPayments.length === 0 ? (
          <div className="p-8 text-center text-[14px] text-[#475569]">
            No payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#475569] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Receipt ID</th>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Student ID</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6">Payment Method</th>
                  <th className="py-3 px-6">Payment Date</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-[13px] font-medium text-[#2563EB]">
                      {p.receipt_number || `REC-${p.id}`}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-[#0F172A]">
                      {p.student || p.student_name}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[12px] text-[#475569]">
                      {p.student_id}
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold text-[#0F172A]">
                      ${parseFloat(p.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3.5 px-6 text-[#475569]">{p.payment_method}</td>
                    <td className="py-3.5 px-6 text-[#475569] text-[12px]">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <Badge status={p.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-[#2563EB] hover:bg-[#DBEAFE] rounded-[6px] transition-colors"
                        title="View transaction details"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </button>
                      {p.receipt_id && (
                        <button
                          onClick={() => handleViewReceiptById(p.receipt_id)}
                          className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] transition-colors"
                          title="View receipt"
                        >
                          <Receipt className="w-3.5 h-3.5 mr-1" />
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Fees Summary Table (Section 4) */}
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#0F172A]">Pending Fees Summary</h2>
            <p className="text-[12px] text-[#475569]">
              Students with immediate outstanding balances
            </p>
          </div>
          <Link
            to="/accountant/pending-fees"
            className="text-[14px] text-[#2563EB] hover:text-[#1D4ED8] font-medium inline-flex items-center"
          >
            View All Pending Fees
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {pendingFeesSummary.length === 0 ? (
          <div className="p-8 text-center text-[14px] text-[#475569]">
            No outstanding fee balances. All students are in good standing!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#475569] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Student ID</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6 text-right">Total Fee</th>
                  <th className="py-3 px-6 text-right">Paid</th>
                  <th className="py-3 px-6 text-right">Pending</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {pendingFeesSummary.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-[12px] font-semibold text-[#0F172A]">
                      {item.student_id}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-[#0F172A]">
                      {item.student_name}
                    </td>
                    <td className="py-3.5 px-6 text-[#475569] text-[13px]">
                      {item.department}
                    </td>
                    <td className="py-3.5 px-6 text-right text-[#475569]">
                      ${parseFloat(item.total_fee).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right text-[#16A34A] font-medium">
                      ${parseFloat(item.paid).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-[#DC2626]">
                      ${parseFloat(item.pending).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-[#475569] text-[12px]">
                      {item.due_date}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <Badge status={item.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedStudentForDetails(item.student_id)}
                        className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] transition-colors"
                        title="View statement"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudentForPay(item.student_id);
                          setIsRecordModalOpen(true);
                        }}
                        className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[6px] transition-colors shadow-sm"
                        title="Record payment"
                      >
                        <PlusCircle className="w-3.5 h-3.5 mr-1" />
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        preselectedStudentId={selectedStudentForPay}
      />

      <PaymentDetailModal
        isOpen={Boolean(selectedPayment)}
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onViewReceipt={(receiptId) => {
          setSelectedPayment(null);
          handleViewReceiptById(receiptId);
        }}
      />

      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <StudentFeeDetailModal
        isOpen={Boolean(selectedStudentForDetails)}
        studentId={selectedStudentForDetails}
        onClose={() => setSelectedStudentForDetails(null)}
        onRecordPayment={(stuId) => {
          setSelectedStudentForPay(stuId);
          setIsRecordModalOpen(true);
        }}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
};
