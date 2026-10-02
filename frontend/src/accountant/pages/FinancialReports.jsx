import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  BarChart2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  PieChart,
  Percent,
  Download
} from 'lucide-react';

export const FinancialReports = () => {
  const [reports, setReports] = useState(null);
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/accountant/reports', {
        params: { startDate, endDate }
      });
      setReports(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load financial reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchReports} />;
  }

  const { revenueTrend = [], departmentCollection = [], paymentMethodDistribution = [], summary = {} } = reports;

  const deptColumns = [
    {
      header: 'Academic Department',
      key: 'department',
      render: (val) => <span className="font-semibold text-sm text-[#0F172A]">{val}</span>
    },
    {
      header: 'Enrolled Students',
      key: 'studentCount',
      render: (val) => <span className="text-center font-medium">{val} Accounts</span>
    },
    {
      header: 'Total Invoiced',
      key: 'totalFee',
      render: (val) => <span className="font-mono text-xs font-semibold">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Total Collected',
      key: 'paidAmount',
      render: (val) => <span className="font-mono text-xs font-bold text-success">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Pending Balance',
      key: 'pendingAmount',
      render: (val) => <span className="font-mono text-xs font-bold text-error">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Recovery Rate',
      key: 'recoveryRate',
      render: (_, row) => {
        const rate = row.totalFee > 0 ? ((row.paidAmount / row.totalFee) * 100).toFixed(1) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${Math.min(rate, 100)}%` }}
              />
            </div>
            <span className="font-bold text-xs text-primary">{rate}%</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Financial Analytics & Fiscal Reports</h2>
          <p className="text-xs text-[#64748B]">
            Institutional revenue trends, department collections, and payment distribution analytics
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-xs text-[#64748B]">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button variant="primary" size="md" onClick={fetchReports}>
            Filter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Fee Collected"
          value={`₹${summary.totalCollected?.toLocaleString()}`}
          subtitle="Cleared across all channels"
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Outstanding Receivable"
          value={`₹${summary.totalPending?.toLocaleString()}`}
          subtitle="Pending student balances"
          icon={TrendingUp}
          color="warning"
        />
        <StatCard
          title="Overall Recovery Rate"
          value={`${summary.collectionRate}%`}
          subtitle="Target threshold: 90%"
          icon={Percent}
          color={summary.collectionRate >= 80 ? 'success' : 'warning'}
        />
        <StatCard
          title="Recorded Transactions"
          value={summary.totalTransactions}
          subtitle="Digital & counter receipts"
          icon={CreditCard}
          color="info"
        />
      </div>

      {/* Monthly Revenue Trend & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            title="Monthly Revenue Trend"
            subtitle="Actual collections vs academic target projections"
          >
            <div className="space-y-4 pt-2">
              {revenueTrend.map((item) => (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#0F172A]">
                    <span>{item.month}</span>
                    <span className="text-primary font-mono font-bold">
                      ₹{item.revenue.toLocaleString()} / ₹{item.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min((item.revenue / item.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment Methods Distribution */}
        <div>
          <Card
            title="Payment Method Breakdown"
            subtitle="Channel volumes & totals"
          >
            <div className="space-y-3">
              {paymentMethodDistribution.map((pm) => (
                <div key={pm.method} className="p-3 bg-slate-50 rounded-lg border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0F172A]">{pm.method}</span>
                    <Badge variant="neutral" size="sm">
                      {pm.count} Payments
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Total Processed:</span>
                    <span className="font-bold text-success font-mono">
                      ₹{pm.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Department-wise Collection Breakdown Table */}
      <Card
        title="Department-wise Financial Ledger"
        subtitle="Gross billed tuition and recovery rates across academic programs"
      >
        <Table columns={deptColumns} data={departmentCollection} keyField="department" />
      </Card>
    </div>
  );
};

export default FinancialReports;
