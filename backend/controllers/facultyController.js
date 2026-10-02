const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get all faculty with search, filter, and pagination
 * GET /api/admin/faculty
 */
async function getFaculty(req, res, next) {
  try {
    const {
      search = '',
      department_id,
      designation,
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
        LOWER(f.name) LIKE $${params.length} OR 
        LOWER(f.faculty_id) LIKE $${params.length} OR 
        LOWER(f.email) LIKE $${params.length} OR
        LOWER(f.phone) LIKE $${params.length} OR
        LOWER(f.designation) LIKE $${params.length}
      )`);
    }

    if (department_id) {
      params.push(parseInt(department_id, 10));
      conditions.push(`f.department_id = $${params.length}`);
    }

    if (designation) {
      params.push(designation);
      conditions.push(`f.designation = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`f.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortCols = ['faculty_id', 'name', 'email', 'designation', 'joining_date', 'status', 'created_at'];
    const safeSortCol = allowedSortCols.includes(sortBy) ? `f.${sortBy}` : 'f.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count
    const countSql = `SELECT COUNT(*)::int AS total FROM faculty f ${whereClause}`;
    const countRes = await db.query(countSql, params);
    const total = countRes.rows[0].total;

    // Faculty with assigned subjects aggregation
    const dataSql = `
      SELECT 
        f.id,
        f.faculty_id,
        f.name,
        f.email,
        f.phone,
        f.gender,
        f.department_id,
        d.department_name,
        d.department_code,
        f.designation,
        TO_CHAR(f.joining_date, 'YYYY-MM-DD') AS joining_date,
        f.status,
        f.created_at,
        f.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'subject_name', s.subject_name,
              'subject_code', s.subject_code,
              'semester', s.semester
            )
          ) FILTER (WHERE s.id IS NOT NULL), '[]'
        ) AS assigned_subjects
      FROM faculty f
      LEFT JOIN departments d ON f.department_id = d.id
      LEFT JOIN faculty_subjects fs ON f.id = fs.faculty_id
      LEFT JOIN subjects s ON fs.subject_id = s.id
      ${whereClause}
      GROUP BY f.id, d.department_name, d.department_code
      ORDER BY ${safeSortCol} ${safeSortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataRes = await db.query(dataSql, [...params, parseInt(limit, 10), offset]);

    return res.status(200).json({
      success: true,
      data: {
        faculty: dataRes.rows,
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
 * Get faculty member by ID
 * GET /api/admin/faculty/:id
 */
async function getFacultyById(req, res, next) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        f.id,
        f.faculty_id,
        f.name,
        f.email,
        f.phone,
        f.gender,
        f.department_id,
        d.department_name,
        d.department_code,
        f.designation,
        TO_CHAR(f.joining_date, 'YYYY-MM-DD') AS joining_date,
        f.status,
        f.created_at,
        f.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'subject_name', s.subject_name,
              'subject_code', s.subject_code,
              'semester', s.semester
            )
          ) FILTER (WHERE s.id IS NOT NULL), '[]'
        ) AS assigned_subjects
      FROM faculty f
      LEFT JOIN departments d ON f.department_id = d.id
      LEFT JOIN faculty_subjects fs ON f.id = fs.faculty_id
      LEFT JOIN subjects s ON fs.subject_id = s.id
      WHERE f.id = $1
      GROUP BY f.id, d.department_name, d.department_code
    `;

    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found.',
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
 * Create Faculty member
 * POST /api/admin/faculty
 */
async function createFaculty(req, res, next) {
  try {
    const {
      faculty_id,
      name,
      email,
      phone,
      gender,
      department_id,
      designation,
      joining_date,
      status = 'Active',
      subject_ids = [],
    } = req.body;

    if (!faculty_id || !name || !email || !designation || !joining_date) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID, Name, Email, Designation, and Joining Date are required.',
      });
    }

    // Check duplicates
    const dupCheck = await db.query(
      'SELECT id, faculty_id, email FROM faculty WHERE LOWER(faculty_id) = LOWER($1) OR LOWER(email) = LOWER($2)',
      [faculty_id.trim(), email.trim()]
    );

    if (dupCheck.rows.length > 0) {
      const match = dupCheck.rows[0];
      const field = match.faculty_id.toLowerCase() === faculty_id.trim().toLowerCase() ? 'Faculty ID' : 'Email';
      return res.status(409).json({
        success: false,
        message: `A faculty member with this ${field} already exists.`,
      });
    }

    const insertSql = `
      INSERT INTO faculty (
        faculty_id, name, email, phone, gender, department_id,
        designation, joining_date, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      faculty_id.trim(),
      name.trim(),
      email.trim(),
      phone ? phone.trim() : null,
      gender || null,
      department_id ? parseInt(department_id, 10) : null,
      designation.trim(),
      joining_date,
      status || 'Active',
    ];

    const result = await db.query(insertSql, values);
    const createdFaculty = result.rows[0];

    // Assign subjects if provided
    if (Array.isArray(subject_ids) && subject_ids.length > 0) {
      for (const subId of subject_ids) {
        await db.query(
          'INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [createdFaculty.id, parseInt(subId, 10)]
        );
      }
    }

    await logActivity('Faculty created', `Added faculty member ${createdFaculty.name} (${createdFaculty.faculty_id})`, 'faculty', createdFaculty.id);

    return res.status(201).json({
      success: true,
      message: 'Faculty member created successfully.',
      data: createdFaculty,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Faculty member
 * PUT /api/admin/faculty/:id
 */
async function updateFaculty(req, res, next) {
  try {
    const { id } = req.params;
    const {
      faculty_id,
      name,
      email,
      phone,
      gender,
      department_id,
      designation,
      joining_date,
      status,
      subject_ids,
    } = req.body;

    const existing = await db.query('SELECT * FROM faculty WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    // Check unique conflicts
    if (faculty_id || email) {
      const dupCheck = await db.query(
        'SELECT id FROM faculty WHERE (LOWER(faculty_id) = LOWER($1) OR LOWER(email) = LOWER($2)) AND id != $3',
        [(faculty_id || '').trim(), (email || '').trim(), id]
      );
      if (dupCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another faculty member already has this Faculty ID or Email.',
        });
      }
    }

    const current = existing.rows[0];

    const updateSql = `
      UPDATE faculty
      SET 
        faculty_id = $1,
        name = $2,
        email = $3,
        phone = $4,
        gender = $5,
        department_id = $6,
        designation = $7,
        joining_date = $8,
        status = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      faculty_id ? faculty_id.trim() : current.faculty_id,
      name ? name.trim() : current.name,
      email ? email.trim() : current.email,
      phone !== undefined ? phone : current.phone,
      gender !== undefined ? gender : current.gender,
      department_id !== undefined ? (department_id ? parseInt(department_id, 10) : null) : current.department_id,
      designation ? designation.trim() : current.designation,
      joining_date !== undefined ? joining_date : current.joining_date,
      status || current.status,
      id,
    ];

    const result = await db.query(updateSql, values);
    const updatedFaculty = result.rows[0];

    // Update subject assignments if subject_ids array is provided
    if (Array.isArray(subject_ids)) {
      await db.query('DELETE FROM faculty_subjects WHERE faculty_id = $1', [id]);
      for (const subId of subject_ids) {
        await db.query(
          'INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, parseInt(subId, 10)]
        );
      }
    }

    await logActivity('Faculty updated', `Updated faculty member ${updatedFaculty.name}`, 'faculty', updatedFaculty.id);

    return res.status(200).json({
      success: true,
      message: 'Faculty member updated successfully.',
      data: updatedFaculty,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Faculty member
 * DELETE /api/admin/faculty/:id
 */
async function deleteFaculty(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT name, faculty_id FROM faculty WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    const { name, faculty_id } = existing.rows[0];

    await db.query('DELETE FROM faculty WHERE id = $1', [id]);

    await logActivity('Faculty deleted', `Removed faculty member ${name} (${faculty_id})`, 'faculty', parseInt(id, 10));

    return res.status(200).json({
      success: true,
      message: `Faculty member ${name} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
