import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Eye,
  Building,
  Calendar,
  X
} from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { TableSkeleton } from '../components/common/SkeletonLoading';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { accountantApi } from '../api/accountantApi';

export const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Selected receipt for print modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, [search, currentPage]);

  const fetchReceipts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await accountantApi.getReceipts({
        search,
        page: currentPage,
        limit: pageSize,
      });
      setReceipts(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalElements(response.pagination.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve receipts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
            Fee Receipts Archive
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Browse, inspect, and reprint official institutional payment receipts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search receipt #, student ID, student name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-[8px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReceipts} />
      ) : receipts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No receipts found"
          description="There are currently no receipts matching your search inquiry."
        />
      ) : (
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#475569] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Receipt Number</th>
                  <th className="py-3 px-5">Issue Date</th>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5">Method</th>
                  <th className="py-3 px-5">Accountant</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#2563EB]">
                      {r.receipt_number}
                    </td>
                    <td className="py-3.5 px-5 text-[#475569] text-[13px]">
                      {new Date(r.issue_date || r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#0F172A]">
                      <div>{r.student_name}</div>
                      <div className="text-[12px] text-[#94A3B8] font-mono">{r.student_id}</div>
                    </td>
                    <td className="py-3.5 px-5 text-[#475569] text-[13px]">{r.department}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-[#0F172A]">
                      ${parseFloat(r.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-[#475569]">{r.payment_method}</td>
                    <td className="py-3.5 px-5 text-[#475569] text-[13px]">{r.accountant_name}</td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="inline-flex items-center px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium rounded-[8px] transition-colors shadow-sm"
                        title="Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1.5" />
                        Print / View
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

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
