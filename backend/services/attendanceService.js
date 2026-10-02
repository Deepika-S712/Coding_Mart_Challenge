const attendanceRepository = require('../repositories/attendanceRepository');
const studentRepository = require('../repositories/studentRepository');

class AttendanceService {
  async getAttendanceSheets(faculty, filters = {}) {
    return await attendanceRepository.getAll({
      facultyId: faculty.id,
      ...filters
    });
  }

  async getAttendanceById(faculty, id) {
    const sheet = await attendanceRepository.getById(id);
    if (!sheet) return null;
    if (sheet.facultyId !== faculty.id) {
      const error = new Error('Unauthorized to access this attendance sheet');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }
    return sheet;
  }

  async markAttendance(faculty, data) {
    if (!faculty.assignedSubjects.includes(data.subjectCode)) {
      const error = new Error('You are not assigned to this subject');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }

    const payload = {
      facultyId: faculty.id,
      date: data.date || new Date().toISOString().split('T')[0],
      subjectCode: data.subjectCode,
      subjectName: data.subjectName || data.subjectCode,
      className: data.className,
      status: data.status || 'Submitted',
      records: data.records
    };

    const created = await attendanceRepository.create(payload);

    // Update students' running attendance % if applicable
    for (const record of data.records) {
      const stats = await attendanceRepository.getStudentAttendanceSummary(record.studentId);
      await studentRepository.update(record.studentId, {
        attendancePercentage: stats.percentage
      });
    }

    return created;
  }

  async updateAttendance(faculty, id, data) {
    await this.getAttendanceById(faculty, id);
    const updated = await attendanceRepository.update(id, data);

    if (data.records) {
      for (const record of data.records) {
        const stats = await attendanceRepository.getStudentAttendanceSummary(record.studentId);
        await studentRepository.update(record.studentId, {
          attendancePercentage: stats.percentage
        });
      }
    }

    return updated;
  }
}

module.exports = new AttendanceService();
