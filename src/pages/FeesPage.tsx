import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Download, Award, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import { Select } from '../design-system/Select';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../design-system/Table';
import { TableSkeleton, CardSkeleton } from '../design-system/Skeleton';
import { ErrorState } from '../design-system/ErrorState';
import { EmptyState } from '../design-system/EmptyState';
import { FeePaymentModal } from '../components/FeePaymentModal';
import type { FeeItem, FeeSummary } from '../types/finance';
import { financeService } from '../services/financeService';
import { useToast } from '../design-system/Toast';
import './FeesPage.css';

export interface FeesPageProps {
  currentUserRole?: string;
}

export const FeesPage: React.FC<FeesPageProps> = ({ currentUserRole = 'Student' }) => {
  const { showToast } = useToast();
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Payment Modal
  const [paymentModalItem, setPaymentModalItem] = useState<FeeItem | null>(null);

  const fetchFeeData = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const [itemsRes, sumRes] = await Promise.all([
        financeService.getFeeItems(currentUserRole),
        financeService.getFeeSummary(currentUserRole),
      ]);

      if (itemsRes.success && itemsRes.data) setFeeItems(itemsRes.data);
      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, [currentUserRole]);

  const filteredItems = feeItems.filter((item) => {
    const matchesSem = selectedSemester === 'All' || String(item.semester) === selectedSemester;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSem && matchesStatus;
  });

  const handleDownloadReceipt = (item: FeeItem) => {
    showToast(
      'Receipt Download Started',
      `Downloading official payment receipt for ${item.feeType} (Sem ${item.semester}). PDF generated.`,
      'info'
    );
  };

  if (isLoading) {
    return (
      <div className="cms-fees-page">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton rows={6} cols={9} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Finance Records Unavailable"
        message="Failed to retrieve fee ledger and payment history from the bursar server."
        onRetry={fetchFeeData}
      />
    );
  }

  return (
    <div className="cms-fees-page">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cms-fee-summary-card">
          <div className="cms-fee-card-header">
            <span className="cms-fee-card-label">Total Course Fee</span>
            <DollarSign size={20} className="text-slate-500" />
          </div>
          <div className="cms-fee-card-value">${summary?.totalCourseFee || 0}</div>
          <span className="text-xs text-slate-500">Cumulative Academic Fees</span>
        </Card>

        <Card className="cms-fee-summary-card">
          <div className="cms-fee-card-header">
            <span className="cms-fee-card-label">Total Paid Amount</span>
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <div className="cms-fee-card-value text-emerald-600">${summary?.totalPaid || 0}</div>
          <span className="text-xs text-emerald-700 font-medium">Cleared Balances</span>
        </Card>

        <Card className="cms-fee-summary-card">
          <div className="cms-fee-card-header">
            <span className="cms-fee-card-label">Pending Dues</span>
            <CreditCard size={20} className="text-amber-600" />
          </div>
          <div className="cms-fee-card-value text-amber-600">${summary?.totalPending || 0}</div>
          <span className="text-xs text-amber-700 font-medium">
            Next Due: {summary?.nextDueDate || 'None'}
          </span>
        </Card>

        <Card className="cms-fee-summary-card">
          <div className="cms-fee-card-header">
            <span className="cms-fee-card-label">Merit Scholarship</span>
            <Award size={20} className="text-indigo-600" />
          </div>
          <div className="cms-fee-card-value text-indigo-600">${summary?.totalScholarship || 0}</div>
          <span className="text-xs text-indigo-700 font-medium">Award Concessions</span>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>
              <CreditCard size={18} className="text-indigo-600" />
              <span>Semester Fee Ledger & Breakdown</span>
            </CardTitle>

            <div className="flex items-center gap-3">
              <div className="w-36">
                <Select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Semesters' },
                    { value: '6', label: 'Semester 6' },
                    { value: '5', label: 'Semester 5' },
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Statuses' },
                    { value: 'PAID', label: 'PAID' },
                    { value: 'PENDING', label: 'PENDING' },
                    { value: 'UNPAID', label: 'UNPAID' },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredItems.length === 0 ? (
            <EmptyState
              title="No Fee Items Found"
              description="No fee records match the selected semester or status filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedSemester('All');
                setSelectedStatus('All');
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sem</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Fee Amount</TableHead>
                  <TableHead>Scholarship Discount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Pending Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">Sem {item.semester}</TableCell>
                    <TableCell className="font-medium text-slate-800">{item.feeType}</TableCell>
                    <TableCell>${item.amount}</TableCell>
                    <TableCell className="text-indigo-600 font-medium">
                      {item.scholarship > 0 ? `-$${item.scholarship}` : '$0'}
                    </TableCell>
                    <TableCell className="text-emerald-700 font-semibold">${item.paidAmount}</TableCell>
                    <TableCell className={item.pendingAmount > 0 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                      ${item.pendingAmount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{item.dueDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'PAID' ? 'success' : item.status === 'PENDING' ? 'warning' : 'error'}
                        size="sm"
                        dot
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.pendingAmount > 0 ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setPaymentModalItem(item)}
                          >
                            Pay ${item.pendingAmount}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Download size={14} />}
                            onClick={() => handleDownloadReceipt(item)}
                          >
                            Receipt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <FeePaymentModal
        isOpen={!!paymentModalItem}
        onClose={() => setPaymentModalItem(null)}
        feeItem={paymentModalItem}
        onPaymentSuccess={fetchFeeData}
      />
    </div>
  );
};
