const assignmentRepository = require('../repositories/assignmentRepository');

class AssignmentService {
  async getAssignments(faculty, filters = {}) {
    return await assignmentRepository.getAll({
      facultyId: faculty.id,
      ...filters
    });
  }

  async getAssignmentById(faculty, id) {
    const item = await assignmentRepository.getById(id);
    if (!item || item.facultyId !== faculty.id) {
      const error = new Error('Assignment not found or unauthorized');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return item;
  }

  async createAssignment(faculty, data) {
    if (!faculty.assignedSubjects.includes(data.subjectCode)) {
      const error = new Error('You are not authorized for this subject');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }

    return await assignmentRepository.create({
      facultyId: faculty.id,
      ...data
    });
  }

  async updateAssignment(faculty, id, data) {
    await this.getAssignmentById(faculty, id);
    return await assignmentRepository.update(id, data);
  }

  async deleteAssignment(faculty, id) {
    await this.getAssignmentById(faculty, id);
    return await assignmentRepository.delete(id);
  }

  async gradeSubmission(faculty, assignmentId, submissionId, gradeData) {
    await this.getAssignmentById(faculty, assignmentId);
    const updated = await assignmentRepository.gradeSubmission(assignmentId, submissionId, gradeData);
    if (!updated) {
      const error = new Error('Submission not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }
}

module.exports = new AssignmentService();
