const { assessmentsData } = require('../mock-data/assessmentsData');

class AssessmentRepository {
  constructor() {
    this.assessments = [...assessmentsData];
  }

  async getAll({ facultyId, subjectCode = '', className = '' } = {}) {
    let result = this.assessments.filter(a => a.facultyId === facultyId);

    if (subjectCode) {
      result = result.filter(a => a.subjectCode === subjectCode);
    }
    if (className) {
      result = result.filter(a => a.className === className);
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    return this.assessments.find(a => a.id === id) || null;
  }

  async create(data) {
    const newItem = {
      id: `ASM${String(this.assessments.length + 1).padStart(3, '0')}`,
      status: data.status || 'Scheduled',
      marksSubmitted: false,
      results: data.results || [],
      ...data
    };
    this.assessments.unshift(newItem);
    return newItem;
  }

  async update(id, data) {
    const index = this.assessments.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.assessments[index] = { ...this.assessments[index], ...data };
    return this.assessments[index];
  }

  async delete(id) {
    const index = this.assessments.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.assessments.splice(index, 1);
    return true;
  }

  async updateMarks(id, results) {
    const assessment = this.assessments.find(a => a.id === id);
    if (!assessment) return null;
    assessment.results = results;
    assessment.marksSubmitted = true;
    assessment.status = 'Completed';
    return assessment;
  }
}

module.exports = new AssessmentRepository();
