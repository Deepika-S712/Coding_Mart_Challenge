const db = require('../config/db');

const getAllPayments = async (queryParams) => {
  const { search = '', payment_method = '', status = '', fromDate = '', toDate = '', page = 1, limit = 10 } = queryParams;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const pageLimit = parseInt(limit, 10);

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      let conditions = [];
      let params = [];
      let idx = 1;

      if (search.trim()) {
        conditions.push(`(p.student_id ILIKE $${idx} OR p.transaction_id ILIKE $${idx} OR s.first_name ILIKE $${idx} OR s.last_name ILIKE $${idx})`);
        params.push(`%${search.trim()}%`);
        idx++;
      }
      if (payment_method) {
        conditions.push(`p.payment_method = $${idx}`);
        params.push(payment_method);
        idx++;
      }
      if (status) {
        conditions.push(`p.status = $${idx}`);
        params.push(status);
        idx++;
      }
      if (fromDate) {
        conditions.push(`p.payment_date >= $${idx}`);
        params.push(fromDate);
        idx++;
      }
      if (toDate) {
        conditions.push(`p.payment_date <= $${idx}`);
        params.push(`${toDate} 23:59:59`);
        idx++;
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const countSql = `
        SELECT COUNT(*)
        FROM payments p
        JOIN students s ON p.student_id = s.student_id
        ${whereClause}
      `;
      const countRes = await client.query(countSql, params);
      const totalElements = parseInt(countRes.rows[0].count, 10);

      params.push(pageLimit);
      params.push(offset);

      const dataSql = `
        SELECT p.*, CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.department,
               r.receipt_number, r.id AS receipt_id
        FROM payments p
        JOIN students s ON p.student_id = s.student_id
        LEFT JOIN receipts r ON p.id = r.payment_id
        ${whereClause}
        ORDER BY p.payment_date DESC
        LIMIT $${idx} OFFSET $${idx + 1}
      `;
      const dataRes = await client.query(dataSql, params);

      return {
        data: dataRes.rows,
        pagination: {
          currentPage: parseInt(page, 10),
          pageSize: pageLimit,
          totalElements
        }
      };
    } finally {
      client.release();
    }
  }

  // Fallback in-memory
  let list = db.inMemoryStore.payments.map((p) => {
    const student = db.inMemoryStore.students.find((s) => s.student_id === p.student_id) || {};
    const receipt = db.inMemoryStore.receipts.find((r) => r.payment_id === p.id) || {};
    return {
      ...p,
      student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || p.student_id,
      department: student.department || 'N/A',
      receipt_id: receipt.id || null,
      receipt_number: receipt.receipt_number || null
    };
  });

  if (search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.student_id.toLowerCase().includes(s) ||
        item.transaction_id.toLowerCase().includes(s) ||
        item.student_name.toLowerCase().includes(s)
    );
  }
  if (payment_method) {
    list = list.filter((item) => item.payment_method === payment_method);
  }
  if (status) {
    list = list.filter((item) => item.status === status);
  }
  if (fromDate) {
    const fromTime = new Date(fromDate).getTime();
    list = list.filter((item) => new Date(item.payment_date).getTime() >= fromTime);
  }
  if (toDate) {
    const toTime = new Date(`${toDate}T23:59:59`).getTime();
    list = list.filter((item) => new Date(item.payment_date).getTime() <= toTime);
  }

  list.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

  const totalElements = list.length;
  const paginated = list.slice(offset, offset + pageLimit);

  return {
    data: paginated,
    pagination: {
      currentPage: parseInt(page, 10),
      pageSize: pageLimit,
      totalElements
    }
  };
};

const getPaymentById = async (id) => {
  const numId = parseInt(id, 10);
  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      const res = await client.query(
        `SELECT p.*, CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.department, s.email,
                r.receipt_number, r.id AS receipt_id,
                sf.total_fee, sf.paid_amount AS total_paid, sf.pending_amount AS total_pending
         FROM payments p
         JOIN students s ON p.student_id = s.student_id
         LEFT JOIN receipts r ON p.id = r.payment_id
         LEFT JOIN student_fees sf ON p.student_fee_id = sf.id
         WHERE p.id = $1`,
        [numId]
      );
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  const p = db.inMemoryStore.payments.find((x) => x.id === numId);
  if (!p) return null;

  const student = db.inMemoryStore.students.find((s) => s.student_id === p.student_id) || {};
  const receipt = db.inMemoryStore.receipts.find((r) => r.payment_id === p.id) || {};
  const sf = db.inMemoryStore.student_fees.find((f) => f.id === p.student_fee_id) || {};

  return {
    ...p,
    student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || p.student_id,
    department: student.department || 'N/A',
    email: student.email || '',
    receipt_id: receipt.id || null,
    receipt_number: receipt.receipt_number || null,
    total_fee: sf.total_fee || 0,
    total_paid: sf.paid_amount || 0,
    total_pending: sf.pending_amount || 0
  };
};

