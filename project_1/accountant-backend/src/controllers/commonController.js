const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getDepartments = async (req, res) => {
  try {
    if (db.isConnected) {
      const client = await db.pool.connect();
      try {
        const result = await client.query('SELECT * FROM departments ORDER BY name ASC');
        return successResponse(res, result.rows, 'Departments retrieved');
      } finally {
        client.release();
      }
    }
    return successResponse(res, db.inMemoryStore.departments, 'Departments retrieved');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getStudents = async (req, res) => {
  try {
    const { department = '', search = '' } = req.query;

    if (db.isConnected) {
      const client = await db.pool.connect();
      try {
        let conditions = [];
        let params = [];
        let idx = 1;

        if (search.trim()) {
          conditions.push(`(student_id ILIKE $${idx} OR first_name ILIKE $${idx} OR last_name ILIKE $${idx})`);
          params.push(`%${search.trim()}%`);
          idx++;
        }
        if (department) {
          conditions.push(`department = $${idx}`);
          params.push(department);
          idx++;
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `
          SELECT id, student_id, first_name, last_name, CONCAT(first_name, ' ', last_name) AS student_name,
                 department, year, semester, email, phone, status
          FROM students
          ${whereClause}
          ORDER BY student_id ASC
        `;
        const result = await client.query(sql, params);
        return successResponse(res, result.rows, 'Students retrieved');
      } finally {
        client.release();
      }
    }

    let list = db.inMemoryStore.students.map((s) => ({
      ...s,
      student_name: `${s.first_name} ${s.last_name}`
    }));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.student_id.toLowerCase().includes(q) ||
          s.student_name.toLowerCase().includes(q)
      );
    }
    if (department) {
      list = list.filter((s) => s.department === department);
    }

    return successResponse(res, list, 'Students retrieved');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getStudentFeesForPayment = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (db.isConnected) {
      const client = await db.pool.connect();
      try {
        const sql = `
          SELECT sf.*, fs.academic_year, fs.year, fs.semester, fs.department
          FROM student_fees sf
          LEFT JOIN fee_structures fs ON sf.fee_structure_id = fs.id
          WHERE sf.student_id = $1 AND sf.pending_amount > 0
          ORDER BY sf.due_date ASC
        `;
        const result = await client.query(sql, [studentId]);
        return successResponse(res, result.rows, 'Pending fees for student retrieved');
      } finally {
        client.release();
      }
    }

    const fees = db.inMemoryStore.student_fees
      .filter((sf) => sf.student_id === studentId && parseFloat(sf.pending_amount) > 0)
      .map((sf) => {
        const fs = db.inMemoryStore.fee_structures.find((f) => f.id === sf.fee_structure_id) || {};
        return {
          ...sf,
          academic_year: fs.academic_year || sf.academic_year,
          year: fs.year || 1,
          semester: fs.semester || 1,
          department: fs.department || 'N/A'
        };
      });

    return successResponse(res, fees, 'Pending fees for student retrieved');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getDepartments,
  getStudents,
  getStudentFeesForPayment
};
