const db = require('../config/db');

/**
 * Log an administrative action to the activity_logs table
 * @param {string} action - Brief description of action, e.g. "New student added"
 * @param {string} details - Additional details
 * @param {string} entityType - e.g. 'student', 'faculty', 'department', 'course', 'subject', 'timetable'
 * @param {number} entityId - Primary key ID of the entity
 */
async function logActivity(action, details = '', entityType = null, entityId = null) {
  try {
    await db.query(
      `INSERT INTO activity_logs (action, details, entity_type, entity_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [action, details, entityType, entityId]
    );
  } catch (error) {
    // Non-blocking log failure
    console.error('Failed to log admin activity:', error.message);
  }
}

module.exports = { logActivity };
