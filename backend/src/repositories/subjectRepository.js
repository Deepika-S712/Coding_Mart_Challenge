import { subjects } from '../data/subjects.js';

export const subjectRepository = {
  getAll({ facultyId, classVal } = {}) {
    let result = [...subjects];
    if (facultyId) {
      result = result.filter(s => s.facultyId === facultyId);
    }
    if (classVal) {
      result = result.filter(s => s.class === classVal);
    }
    return result;
  },

  findById(id) {
    return subjects.find(s => s.id === id || s.code === id);
  }
};
