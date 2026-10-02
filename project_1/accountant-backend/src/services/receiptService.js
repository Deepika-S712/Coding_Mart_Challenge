const db = require('../config/db');

const getAllReceipts = async (queryParams) => {
  const { search = '', page = 1, limit = 10 } = queryParams;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const pageLimit = parseInt(limit, 10);

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      let conditions = [];
      let params = [];
      let idx = 1;

      if (search.trim()) {
        conditions.push(`(r.receipt_number ILIKE $${idx} OR r.student_id ILIKE $${idx} OR r.student_name ILIKE $${idx} OR r.transaction_id ILIKE $${idx})`);
        params.push(`%${search.trim()}%`);
        idx++;
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const countSql = `SELECT COUNT(*) FROM receipts r ${whereClause}`;
      const countRes = await client.query(countSql, params);
      const totalElements = parseInt(countRes.rows[0].count, 10);

      params.push(pageLimit);
      params.push(offset);

      const dataSql = `
        SELECT r.*, 'CMS College of Engineering & Technology' AS college_name
        FROM receipts r
        ${whereClause}
        ORDER BY r.issue_date DESC
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
  let list = db.inMemoryStore.receipts.map((r) => ({
    ...r,
    college_name: 'CMS College of Engineering & Technology'
  }));

  if (search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.receipt_number.toLowerCase().includes(s) ||
        item.student_id.toLowerCase().includes(s) ||
        item.student_name.toLowerCase().includes(s) ||
        item.transaction_id.toLowerCase().includes(s)
    );
  }

  list.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));

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

const getReceiptById = async (id) => {
  const numId = parseInt(id, 10);
  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      const res = await client.query(
        `SELECT r.*, 'CMS College of Engineering & Technology' AS college_name,
                s.email AS student_email, s.phone AS student_phone, s.year, s.semester,
                p.remarks, p.payment_date
         FROM receipts r
         JOIN students s ON r.student_id = s.student_id
         JOIN payments p ON r.payment_id = p.id
         WHERE r.id = $1`,
        [numId]
      );
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  const r = db.inMemoryStore.receipts.find((item) => item.id === numId);
  if (!r) return null;

  const student = db.inMemoryStore.students.find((s) => s.student_id === r.student_id) || {};
  const payment = db.inMemoryStore.payments.find((p) => p.id === r.payment_id) || {};

  return {
    ...r,
    college_name: 'CMS College of Engineering & Technology',
    student_email: student.email || '',
    student_phone: student.phone || '',
    year: student.year || 1,
    semester: student.semester || 1,
    remarks: payment.remarks || '',
    payment_date: payment.payment_date || r.issue_date
  };
};

module.exports = {
  getAllReceipts,
  getReceiptById
};
