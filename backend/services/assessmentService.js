const assessmentRepository = require('../repositories/assessmentRepository');
const studentRepository = require('../repositories/studentRepository');

class AssessmentService {
  async getAssessments(faculty, filters = {}) {
    return await assessmentRepository.getAll({
      facultyId: faculty.id,
      ...filters
    });
  }

  async getAssessmentById(faculty, id) {
    const item = await assessmentRepository.getById(id);
    if (!item || item.facultyId !== faculty.id) {
      const error = new Error('Assessment not found or unauthorized');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return item;
  }

  async createAssessment(faculty, data) {
    if (!faculty.assignedSubjects.includes(data.subjectCode)) {
      const error = new Error('You are not authorized for this subject');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }

    // Auto-populate enrolled students into results structure if not provided
    if (!data.results || data.results.length === 0) {
      const students = await studentRepository.getByClass(data.className);
      data.results = students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        rollNumber: s.rollNumber,
        marksObtained: null,
        remarks: ''
      }));
    }

    return await assessmentRepository.create({
      facultyId: faculty.id,
      ...data
    });
  }

  async updateAssessment(faculty, id, data) {
    await this.getAssessmentById(faculty, id);
    return await assessmentRepository.update(id, data);
  }

  async deleteAssessment(faculty, id) {
    await this.getAssessmentById(faculty, id);
    return await assessmentRepository.delete(id);
  }

  async updateMarks(faculty, id, results) {
    await this.getAssessmentById(faculty, id);
    return await assessmentRepository.updateMarks(id, results);
  }
}

module.exports = new AssessmentService();
