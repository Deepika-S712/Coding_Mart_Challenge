import type { FeeItem, FeeSummary, PaymentRequest } from '../types/finance';
import { mockFeeItems, mockFeeSummary } from '../mockData/financeData';
import { simulatedFetch, type ApiResponse } from './apiClient';

let activeFeeItems = [...mockFeeItems];
let activeFeeSummary = { ...mockFeeSummary };

export const financeService = {
  async getFeeItems(currentUserRole: string = 'Student'): Promise<ApiResponse<FeeItem[]>> {
    return simulatedFetch(
      () => activeFeeItems,
      { delayMs: 400, requiredRole: 'Student', currentUserRole }
    );
  },

  async getFeeSummary(currentUserRole: string = 'Student'): Promise<ApiResponse<FeeSummary>> {
    return simulatedFetch(
      () => activeFeeSummary,
      { delayMs: 300, requiredRole: 'Student', currentUserRole }
    );
  },

  async processFeePayment(
    payment: PaymentRequest,
    currentUserRole: string = 'Student'
  ): Promise<ApiResponse<{ transactionId: string; updatedItem: FeeItem }>> {
    return simulatedFetch(
      () => {
        const targetIndex = activeFeeItems.findIndex((item) => item.id === payment.feeItemId);
        if (targetIndex === -1) {
          throw new Error('Selected fee line item was not found.');
        }

        const target = activeFeeItems[targetIndex];
        if (payment.amountToPay <= 0) {
          throw new Error('Payment amount must be greater than $0.00.');
        }

        if (payment.amountToPay > target.pendingAmount) {
          throw new Error(`Payment amount cannot exceed the pending balance of $${target.pendingAmount}.`);
        }

        const newPaid = target.paidAmount + payment.amountToPay;
        const newPending = Math.max(0, target.pendingAmount - payment.amountToPay);
        const newStatus = newPending === 0 ? 'PAID' : 'PENDING';
        const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

        const updatedItem: FeeItem = {
          ...target,
          paidAmount: newPaid,
          pendingAmount: newPending,
          status: newStatus,
          transactionId: txnId,
          paymentDate: new Date().toISOString().split('T')[0],
        };

        activeFeeItems[targetIndex] = updatedItem;

        activeFeeSummary.totalPaid += payment.amountToPay;
        activeFeeSummary.totalPending = Math.max(0, activeFeeSummary.totalPending - payment.amountToPay);

        return {
          transactionId: txnId,
          updatedItem,
        };
      },
      { delayMs: 600, requiredRole: 'Student', currentUserRole }
    );
  },
};
