import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { CreditCard, DollarSign, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const StudentFees = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/student/fees');
      setFeeData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch fee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchFees} />;
  }

  const { totalFee, paidAmount, pendingAmount, dueDate, status, breakdown = {}, semester, academicYear } = feeData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Student Fee Ledger & Dues</h2>
        <p className="text-xs text-[#64748B]">
          {semester} ({academicYear}) Institutional Fee Structure & Payments
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Net Invoiced"
          value={`₹${totalFee.toLocaleString()}`}
          subtitle="Net fee after scholarship"
          icon={CreditCard}
          color="primary"
        />
        <StatCard
          title="Paid to Date"
          value={`₹${paidAmount.toLocaleString()}`}
          subtitle="Recorded and cleared"
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Pending Dues"
          value={`₹${pendingAmount.toLocaleString()}`}
          subtitle={`Due Date: ${dueDate}`}
          icon={AlertTriangle}
          color={pendingAmount > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Breakdown and Ledger View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component-wise breakdown */}
        <Card title="Detailed Fee Component Breakdown">
          <div className="divide-y divide-[#E2E8F0] text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Tuition Fee (Core Academic):</span>
              <span className="font-semibold text-[#0F172A]">₹{Number(breakdown.tuitionFee || 0).toLocaleString()}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">University Examination Fee:</span>
              <span className="font-semibold text-[#0F172A]">₹{Number(breakdown.examFee || 0).toLocaleString()}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Hostel & Campus Mess Charges:</span>
              <span className="font-semibold text-[#0F172A]">₹{Number(breakdown.hostelFee || 0).toLocaleString()}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">College Bus / CAB Transport Fee:</span>
              <span className="font-semibold text-[#0F172A]">₹{Number(breakdown.cabFee || 0).toLocaleString()}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Library & Laboratory Amenities:</span>
              <span className="font-semibold text-[#0F172A]">₹{Number(breakdown.otherFee || 0).toLocaleString()}</span>
            </div>
            {Number(breakdown.scholarship || 0) > 0 && (
              <div className="py-2.5 flex justify-between text-success">
                <span className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Merit Scholarship Concession:
                </span>
                <span className="font-bold">- ₹{Number(breakdown.scholarship).toLocaleString()}</span>
              </div>
            )}
            <div className="py-3 flex justify-between font-bold text-sm bg-slate-50 px-2 rounded mt-2">
              <span className="text-[#0F172A]">Net Payable:</span>
              <span className="text-primary">₹{totalFee.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Payment Summary & Status */}
        <Card title="Payment Status & Official Advice">
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-medium">Account Status:</span>
                <Badge
                  variant={status === 'Paid' ? 'success' : status === 'Partially Paid' ? 'warning' : 'error'}
                  size="md"
                  dot
                >
                  {status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Final Due Date:</span>
                <span className="font-semibold text-[#0F172A]">{dueDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Official Clearance:</span>
                <span className="font-semibold text-[#0F172A]">
                  {pendingAmount === 0 ? 'No Dues Certificate Available' : 'Payment Required'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-slate-700 space-y-1">
              <h5 className="font-semibold text-primary">Accounts Notice for Students:</h5>
              <p className="text-[11px] leading-relaxed text-[#64748B]">
                Fees can be deposited via cash or UPI at the Finance & Accounts Counter (Ground Floor, Admin Block), or directly reconciled through the Accountant desk with instant official receipt generation.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentFees;
