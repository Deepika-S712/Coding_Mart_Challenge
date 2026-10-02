import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { useToast } from '../../components/common/Toast';
import { DollarSign, Search, FileText, CheckCircle2, AlertCircle, Eye, ShieldCheck } from 'lucide-react';

export const StudentFeesLedger = () => {
  const [fees, setFees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ledger details modal
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const toast = useToast();

  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/accountant/student-fees', {
        params: { search: searchTerm }
      });
      setFees(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load student fee ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [searchTerm]);

  const handleOpenLedger = async (feeRecord) => {
    setLedgerLoading(true);
    setIsLedgerModalOpen(true);
    try {
      const res = await apiClient.get(`/accountant/student-fees/${feeRecord.studentId}`);
      setSelectedLedger(res.data);
    } catch (err) {
      toast.error('Failed to load detailed student ledger.');
    } finally {
      setLedgerLoading(false);
    }
  };

  const columns = [
    {
      header: 'Student',
      key: 'studentName',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-sm text-[#0F172A] block">{val}</span>
          <span className="font-mono text-xs text-[#64748B]">{row.rollNo} • {row.studentId}</span>
        </div>
      )
    },
    {
      header: 'Department / Sem',
      key: 'department',
      render: (val, row) => (
        <div>
          <span className="text-xs font-medium text-[#0F172A] block">{row.semester}</span>
          <span className="text-[11px] text-[#64748B]">{val}</span>
        </div>
      )
    },
    {
      header: 'Total Net Fee',
      key: 'totalFee',
      render: (val) => <span className="font-bold text-xs text-[#0F172A]">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Paid Amount',
      key: 'paidAmount',
      render: (val) => <span className="font-bold text-xs text-success">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Pending Balance',
      key: 'pendingAmount',
      render: (val) => (
        <span className={`font-bold text-xs ${val > 0 ? 'text-error' : 'text-[#64748B]'}`}>
          ₹{val.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <Badge
          variant={val === 'Paid' ? 'success' : val === 'Partially Paid' ? 'warning' : 'error'}
          size="sm"
          dot
        >
          {val}
        </Badge>
      )
    },
    {
      header: 'Ledger',
      key: 'actions',
      render: (_, row) => (
        <Button variant="secondary" size="sm" icon={Eye} onClick={() => handleOpenLedger(row)}>
          View Ledger
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Student Fee Accounts & Ledgers</h2>
        <p className="text-xs text-[#64748B]">
          Complete billing, collections, balance records, and scholarship concessions
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex justify-between items-center gap-4">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search by student name, roll no, student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs font-semibold text-[#64748B]">
          {fees.length} Account Records
        </span>
      </div>

      {/* Main Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchFees} />
      ) : (
        <Card title="Student Fee Roster">
          <Table columns={columns} data={fees} keyField="id" />
        </Card>
      )}

      {/* Detailed Ledger Modal */}
      <Modal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        title="Student Fee Ledger Statement"
        subtitle={selectedLedger ? `${selectedLedger.student?.name} (${selectedLedger.student?.rollNo})` : ''}
        maxWidth="max-w-3xl"
      >
        {ledgerLoading || !selectedLedger ? (
          <div className="space-y-3 py-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            {/* Student & Ledger Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-[#E2E8F0]">
              <div>
                <span className="text-[#64748B] block">Total Invoiced</span>
                <span className="font-bold text-sm text-[#0F172A]">
                  ₹{selectedLedger.feeRecord.totalFee.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">Paid to Date</span>
                <span className="font-bold text-sm text-success">
                  ₹{selectedLedger.feeRecord.paidAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">Outstanding Balance</span>
                <span className="font-bold text-sm text-error">
                  ₹{selectedLedger.feeRecord.pendingAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Component Breakdown */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#64748B] mb-2">
                Fee Component Breakdown
              </h4>
              <div className="divide-y divide-[#E2E8F0] border rounded-lg p-3 bg-white">
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#64748B]">Tuition Fee:</span>
                  <span className="font-semibold text-[#0F172A]">₹{selectedLedger.feeRecord.breakdown?.tuitionFee?.toLocaleString()}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#64748B]">Examination Fee:</span>
                  <span className="font-semibold text-[#0F172A]">₹{selectedLedger.feeRecord.breakdown?.examFee?.toLocaleString()}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#64748B]">Hostel & Mess:</span>
                  <span className="font-semibold text-[#0F172A]">₹{selectedLedger.feeRecord.breakdown?.hostelFee?.toLocaleString()}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#64748B]">CAB Transport Fee:</span>
                  <span className="font-semibold text-[#0F172A]">₹{selectedLedger.feeRecord.breakdown?.cabFee?.toLocaleString()}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-[#64748B]">Library & Amenities:</span>
                  <span className="font-semibold text-[#0F172A]">₹{selectedLedger.feeRecord.breakdown?.otherFee?.toLocaleString()}</span>
                </div>
                {Number(selectedLedger.feeRecord.breakdown?.scholarship || 0) > 0 && (
                  <div className="py-1.5 flex justify-between text-success">
                    <span className="font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Scholarship Adjustment:
                    </span>
                    <span className="font-bold">- ₹{selectedLedger.feeRecord.breakdown?.scholarship?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Transactions History */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#64748B] mb-2">
                Payment Transactions on File ({selectedLedger.paymentHistory?.length || 0})
              </h4>
              {selectedLedger.paymentHistory?.length === 0 ? (
                <p className="text-xs text-[#64748B] py-2">No payments recorded for this account.</p>
              ) : (
                <div className="border rounded-lg divide-y divide-[#E2E8F0]">
                  {selectedLedger.paymentHistory.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-primary font-semibold mr-2">{p.receiptNo}</span>
                        <span className="text-[#64748B]">{p.paymentDate} • {p.paymentMethod}</span>
                        <p className="text-[11px] text-[#64748B]">Txn ID: {p.transactionId}</p>
                      </div>
                      <span className="font-bold text-success text-sm">
                        + ₹{p.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
              <Button variant="secondary" onClick={() => setIsLedgerModalOpen(false)}>
                Close Ledger
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentFeesLedger;
