const db = require('../config/db');

/**
 * Get Comprehensive Reports & Analytics
 * GET /api/admin/reports
 */
async function getReports(req, res, next) {
  try {
    // 1. Student Reports
    const totalStudentsRes = await db.query('SELECT COUNT(*)::int AS count FROM students');
    
    const studentsByDeptRes = await db.query(`
      SELECT 
        d.id,
        d.department_name,
        d.department_code,
        COUNT(s.id)::int AS count
      FROM departments d
      LEFT JOIN students s ON s.department_id = d.id
      GROUP BY d.id, d.department_name, d.department_code
      ORDER BY count DESC, d.department_name ASC
    `);

    const studentsByCourseRes = await db.query(`
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        COUNT(s.id)::int AS count
      FROM courses c
      LEFT JOIN students s ON s.course_id = c.id
      GROUP BY c.id, c.course_name, c.course_code
      ORDER BY count DESC
    `);

    const studentsByYearRes = await db.query(`
      SELECT 
        year,
        COUNT(id)::int AS count
      FROM students
      GROUP BY year
      ORDER BY year ASC
    `);

    const studentsByStatusRes = await db.query(`
      SELECT 
        status,
        COUNT(id)::int AS count
      FROM students
      GROUP BY status
    `);

    // 2. Faculty Reports
    const totalFacultyRes = await db.query('SELECT COUNT(*)::int AS count FROM faculty');

    const facultyByDeptRes = await db.query(`
      SELECT 
        d.id,
        d.department_name,
        d.department_code,
        COUNT(f.id)::int AS count
      FROM departments d
      LEFT JOIN faculty f ON f.department_id = d.id
      GROUP BY d.id, d.department_name, d.department_code
      ORDER BY count DESC, d.department_name ASC
    `);

    const facultyByDesignationRes = await db.query(`
      SELECT 
        designation,
        COUNT(id)::int AS count
      FROM faculty
      GROUP BY designation
      ORDER BY count DESC
    `);

    // 3. Course Reports
    const coursesByDeptRes = await db.query(`
      SELECT 
        d.department_name,
        COUNT(c.id)::int AS count
      FROM departments d
      LEFT JOIN courses c ON c.department_id = d.id
      GROUP BY d.id, d.department_name
      ORDER BY count DESC
    `);

    // 4. Subject Reports
    const subjectsByCourseRes = await db.query(`
      SELECT 
        c.course_name,
        c.course_code,
        COUNT(s.id)::int AS count
      FROM courses c
      LEFT JOIN subjects s ON s.course_id = c.id
      GROUP BY c.id, c.course_name, c.course_code
      ORDER BY count DESC
    `);

    return res.status(200).json({
      success: true,
      data: {
        students: {
          total: totalStudentsRes.rows[0].count,
          byDepartment: studentsByDeptRes.rows,
          byCourse: studentsByCourseRes.rows,
          byYear: studentsByYearRes.rows,
          byStatus: studentsByStatusRes.rows,
        },
        faculty: {
          total: totalFacultyRes.rows[0].count,
          byDepartment: facultyByDeptRes.rows,
          byDesignation: facultyByDesignationRes.rows,
        },
        courses: {
          byDepartment: coursesByDeptRes.rows,
        },
        subjects: {
          byCourse: subjectsByCourseRes.rows,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export raw records for CSV download
 * GET /api/admin/reports/export/:entity
 */
async function exportCsv(req, res, next) {
  try {
    const { entity } = req.params;

    let sql = '';
    let filename = 'export.csv';

    switch (entity) {
      case 'students':
        filename = 'students_report.csv';
        sql = `
          SELECT 
            s.student_id AS "Student ID",
            s.name AS "Name",
            s.email AS "Email",
            s.phone AS "Phone",
            s.gender AS "Gender",
            TO_CHAR(s.date_of_birth, 'YYYY-MM-DD') AS "Date of Birth",
            d.department_name AS "Department",
            c.course_name AS "Course",
            s.year AS "Year",
            TO_CHAR(s.admission_date, 'YYYY-MM-DD') AS "Admission Date",
            s.status AS "Status"
          FROM students s
          LEFT JOIN departments d ON s.department_id = d.id
          LEFT JOIN courses c ON s.course_id = c.id
          ORDER BY s.student_id ASC
        `;
        break;

      case 'faculty':
        filename = 'faculty_report.csv';
        sql = `
          SELECT 
            f.faculty_id AS "Faculty ID",
            f.name AS "Name",
            f.email AS "Email",
            f.phone AS "Phone",
            f.gender AS "Gender",
            d.department_name AS "Department",
            f.designation AS "Designation",
            TO_CHAR(f.joining_date, 'YYYY-MM-DD') AS "Joining Date",
            f.status AS "Status"
          FROM faculty f
          LEFT JOIN departments d ON f.department_id = d.id
          ORDER BY f.faculty_id ASC
        `;
        break;

      case 'courses':
        filename = 'courses_report.csv';
        sql = `
          SELECT 
            c.course_code AS "Course Code",
            c.course_name AS "Course Name",
            d.department_name AS "Department",
            c.duration AS "Duration",
            c.degree_type AS "Degree Type",
            c.status AS "Status"
          FROM courses c
          LEFT JOIN departments d ON c.department_id = d.id
          ORDER BY c.course_code ASC
        `;
        break;

      case 'timetable':
        filename = 'timetable_report.csv';
        sql = `
          SELECT 
            t.day AS "Day",
            TO_CHAR(t.start_time, 'HH24:MI') AS "Start Time",
            TO_CHAR(t.end_time, 'HH24:MI') AS "End Time",
            c.course_name AS "Course",
            sub.subject_name AS "Subject",
            f.name AS "Faculty",
            t.room_number AS "Room Number"
          FROM timetable t
          JOIN courses c ON t.course_id = c.id
          JOIN subjects sub ON t.subject_id = sub.id
          JOIN faculty f ON t.faculty_id = f.id
          ORDER BY t.day, t.start_time ASC
        `;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid export entity.' });
    }

    const result = await db.query(sql);
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(200).send('');
    }

    // Convert rows to CSV format
    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      const line = headers.map(h => {
        let val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvLines.push(line.join(','));
    }

    const csvContent = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

module.exports = { getReports, exportCsv };
