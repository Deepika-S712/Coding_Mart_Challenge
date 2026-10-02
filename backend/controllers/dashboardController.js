const db = require('../config/db');

/**
 * Get Admin Dashboard Statistics & Analytics
 * GET /api/admin/dashboard
 */
async function getDashboardStats(req, res, next) {
  try {
    // 1. Total counts from real PostgreSQL tables
    const [
      studentsCountRes,
      facultyCountRes,
      departmentsCountRes,
      coursesCountRes,
      subjectsCountRes
    ] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS count FROM students'),
      db.query('SELECT COUNT(*)::int AS count FROM faculty'),
      db.query('SELECT COUNT(*)::int AS count FROM departments'),
      db.query('SELECT COUNT(*)::int AS count FROM courses'),
      db.query('SELECT COUNT(*)::int AS count FROM subjects'),
    ]);

    const totals = {
      students: studentsCountRes.rows[0].count,
      faculty: facultyCountRes.rows[0].count,
      departments: departmentsCountRes.rows[0].count,
      courses: coursesCountRes.rows[0].count,
      subjects: subjectsCountRes.rows[0].count,
    };

    // 2. Student Statistics: Students by Department
    const studentsByDeptRes = await db.query(`
      SELECT 
        d.id,
        d.department_name,
        d.department_code,
        COUNT(s.id)::int AS student_count
      FROM departments d
      LEFT JOIN students s ON s.department_id = d.id
      GROUP BY d.id, d.department_name, d.department_code
      ORDER BY student_count DESC, d.department_name ASC
    `);

    // 3. Faculty Statistics: Faculty distribution by Department
    const facultyByDeptRes = await db.query(`
      SELECT 
        d.id,
        d.department_name,
        d.department_code,
        COUNT(f.id)::int AS faculty_count
      FROM departments d
      LEFT JOIN faculty f ON f.department_id = d.id
      GROUP BY d.id, d.department_name, d.department_code
      ORDER BY faculty_count DESC, d.department_name ASC
    `);

    // 4. Course Statistics: Courses by Department and Degree Type
    const coursesByDeptRes = await db.query(`
      SELECT 
        d.department_name,
        COUNT(c.id)::int AS course_count
      FROM departments d
      LEFT JOIN courses c ON c.department_id = d.id
      GROUP BY d.id, d.department_name
      ORDER BY course_count DESC
    `);

    const coursesByDegreeRes = await db.query(`
      SELECT 
        degree_type,
        COUNT(id)::int AS count
      FROM courses
      GROUP BY degree_type
      ORDER BY count DESC
    `);

    // 5. Recent Admin Activities from activity_logs
    const recentActivitiesRes = await db.query(`
      SELECT 
        id,
        action,
        details,
        entity_type,
        entity_id,
        created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      data: {
        totals,
        charts: {
          studentsByDepartment: studentsByDeptRes.rows,
          facultyByDepartment: facultyByDeptRes.rows,
          coursesByDepartment: coursesByDeptRes.rows,
          coursesByDegree: coursesByDegreeRes.rows,
        },
        recentActivities: recentActivitiesRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboardStats };
