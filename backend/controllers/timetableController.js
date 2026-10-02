const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get timetable entries with filters
 * GET /api/admin/timetable
 */
async function getTimetable(req, res, next) {
  try {
    const { department_id, course_id, semester, day } = req.query;

    const params = [];
    const conditions = [];

    if (department_id) {
      params.push(parseInt(department_id, 10));
      conditions.push(`c.department_id = $${params.length}`);
    }

    if (course_id) {
      params.push(parseInt(course_id, 10));
      conditions.push(`t.course_id = $${params.length}`);
    }

    if (semester) {
      params.push(parseInt(semester, 10));
      conditions.push(`sub.semester = $${params.length}`);
    }

    if (day) {
      params.push(day);
      conditions.push(`LOWER(t.day) = LOWER($${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        t.id,
        t.day,
        TO_CHAR(t.start_time, 'HH24:MI') AS start_time,
        TO_CHAR(t.end_time, 'HH24:MI') AS end_time,
        t.course_id,
        c.course_name,
        c.course_code,
        c.department_id,
        d.department_name,
        d.department_code,
        t.subject_id,
        sub.subject_name,
        sub.subject_code,
        sub.semester,
        t.faculty_id,
        f.name AS faculty_name,
        f.faculty_id AS faculty_code,
        f.designation AS faculty_designation,
        t.room_number,
        t.created_at,
        t.updated_at
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
      JOIN departments d ON c.department_id = d.id
      JOIN subjects sub ON t.subject_id = sub.id
      JOIN faculty f ON t.faculty_id = f.id
      ${whereClause}
      ORDER BY 
        CASE t.day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
          ELSE 8
        END,
        t.start_time ASC
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
 * Validate Timetable Conflicts
 * Checks both faculty double-booking and room double-booking
 */
async function checkConflict(day, start_time, end_time, faculty_id, room_number, excludeId = null) {
  // 1. Faculty Conflict Check
  let facultyConflictSql = `
    SELECT 
      t.id,
      t.day,
      TO_CHAR(t.start_time, 'HH24:MI') AS start_time,
      TO_CHAR(t.end_time, 'HH24:MI') AS end_time,
      t.room_number,
      f.name AS faculty_name,
      sub.subject_name
    FROM timetable t
    JOIN faculty f ON t.faculty_id = f.id
    JOIN subjects sub ON t.subject_id = sub.id
    WHERE t.day = $1
      AND t.faculty_id = $2
      AND (t.start_time < $4::time AND t.end_time > $3::time)
  `;
  const facultyParams = [day, parseInt(faculty_id, 10), start_time, end_time];

  if (excludeId) {
    facultyConflictSql += ` AND t.id != $5`;
    facultyParams.push(parseInt(excludeId, 10));
  }

  const facultyRes = await db.query(facultyConflictSql, facultyParams);
  if (facultyRes.rows.length > 0) {
    const c = facultyRes.rows[0];
    return {
      hasConflict: true,
      type: 'faculty',
      message: `Faculty conflict: ${c.faculty_name} is already assigned to "${c.subject_name}" in ${c.room_number} on ${c.day} between ${c.start_time} and ${c.end_time}.`,
    };
  }

  // 2. Room Conflict Check
  let roomConflictSql = `
    SELECT 
      t.id,
      t.day,
      TO_CHAR(t.start_time, 'HH24:MI') AS start_time,
      TO_CHAR(t.end_time, 'HH24:MI') AS end_time,
      t.room_number,
      f.name AS faculty_name,
      sub.subject_name
    FROM timetable t
    JOIN faculty f ON t.faculty_id = f.id
    JOIN subjects sub ON t.subject_id = sub.id
    WHERE t.day = $1
      AND LOWER(t.room_number) = LOWER($2)
      AND (t.start_time < $4::time AND t.end_time > $3::time)
  `;
  const roomParams = [day, room_number.trim(), start_time, end_time];

  if (excludeId) {
    roomConflictSql += ` AND t.id != $5`;
    roomParams.push(parseInt(excludeId, 10));
  }

  const roomRes = await db.query(roomConflictSql, roomParams);
  if (roomRes.rows.length > 0) {
    const c = roomRes.rows[0];
    return {
      hasConflict: true,
      type: 'room',
      message: `Room conflict: Room ${c.room_number} is already booked for "${c.subject_name}" (${c.faculty_name}) on ${c.day} between ${c.start_time} and ${c.end_time}.`,
    };
  }

  return { hasConflict: false };
}

/**
 * Create Timetable Entry with conflict validation
 * POST /api/admin/timetable
 */
async function createTimetable(req, res, next) {
  try {
    const { day, start_time, end_time, course_id, subject_id, faculty_id, room_number } = req.body;

    if (!day || !start_time || !end_time || !course_id || !subject_id || !faculty_id || !room_number) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Day, Start Time, End Time, Course, Subject, Faculty, Room Number) are required.',
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time.',
      });
    }

    // Run Conflict Validation
    const conflict = await checkConflict(day, start_time, end_time, faculty_id, room_number);
    if (conflict.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflict.message,
        conflictType: conflict.type,
      });
    }

    const insertSql = `
      INSERT INTO timetable (day, start_time, end_time, course_id, subject_id, faculty_id, room_number, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(insertSql, [
      day,
      start_time,
      end_time,
      parseInt(course_id, 10),
      parseInt(subject_id, 10),
      parseInt(faculty_id, 10),
      room_number.trim(),
    ]);

    const createdSlot = result.rows[0];
    await logActivity('Timetable created', `Scheduled slot on ${day} (${start_time} - ${end_time}) in ${room_number}`, 'timetable', createdSlot.id);

    return res.status(201).json({
      success: true,
      message: 'Timetable entry created successfully.',
      data: createdSlot,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Timetable Entry with conflict validation
 * PUT /api/admin/timetable/:id
 */
async function updateTimetable(req, res, next) {
  try {
    const { id } = req.params;
    const { day, start_time, end_time, course_id, subject_id, faculty_id, room_number } = req.body;

    const existing = await db.query('SELECT * FROM timetable WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    }

    const current = existing.rows[0];

    const targetDay = day || current.day;
    const targetStart = start_time || current.start_time;
    const targetEnd = end_time || current.end_time;
    const targetFaculty = faculty_id ? parseInt(faculty_id, 10) : current.faculty_id;
    const targetRoom = room_number ? room_number.trim() : current.room_number;
    const targetCourse = course_id ? parseInt(course_id, 10) : current.course_id;
    const targetSubject = subject_id ? parseInt(subject_id, 10) : current.subject_id;

    if (targetStart >= targetEnd) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time.',
      });
    }

    // Run Conflict Validation excluding current record
    const conflict = await checkConflict(targetDay, targetStart, targetEnd, targetFaculty, targetRoom, id);
    if (conflict.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflict.message,
        conflictType: conflict.type,
      });
    }

    const updateSql = `
      UPDATE timetable
      SET 
        day = $1,
        start_time = $2,
        end_time = $3,
        course_id = $4,
        subject_id = $5,
        faculty_id = $6,
        room_number = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const result = await db.query(updateSql, [
      targetDay,
      targetStart,
      targetEnd,
      targetCourse,
      targetSubject,
      targetFaculty,
      targetRoom,
      id,
    ]);

    const updatedSlot = result.rows[0];
    await logActivity('Timetable changed', `Updated schedule on ${targetDay} for room ${targetRoom}`, 'timetable', updatedSlot.id);

    return res.status(200).json({
      success: true,
      message: 'Timetable entry updated successfully.',
      data: updatedSlot,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Timetable Entry
 * DELETE /api/admin/timetable/:id
 */
async function deleteTimetable(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT day, room_number FROM timetable WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    }

    const { day, room_number } = existing.rows[0];
    await db.query('DELETE FROM timetable WHERE id = $1', [id]);

    await logActivity('Timetable slot removed', `Removed schedule slot on ${day} in ${room_number}`, 'timetable', parseInt(id, 10));

    return res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable,
};
