const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get all courses with department info, search, and department filter
 * GET /api/admin/courses
 */
async function getCourses(req, res, next) {
  try {
    const { search = '', department_id, degree_type, status } = req.query;

    const params = [];
    const conditions = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(
        LOWER(c.course_name) LIKE $${params.length} OR 
        LOWER(c.course_code) LIKE $${params.length}
      )`);
    }

    if (department_id) {
      params.push(parseInt(department_id, 10));
      conditions.push(`c.department_id = $${params.length}`);
    }

    if (degree_type) {
      params.push(degree_type);
      conditions.push(`c.degree_type = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`c.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.department_id,
        d.department_name,
        d.department_code,
        c.duration,
        c.degree_type,
        c.description,
        c.status,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT s.id)::int AS student_count,
        COUNT(DISTINCT sub.id)::int AS subject_count
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN students s ON s.course_id = c.id
      LEFT JOIN subjects sub ON sub.course_id = c.id
      ${whereClause}
      GROUP BY c.id, d.department_name, d.department_code
      ORDER BY c.course_name ASC
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
 * Create Course
 * POST /api/admin/courses
 */
async function createCourse(req, res, next) {
  try {
    const { course_name, course_code, department_id, duration, degree_type, description, status = 'Active' } = req.body;

    if (!course_name || !course_code || !department_id || !duration || !degree_type) {
      return res.status(400).json({
        success: false,
        message: 'Course Name, Course Code, Department, Duration, and Degree Type are required.',
      });
    }

    const dupCheck = await db.query(
      'SELECT id FROM courses WHERE LOWER(course_code) = LOWER($1)',
      [course_code.trim()]
    );
    if (dupCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A course with this Course Code already exists.',
      });
    }

    const insertSql = `
      INSERT INTO courses (course_name, course_code, department_id, duration, degree_type, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(insertSql, [
      course_name.trim(),
      course_code.trim().toUpperCase(),
      parseInt(department_id, 10),
      duration.trim(),
      degree_type.trim(),
      description ? description.trim() : null,
      status || 'Active',
    ]);

    const createdCourse = result.rows[0];
    await logActivity('Course added', `Created course ${createdCourse.course_name} (${createdCourse.course_code})`, 'course', createdCourse.id);

    return res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: createdCourse,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Course
 * PUT /api/admin/courses/:id
 */
async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const { course_name, course_code, department_id, duration, degree_type, description, status } = req.body;

    const existing = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (course_code) {
      const dupCheck = await db.query(
        'SELECT id FROM courses WHERE LOWER(course_code) = LOWER($1) AND id != $2',
        [course_code.trim(), id]
      );
      if (dupCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another course already exists with this Course Code.',
        });
      }
    }

    const current = existing.rows[0];

    const updateSql = `
      UPDATE courses
      SET 
        course_name = $1,
        course_code = $2,
        department_id = $3,
        duration = $4,
        degree_type = $5,
        description = $6,
        status = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      course_name ? course_name.trim() : current.course_name,
      course_code ? course_code.trim().toUpperCase() : current.course_code,
      department_id ? parseInt(department_id, 10) : current.department_id,
      duration ? duration.trim() : current.duration,
      degree_type ? degree_type.trim() : current.degree_type,
      description !== undefined ? description : current.description,
      status || current.status,
      id,
    ];

    const result = await db.query(updateSql, values);
    const updatedCourse = result.rows[0];

    await logActivity('Course updated', `Updated course ${updatedCourse.course_name}`, 'course', updatedCourse.id);

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Course
 * DELETE /api/admin/courses/:id
 */
async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT course_name FROM courses WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const { course_name } = existing.rows[0];

    await db.query('DELETE FROM courses WHERE id = $1', [id]);

    await logActivity('Course deleted', `Removed course ${course_name}`, 'course', parseInt(id, 10));

    return res.status(200).json({
      success: true,
      message: `Course ${course_name} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
