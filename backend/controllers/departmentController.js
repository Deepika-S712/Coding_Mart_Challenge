const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get all departments with related counts (students, faculty, courses)
 * GET /api/admin/departments
 */
async function getDepartments(req, res, next) {
  try {
    const { search = '', status } = req.query;

    const params = [];
    const conditions = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(
        LOWER(d.department_name) LIKE $${params.length} OR 
        LOWER(d.department_code) LIKE $${params.length} OR 
        LOWER(d.hod_name) LIKE $${params.length}
      )`);
    }

    if (status) {
      params.push(status);
      conditions.push(`d.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        d.id,
        d.department_name,
        d.department_code,
        d.hod_name,
        d.description,
        d.status,
        d.created_at,
        d.updated_at,
        COUNT(DISTINCT s.id)::int AS student_count,
        COUNT(DISTINCT f.id)::int AS faculty_count,
        COUNT(DISTINCT c.id)::int AS course_count
      FROM departments d
      LEFT JOIN students s ON s.department_id = d.id
      LEFT JOIN faculty f ON f.department_id = d.id
      LEFT JOIN courses c ON c.department_id = d.id
      ${whereClause}
      GROUP BY d.id
      ORDER BY d.department_name ASC
    `;

    const result = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create Department
 * POST /api/admin/departments
 */
async function createDepartment(req, res, next) {
  try {
    const { department_name, department_code, hod_name, description, status = 'Active' } = req.body;

    if (!department_name || !department_code) {
      return res.status(400).json({
        success: false,
        message: 'Department Name and Department Code are required.',
      });
    }

    const dupCheck = await db.query(
      'SELECT id, department_name, department_code FROM departments WHERE LOWER(department_code) = LOWER($1) OR LOWER(department_name) = LOWER($2)',
      [department_code.trim(), department_name.trim()]
    );

    if (dupCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A department with this name or code already exists.',
      });
    }

    const insertSql = `
      INSERT INTO departments (department_name, department_code, hod_name, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(insertSql, [
      department_name.trim(),
      department_code.trim().toUpperCase(),
      hod_name ? hod_name.trim() : null,
      description ? description.trim() : null,
      status || 'Active',
    ]);

    const createdDept = result.rows[0];
    await logActivity('Department created', `Added department ${createdDept.department_name} (${createdDept.department_code})`, 'department', createdDept.id);

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: createdDept,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Department
 * PUT /api/admin/departments/:id
 */
async function updateDepartment(req, res, next) {
  try {
    const { id } = req.params;
    const { department_name, department_code, hod_name, description, status } = req.body;

    const existing = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    if (department_name || department_code) {
      const dupCheck = await db.query(
        'SELECT id FROM departments WHERE (LOWER(department_code) = LOWER($1) OR LOWER(department_name) = LOWER($2)) AND id != $3',
        [(department_code || '').trim(), (department_name || '').trim(), id]
      );
      if (dupCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another department already exists with this name or code.',
        });
      }
    }

    const current = existing.rows[0];

    const updateSql = `
      UPDATE departments
      SET 
        department_name = $1,
        department_code = $2,
        hod_name = $3,
        description = $4,
        status = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      department_name ? department_name.trim() : current.department_name,
      department_code ? department_code.trim().toUpperCase() : current.department_code,
      hod_name !== undefined ? hod_name : current.hod_name,
      description !== undefined ? description : current.description,
      status || current.status,
      id,
    ];

    const result = await db.query(updateSql, values);
    const updatedDept = result.rows[0];

    await logActivity('Department updated', `Updated department ${updatedDept.department_name}`, 'department', updatedDept.id);

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: updatedDept,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Department
 * DELETE /api/admin/departments/:id
 */
async function deleteDepartment(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT department_name FROM departments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const { department_name } = existing.rows[0];

    await db.query('DELETE FROM departments WHERE id = $1', [id]);

    await logActivity('Department deleted', `Deleted department ${department_name}`, 'department', parseInt(id, 10));

    return res.status(200).json({
      success: true,
      message: `Department ${department_name} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
