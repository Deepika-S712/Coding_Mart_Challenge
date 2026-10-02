import React, { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Modal } from '../design-system/Modal';
import { Input } from '../design-system/Input';
import { Select } from '../design-system/Select';
import { Button } from '../design-system/Button';
import type { FeeItem } from '../types/finance';
import { financeService } from '../services/financeService';
import { useToast } from '../design-system/Toast';

export interface FeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeItem: FeeItem | null;
  onPaymentSuccess: () => void;
}

export const FeePaymentModal: React.FC<FeePaymentModalProps> = ({
  isOpen,
  onClose,
  feeItem,
  onPaymentSuccess,
}) => {
  const { showToast } = useToast();
  const [amount, setAmount] = useState<number>(feeItem ? feeItem.pendingAmount : 0);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking'>('UPI');
  const [accountRef, setAccountRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (feeItem) {
      setAmount(feeItem.pendingAmount);
    }
  }, [feeItem]);

  if (!feeItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > feeItem.pendingAmount) {
      setError(`Please enter an amount between $1 and $${feeItem.pendingAmount}.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await financeService.processFeePayment({
      feeItemId: feeItem.id,
      amountToPay: amount,
      paymentMethod,
      accountReference: accountRef,
    });

    setIsLoading(false);

    if (res.success && res.data) {
      showToast(
        'Payment Processed Successfully!',
        `Received $${amount} for ${feeItem.feeType} (Sem ${feeItem.semester}). Transaction ID: ${res.data.transactionId}`,
        'success'
      );
      onPaymentSuccess();
      onClose();
    } else {
      setError(res.error || 'Payment transaction failed. Please try again.');
      showToast('Payment Failed', res.error || 'Transaction rejected by payment gateway.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={20} style={{ color: 'var(--cms-color-primary)' }} />
          <span>Pay Fee Balance — {feeItem.feeType}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: '#64748b' }}>Semester:</span> <strong>Sem {feeItem.semester}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Due Date:</span> <strong>{feeItem.dueDate}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Total Fee Amount:</span> <strong>${feeItem.amount}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Pending Balance:</span> <strong style={{ color: 'var(--cms-color-danger)' }}>${feeItem.pendingAmount}</strong>
          </div>
        </div>

        <Input
          label="Amount to Pay ($)"
          type="number"
          min={1}
          max={feeItem.pendingAmount}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          error={error || undefined}
          helperText={`Enter full balance ($${feeItem.pendingAmount}) or custom installment amount.`}
          required
        />

        <Select
          label="Payment Gateway Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          options={[
            { value: 'UPI', label: 'UPI / Instant Mobile Wallet' },
            { value: 'Credit Card', label: 'Credit Card (Visa / Mastercard / Amex)' },
            { value: 'Debit Card', label: 'Debit Card' },
            { value: 'Net Banking', label: 'Institutional Net Banking' },
          ]}
        />

        <Input
          label="Reference / Account ID (Optional)"
          type="text"
          placeholder={paymentMethod === 'UPI' ? 'alex.vance@upi' : 'Account or Card Ending digits'}
          value={accountRef}
          onChange={(e) => setAccountRef(e.target.value)}
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: '#065f46',
          backgroundColor: '#ecfdf5',
          padding: '10px 12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #a7f3d0'
        }}>
          <ShieldCheck size={16} />
          <span>Encrypted with 256-bit SSL gateway security. Automatic receipt generated upon completion.</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Confirm & Pay ${amount}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
