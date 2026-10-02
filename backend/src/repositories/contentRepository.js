import { courseContent } from '../data/content.js';

export const contentRepository = {
  getAll({ facultyId, classVal, subjectCode, contentType, search } = {}) {
    let result = [...courseContent];
    if (facultyId) result = result.filter(c => c.facultyId === facultyId);
    if (classVal) result = result.filter(c => c.class === classVal);
    if (subjectCode) result = result.filter(c => c.subjectCode === subjectCode);
    if (contentType) result = result.filter(c => c.contentType.toLowerCase() === contentType.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.subjectCode.toLowerCase().includes(q)
      );
    }
    return result;
  },

  findById(id) {
    return courseContent.find(c => c.id === id);
  },

  create(data) {
    const id = `CNT${String(courseContent.length + 1).padStart(3, '0')}`;
    const newContent = {
      id,
      uploadedDate: new Date().toISOString().split('T')[0],
      fileSize: data.fileSize || "2.5 MB",
      ...data
    };
    courseContent.unshift(newContent);
    return newContent;
  },

  update(id, updates) {
    const index = courseContent.findIndex(c => c.id === id);
    if (index === -1) return null;
    courseContent[index] = { ...courseContent[index], ...updates };
    return courseContent[index];
  },

  delete(id) {
    const index = courseContent.findIndex(c => c.id === id);
    if (index === -1) return false;
    courseContent.splice(index, 1);
    return true;
  }
};
