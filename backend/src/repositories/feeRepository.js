import { studentFees } from '../data/fees.js';
import { feeStructures } from '../data/feeStructures.js';

export const feeRepository = {
  getStudentFee(studentId) {
    return studentFees.find(f => f.studentId === studentId);
  },

  getAllStudentFees({ department, semester, status, search } = {}) {
    let result = [...studentFees];
    if (department) result = result.filter(f => f.department.toLowerCase() === department.toLowerCase());
    if (semester) result = result.filter(f => f.semester.toLowerCase() === semester.toLowerCase());
    if (status) {
      if (status.toLowerCase() === 'overdue') {
        const today = new Date().toISOString().split('T')[0];
        result = result.filter(f => f.pendingAmount > 0 && f.dueDate < today);
      } else {
        result = result.filter(f => f.status.toLowerCase() === status.toLowerCase());
      }
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f => 
        f.studentName.toLowerCase().includes(q) ||
        f.rollNo.toLowerCase().includes(q) ||
        f.studentId.toLowerCase().includes(q)
      );
    }
    return result;
  },

  getFeeStructures({ department, semester } = {}) {
    let result = [...feeStructures];
    if (department) result = result.filter(fs => fs.department.toLowerCase() === department.toLowerCase());
    if (semester) result = result.filter(fs => fs.semester.toLowerCase() === semester.toLowerCase());
    return result;
  },

  findFeeStructureById(id) {
    return feeStructures.find(fs => fs.id === id);
  },

  createFeeStructure(data) {
    const id = `FS${String(feeStructures.length + 1).padStart(3, '0')}`;
    const totalFee = (Number(data.tuitionFee) || 0) +
      (Number(data.examFee) || 0) +
      (Number(data.hostelFee) || 0) +
      (Number(data.cabFee) || 0) +
      (Number(data.libraryFee) || 0) +
      (Number(data.otherFee) || 0);

    const newStruct = {
      id,
      ...data,
      tuitionFee: Number(data.tuitionFee) || 0,
      examFee: Number(data.examFee) || 0,
      hostelFee: Number(data.hostelFee) || 0,
      cabFee: Number(data.cabFee) || 0,
      libraryFee: Number(data.libraryFee) || 0,
      otherFee: Number(data.otherFee) || 0,
      totalFee
    };
    feeStructures.push(newStruct);
    return newStruct;
  },

  updateFeeStructure(id, data) {
    const index = feeStructures.findIndex(fs => fs.id === id);
    if (index === -1) return null;
    const current = feeStructures[index];
    const tuitionFee = data.tuitionFee !== undefined ? Number(data.tuitionFee) : current.tuitionFee;
    const examFee = data.examFee !== undefined ? Number(data.examFee) : current.examFee;
    const hostelFee = data.hostelFee !== undefined ? Number(data.hostelFee) : current.hostelFee;
    const cabFee = data.cabFee !== undefined ? Number(data.cabFee) : current.cabFee;
    const libraryFee = data.libraryFee !== undefined ? Number(data.libraryFee) : current.libraryFee;
    const otherFee = data.otherFee !== undefined ? Number(data.otherFee) : current.otherFee;
    const totalFee = tuitionFee + examFee + hostelFee + cabFee + libraryFee + otherFee;

    feeStructures[index] = {
      ...current,
      ...data,
      tuitionFee,
      examFee,
      hostelFee,
      cabFee,
      libraryFee,
      otherFee,
      totalFee
    };
    return feeStructures[index];
  },

  deleteFeeStructure(id) {
    const index = feeStructures.findIndex(fs => fs.id === id);
    if (index === -1) return false;
    feeStructures.splice(index, 1);
    return true;
  },

  recordPaymentOnStudentFee(studentId, amount) {
    const index = studentFees.findIndex(f => f.studentId === studentId);
    if (index === -1) return null;
    const feeRecord = studentFees[index];
    const newPaid = feeRecord.paidAmount + amount;
    const newPending = feeRecord.totalFee - newPaid;
    let newStatus = "Partially Paid";
    if (newPending <= 0) {
      newStatus = "Paid";
    } else if (newPaid === 0) {
      newStatus = "Unpaid";
    }

    studentFees[index] = {
      ...feeRecord,
      paidAmount: newPaid,
      pendingAmount: Math.max(0, newPending),
      status: newStatus
    };
    return studentFees[index];
  }
};
