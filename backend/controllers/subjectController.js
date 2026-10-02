const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get all subjects with course details and assigned faculty
 * GET /api/admin/subjects
 */
async function getSubjects(req, res, next) {
  try {
    const { search = '', course_id, semester, status } = req.query;

    const params = [];
    const conditions = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(
        LOWER(sub.subject_name) LIKE $${params.length} OR 
        LOWER(sub.subject_code) LIKE $${params.length}
      )`);
    }

    if (course_id) {
      params.push(parseInt(course_id, 10));
      conditions.push(`sub.course_id = $${params.length}`);
    }

    if (semester) {
      params.push(parseInt(semester, 10));
      conditions.push(`sub.semester = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`sub.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        sub.id,
        sub.subject_name,
        sub.subject_code,
        sub.course_id,
        c.course_name,
        c.course_code,
        d.id AS department_id,
        d.department_name,
        sub.semester,
        sub.credits,
        sub.description,
        sub.status,
        sub.created_at,
        sub.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'faculty_id', f.faculty_id,
              'name', f.name,
              'designation', f.designation
            )
          ) FILTER (WHERE f.id IS NOT NULL), '[]'
        ) AS assigned_faculty
      FROM subjects sub
      LEFT JOIN courses c ON sub.course_id = c.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN faculty_subjects fs ON sub.id = fs.subject_id
      LEFT JOIN faculty f ON fs.faculty_id = f.id
      ${whereClause}
      GROUP BY sub.id, c.course_name, c.course_code, d.id, d.department_name
      ORDER BY sub.subject_name ASC
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
 * Create Subject
 * POST /api/admin/subjects
 */
async function createSubject(req, res, next) {
  try {
    const {
      subject_name,
      subject_code,
      course_id,
      semester,
      credits = 3,
      description,
      status = 'Active',
      faculty_ids = [],
    } = req.body;

    if (!subject_name || !subject_code || !course_id || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Subject Name, Subject Code, Course, and Semester are required.',
      });
    }

    const dupCheck = await db.query(
      'SELECT id FROM subjects WHERE LOWER(subject_code) = LOWER($1)',
      [subject_code.trim()]
    );
    if (dupCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A subject with this Subject Code already exists.',
      });
    }

    const insertSql = `
      INSERT INTO subjects (subject_name, subject_code, course_id, semester, credits, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(insertSql, [
      subject_name.trim(),
      subject_code.trim().toUpperCase(),
      parseInt(course_id, 10),
      parseInt(semester, 10),
      parseInt(credits, 10),
      description ? description.trim() : null,
      status || 'Active',
    ]);

    const createdSubject = result.rows[0];

    // Assign faculty
    if (Array.isArray(faculty_ids) && faculty_ids.length > 0) {
      for (const fid of faculty_ids) {
        await db.query(
          'INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [parseInt(fid, 10), createdSubject.id]
        );
      }
    }

    await logActivity('Subject added', `Added subject ${createdSubject.subject_name} (${createdSubject.subject_code})`, 'subject', createdSubject.id);

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: createdSubject,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Subject
 * PUT /api/admin/subjects/:id
 */
async function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const {
      subject_name,
      subject_code,
      course_id,
      semester,
      credits,
      description,
      status,
      faculty_ids,
    } = req.body;

    const existing = await db.query('SELECT * FROM subjects WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    if (subject_code) {
      const dupCheck = await db.query(
        'SELECT id FROM subjects WHERE LOWER(subject_code) = LOWER($1) AND id != $2',
        [subject_code.trim(), id]
      );
      if (dupCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another subject already exists with this Subject Code.',
        });
      }
    }

    const current = existing.rows[0];

    const updateSql = `
      UPDATE subjects
      SET 
        subject_name = $1,
        subject_code = $2,
        course_id = $3,
        semester = $4,
        credits = $5,
        description = $6,
        status = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      subject_name ? subject_name.trim() : current.subject_name,
      subject_code ? subject_code.trim().toUpperCase() : current.subject_code,
      course_id ? parseInt(course_id, 10) : current.course_id,
      semester ? parseInt(semester, 10) : current.semester,
      credits !== undefined ? parseInt(credits, 10) : current.credits,
      description !== undefined ? description : current.description,
      status || current.status,
      id,
    ];

    const result = await db.query(updateSql, values);
    const updatedSubject = result.rows[0];

    // Update faculty assignments if array provided
    if (Array.isArray(faculty_ids)) {
      await db.query('DELETE FROM faculty_subjects WHERE subject_id = $1', [id]);
      for (const fid of faculty_ids) {
        await db.query(
          'INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [parseInt(fid, 10), id]
        );
      }
    }

    await logActivity('Subject updated', `Updated subject ${updatedSubject.subject_name}`, 'subject', updatedSubject.id);

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      data: updatedSubject,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Subject
 * DELETE /api/admin/subjects/:id
 */
async function deleteSubject(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT subject_name FROM subjects WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const { subject_name } = existing.rows[0];

    await db.query('DELETE FROM subjects WHERE id = $1', [id]);

    await logActivity('Subject deleted', `Removed subject ${subject_name}`, 'subject', parseInt(id, 10));

    return res.status(200).json({
      success: true,
      message: `Subject ${subject_name} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
