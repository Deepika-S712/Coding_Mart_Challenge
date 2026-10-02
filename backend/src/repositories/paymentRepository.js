import { payments, receipts } from '../data/payments.js';
import { studentFees } from '../data/fees.js';

export const paymentRepository = {
  getAllPayments({ studentId, method, search } = {}) {
    let result = [...payments];
    if (studentId) result = result.filter(p => p.studentId === studentId);
    if (method) result = result.filter(p => p.paymentMethod.toLowerCase() === method.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.studentName.toLowerCase().includes(q) ||
        p.rollNo.toLowerCase().includes(q) ||
        p.receiptNo.toLowerCase().includes(q) ||
        p.transactionId.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findPaymentById(id) {
    return payments.find(p => p.id === id || p.receiptNo === id);
  },

  recordPayment({ studentId, amount, paymentMethod, transactionId, notes, collectedBy }) {
    const feeRecord = studentFees.find(f => f.studentId === studentId);
    if (!feeRecord) {
      return { error: "STUDENT_FEE_RECORD_NOT_FOUND" };
    }

    const outstanding = feeRecord.pendingAmount;
    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) {
      return { error: "INVALID_AMOUNT", message: "Payment amount must be greater than zero." };
    }

    if (paymentAmount > outstanding) {
      return {
        error: "AMOUNT_EXCEEDS_OUTSTANDING",
        message: `Payment amount (₹${paymentAmount.toLocaleString()}) exceeds the outstanding balance (₹${outstanding.toLocaleString()}).`
      };
    }

    const payId = `PAY${String(payments.length + 1).padStart(3, '0')}`;
    const receiptNo = `REC-2026-${String(1000 + receipts.length + 1)}`;
    const today = new Date().toISOString().split('T')[0];

    const newPayment = {
      id: payId,
      receiptNo,
      studentId: feeRecord.studentId,
      studentName: feeRecord.studentName,
      rollNo: feeRecord.rollNo,
      department: feeRecord.department,
      semester: feeRecord.semester,
      amount: paymentAmount,
      paymentMethod: paymentMethod || "Cash",
      transactionId: transactionId || `TXN-${Date.now()}`,
      paymentDate: today,
      collectedBy: collectedBy || "Suresh Narayanan (ACC001)",
      notes: notes || "Fee installment payment"
    };

    payments.unshift(newPayment);

    // Update fee ledger
    const newPaid = feeRecord.paidAmount + paymentAmount;
    const newPending = feeRecord.totalFee - newPaid;
    feeRecord.paidAmount = newPaid;
    feeRecord.pendingAmount = Math.max(0, newPending);
    feeRecord.status = newPending === 0 ? "Paid" : "Partially Paid";

    // Generate receipt
    const newReceipt = {
      receiptNo,
      paymentId: payId,
      studentId: feeRecord.studentId,
      studentName: feeRecord.studentName,
      rollNo: feeRecord.rollNo,
      department: feeRecord.department,
      semester: feeRecord.semester,
      academicYear: feeRecord.academicYear,
      amount: paymentAmount,
      paymentMethod: paymentMethod || "Cash",
      transactionId: newPayment.transactionId,
      date: today,
      collectedBy: collectedBy || "Suresh Narayanan",
      items: [
        { description: `Tuition & Academic Fees (${feeRecord.semester})`, amount: paymentAmount }
      ],
      totalFee: feeRecord.totalFee,
      totalPaidToDate: feeRecord.paidAmount,
      balanceRemaining: feeRecord.pendingAmount,
      status: feeRecord.status === "Paid" ? "PAID - FULL" : "PAID - PARTIAL"
    };

    receipts.unshift(newReceipt);

    return { payment: newPayment, receipt: newReceipt };
  },

  getAllReceipts({ studentId, search } = {}) {
    let result = [...receipts];
    if (studentId) result = result.filter(r => r.studentId === studentId);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.studentName.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q) ||
        r.receiptNo.toLowerCase().includes(q) ||
        r.transactionId.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findReceiptByNumber(receiptNo) {
    return receipts.find(r => r.receiptNo === receiptNo || r.paymentId === receiptNo);
  }
};
