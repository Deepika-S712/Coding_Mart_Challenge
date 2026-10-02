const db = require('../config/db');

const getAllStudentFees = async (queryParams) => {
  const { search = '', department = '', year = '', semester = '', status = '', page = 1, limit = 10 } = queryParams;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const pageLimit = parseInt(limit, 10);

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      let conditions = [];
      let params = [];
      let idx = 1;

      if (search.trim()) {
        conditions.push(`(sf.student_id ILIKE $${idx} OR s.first_name ILIKE $${idx} OR s.last_name ILIKE $${idx})`);
        params.push(`%${search.trim()}%`);
        idx++;
      }
      if (department) {
        conditions.push(`s.department = $${idx}`);
        params.push(department);
        idx++;
      }
      if (year) {
        conditions.push(`s.year = $${idx}`);
        params.push(parseInt(year, 10));
        idx++;
      }
      if (semester) {
        conditions.push(`s.semester = $${idx}`);
        params.push(parseInt(semester, 10));
        idx++;
      }
      if (status) {
        conditions.push(`sf.status = $${idx}`);
        params.push(status.toUpperCase());
        idx++;
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const countSql = `
        SELECT COUNT(*)
        FROM student_fees sf
        JOIN students s ON sf.student_id = s.student_id
        ${whereClause}
      `;
      const countRes = await client.query(countSql, params);
      const totalElements = parseInt(countRes.rows[0].count, 10);

      params.push(pageLimit);
      params.push(offset);

      const dataSql = `
        SELECT sf.id, sf.student_id, sf.fee_structure_id, sf.academic_year,
               sf.total_fee, sf.paid_amount, sf.pending_amount, sf.due_date, sf.status,
               s.first_name, s.last_name, CONCAT(s.first_name, ' ', s.last_name) AS student_name,
               s.department, s.year, s.semester, s.email, s.phone
        FROM student_fees sf
        JOIN students s ON sf.student_id = s.student_id
        ${whereClause}
        ORDER BY sf.id DESC
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
  let list = db.inMemoryStore.student_fees.map((sf) => {
    const student = db.inMemoryStore.students.find((s) => s.student_id === sf.student_id) || {};
    return {
      ...sf,
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || sf.student_id,
      department: student.department || 'N/A',
      year: student.year || 1,
      semester: student.semester || 1,
      email: student.email || '',
      phone: student.phone || ''
    };
  });

  if (search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.student_id.toLowerCase().includes(s) ||
        item.student_name.toLowerCase().includes(s)
    );
  }
  if (department) {
    list = list.filter((item) => item.department === department);
  }
  if (year) {
    list = list.filter((item) => item.year === parseInt(year, 10));
  }
  if (semester) {
    list = list.filter((item) => item.semester === parseInt(semester, 10));
  }
  if (status) {
    list = list.filter((item) => item.status.toUpperCase() === status.toUpperCase());
  }

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

const getStudentFeeDetails = async (studentId) => {
  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      const studentRes = await client.query(
        'SELECT * FROM students WHERE student_id = $1',
        [studentId]
      );
      if (studentRes.rows.length === 0) return null;

      const student = studentRes.rows[0];

      // Student Fee Records
      const feesRes = await client.query(
        `SELECT sf.*, fs.tuition_fee, fs.exam_fee, fs.library_fee, fs.transport_fee, fs.hostel_fee, fs.other_fee
         FROM student_fees sf
         LEFT JOIN fee_structures fs ON sf.fee_structure_id = fs.id
         WHERE sf.student_id = $1
         ORDER BY sf.id DESC`,
        [studentId]
      );

      // Payment History
      const paymentsRes = await client.query(
        `SELECT p.*, r.receipt_number
         FROM payments p
         LEFT JOIN receipts r ON p.id = r.payment_id
         WHERE p.student_id = $1
         ORDER BY p.payment_date DESC`,
        [studentId]
      );

      return {
        student: {
          ...student,
          student_name: `${student.first_name} ${student.last_name}`
        },
        fees: feesRes.rows,
        payments: paymentsRes.rows
      };
    } finally {
      client.release();
    }
  }

  // Fallback in-memory
  const student = db.inMemoryStore.students.find((s) => s.student_id === studentId);
  if (!student) return null;

  const fees = db.inMemoryStore.student_fees
    .filter((sf) => sf.student_id === studentId)
    .map((sf) => {
      const fs = db.inMemoryStore.fee_structures.find((f) => f.id === sf.fee_structure_id) || {};
      return {
        ...sf,
        tuition_fee: fs.tuition_fee || 0,
        exam_fee: fs.exam_fee || 0,
        library_fee: fs.library_fee || 0,
        transport_fee: fs.transport_fee || 0,
        hostel_fee: fs.hostel_fee || 0,
        other_fee: fs.other_fee || 0
      };
    });

  const payments = db.inMemoryStore.payments
    .filter((p) => p.student_id === studentId)
    .map((p) => {
      const receipt = db.inMemoryStore.receipts.find((r) => r.payment_id === p.id) || {};
      return {
        ...p,
        receipt_number: receipt.receipt_number || null
      };
    })
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

  return {
    student: {
      ...student,
      student_name: `${student.first_name} ${student.last_name}`
    },
    fees,
    payments
  };
};

const getPendingFees = async (queryParams) => {
  const { search = '', department = '', year = '', semester = '', status = '', page = 1, limit = 10 } = queryParams;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const pageLimit = parseInt(limit, 10);

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      let conditions = ['sf.pending_amount > 0'];
      let params = [];
      let idx = 1;

      if (search.trim()) {
        conditions.push(`(sf.student_id ILIKE $${idx} OR s.first_name ILIKE $${idx} OR s.last_name ILIKE $${idx})`);
        params.push(`%${search.trim()}%`);
        idx++;
      }
      if (department) {
        conditions.push(`s.department = $${idx}`);
        params.push(department);
        idx++;
      }
      if (year) {
        conditions.push(`s.year = $${idx}`);
        params.push(parseInt(year, 10));
        idx++;
      }
      if (semester) {
        conditions.push(`s.semester = $${idx}`);
        params.push(parseInt(semester, 10));
        idx++;
      }
      if (status) {
        conditions.push(`sf.status = $${idx}`);
        params.push(status.toUpperCase());
        idx++;
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const countSql = `
        SELECT COUNT(*)
        FROM student_fees sf
        JOIN students s ON sf.student_id = s.student_id
        ${whereClause}
      `;
      const countRes = await client.query(countSql, params);
      const totalElements = parseInt(countRes.rows[0].count, 10);

      params.push(pageLimit);
      params.push(offset);

      const dataSql = `
        SELECT sf.id, sf.student_id, sf.fee_structure_id, sf.academic_year,
               sf.total_fee, sf.paid_amount, sf.pending_amount, sf.due_date, sf.status,
               CONCAT(s.first_name, ' ', s.last_name) AS student_name,
               s.department, s.year, s.semester, s.email, s.phone
        FROM student_fees sf
        JOIN students s ON sf.student_id = s.student_id
        ${whereClause}
        ORDER BY sf.due_date ASC
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
  let list = db.inMemoryStore.student_fees
    .filter((sf) => parseFloat(sf.pending_amount) > 0)
    .map((sf) => {
      const student = db.inMemoryStore.students.find((s) => s.student_id === sf.student_id) || {};
      return {
        ...sf,
        student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || sf.student_id,
        department: student.department || 'N/A',
        year: student.year || 1,
        semester: student.semester || 1,
        email: student.email || '',
        phone: student.phone || ''
      };
    });

  if (search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.student_id.toLowerCase().includes(s) ||
        item.student_name.toLowerCase().includes(s)
    );
  }
  if (department) {
    list = list.filter((item) => item.department === department);
  }
  if (year) {
    list = list.filter((item) => item.year === parseInt(year, 10));
  }
  if (semester) {
    list = list.filter((item) => item.semester === parseInt(semester, 10));
  }
  if (status) {
    list = list.filter((item) => item.status.toUpperCase() === status.toUpperCase());
  }

  list.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

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

module.exports = {
  getAllStudentFees,
  getStudentFeeDetails,
  getPendingFees
};
