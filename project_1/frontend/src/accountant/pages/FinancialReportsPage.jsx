import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Printer,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { TableSkeleton } from '../components/common/SkeletonLoading';
import { ErrorState } from '../components/common/ErrorState';
import { CollectionBarChart } from '../components/charts/CollectionBarChart';
import { MethodBreakdown } from '../components/charts/MethodBreakdown';
import { accountantApi } from '../api/accountantApi';

export const FinancialReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activePreset, setActivePreset] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await accountantApi.getReports({ fromDate, toDate });
      setReportData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to generate financial reports.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === 'week') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (preset === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      setFromDate(startOfMonth);
      setToDate(todayStr);
    } else {
      setFromDate('');
      setToDate('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-[12px] border border-[#E2E8F0] animate-pulse"></div>
          ))}
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchReports} />;
  }

  const {
    summary = {},
    dailyCollection = [],
    monthlyCollection = [],
    departmentWise = [],
    departmentPending = [],
    paymentMethods = [],
  } = reportData || {};

  return (
    <div className="space-y-8 animate-fade-in print:p-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
            Financial & Collection Reports
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Institutional revenue analytics, collection breakdowns, and outstanding dues audit.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2 bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-[14px] font-medium rounded-[8px] transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4 mr-2 text-[#475569]" />
          Print / Export Report
        </button>
      </div>

      {/* Date Range Controls Card */}
      <div className="bg-white p-4 rounded-[12px] border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-[12px] font-semibold text-[#475569] uppercase tracking-wider mr-2">
            Quick Ranges:
          </span>
          <button
            onClick={() => handlePreset('all')}
            className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${
              activePreset === 'all'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#E2E8F0]'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handlePreset('month')}
            className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${
              activePreset === 'month'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#E2E8F0]'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => handlePreset('week')}
            className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${
              activePreset === 'week'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#E2E8F0]'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handlePreset('today')}
            className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${
              activePreset === 'today'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#E2E8F0]'
            }`}
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-[12px] text-[#475569]">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setActivePreset('custom');
              }}
              className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] text-[12px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[12px] text-[#475569]">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setActivePreset('custom');
              }}
              className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] text-[12px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Period Collection"
          value={`$${(summary.totalCollected || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          subtitle={`${summary.totalTransactions || 0} transactions in period`}
          icon={DollarSign}
          color="blue"
        />

        <StatCard
          title="Total Outstanding"
          value={`$${(summary.totalPending || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          subtitle="Cumulative pending receivables"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Total Fees Invoiced"
          value={`$${(summary.totalInvoiced || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}`}
          subtitle="Total assessed academic fees"
          icon={TrendingUp}
          color="purple"
        />

        <StatCard
          title="Collection Ratio"
          value={`${
            summary.totalInvoiced > 0
              ? Math.round((summary.totalCollected / summary.totalInvoiced) * 100)
              : 0
          }%`}
          subtitle="Effective fee recovery rate"
          icon={CreditCard}
          color="green"
        />
      </div>

      {/* Charts Section: Daily Trend & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Collection Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#0F172A]">
                Collection Trend by Date
              </h3>
              <p className="text-[12px] text-[#475569]">
                Daily fee revenue distribution ($)
              </p>
            </div>
            <span className="text-[12px] font-medium text-[#2563EB] bg-[#DBEAFE] px-2.5 py-1 rounded-[6px]">
              Daily View
            </span>
          </div>

          <CollectionBarChart
            data={dailyCollection}
            height={220}
            labelKey="date"
            valueKey="total"
          />
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-[16px] font-bold text-[#0F172A]">
              Payment Method Summary
            </h3>
            <p className="text-[12px] text-[#475569]">
              Volume & distribution by instrument
            </p>
          </div>

          <MethodBreakdown methods={paymentMethods} />
        </div>
      </div>

      {/* Tables Section: Department-wise collection & Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Collection Table */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h3 className="text-[16px] font-bold text-[#0F172A]">
              Department-Wise Fee Collections
            </h3>
            <p className="text-[12px] text-[#475569]">
              Realized fee receipts aggregated by academic discipline
            </p>
          </div>

          {departmentWise.length === 0 ? (
            <div className="p-8 text-center text-[14px] text-[#94A3B8]">
              No collection recorded for selected date range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#475569] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5 text-center">Txn Count</th>
                    <th className="py-3 px-5 text-right">Total Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {departmentWise.map((d, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="py-3 px-5 font-medium text-[#0F172A]">
                        {d.department}
                      </td>
                      <td className="py-3 px-5 text-center text-[#475569]">
                        {d.payment_count}
                      </td>
                      <td className="py-3 px-5 text-right font-bold text-[#16A34A]">
                        ${parseFloat(d.collected).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Department-wise Pending Dues Table */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h3 className="text-[16px] font-bold text-[#0F172A]">
              Department-Wise Pending Receivables
            </h3>
            <p className="text-[12px] text-[#475569]">
              Total unpaid fees and number of pending student accounts
            </p>
          </div>

          {departmentPending.length === 0 ? (
            <div className="p-8 text-center text-[14px] text-[#94A3B8]">
              Zero pending fees across all departments!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#475569] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Department</th>
                    <th className="py-3 px-5 text-center">Pending Students</th>
                    <th className="py-3 px-5 text-right">Outstanding Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {departmentPending.map((d, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="py-3 px-5 font-medium text-[#0F172A]">
                        {d.department}
                      </td>
                      <td className="py-3 px-5 text-center text-[#475569]">
                        {d.pending_student_count}
                      </td>
                      <td className="py-3 px-5 text-right font-bold text-[#DC2626]">
                        ${parseFloat(d.pending_total).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
