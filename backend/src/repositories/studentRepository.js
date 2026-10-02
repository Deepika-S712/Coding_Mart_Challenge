import { students } from '../data/students.js';

export const studentRepository = {
  getAll({ search, department, classVal } = {}) {
    let result = [...students];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    if (department) {
      result = result.filter(s => s.department.toLowerCase() === department.toLowerCase());
    }
    if (classVal) {
      result = result.filter(s => s.class.toLowerCase() === classVal.toLowerCase());
    }
    return result;
  },

  findById(id) {
    return students.find(s => s.id === id || s.rollNo === id);
  },

  findByEmail(email) {
    return students.find(s => s.email.toLowerCase() === email.toLowerCase());
  },

  create(studentData) {
    const newId = `STU${String(students.length + 1).padStart(3, '0')}`;
    const newRollNo = `21CS${String(students.length + 1).padStart(3, '0')}`;
    const newStudent = {
      id: newId,
      rollNo: newRollNo,
      admissionYear: new Date().getFullYear(),
      attendanceRate: 100,
      cgpa: 0.0,
      ...studentData
    };
    students.push(newStudent);
    return newStudent;
  },

  update(id, updates) {
    const index = students.findIndex(s => s.id === id || s.rollNo === id);
    if (index === -1) return null;
    students[index] = { ...students[index], ...updates };
    return students[index];
  },

  delete(id) {
    const index = students.findIndex(s => s.id === id || s.rollNo === id);
    if (index === -1) return false;
    students.splice(index, 1);
    return true;
  }
};
