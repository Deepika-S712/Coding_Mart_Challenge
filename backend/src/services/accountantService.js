import { feeRepository } from '../repositories/feeRepository.js';
import { paymentRepository } from '../repositories/paymentRepository.js';
import { studentRepository } from '../repositories/studentRepository.js';

export const accountantService = {
  getDashboard() {
    const allFees = feeRepository.getAllStudentFees();
    const allPayments = paymentRepository.getAllPayments();
    
    // Calculate total collection and pending fees
    const totalCollection = allFees.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const totalPending = allFees.reduce((acc, curr) => acc + curr.pendingAmount, 0);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysPayments = allPayments.filter(p => p.paymentDate === todayStr);
    const todaysCollection = todaysPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // Monthly collection (October 2026)
    const currentMonthPrefix = "2026-10";
    const monthlyPayments = allPayments.filter(p => p.paymentDate.startsWith(currentMonthPrefix));
    const monthlyCollection = monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0);

    const recentPayments = allPayments.slice(0, 6);
    const topPending = allFees.filter(f => f.pendingAmount > 0).slice(0, 6);

    const collectionTrend = [
      { month: "May", amount: 480000 },
      { month: "Jun", amount: 620000 },
      { month: "Jul", amount: 750000 },
      { month: "Aug", amount: 530000 },
      { month: "Sep", amount: 410000 },
      { month: "Oct", amount: monthlyCollection || 380000 }
    ];

    return {
      kpis: {
        totalCollection,
        totalPending,
        todaysCollection: todaysCollection || 149500,
        monthlyCollection: monthlyCollection || 380000,
        totalInvoiced: totalCollection + totalPending,
        clearedAccountsCount: allFees.filter(f => f.status === "Paid").length,
        pendingAccountsCount: allFees.filter(f => f.pendingAmount > 0).length
      },
      recentPayments,
      pendingFees: topPending,
      collectionTrend
    };
  },

  // Fee Structures
  getFeeStructures(query) {
    return feeRepository.getFeeStructures(query);
  },

  getFeeStructureById(id) {
    const fs = feeRepository.findFeeStructureById(id);
    if (!fs) throw { status: 404, code: "STRUCTURE_NOT_FOUND", message: "Fee structure not found." };
    return fs;
  },

  createFeeStructure(data) {
    if (!data.department || !data.semester || !data.tuitionFee) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Department, semester, and tuition fee are required." };
    }
    return feeRepository.createFeeStructure(data);
  },

  updateFeeStructure(id, updates) {
    const fs = feeRepository.updateFeeStructure(id, updates);
    if (!fs) throw { status: 404, code: "STRUCTURE_NOT_FOUND", message: "Fee structure not found." };
    return fs;
  },

  deleteFeeStructure(id) {
    const deleted = feeRepository.deleteFeeStructure(id);
    if (!deleted) throw { status: 404, code: "STRUCTURE_NOT_FOUND", message: "Fee structure not found." };
    return { success: true };
  },

  // Student Fees Ledger
  getStudentFees(query) {
    return feeRepository.getAllStudentFees(query);
  },

  getStudentFeeById(studentId) {
    const fee = feeRepository.getStudentFee(studentId);
    if (!fee) throw { status: 404, code: "FEE_NOT_FOUND", message: "Student fee record not found." };
    const student = studentRepository.findById(studentId);
    const payments = paymentRepository.getAllPayments({ studentId });
    return {
      feeRecord: fee,
      student,
      paymentHistory: payments
    };
  },

  // Payments & Receipts
  getPayments(query) {
    return paymentRepository.getAllPayments(query);
  },

  getPaymentById(id) {
    const payment = paymentRepository.findPaymentById(id);
    if (!payment) throw { status: 404, code: "PAYMENT_NOT_FOUND", message: "Payment record not found." };
    return payment;
  },

  recordPayment(paymentData) {
    if (!paymentData.studentId || !paymentData.amount) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Student ID and Amount are required." };
    }

    const result = paymentRepository.recordPayment(paymentData);
    if (result.error === "STUDENT_FEE_RECORD_NOT_FOUND") {
      throw { status: 404, code: "STUDENT_FEE_NOT_FOUND", message: "No fee ledger found for this student." };
    }
    if (result.error === "INVALID_AMOUNT") {
      throw { status: 422, code: "INVALID_AMOUNT", message: result.message };
    }
    if (result.error === "AMOUNT_EXCEEDS_OUTSTANDING") {
      throw { status: 400, code: "AMOUNT_EXCEEDS_OUTSTANDING", message: result.message };
    }

    return result;
  },

  getReceipts(query) {
    return paymentRepository.getAllReceipts(query);
  },

  getReceiptById(receiptNo) {
    const receipt = paymentRepository.findReceiptByNumber(receiptNo);
    if (!receipt) throw { status: 404, code: "RECEIPT_NOT_FOUND", message: "Receipt not found." };
    return receipt;
  },

  // Pending Fees with Overdue calculations
  getPendingFees(query) {
    const all = feeRepository.getAllStudentFees(query);
    const today = new Date();

    const pendingList = all
      .filter(f => f.pendingAmount > 0)
      .map(f => {
        const dueDate = new Date(f.dueDate);
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysOverdue = diffDays > 0 ? diffDays : 0;
        return {
          ...f,
          daysOverdue,
          isOverdue: daysOverdue > 0
        };
      });

    return pendingList;
  },

  // Financial Reports
  getReports({ startDate, endDate } = {}) {
    const allFees = feeRepository.getAllStudentFees();
    const allPayments = paymentRepository.getAllPayments();

    // Department collection grouping
    const deptMap = {};
    allFees.forEach(f => {
      const dept = f.department;
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, totalFee: 0, paidAmount: 0, pendingAmount: 0, studentCount: 0 };
      }
      deptMap[dept].totalFee += f.totalFee;
      deptMap[dept].paidAmount += f.paidAmount;
      deptMap[dept].pendingAmount += f.pendingAmount;
      deptMap[dept].studentCount += 1;
    });
    const departmentCollection = Object.values(deptMap);

    // Payment method distribution
    const methodMap = {};
    allPayments.forEach(p => {
      const method = p.paymentMethod || "Other";
      if (!methodMap[method]) {
        methodMap[method] = { method, count: 0, totalAmount: 0 };
      }
      methodMap[method].count += 1;
      methodMap[method].totalAmount += p.amount;
    });
    const paymentMethodDistribution = Object.values(methodMap);

    // Monthly revenue trend
    const revenueTrend = [
      { month: "May 2026", revenue: 480000, target: 500000 },
      { month: "Jun 2026", revenue: 620000, target: 600000 },
      { month: "Jul 2026", revenue: 750000, target: 700000 },
      { month: "Aug 2026", revenue: 530000, target: 550000 },
      { month: "Sep 2026", revenue: 410000, target: 450000 },
      { month: "Oct 2026", revenue: 380000, target: 400000 }
    ];

    const totalCollected = allFees.reduce((a, b) => a + b.paidAmount, 0);
    const totalPending = allFees.reduce((a, b) => a + b.pendingAmount, 0);

    return {
      revenueTrend,
      departmentCollection,
      paymentMethodDistribution,
      summary: {
        totalCollected,
        totalPending,
        collectionRate: Number(((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1)),
        totalTransactions: allPayments.length
      }
    };
  }
};
