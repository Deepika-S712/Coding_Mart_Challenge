import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { AlertTriangle, Search, Filter, CreditCard, DollarSign, Calendar } from 'lucide-react';

const statusFilters = ['All Pending', 'Overdue', 'Partially Paid', 'Unpaid'];
const departments = [
  'All Departments',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering'
];

export const PendingFees = () => {
  const [pendingList, setPendingList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Pending');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchPendingFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/accountant/pending-fees', {
        params: {
          search: searchTerm,
          status: selectedStatus === 'All Pending' ? undefined : selectedStatus,
          department: selectedDept === 'All Departments' ? undefined : selectedDept
        }
      });
      setPendingList(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load pending fee balances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFees();
  }, [searchTerm, selectedStatus, selectedDept]);

  const totalOutstanding = pendingList.reduce((acc, curr) => acc + curr.pendingAmount, 0);

  const columns = [
    {
      header: 'Student Name',
      key: 'studentName',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-sm text-[#0F172A] block">{val}</span>
          <span className="font-mono text-xs text-[#64748B]">{row.rollNo} • {row.studentId}</span>
        </div>
      )
    },
    {
      header: 'Department / Term',
      key: 'department',
      render: (val, row) => (
        <div>
          <span className="text-xs font-medium text-[#0F172A] block">{row.semester}</span>
          <span className="text-[11px] text-[#64748B]">{val}</span>
        </div>
      )
    },
    {
      header: 'Total Fee',
      key: 'totalFee',
      render: (val) => <span className="font-mono text-xs text-[#64748B]">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Paid to Date',
      key: 'paidAmount',
      render: (val) => <span className="font-mono text-xs text-success font-semibold">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Pending Balance',
      key: 'pendingAmount',
      render: (val) => <span className="font-mono text-sm font-bold text-error">₹{val.toLocaleString()}</span>
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (val, row) => (
        <div>
          <span className="text-xs font-semibold text-[#0F172A] block">{val}</span>
          {row.isOverdue && (
            <span className="text-[11px] text-error font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {row.daysOverdue} Days Overdue
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val, row) => (
        <Badge variant={row.isOverdue ? 'error' : val === 'Partially Paid' ? 'warning' : 'neutral'} size="sm" dot>
          {row.isOverdue ? 'OVERDUE' : val}
        </Badge>
      )
    },
    {
      header: 'Action',
      key: 'actions',
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={CreditCard}
          onClick={() => navigate('/accountant/payments')}
        >
          Collect Fee
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Outstanding & Overdue Fee Follow-up</h2>
          <p className="text-xs text-[#64748B]">
            Track student unpaid dues, overdue accounts, and installment balances
          </p>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-right">
          <span className="text-[11px] uppercase tracking-wider text-error font-bold block">
            Filtered Outstanding Balance
          </span>
          <span className="font-black text-xl text-error font-mono">
            ₹{totalOutstanding.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {statusFilters.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Dept filter & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={departments}
            />
          </div>
          <div className="w-full sm:w-60">
            <Input
              icon={Search}
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPendingFees} />
      ) : pendingList.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="All clear! No pending accounts found"
          description="There are currently no students with outstanding dues matching this filter."
        />
      ) : (
        <Card title="Pending Accounts Table">
          <Table columns={columns} data={pendingList} keyField="id" />
        </Card>
      )}
    </div>
  );
};

export default PendingFees;
