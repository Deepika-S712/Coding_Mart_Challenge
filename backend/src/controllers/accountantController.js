import { accountantService } from '../services/accountantService.js';

export const accountantController = {
  async getDashboard(req, res, next) {
    try {
      const data = accountantService.getDashboard();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Fee Structures
  async getFeeStructures(req, res, next) {
    try {
      const data = accountantService.getFeeStructures(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getFeeStructureById(req, res, next) {
    try {
      const data = accountantService.getFeeStructureById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createFeeStructure(req, res, next) {
    try {
      const data = accountantService.createFeeStructure(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateFeeStructure(req, res, next) {
    try {
      const data = accountantService.updateFeeStructure(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteFeeStructure(req, res, next) {
    try {
      const data = accountantService.deleteFeeStructure(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Student Fees
  async getStudentFees(req, res, next) {
    try {
      const data = accountantService.getStudentFees(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getStudentFeeById(req, res, next) {
    try {
      const data = accountantService.getStudentFeeById(req.params.studentId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Payments & Receipts
  async getPayments(req, res, next) {
    try {
      const data = accountantService.getPayments(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getPaymentById(req, res, next) {
    try {
      const data = accountantService.getPaymentById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async recordPayment(req, res, next) {
    try {
      const data = accountantService.recordPayment({
        ...req.body,
        collectedBy: req.user.name + " (" + req.user.id + ")"
      });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getReceipts(req, res, next) {
    try {
      const data = accountantService.getReceipts(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getReceiptById(req, res, next) {
    try {
      const data = accountantService.getReceiptById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Pending Fees
  async getPendingFees(req, res, next) {
    try {
      const data = accountantService.getPendingFees(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Reports
  async getReports(req, res, next) {
    try {
      const data = accountantService.getReports(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