const recordPayment = async (data, accountantName = 'College Accountant') => {
  const { student_id, student_fee_id, amount, payment_method, transaction_id, remarks, payment_date } = data;
  const payAmount = parseFloat(amount);

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Verify student exists
      const studentRes = await client.query('SELECT * FROM students WHERE student_id = $1', [student_id]);
      if (studentRes.rows.length === 0) {
        throw new Error(`Student with ID '${student_id}' does not exist.`);
      }
      const student = studentRes.rows[0];

      // 2. Verify student_fee exists and lock for update
      const feeRes = await client.query(
        'SELECT * FROM student_fees WHERE id = $1 AND student_id = $2 FOR UPDATE',
        [student_fee_id, student_id]
      );
      if (feeRes.rows.length === 0) {
        throw new Error(`Fee record with ID '${student_fee_id}' for student '${student_id}' not found.`);
      }
      const fee = feeRes.rows[0];

      // 3. Validate payment amount does not exceed pending amount
      const currentPending = parseFloat(fee.pending_amount);
      if (payAmount > currentPending) {
        throw new Error(
          `Payment amount (${payAmount.toFixed(2)}) exceeds outstanding pending fee (${currentPending.toFixed(2)}).`
        );
      }

      // Check unique transaction id
      const txnCheck = await client.query('SELECT id FROM payments WHERE transaction_id = $1', [transaction_id]);
      if (txnCheck.rows.length > 0) {
        throw new Error(`Transaction ID '${transaction_id}' has already been processed.`);
      }

      // 4. Update student_fees
      const newPaid = parseFloat(fee.paid_amount) + payAmount;
      const newPending = currentPending - payAmount;
      const newStatus = newPending <= 0 ? 'PAID' : 'PARTIAL';

      await client.query(
        `UPDATE student_fees
         SET paid_amount = $1, pending_amount = $2, status = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [newPaid, newPending, newStatus, fee.id]
      );

      // 5. Insert payment record
      const paymentDateVal = payment_date ? new Date(payment_date) : new Date();
      const insertPaymentSql = `
        INSERT INTO payments (
          student_id, student_fee_id, amount, payment_method, transaction_id,
          payment_date, remarks, status, recorded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const paymentRes = await client.query(insertPaymentSql, [
        student_id,
        fee.id,
        payAmount,
        payment_method,
        transaction_id,
        paymentDateVal,
        remarks || '',
        'Completed',
        accountantName
      ]);
      const payment = paymentRes.rows[0];

      // 6. Generate receipt
      const year = new Date().getFullYear();
      const countRes = await client.query('SELECT COUNT(*) FROM receipts');
      const seq = parseInt(countRes.rows[0].count, 10) + 1;
      const receiptNumber = `REC-${year}-${String(seq).padStart(4, '0')}`;

      const insertReceiptSql = `
        INSERT INTO receipts (
          receipt_number, payment_id, student_id, student_name, department,
          academic_year, amount, payment_method, transaction_id, accountant_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const studentFullName = `${student.first_name} ${student.last_name}`;
      const receiptRes = await client.query(insertReceiptSql, [
        receiptNumber,
        payment.id,
        student_id,
        studentFullName,
        student.department,
        fee.academic_year,
        payAmount,
        payment_method,
        transaction_id,
        accountantName
      ]);

      await client.query('COMMIT');

      return {
        payment,
        receipt: receiptRes.rows[0]
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Fallback in-memory
  const student = db.inMemoryStore.students.find((s) => s.student_id === student_id);
  if (!student) {
    throw new Error(`Student with ID '${student_id}' does not exist.`);
  }

  const fee = db.inMemoryStore.student_fees.find(
    (f) => f.id === parseInt(student_fee_id, 10) && f.student_id === student_id
  );
  if (!fee) {
    throw new Error(`Fee record with ID '${student_fee_id}' for student '${student_id}' not found.`);
  }

  const currentPending = parseFloat(fee.pending_amount);
  if (payAmount > currentPending) {
    throw new Error(
      `Payment amount ($${payAmount.toFixed(2)}) exceeds outstanding pending fee ($${currentPending.toFixed(2)}).`
    );
  }

  const isTxnDuplicate = db.inMemoryStore.payments.some((p) => p.transaction_id === transaction_id);
  if (isTxnDuplicate) {
    throw new Error(`Transaction ID '${transaction_id}' has already been processed.`);
  }

  // Update fee
  fee.paid_amount = Number((parseFloat(fee.paid_amount) + payAmount).toFixed(2));
  fee.pending_amount = Number((currentPending - payAmount).toFixed(2));
  fee.status = fee.pending_amount <= 0 ? 'PAID' : 'PARTIAL';

  // Create payment
  const newPaymentId = db.inMemoryStore.payments.length > 0
    ? Math.max(...db.inMemoryStore.payments.map((p) => p.id)) + 1
    : 1;

  const paymentRecord = {
    id: newPaymentId,
    student_id,
    student_fee_id: fee.id,
    amount: payAmount,
    payment_method,
    transaction_id,
    payment_date: payment_date ? new Date(payment_date) : new Date(),
    remarks: remarks || '',
    status: 'Completed',
    recorded_by: accountantName,
    created_at: new Date()
  };
  db.inMemoryStore.payments.unshift(paymentRecord);

  // Generate Receipt
  const year = new Date().getFullYear();
  const seq = db.inMemoryStore.receipts.length + 1;
  const receiptNumber = `REC-${year}-${String(seq).padStart(4, '0')}`;

  const newReceiptId = db.inMemoryStore.receipts.length > 0
    ? Math.max(...db.inMemoryStore.receipts.map((r) => r.id)) + 1
    : 1;

  const receiptRecord = {
    id: newReceiptId,
    receipt_number: receiptNumber,
    payment_id: newPaymentId,
    student_id,
    student_name: `${student.first_name} ${student.last_name}`,
    department: student.department,
    academic_year: fee.academic_year,
    amount: payAmount,
    payment_method,
    transaction_id,
    accountant_name: accountantName,
    issue_date: new Date(),
    created_at: new Date()
  };
  db.inMemoryStore.receipts.unshift(receiptRecord);

  return {
    payment: paymentRecord,
    receipt: receiptRecord
  };
};

module.exports = {
  getAllPayments,
  getPaymentById,
  recordPayment
};
