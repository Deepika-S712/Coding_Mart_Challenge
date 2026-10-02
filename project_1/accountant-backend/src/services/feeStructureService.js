const db = require('../config/db');

const calculateTotal = (data) => {
  const t = parseFloat(data.tuition_fee || 0);
  const e = parseFloat(data.exam_fee || 0);
  const l = parseFloat(data.library_fee || 0);
  const tr = parseFloat(data.transport_fee || 0);
  const h = parseFloat(data.hostel_fee || 0);
  const o = parseFloat(data.other_fee || 0);
  return Number((t + e + l + tr + h + o).toFixed(2));
};

const getAllFeeStructures = async (queryParams) => {
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
        conditions.push(`(academic_year ILIKE $${idx} OR department ILIKE $${idx})`);
        params.push(`%${search.trim()}%`);
        idx++;
      }
      if (department) {
        conditions.push(`department = $${idx}`);
        params.push(department);
        idx++;
      }
      if (year) {
        conditions.push(`year = $${idx}`);
        params.push(parseInt(year, 10));
        idx++;
      }
      if (semester) {
        conditions.push(`semester = $${idx}`);
        params.push(parseInt(semester, 10));
        idx++;
      }
      if (status) {
        conditions.push(`status = $${idx}`);
        params.push(status);
        idx++;
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await client.query(`SELECT COUNT(*) FROM fee_structures ${whereClause}`, params);
      const totalElements = parseInt(countResult.rows[0].count, 10);

      params.push(pageLimit);
      params.push(offset);
      const dataResult = await client.query(
        `SELECT * FROM fee_structures ${whereClause} ORDER BY id DESC LIMIT $${idx} OFFSET $${idx + 1}`,
        params
      );

      return {
        data: dataResult.rows,
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
  let list = [...db.inMemoryStore.fee_structures];

  if (search.trim()) {
    const s = search.toLowerCase();
    list = list.filter(
      (f) =>
        f.academic_year.toLowerCase().includes(s) ||
        f.department.toLowerCase().includes(s)
    );
  }
  if (department) {
    list = list.filter((f) => f.department === department);
  }
  if (year) {
    list = list.filter((f) => f.year === parseInt(year, 10));
  }
  if (semester) {
    list = list.filter((f) => f.semester === parseInt(semester, 10));
  }
  if (status) {
    list = list.filter((f) => f.status === status);
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

const getFeeStructureById = async (id) => {
  const numId = parseInt(id, 10);
  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      const res = await client.query('SELECT * FROM fee_structures WHERE id = $1', [numId]);
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  return db.inMemoryStore.fee_structures.find((f) => f.id === numId) || null;
};

const createFeeStructure = async (data) => {
  const total = calculateTotal(data);
  const record = {
    academic_year: data.academic_year.trim(),
    department: data.department.trim(),
    department_id: data.department_id ? parseInt(data.department_id, 10) : null,
    year: parseInt(data.year, 10),
    semester: parseInt(data.semester, 10),
    tuition_fee: parseFloat(data.tuition_fee || 0),
    exam_fee: parseFloat(data.exam_fee || 0),
    library_fee: parseFloat(data.library_fee || 0),
    transport_fee: parseFloat(data.transport_fee || 0),
    hostel_fee: parseFloat(data.hostel_fee || 0),
    other_fee: parseFloat(data.other_fee || 0),
    total_fee: total,
    status: data.status || 'Active'
  };

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      const query = `
        INSERT INTO fee_structures (
          academic_year, department, department_id, year, semester,
          tuition_fee, exam_fee, library_fee, transport_fee, hostel_fee,
          other_fee, total_fee, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      const values = [
        record.academic_year,
        record.department,
        record.department_id,
        record.year,
        record.semester,
        record.tuition_fee,
        record.exam_fee,
        record.library_fee,
        record.transport_fee,
        record.hostel_fee,
        record.other_fee,
        record.total_fee,
        record.status
      ];
      const res = await client.query(query, values);
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  const newId = db.inMemoryStore.fee_structures.length > 0
    ? Math.max(...db.inMemoryStore.fee_structures.map((f) => f.id)) + 1
    : 1;
  const created = {
    id: newId,
    ...record,
    created_at: new Date()
  };
  db.inMemoryStore.fee_structures.unshift(created);
  return created;
};

const updateFeeStructure = async (id, data) => {
  const numId = parseInt(id, 10);
  const total = calculateTotal(data);

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      const query = `
        UPDATE fee_structures
        SET academic_year = $1, department = $2, year = $3, semester = $4,
            tuition_fee = $5, exam_fee = $6, library_fee = $7, transport_fee = $8,
            hostel_fee = $9, other_fee = $10, total_fee = $11, status = $12,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $13
        RETURNING *
      `;
      const values = [
        data.academic_year.trim(),
        data.department.trim(),
        parseInt(data.year, 10),
        parseInt(data.semester, 10),
        parseFloat(data.tuition_fee || 0),
        parseFloat(data.exam_fee || 0),
        parseFloat(data.library_fee || 0),
        parseFloat(data.transport_fee || 0),
        parseFloat(data.hostel_fee || 0),
        parseFloat(data.other_fee || 0),
        total,
        data.status || 'Active',
        numId
      ];
      const res = await client.query(query, values);
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  const index = db.inMemoryStore.fee_structures.findIndex((f) => f.id === numId);
  if (index === -1) return null;

  const existing = db.inMemoryStore.fee_structures[index];
  const updated = {
    ...existing,
    academic_year: data.academic_year.trim(),
    department: data.department.trim(),
    year: parseInt(data.year, 10),
    semester: parseInt(data.semester, 10),
    tuition_fee: parseFloat(data.tuition_fee || 0),
    exam_fee: parseFloat(data.exam_fee || 0),
    library_fee: parseFloat(data.library_fee || 0),
    transport_fee: parseFloat(data.transport_fee || 0),
    hostel_fee: parseFloat(data.hostel_fee || 0),
    other_fee: parseFloat(data.other_fee || 0),
    total_fee: total,
    status: data.status || existing.status,
    updated_at: new Date()
  };

  db.inMemoryStore.fee_structures[index] = updated;
  return updated;
};

const deleteFeeStructure = async (id) => {
  const numId = parseInt(id, 10);

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      // Check if referenced in student_fees
      const checkRes = await client.query('SELECT COUNT(*) FROM student_fees WHERE fee_structure_id = $1', [numId]);
      if (parseInt(checkRes.rows[0].count, 10) > 0) {
        throw new Error('Cannot delete fee structure: It is currently assigned to one or more students.');
      }
      const res = await client.query('DELETE FROM fee_structures WHERE id = $1 RETURNING *', [numId]);
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Check references in fallback
  const isReferenced = db.inMemoryStore.student_fees.some((sf) => sf.fee_structure_id === numId);
  if (isReferenced) {
    throw new Error('Cannot delete fee structure: It is currently assigned to one or more students.');
  }

  const index = db.inMemoryStore.fee_structures.findIndex((f) => f.id === numId);
  if (index === -1) return null;

  const [removed] = db.inMemoryStore.fee_structures.splice(index, 1);
  return removed;
};

module.exports = {
  getAllFeeStructures,
  getFeeStructureById,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure
};
