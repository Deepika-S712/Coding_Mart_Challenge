export type FeeStatus = 'PAID' | 'PENDING' | 'UNPAID';

export type FeeType = 
  | 'Tuition Fee' 
  | 'Development Fee' 
  | 'Laboratory Fee' 
  | 'Library Fee' 
  | 'Exam Fee' 
  | 'Hostel Fee' 
  | 'Transport Fee';

export interface FeeItem {
  id: string;
  semester: number;
  feeType: FeeType;
  amount: number;
  scholarship: number;
  paidAmount: number;
  pendingAmount: number;
  status: FeeStatus;
  dueDate: string;
  transactionId?: string;
  paymentDate?: string;
}

export interface FeeSummary {
  totalCourseFee: number;
  totalPaid: number;
  totalPending: number;
  totalScholarship: number;
  nextDueDate: string;
}

export interface PaymentRequest {
  feeItemId: string;
  amountToPay: number;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking';
  accountReference?: string;
}
