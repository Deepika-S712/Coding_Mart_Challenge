import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Plus,
  ArrowRight,
  Building2
} from 'lucide-react';

export const AccountantDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/accountant/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load accountant dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const { kpis, recentPayments = [], pendingFees = [], collectionTrend = [] } = data;

  const paymentColumns = [
    {
      header: 'Receipt No',
      key: 'receiptNo',
      render: (val) => <span className="font-mono text-xs font-semibold text-primary">{val}</span>
    },
    {
      header: 'Student',
      key: 'studentName',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#0F172A] block">{val}</span>
          <span className="text-[11px] text-[#64748B]">{row.rollNo}</span>
        </div>
      )
    },
    {
      header: 'Amount Paid',
      key: 'amount',
      render: (val) => <span className="font-bold text-xs text-success">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Method',
      key: 'paymentMethod',
      render: (val) => <Badge variant="neutral" size="sm">{val}</Badge>
    },
    {
      header: 'Date',
      key: 'paymentDate',
      render: (val) => <span className="text-xs text-[#64748B]">{val}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Finance & Accounts Command Center</h2>
          <p className="text-xs text-[#64748B]">
            Fee collection records, reconciliation ledgers, and revenue trends
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/accountant/payments">
            <Button variant="primary" size="sm" icon={Plus}>
              Record Fee Payment
            </Button>
          </Link>
          <Link to="/accountant/fee-structure">
            <Button variant="secondary" size="sm" icon={Building2}>
              Fee Structure
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Fee Collection"
          value={`₹${kpis.totalCollection.toLocaleString()}`}
          subtitle={`${kpis.clearedAccountsCount} student accounts fully cleared`}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Total Outstanding Dues"
          value={`₹${kpis.totalPending.toLocaleString()}`}
          subtitle={`${kpis.pendingAccountsCount} accounts with pending balance`}
          icon={AlertCircle}
          color="warning"
        />
        <StatCard
          title="Today's Collection"
          value={`₹${kpis.todaysCollection.toLocaleString()}`}
          subtitle="Cleared through counters & online"
          icon={CreditCard}
          color="primary"
        />
        <StatCard
          title="Current Month Collection"
          value={`₹${kpis.monthlyCollection.toLocaleString()}`}
          subtitle="October 2026 gross collection"
          icon={TrendingUp}
          color="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Recent Fee Payments & Receipts"
            subtitle="Real-time transaction log recorded by accounts"
            action={
              <Link to="/accountant/receipts" className="text-xs font-semibold text-primary hover:underline">
                View All Receipts →
              </Link>
            }
          >
            <Table columns={paymentColumns} data={recentPayments} keyField="id" />
          </Card>

          {/* Collection Trend */}
          <Card
            title="Monthly Revenue & Collection Trajectory"
            subtitle="Academic fee inflow trend across past 6 months"
          >
            <div className="space-y-4 pt-2">
              {collectionTrend.map((item) => (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#0F172A]">
                    <span>{item.month} 2026</span>
                    <span className="text-primary">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.amount / 800000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Pending Fees Alert widget */}
        <div className="space-y-6">
          <Card
            title="Pending Balances"
            subtitle="Students with outstanding fee accounts"
            action={
              <Link to="/accountant/pending-fees" className="text-xs font-semibold text-primary hover:underline">
                Full List →
              </Link>
            }
          >
            <div className="space-y-3">
              {pendingFees.map((fee) => (
                <div key={fee.id} className="p-3 bg-slate-50 rounded-lg border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#0F172A]">{fee.studentName}</span>
                    <span className="font-bold text-xs text-error">₹{fee.pendingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>{fee.rollNo} • {fee.class || 'CSE-3A'}</span>
                    <span>Due: {fee.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Payment Shortcut Card */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-sm">Counter Deposit Quick Entry</h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Accept student payments via UPI QR, cash counter, or NEFT bank deposit and generate an official verifiable receipt instantly.
            </p>
            <Link to="/accountant/payments">
              <Button variant="secondary" size="sm" className="w-full mt-2">
                Open Cash / Payment Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
