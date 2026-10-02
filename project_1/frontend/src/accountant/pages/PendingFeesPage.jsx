import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Search,
  PlusCircle,
  Eye,
  Filter,
  DollarSign
} from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/SkeletonLoading';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { StudentFeeDetailModal } from '../components/modals/StudentFeeDetailModal';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { Toast } from '../../components/Toast';
import { accountantApi } from '../api/accountantApi';

export const PendingFeesPage = () => {
  const [pendingFees, setPendingFees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Modals
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState(null);
  const [selectedFeeForPay, setSelectedFeeForPay] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [issuedReceipt, setIssuedReceipt] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchPendingFees();
  }, [search, deptFilter, yearFilter, semesterFilter, statusFilter, currentPage]);

  const loadDepartments = async () => {
    try {
      const res = await accountantApi.getDepartments();
      setDepartments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPendingFees = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search,
        department: deptFilter,
        year: yearFilter,
        semester: semesterFilter,
        status: statusFilter,
        page: currentPage,
        limit: pageSize,
      };
      const response = await accountantApi.getPendingFees(params);
      setPendingFees(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalElements(response.pagination.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve pending fees.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    setToastMessage('Payment recorded and receipt generated!');
    fetchPendingFees();
    if (result?.receipt) {
      setIssuedReceipt(result.receipt);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDeptFilter('');
    setYearFilter('');
    setSemesterFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
            Pending & Overdue Fees
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Focus list of students with outstanding dues, partial payments, and overdue fees.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student ID, name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Department */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id || d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <select
              value={semesterFilter}
              onChange={(e) => {
                setSemesterFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
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
              <option value="PARTIAL">PARTIAL</option>
              <option value="PENDING">PENDING</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>
        </div>

        {(search || deptFilter || yearFilter || semesterFilter || statusFilter) && (
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
        <TableSkeleton rows={6} cols={9} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPendingFees} />
      ) : pendingFees.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No pending fees"
          description="Great job! There are currently no students with pending fees matching your criteria."
        />
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#475569] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Student ID</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5 text-right">Total Fee</th>
                  <th className="py-3 px-5 text-right">Paid Amount</th>
                  <th className="py-3 px-5 text-right">Pending Amount</th>
                  <th className="py-3 px-5">Due Date</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {pendingFees.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[12px] font-bold text-[#0F172A]">
                      {item.student_id}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#0F172A]">
                      {item.student_name}
                    </td>
                    <td className="py-3.5 px-5 text-[#475569] text-[13px]">{item.department}</td>
                    <td className="py-3.5 px-5 text-right text-[#0F172A]">
                      ${parseFloat(item.total_fee).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right text-[#16A34A] font-medium">
                      ${parseFloat(item.paid_amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-[#DC2626]">
                      ${parseFloat(item.pending_amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-[#475569] text-[13px]">{item.due_date}</td>
                    <td className="py-3.5 px-5 text-center">
                      <Badge status={item.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedStudentForDetails(item.student_id)}
                        className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudentForPay(item.student_id);
                          setSelectedFeeForPay(item.id);
                          setIsRecordModalOpen(true);
                        }}
                        className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[6px] transition-colors shadow-sm"
                        title="Record Payment"
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
      <StudentFeeDetailModal
        isOpen={Boolean(selectedStudentForDetails)}
        studentId={selectedStudentForDetails}
        onClose={() => setSelectedStudentForDetails(null)}
        onRecordPayment={(stuId) => {
          setSelectedStudentForPay(stuId);
          setIsRecordModalOpen(true);
        }}
      />

      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setSelectedStudentForPay(null);
          setSelectedFeeForPay(null);
        }}
        onSuccess={handlePaymentSuccess}
        preselectedStudentId={selectedStudentForPay}
        preselectedFeeId={selectedFeeForPay}
      />

      <ReceiptModal
        isOpen={Boolean(issuedReceipt)}
        receipt={issuedReceipt}
        onClose={() => setIssuedReceipt(null)}
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
