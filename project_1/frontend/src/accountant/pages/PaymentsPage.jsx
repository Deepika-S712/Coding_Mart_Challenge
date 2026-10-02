import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  PlusCircle,
  Receipt,
  X
} from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/SkeletonLoading';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { PaymentDetailModal } from '../components/modals/PaymentDetailModal';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { Toast } from '../../components/Toast';
import { accountantApi } from '../api/accountantApi';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [search, methodFilter, statusFilter, fromDate, toDate, currentPage]);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search,
        payment_method: methodFilter,
        status: statusFilter,
        fromDate,
        toDate,
        page: currentPage,
        limit: pageSize,
      };
      const response = await accountantApi.getPayments(params);
      setPayments(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalElements(response.pagination.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve payments.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    setToastMessage('Payment recorded successfully! Receipt issued.');
    fetchPayments();
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

  const resetFilters = () => {
    setSearch('');
    setMethodFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
            Fee Payments Ledger
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Browse payment logs, verify transactions, issue receipts, and record collections.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-[8px] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search txn ID, student..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* To Date */}
          <div>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {(search || methodFilter || statusFilter || fromDate || toDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[12px] text-[#475569]">
            <span>Active filters applied</span>
            <button
              onClick={resetFilters}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPayments} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description="There are currently no transactions matching your criteria."
          actionText="Record First Payment"
          onAction={() => setIsRecordModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#475569] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Receipt ID</th>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-5">Student ID</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5">Payment Method</th>
                  <th className="py-3 px-5">Transaction ID</th>
                  <th className="py-3 px-5">Payment Date</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[13px] font-semibold text-[#2563EB]">
                      {p.receipt_number || `REC-${p.id}`}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#0F172A]">
                      {p.student_name || p.student}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[12px] text-[#475569]">
                      {p.student_id}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-[#0F172A]">
                      ${parseFloat(p.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-[#475569]">{p.payment_method}</td>
                    <td className="py-3.5 px-5 font-mono text-[12px] text-[#475569]">
                      {p.transaction_id}
                    </td>
                    <td className="py-3.5 px-5 text-[#475569] text-[12px]">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <Badge status={p.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] transition-colors"
                        title="View Payment Details"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </button>
                      {p.receipt_id && (
                        <button
                          onClick={() => handleViewReceiptById(p.receipt_id)}
                          className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-[#2563EB] hover:bg-[#DBEAFE] rounded-[6px] transition-colors"
                          title="Print Receipt"
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={handlePaymentSuccess}
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
