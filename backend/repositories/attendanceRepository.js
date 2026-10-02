const { attendanceData } = require('../mock-data/attendanceData');

class AttendanceRepository {
  constructor() {
    this.records = [...attendanceData];
  }

  async getAll({ facultyId, date = '', subjectCode = '', className = '' } = {}) {
    let result = this.records.filter(r => r.facultyId === facultyId);

    if (date) {
      result = result.filter(r => r.date === date);
    }
    if (subjectCode) {
      result = result.filter(r => r.subjectCode === subjectCode);
    }
    if (className) {
      result = result.filter(r => r.className === className);
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    return this.records.find(r => r.id === id) || null;
  }

  async create(recordData) {
    const presentCount = recordData.records ? recordData.records.filter(r => r.status === 'Present').length : 0;
    const absentCount = recordData.records ? recordData.records.filter(r => r.status === 'Absent').length : 0;

    const newRecord = {
      id: `ATT${String(this.records.length + 1).padStart(3, '0')}`,
      status: recordData.status || 'Submitted',
      presentCount,
      absentCount,
      totalStudents: recordData.records ? recordData.records.length : 0,
      ...recordData
    };
    this.records.unshift(newRecord);
    return newRecord;
  }

  async update(id, recordData) {
    const index = this.records.findIndex(r => r.id === id);
    if (index === -1) return null;

    if (recordData.records) {
      recordData.presentCount = recordData.records.filter(r => r.status === 'Present').length;
      recordData.absentCount = recordData.records.filter(r => r.status === 'Absent').length;
      recordData.totalStudents = recordData.records.length;
    }

    this.records[index] = { ...this.records[index], ...recordData };
    return this.records[index];
  }

  async getStudentAttendanceSummary(studentId) {
    let totalClasses = 0;
    let attendedClasses = 0;

    for (const sheet of this.records) {
      const rec = sheet.records.find(r => r.studentId === studentId);
      if (rec) {
        totalClasses++;
        if (rec.status === 'Present') attendedClasses++;
      }
    }

    const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
    return { totalClasses, attendedClasses, percentage };
  }
}

module.exports = new AttendanceRepository();
