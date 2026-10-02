import { facultyList } from '../data/faculty.js';

export const facultyRepository = {
  getAll() {
    return [...facultyList];
  },
  
  findById(id) {
    return facultyList.find(f => f.id === id || f.employeeId === id);
  },

  findByEmail(email) {
    return facultyList.find(f => f.email.toLowerCase() === email.toLowerCase());
  },

  update(id, updates) {
    const index = facultyList.findIndex(f => f.id === id || f.employeeId === id);
    if (index === -1) return null;
    facultyList[index] = { ...facultyList[index], ...updates };
    return facultyList[index];
  }
};
