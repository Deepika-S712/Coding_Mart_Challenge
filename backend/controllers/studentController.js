const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get all students with search, filters, and pagination
 * GET /api/admin/students
 */
async function getStudents(req, res, next) {
  try {
    const {
      search = '',
      department_id,
      course_id,
      year,
      status,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const conditions = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(
        LOWER(s.name) LIKE $${params.length} OR 
        LOWER(s.student_id) LIKE $${params.length} OR 
        LOWER(s.email) LIKE $${params.length} OR
        LOWER(s.phone) LIKE $${params.length}
      )`);
    }

    if (department_id) {
      params.push(parseInt(department_id, 10));
      conditions.push(`s.department_id = $${params.length}`);
    }

    if (course_id) {
      params.push(parseInt(course_id, 10));
      conditions.push(`s.course_id = $${params.length}`);
    }

    if (year) {
      params.push(parseInt(year, 10));
      conditions.push(`s.year = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`s.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSortCols = ['student_id', 'name', 'email', 'year', 'admission_date', 'status', 'created_at'];
    const safeSortCol = allowedSortCols.includes(sortBy) ? `s.${sortBy}` : 's.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total query
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM students s
      ${whereClause}
    `;
    const countRes = await db.query(countSql, params);
    const total = countRes.rows[0].total;

    // Data query with joins
    const dataSql = `
      SELECT 
        s.id,
        s.student_id,
        s.name,
        s.email,
        s.phone,
        s.gender,
        TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
        s.address,
        s.department_id,
        d.department_name,
        d.department_code,
        s.course_id,
        c.course_name,
        c.course_code,
        s.year,
        TO_CHAR(s.admission_date, 'YYYY-MM-DD') AS admission_date,
        s.status,
        s.created_at,
        s.updated_at
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN courses c ON s.course_id = c.id
      ${whereClause}
      ORDER BY ${safeSortCol} ${safeSortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataParams = [...params, parseInt(limit, 10), offset];
    const dataRes = await db.query(dataSql, dataParams);

    return res.status(200).json({
      success: true,
      data: {
        students: dataRes.rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get student by ID
 * GET /api/admin/students/:id
 */
async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        s.id,
        s.student_id,
        s.name,
        s.email,
        s.phone,
        s.gender,
        TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
        s.address,
        s.department_id,
        d.department_name,
        d.department_code,
        s.course_id,
        c.course_name,
        c.course_code,
        s.year,
        TO_CHAR(s.admission_date, 'YYYY-MM-DD') AS admission_date,
        s.status,
        s.created_at,
        s.updated_at
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.id = $1
    `;

    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new student
 * POST /api/admin/students
 */
async function createStudent(req, res, next) {
  try {
    const {
      student_id,
      name,
      email,
      phone,
      gender,
      date_of_birth,
      address,
      department_id,
      course_id,
      year,
      admission_date,
      status = 'Active',
    } = req.body;

    // Validation
    if (!student_id || !name || !email || !admission_date) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Full Name, Email, and Admission Date are required fields.',
      });
    }

    // Check unique student_id and email
    const duplicateCheck = await db.query(
      'SELECT id, student_id, email FROM students WHERE LOWER(student_id) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [student_id.trim(), email.trim()]
    );

    if (duplicateCheck.rows.length > 0) {
      const match = duplicateCheck.rows[0];
      const field = match.student_id.toLowerCase() === student_id.trim().toLowerCase() ? 'Student ID' : 'Email';
      return res.status(409).json({
        success: false,
        message: `A student with this ${field} already exists.`,
      });
    }

    const insertSql = `
      INSERT INTO students (
        student_id, name, email, phone, gender, date_of_birth,
        address, department_id, course_id, year, admission_date, status,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      student_id.trim(),
      name.trim(),
      email.trim(),
      phone ? phone.trim() : null,
      gender || null,
      date_of_birth || null,
      address ? address.trim() : null,
      department_id ? parseInt(department_id, 10) : null,
      course_id ? parseInt(course_id, 10) : null,
      year ? parseInt(year, 10) : 1,
      admission_date,
      status || 'Active',
    ];

    const result = await db.query(insertSql, values);
    const createdStudent = result.rows[0];

    await logActivity('New student added', `Enrolled ${createdStudent.name} (${createdStudent.student_id})`, 'student', createdStudent.id);

    return res.status(201).json({
      success: true,
      message: 'Student added successfully.',
      data: createdStudent,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update student
 * PUT /api/admin/students/:id
 */
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const {
      student_id,
      name,
      email,
      phone,
      gender,
      date_of_birth,
      address,
      department_id,
      course_id,
      year,
      admission_date,
      status,
    } = req.body;

    const existing = await db.query('SELECT * FROM students WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Check unique conflict on student_id or email with other records
    if (student_id || email) {
      const dupCheck = await db.query(
        'SELECT id FROM students WHERE (LOWER(student_id) = LOWER($1) OR LOWER(email) = LOWER($2)) AND id != $3',
        [(student_id || '').trim(), (email || '').trim(), id]
      );
      if (dupCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another student already has this Student ID or Email.',
        });
      }
    }

    const current = existing.rows[0];

    const updateSql = `
      UPDATE students
      SET 
        student_id = $1,
        name = $2,
        email = $3,
        phone = $4,
        gender = $5,
        date_of_birth = $6,
        address = $7,
        department_id = $8,
        course_id = $9,
        year = $10,
        admission_date = $11,
        status = $12,
        updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `;

    const values = [
      student_id ? student_id.trim() : current.student_id,
      name ? name.trim() : current.name,
      email ? email.trim() : current.email,
      phone !== undefined ? phone : current.phone,
      gender !== undefined ? gender : current.gender,
      date_of_birth !== undefined ? date_of_birth : current.date_of_birth,
      address !== undefined ? address : current.address,
      department_id !== undefined ? (department_id ? parseInt(department_id, 10) : null) : current.department_id,
      course_id !== undefined ? (course_id ? parseInt(course_id, 10) : null) : current.course_id,
      year !== undefined ? parseInt(year, 10) : current.year,
      admission_date !== undefined ? admission_date : current.admission_date,
      status || current.status,
      id,
    ];

    const result = await db.query(updateSql, values);
    const updatedStudent = result.rows[0];

    await logActivity('Student updated', `Updated details for ${updatedStudent.name} (${updatedStudent.student_id})`, 'student', updatedStudent.id);

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete student
 * DELETE /api/admin/students/:id
 */
async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT name, student_id FROM students WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const { name, student_id } = existing.rows[0];

    await db.query('DELETE FROM students WHERE id = $1', [id]);

    await logActivity('Student deleted', `Removed student ${name} (${student_id})`, 'student', parseInt(id, 10));

    return res.status(200).json({
      success: true,
      message: `Student ${name} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
