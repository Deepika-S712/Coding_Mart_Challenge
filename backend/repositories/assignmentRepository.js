const { assignmentsData } = require('../mock-data/assignmentsData');

class AssignmentRepository {
  constructor() {
    this.assignments = [...assignmentsData];
  }

  async getAll({ facultyId, subjectCode = '', status = '' } = {}) {
    let result = this.assignments.filter(a => a.facultyId === facultyId);

    if (subjectCode) {
      result = result.filter(a => a.subjectCode === subjectCode);
    }
    if (status) {
      result = result.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }

    return result.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }

  async getById(id) {
    return this.assignments.find(a => a.id === id) || null;
  }

  async create(data) {
    const newItem = {
      id: `ASN${String(this.assignments.length + 1).padStart(3, '0')}`,
      status: data.status || 'Draft',
      totalStudents: data.totalStudents || 6,
      submittedCount: 0,
      gradedCount: 0,
      submissions: [],
      ...data
    };
    this.assignments.unshift(newItem);
    return newItem;
  }

  async update(id, data) {
    const index = this.assignments.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.assignments[index] = { ...this.assignments[index], ...data };
    return this.assignments[index];
  }

  async delete(id) {
    const index = this.assignments.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.assignments.splice(index, 1);
    return true;
  }

  async gradeSubmission(assignmentId, submissionId, { score, feedback }) {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;

    const submission = assignment.submissions.find(s => s.submissionId === submissionId);
    if (!submission) return null;

    submission.score = Number(score);
    submission.feedback = feedback || '';
    submission.status = 'Graded';

    // Recalculate graded count
    assignment.gradedCount = assignment.submissions.filter(s => s.status === 'Graded').length;
    return submission;
  }
}

module.exports = new AssignmentRepository();
