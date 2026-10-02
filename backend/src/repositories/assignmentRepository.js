import { assignments } from '../data/assignments.js';

export const assignmentRepository = {
  getAll({ facultyId, classVal, subjectCode } = {}) {
    let result = [...assignments];
    if (facultyId) result = result.filter(a => a.facultyId === facultyId);
    if (classVal) result = result.filter(a => a.class === classVal);
    if (subjectCode) result = result.filter(a => a.subjectCode === subjectCode);
    return result;
  },

  findById(id) {
    return assignments.find(a => a.id === id);
  },

  create(data) {
    const id = `ASN${String(assignments.length + 1).padStart(3, '0')}`;
    const newAssignment = {
      id,
      status: "Published",
      submissions: [],
      attachment: data.attachment || "Specification_Document.pdf",
      ...data
    };
    assignments.push(newAssignment);
    return newAssignment;
  },

  update(id, updates) {
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return null;
    assignments[index] = { ...assignments[index], ...updates };
    return assignments[index];
  },

  delete(id) {
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return false;
    assignments.splice(index, 1);
    return true;
  },

  gradeSubmission(assignmentId, submissionId, { marks, feedback }) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;
    const submission = assignment.submissions.find(s => s.submissionId === submissionId);
    if (!submission) return null;
    submission.marks = Number(marks);
    submission.feedback = feedback || "";
    submission.status = "Graded";
    return submission;
  }
};
