const { studentsData } = require('../mock-data/studentsData');

class StudentRepository {
  constructor() {
    this.students = [...studentsData];
  }

  async getAll({ search = '', className = '', semester = '' } = {}) {
    let result = [...this.students];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }

    if (className) {
      result = result.filter(s => s.className.toLowerCase() === className.toLowerCase());
    }

    if (semester) {
      result = result.filter(s => String(s.semester) === String(semester));
    }

    return result;
  }

  async getById(id) {
    return this.students.find(s => s.id === id || s.rollNumber === id) || null;
  }

  async getByClass(className) {
    return this.students.filter(s => s.className === className);
  }

  async create(studentData) {
    const newStudent = {
      id: `STU${String(this.students.length + 1).padStart(3, '0')}`,
      attendancePercentage: 100,
      cgpa: studentData.cgpa || 0,
      status: 'Active',
      enrolledSubjects: studentData.enrolledSubjects || [],
      ...studentData
    };
    this.students.unshift(newStudent);
    return newStudent;
  }

  async update(id, studentData) {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.students[index] = { ...this.students[index], ...studentData };
    return this.students[index];
  }

  async delete(id) {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.students.splice(index, 1);
    return true;
  }
}

module.exports = new StudentRepository();
