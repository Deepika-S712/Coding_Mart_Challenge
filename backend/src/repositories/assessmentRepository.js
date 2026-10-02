import { assessments } from '../data/assessments.js';

export const assessmentRepository = {
  getAll({ facultyId, classVal, subjectCode } = {}) {
    let result = [...assessments];
    if (facultyId) result = result.filter(a => a.facultyId === facultyId);
    if (classVal) result = result.filter(a => a.class === classVal);
    if (subjectCode) result = result.filter(a => a.subjectCode === subjectCode);
    return result;
  },

  findById(id) {
    return assessments.find(a => a.id === id);
  },

  create(data) {
    const id = `ASM${String(assessments.length + 1).padStart(3, '0')}`;
    const newAssessment = {
      id,
      marks: data.marks || [],
      ...data
    };
    assessments.push(newAssessment);
    return newAssessment;
  },

  update(id, updates) {
    const index = assessments.findIndex(a => a.id === id);
    if (index === -1) return null;
    assessments[index] = { ...assessments[index], ...updates };
    return assessments[index];
  },

  updateMarks(id, marksArray) {
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) return null;
    assessment.marks = marksArray;
    return assessment;
  },

  delete(id) {
    const index = assessments.findIndex(a => a.id === id);
    if (index === -1) return false;
    assessments.splice(index, 1);
    return true;
  }
};
