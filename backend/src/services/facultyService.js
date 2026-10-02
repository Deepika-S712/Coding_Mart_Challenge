import { facultyRepository } from '../repositories/facultyRepository.js';
import { studentRepository } from '../repositories/studentRepository.js';
import { subjectRepository } from '../repositories/subjectRepository.js';
import { attendanceRepository } from '../repositories/attendanceRepository.js';
import { timetableRepository } from '../repositories/timetableRepository.js';
import { contentRepository } from '../repositories/contentRepository.js';
import { assignmentRepository } from '../repositories/assignmentRepository.js';
import { assessmentRepository } from '../repositories/assessmentRepository.js';
import { examRepository } from '../repositories/examRepository.js';
import { noticeRepository } from '../repositories/noticeRepository.js';

export const facultyService = {
  getDashboard(facultyId) {
    const faculty = facultyRepository.findById(facultyId) || facultyRepository.findById("FAC001");
    const subjects = subjectRepository.getAll({ facultyId: faculty.id });
    const students = studentRepository.getAll();
    const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    const validDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(todayDay) ? todayDay : "Monday";
    const todayClasses = timetableRepository.getAll({ facultyId: faculty.id, day: validDay });

    const assignments = assignmentRepository.getAll({ facultyId: faculty.id });
    let pendingEvaluations = 0;
    assignments.forEach(a => {
      if (a.submissions) {
        pendingEvaluations += a.submissions.filter(s => s.status === "Pending Evaluation").length;
      }
    });

    const recentNotices = noticeRepository.getAllNotices({ facultyId: faculty.id }).slice(0, 3);

    return {
      faculty: {
        id: faculty.id,
        name: faculty.name,
        designation: faculty.designation,
        department: faculty.department
      },
      kpis: {
        assignedSubjectsCount: subjects.length,
        totalStudentsCount: students.length,
        todayClassesCount: todayClasses.length,
        pendingEvaluationsCount: pendingEvaluations
      },
      assignedSubjects: subjects,
      todayClasses,
      pendingEvaluationsList: assignments.filter(a => (a.submissions || []).some(s => s.status === "Pending Evaluation")),
      recentNotices
    };
  },

  getProfile(facultyId) {
    const faculty = facultyRepository.findById(facultyId) || facultyRepository.findById("FAC001");
    if (!faculty) throw { status: 404, code: "FACULTY_NOT_FOUND", message: "Faculty not found." };
    return faculty;
  },

  updateProfile(facultyId, updates) {
    const faculty = facultyRepository.update(facultyId, updates);
    if (!faculty) throw { status: 404, code: "FACULTY_NOT_FOUND", message: "Faculty not found." };
    return faculty;
  },

  getSubjects(facultyId) {
    return subjectRepository.getAll({ facultyId: facultyId || "FAC001" });
  },

  // Students CRUD
  getStudents(query) {
    return studentRepository.getAll(query);
  },

  createStudent(studentData) {
    if (!studentData.name || !studentData.email || !studentData.department) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Name, email, and department are required." };
    }
    return studentRepository.create(studentData);
  },

  updateStudent(id, updates) {
    const student = studentRepository.update(id, updates);
    if (!student) throw { status: 404, code: "STUDENT_NOT_FOUND", message: "Student not found." };
    return student;
  },

  deleteStudent(id) {
    const deleted = studentRepository.delete(id);
    if (!deleted) throw { status: 404, code: "STUDENT_NOT_FOUND", message: "Student not found." };
    return { success: true };
  },

  // Attendance
  getAttendance(query) {
    return attendanceRepository.getAllSessions(query);
  },

  saveAttendance(sessionData) {
    if (!sessionData.date || !sessionData.subjectCode || !sessionData.records) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Date, subject code, and student records are required." };
    }
    const total = sessionData.records.length;
    const present = sessionData.records.filter(r => r.status === "PRESENT").length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return attendanceRepository.createSession({
      ...sessionData,
      totalCount: total,
      presentCount: present,
      absentCount: total - present,
      percentage: Number(percentage)
    });
  },

  updateAttendance(id, sessionData) {
    const total = sessionData.records ? sessionData.records.length : 0;
    const present = sessionData.records ? sessionData.records.filter(r => r.status === "PRESENT").length : 0;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    const updated = attendanceRepository.updateSession(id, {
      ...sessionData,
      totalCount: total,
      presentCount: present,
      absentCount: total - present,
      percentage: Number(percentage)
    });
    if (!updated) throw { status: 404, code: "SESSION_NOT_FOUND", message: "Attendance session not found." };
    return updated;
  },

  // Timetable
  getTimetable(query) {
    return timetableRepository.getAll(query);
  },

  createTimetableSlot(slotData) {
    if (!slotData.day || !slotData.time || !slotData.subjectCode) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Day, time, and subject code are required." };
    }
    return timetableRepository.create(slotData);
  },

  updateTimetableSlot(id, updates) {
    const slot = timetableRepository.update(id, updates);
    if (!slot) throw { status: 404, code: "SLOT_NOT_FOUND", message: "Timetable slot not found." };
    return slot;
  },

  deleteTimetableSlot(id) {
    const deleted = timetableRepository.delete(id);
    if (!deleted) throw { status: 404, code: "SLOT_NOT_FOUND", message: "Timetable slot not found." };
    return { success: true };
  },

  // Content
  getContent(query) {
    return contentRepository.getAll(query);
  },

  createContent(data) {
    if (!data.title || !data.subjectCode || !data.contentType) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Title, subject code, and content type are required." };
    }
    return contentRepository.create(data);
  },

  updateContent(id, updates) {
    const content = contentRepository.update(id, updates);
    if (!content) throw { status: 404, code: "CONTENT_NOT_FOUND", message: "Content not found." };
    return content;
  },

  deleteContent(id) {
    const deleted = contentRepository.delete(id);
    if (!deleted) throw { status: 404, code: "CONTENT_NOT_FOUND", message: "Content not found." };
    return { success: true };
  },

  // Assignments
  getAssignments(query) {
    return assignmentRepository.getAll(query);
  },

  createAssignment(data) {
    if (!data.title || !data.subjectCode || !data.dueDate) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Title, subject code, and due date are required." };
    }
    return assignmentRepository.create(data);
  },

  updateAssignment(id, updates) {
    const assignment = assignmentRepository.update(id, updates);
    if (!assignment) throw { status: 404, code: "ASSIGNMENT_NOT_FOUND", message: "Assignment not found." };
    return assignment;
  },

  deleteAssignment(id) {
    const deleted = assignmentRepository.delete(id);
    if (!deleted) throw { status: 404, code: "ASSIGNMENT_NOT_FOUND", message: "Assignment not found." };
    return { success: true };
  },

  gradeSubmission(assignmentId, submissionId, gradeData) {
    const submission = assignmentRepository.gradeSubmission(assignmentId, submissionId, gradeData);
    if (!submission) throw { status: 404, code: "SUBMISSION_NOT_FOUND", message: "Submission or assignment not found." };
    return submission;
  },

  // Assessments
  getAssessments(query) {
    const list = assessmentRepository.getAll(query);
    // Augment with calculated stats
    return list.map(a => {
      const marks = a.marks || [];
      const count = marks.length;
      if (count === 0) {
        return { ...a, stats: { average: 0, highest: 0, lowest: 0, passCount: 0, totalCount: 0 } };
      }
      const values = marks.map(m => m.marksObtained);
      const total = values.reduce((sum, v) => sum + v, 0);
      const average = (total / count).toFixed(1);
      const highest = Math.max(...values);
      const lowest = Math.min(...values);
      const passMarks = a.passMarks || (a.maxMarks * 0.4);
      const passCount = values.filter(v => v >= passMarks).length;

      return {
        ...a,
        stats: {
          average: Number(average),
          highest,
          lowest,
          passCount,
          totalCount: count,
          passRate: Number(((passCount / count) * 100).toFixed(1))
        }
      };
    });
  },

  createAssessment(data) {
    if (!data.title || !data.type || !data.subjectCode) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Title, assessment type, and subject are required." };
    }
    return assessmentRepository.create(data);
  },

  updateAssessment(id, updates) {
    const assessment = assessmentRepository.update(id, updates);
    if (!assessment) throw { status: 404, code: "ASSESSMENT_NOT_FOUND", message: "Assessment not found." };
    return assessment;
  },

  updateAssessmentMarks(id, marksArray) {
    const assessment = assessmentRepository.updateMarks(id, marksArray);
    if (!assessment) throw { status: 404, code: "ASSESSMENT_NOT_FOUND", message: "Assessment not found." };
    return assessment;
  },

  deleteAssessment(id) {
    const deleted = assessmentRepository.delete(id);
    if (!deleted) throw { status: 404, code: "ASSESSMENT_NOT_FOUND", message: "Assessment not found." };
    return { success: true };
  },

  // Exam Scores
  getExams(facultyId) {
    return examRepository.getAllExamScores({ facultyId });
  },

  getExamScoresById(id) {
    const exam = examRepository.getExamScoresById(id);
    if (!exam) throw { status: 404, code: "EXAM_NOT_FOUND", message: "Exam record not found." };
    return exam;
  },

  saveDraftExamScores(id, scoresList) {
    const result = examRepository.saveDraftScores(id, scoresList);
    if (result.error === "EXAM_NOT_FOUND") {
      throw { status: 404, code: "EXAM_NOT_FOUND", message: "Exam record not found." };
    }
    if (result.error === "EXAM_ALREADY_SUBMITTED") {
      throw { status: 403, code: "EXAM_LOCKED", message: "Scores have already been submitted and are locked for editing." };
    }
    return result;
  },

  updateSingleExamScore(id, studentId, scoreData) {
    const result = examRepository.updateSingleScore(id, studentId, scoreData);
    if (result.error === "EXAM_NOT_FOUND") {
      throw { status: 404, code: "EXAM_NOT_FOUND", message: "Exam record not found." };
    }
    if (result.error === "EXAM_ALREADY_SUBMITTED") {
      throw { status: 403, code: "EXAM_LOCKED", message: "Scores are locked and cannot be modified." };
    }
    return result;
  },

  submitFinalExamScores(id) {
    const result = examRepository.submitFinalScores(id);
    if (result.error === "EXAM_NOT_FOUND") {
      throw { status: 404, code: "EXAM_NOT_FOUND", message: "Exam record not found." };
    }
    if (result.error === "ALREADY_SUBMITTED") {
      throw { status: 400, code: "ALREADY_SUBMITTED", message: "Exam scores were already submitted." };
    }
    return result;
  },

  // Notices
  getNotices(query) {
    return noticeRepository.getAllNotices(query);
  },

  createNotice(data) {
    if (!data.title || !data.content || !data.category) {
      throw { status: 422, code: "VALIDATION_ERROR", message: "Title, content, and category are required." };
    }
    return noticeRepository.createNotice(data);
  },

  updateNotice(id, updates) {
    const notice = noticeRepository.updateNotice(id, updates);
    if (!notice) throw { status: 404, code: "NOTICE_NOT_FOUND", message: "Notice not found." };
    return notice;
  },

  toggleNoticePin(id) {
    const notice = noticeRepository.togglePin(id);
    if (!notice) throw { status: 404, code: "NOTICE_NOT_FOUND", message: "Notice not found." };
    return notice;
  },

  deleteNotice(id) {
    const deleted = noticeRepository.deleteNotice(id);
    if (!deleted) throw { status: 404, code: "NOTICE_NOT_FOUND", message: "Notice not found." };
    return { success: true };
  },

  // Comprehensive Faculty Reports
  getReports(facultyId) {
    const students = studentRepository.getAll();
    const subjects = subjectRepository.getAll({ facultyId: facultyId || "FAC001" });
    const assessments = assessmentRepository.getAll({ facultyId: facultyId || "FAC001" });
    const assignments = assignmentRepository.getAll({ facultyId: facultyId || "FAC001" });

    // Aggregate student performance metrics
    const studentPerformance = students.map(s => {
      return {
        id: s.id,
        name: s.name,
        rollNo: s.rollNo,
        class: s.class,
        attendanceRate: s.attendanceRate,
        cgpa: s.cgpa,
        status: s.attendanceRate >= 85 ? "Good Standing" : s.attendanceRate >= 75 ? "Warning" : "Critical"
      };
    });

    // Subject performance metrics
    const subjectPerformance = subjects.map(sub => {
      return {
        code: sub.code,
        name: sub.name,
        class: sub.class,
        credits: sub.credits,
        completionRate: sub.syllabusCompletion,
        averageAttendance: 90.5,
        assessmentsHeld: assessments.filter(a => a.subjectCode === sub.code).length,
        assignmentsGiven: assignments.filter(a => a.subjectCode === sub.code).length
      };
    });

    return {
      studentPerformance,
      subjectPerformance,
      summary: {
        totalStudents: students.length,
        averageClassAttendance: 88.5,
        totalSubjects: subjects.length,
        totalAssessments: assessments.length,
        totalAssignments: assignments.length
      }
    };
  }
};
