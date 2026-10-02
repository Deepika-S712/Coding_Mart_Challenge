import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { useToast } from '../../components/common/Toast';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Printer,
  DollarSign,
  ArrowRight
} from 'lucide-react';

const paymentMethods = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Online'];

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Record Payment Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Success Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [payRes, feeRes] = await Promise.all([
        apiClient.get('/accountant/payments'),
        apiClient.get('/accountant/student-fees')
      ]);
      setPayments(payRes.data);
      setStudentFees(feeRes.data);

      if (feeRes.data.length > 0 && !selectedStudentId) {
        const firstWithPending = feeRes.data.find((f) => f.pendingAmount > 0) || feeRes.data[0];
        setSelectedStudentId(firstWithPending.studentId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load payments records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedFeeRecord = studentFees.find((f) => f.studentId === selectedStudentId);

  const handleOpenRecord = (studentId) => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
    const targetFee = studentFees.find((f) => f.studentId === (studentId || selectedStudentId));
    setPaymentAmount(targetFee ? String(targetFee.pendingAmount) : '');
    setTransactionId(`TXN-${Date.now().toString().slice(-6)}`);
    setNotes('Semester tuition fee deposit');
    setIsRecordModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFeeRecord) {
      toast.error('Please select a valid student fee account.');
      return;
    }

    const amountNum = Number(paymentAmount);
    if (amountNum <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }

    if (amountNum > selectedFeeRecord.pendingAmount) {
      toast.error(
        `Overpayment rejected! Amount ₹${amountNum.toLocaleString()} exceeds outstanding dues of ₹${selectedFeeRecord.pendingAmount.toLocaleString()}.`
      );
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.post('/accountant/payments', {
        studentId: selectedStudentId,
        amount: amountNum,
        paymentMethod,
        transactionId: transactionId || `TXN-${Date.now()}`,
        notes
      });

      toast.success(`Payment of ₹${amountNum.toLocaleString()} recorded successfully!`);
      setIsRecordModalOpen(false);
      setGeneratedReceipt(res.data.receipt);
      setIsReceiptModalOpen(true);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Receipt No',
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
      render: (val) => <span className="font-bold text-sm text-success font-mono">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Payment Method',
      key: 'paymentMethod',
      render: (val) => <Badge variant="neutral" size="sm">{val}</Badge>
    },
    {
      header: 'Transaction ID',
      key: 'transactionId',
      render: (val) => <span className="font-mono text-xs text-[#64748B]">{val}</span>
    },
    {
      header: 'Date',
      key: 'paymentDate',
      render: (val) => <span className="text-xs text-[#64748B]">{val}</span>
    },
    {
      header: 'Collected By',
      key: 'collectedBy',
      render: (val) => <span className="text-xs text-[#64748B]">{val}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Fee Payments & Counter Collection</h2>
          <p className="text-xs text-[#64748B]">
            Record cash counter deposits, UPI transfers, bank payments, and issue official receipts
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={() => handleOpenRecord()}>
          Record Fee Payment
        </Button>
      </div>

      {/* Payments Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <Card title="Payment Transaction Log">
          <Table columns={columns} data={payments} keyField="id" />
        </Card>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Fee Payment"
        subtitle="Enforces automatic outstanding balance verification and overpayment protection"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Select
            label="Select Student Account"
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              const target = studentFees.find((f) => f.studentId === e.target.value);
              if (target) setPaymentAmount(String(target.pendingAmount));
            }}
            options={studentFees.map((f) => ({
              value: f.studentId,
              label: `${f.studentName} (${f.rollNo}) — Dues: ₹${f.pendingAmount.toLocaleString()}`
            }))}
            required
          />

          {selectedFeeRecord && (
            <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Total Net Fee Invoiced:</span>
                <span className="font-semibold text-[#0F172A]">₹{selectedFeeRecord.totalFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Already Paid to Date:</span>
                <span className="font-semibold text-success">₹{selectedFeeRecord.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#E2E8F0] pt-1 font-bold">
                <span className="text-[#0F172A]">Outstanding Balance:</span>
                <span className="text-error font-mono">₹{selectedFeeRecord.pendingAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Deposit Amount (₹)"
              type="number"
              min="1"
              max={selectedFeeRecord?.pendingAmount}
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="e.g. 25000"
            />
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={paymentMethods}
            />
          </div>

          <Input
            label="Transaction Reference / Cheque / UPI ID"
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. UPI/261002/108239 or CSH-012"
          />

          <Input
            label="Payment Remarks / Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Installment 2 tuition fee clearance..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving} icon={CheckCircle2}>
              Confirm & Generate Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generated Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Official Fee Payment Receipt"
        maxWidth="max-w-2xl"
      >
        {generatedReceipt && (
          <div className="space-y-4">
            {/* Printable Receipt Container */}
            <div id="printable-receipt" className="p-6 bg-white border border-[#E2E8F0] rounded-lg text-xs space-y-4">
              {/* Institution Header */}
              <div className="text-center pb-4 border-b border-[#E2E8F0] space-y-0.5">
                <h3 className="text-base font-bold text-[#0F172A] uppercase tracking-wide">
                  Apex Institute of Technology & Management
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Affiliated to State Technical University • Accredited 'A+' by NAAC
                </p>
                <p className="text-[11px] text-[#64748B]">Finance & Accounts Division • Official Fee Receipt</p>
              </div>

              {/* Receipt Metadata */}
              <div className="grid grid-cols-2 gap-2 text-[#0F172A]">
                <div>
                  <p><span className="text-[#64748B]">Receipt No: </span><span className="font-bold font-mono text-primary">{generatedReceipt.receiptNo}</span></p>
                  <p><span className="text-[#64748B]">Student Name: </span><span className="font-bold">{generatedReceipt.studentName}</span></p>
                  <p><span className="text-[#64748B]">Roll No / ID: </span><span>{generatedReceipt.rollNo} ({generatedReceipt.studentId})</span></p>
                </div>
                <div className="text-right">
                  <p><span className="text-[#64748B]">Payment Date: </span><span className="font-bold">{generatedReceipt.date}</span></p>
                  <p><span className="text-[#64748B]">Department: </span><span>{generatedReceipt.department}</span></p>
                  <p><span className="text-[#64748B]">Academic Term: </span><span>{generatedReceipt.semester}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse border border-[#E2E8F0] text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0]">
                    <th className="p-2 text-[#64748B] font-semibold">Fee Particulars</th>
                    <th className="p-2 text-[#64748B] font-semibold text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {(generatedReceipt.items || []).map((item, i) => (
                    <tr key={i} className="border-b border-[#E2E8F0]">
                      <td className="p-2 font-medium">{item.description}</td>
                      <td className="p-2 text-right font-mono font-semibold">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2 text-primary">Total Amount Deposited</td>
                    <td className="p-2 text-right text-primary font-mono text-sm">₹{generatedReceipt.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Ledger Status summary */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded border border-[#E2E8F0] text-center">
                <div>
                  <span className="text-[#64748B] block text-[10px]">Total Invoiced</span>
                  <span className="font-bold">₹{generatedReceipt.totalFee?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Total Paid to Date</span>
                  <span className="font-bold text-success">₹{generatedReceipt.totalPaidToDate?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">Remaining Balance</span>
                  <span className="font-bold text-error">₹{generatedReceipt.balanceRemaining?.toLocaleString()}</span>
                </div>
              </div>

              {/* Footer notes & signature */}
              <div className="flex justify-between items-end pt-4 text-[11px] text-[#64748B]">
                <div>
                  <p>Payment Mode: <span className="font-semibold text-[#0F172A]">{generatedReceipt.paymentMethod}</span></p>
                  <p>Transaction ID: <span className="font-mono text-[#0F172A]">{generatedReceipt.transactionId}</span></p>
                  <p className="text-[10px] mt-1 text-slate-400">System Generated e-Receipt • No physical signature needed.</p>
                </div>
                <div className="text-center border-t border-slate-300 pt-1 px-4">
                  <p className="font-semibold text-[#0F172A]">{generatedReceipt.collectedBy}</p>
                  <p className="text-[10px]">Authorized Cashier / Accountant</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0] no-print">
              <Button variant="secondary" onClick={() => setIsReceiptModalOpen(false)}>
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

export default Payments;
