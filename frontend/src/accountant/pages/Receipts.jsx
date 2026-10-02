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
import { EmptyState } from '../../components/common/EmptyState';
import { Receipt, Search, Printer, Eye, Download } from 'lucide-react';

export const Receipts = () => {
  const [receiptsList, setReceiptsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/accountant/receipts', {
        params: { search: searchTerm }
      });
      setReceiptsList(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [searchTerm]);

  const handleOpenView = (rec) => {
    setSelectedReceipt(rec);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Receipt Number',
      key: 'receiptNo',
      render: (val) => <span className="font-mono text-xs font-bold text-primary">{val}</span>
    },
    {
      header: 'Student Name',
      key: 'studentName',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-sm text-[#0F172A] block">{val}</span>
          <span className="text-xs text-[#64748B]">{row.rollNo} • {row.department}</span>
        </div>
      )
    },
    {
      header: 'Amount Paid',
      key: 'amount',
      render: (val) => <span className="font-bold text-xs text-success font-mono">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Method',
      key: 'paymentMethod',
      render: (val) => <Badge variant="neutral" size="sm">{val}</Badge>
    },
    {
      header: 'Transaction ID',
      key: 'transactionId',
      render: (val) => <span className="font-mono text-xs text-[#64748B]">{val}</span>
    },
    {
      header: 'Issue Date',
      key: 'date',
      render: (val) => <span className="text-xs text-[#64748B]">{val}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm" icon={Eye} onClick={() => handleOpenView(row)}>
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Printer}
            onClick={() => {
              setSelectedReceipt(row);
              setIsViewModalOpen(true);
              setTimeout(() => window.print(), 300);
            }}
          >
            Print
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Official Fee Receipts Register</h2>
          <p className="text-xs text-[#64748B]">
            Search, preview, and print verifiable student fee payment receipts
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex justify-between items-center gap-4">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search by receipt number, student name, txn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs font-semibold text-[#64748B]">
          {receiptsList.length} Receipts Issued
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReceipts} />
      ) : receiptsList.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No receipts found"
          description="No official payment receipts match your search query."
        />
      ) : (
        <Card title="Issued Receipts Archive">
          <Table columns={columns} data={receiptsList} keyField="receiptNo" />
        </Card>
      )}

      {/* Receipt View & Print Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Fee Payment Receipt Voucher"
        maxWidth="max-w-2xl"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            {/* Printable Receipt Frame */}
            <div id="printable-receipt" className="p-6 bg-white border border-[#E2E8F0] rounded-lg text-xs space-y-4">
              <div className="text-center pb-4 border-b border-[#E2E8F0] space-y-0.5">
                <h3 className="text-base font-bold text-[#0F172A] uppercase tracking-wide">
                  Apex Institute of Technology & Management
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Affiliated to State Technical University • Accredited 'A+' by NAAC
                </p>
                <p className="text-[11px] text-[#64748B]">Finance & Accounts Division • Official Fee Receipt</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[#0F172A]">
                <div>
                  <p><span className="text-[#64748B]">Receipt No: </span><span className="font-bold font-mono text-primary">{selectedReceipt.receiptNo}</span></p>
                  <p><span className="text-[#64748B]">Student Name: </span><span className="font-bold">{selectedReceipt.studentName}</span></p>
                  <p><span className="text-[#64748B]">Roll No / ID: </span><span>{selectedReceipt.rollNo} ({selectedReceipt.studentId})</span></p>
                </div>
                <div className="text-right">
                  <p><span className="text-[#64748B]">Date: </span><span className="font-bold">{selectedReceipt.date}</span></p>
                  <p><span className="text-[#64748B]">Department: </span><span>{selectedReceipt.department}</span></p>
                  <p><span className="text-[#64748B]">Academic Term: </span><span>{selectedReceipt.semester}</span></p>
                </div>
              </div>

              <table className="w-full border-collapse border border-[#E2E8F0] text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0]">
                    <th className="p-2 text-[#64748B] font-semibold">Fee Description</th>
                    <th className="p-2 text-[#64748B] font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedReceipt.items || []).map((item, i) => (
                    <tr key={i} className="border-b border-[#E2E8F0]">
                      <td className="p-2 font-medium">{item.description}</td>
                      <td className="p-2 text-right font-mono font-semibold">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2 text-primary">Total Amount Deposited</td>
                    <td className="p-2 text-right text-primary font-mono text-sm">₹{selectedReceipt.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded border border-[#E2E8F0] text-center">
                <div>
                  <span className="text-[#64748B] block text-[10px]">Total Invoiced</span>
                  <span className="font-bold">₹{selectedReceipt.totalFee?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Total Paid to Date</span>
                  <span className="font-bold text-success">₹{selectedReceipt.totalPaidToDate?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Remaining Balance</span>
                  <span className="font-bold text-error">₹{selectedReceipt.balanceRemaining?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 text-[11px] text-[#64748B]">
                <div>
                  <p>Payment Mode: <span className="font-semibold text-[#0F172A]">{selectedReceipt.paymentMethod}</span></p>
                  <p>Transaction ID: <span className="font-mono text-[#0F172A]">{selectedReceipt.transactionId}</span></p>
                </div>
                <div className="text-center border-t border-slate-300 pt-1 px-4">
                  <p className="font-semibold text-[#0F172A]">{selectedReceipt.collectedBy}</p>
                  <p className="text-[10px]">Authorized Cashier / Accountant</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0] no-print">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={handlePrint}>
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Receipts;
