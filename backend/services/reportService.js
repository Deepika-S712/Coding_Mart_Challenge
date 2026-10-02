const attendanceRepository = require('../repositories/attendanceRepository');
const studentRepository = require('../repositories/studentRepository');
const assignmentRepository = require('../repositories/assignmentRepository');
const assessmentRepository = require('../repositories/assessmentRepository');
const examRepository = require('../repositories/examRepository');
const facultyRepository = require('../repositories/facultyRepository');

class ReportService {
  async getAttendanceReport(faculty) {
    const sheets = await attendanceRepository.getAll({ facultyId: faculty.id });
    const students = await studentRepository.getAll();

    const summaryBySubject = {};
    for (const sheet of sheets) {
      if (!summaryBySubject[sheet.subjectCode]) {
        summaryBySubject[sheet.subjectCode] = {
          subjectCode: sheet.subjectCode,
          subjectName: sheet.subjectName,
          classesConducted: 0,
          totalPresentMarks: 0,
          totalPossibleMarks: 0
        };
      }
      summaryBySubject[sheet.subjectCode].classesConducted++;
      summaryBySubject[sheet.subjectCode].totalPresentMarks += sheet.presentCount;
      summaryBySubject[sheet.subjectCode].totalPossibleMarks += sheet.totalStudents;
    }

    const subjectStats = Object.values(summaryBySubject).map(item => ({
      ...item,
      averageAttendanceRate: item.totalPossibleMarks > 0 
        ? Math.round((item.totalPresentMarks / item.totalPossibleMarks) * 100) 
        : 100
    }));

    const studentList = students.map(s => ({
      studentId: s.id,
      rollNumber: s.rollNumber,
      name: s.name,
      className: s.className,
      attendancePercentage: s.attendancePercentage,
      status: s.attendancePercentage >= 75 ? 'Regular' : 'Shortage'
    }));

    return {
      totalSheets: sheets.length,
      subjectStats,
      studentList
    };
  }

  async getMarksReport(faculty) {
    const exams = await examRepository.getAllExams();
    const midExam = await examRepository.getExamById('EXAM-2026-MID');

    const subjectBreakdown = (midExam ? midExam.subjects : []).map(sub => {
      const validScores = sub.scores.filter(s => s.marks !== null);
      const totalMarks = validScores.reduce((acc, curr) => acc + curr.marks, 0);
      const avg = validScores.length > 0 ? (totalMarks / validScores.length).toFixed(1) : 0;
      const highest = validScores.length > 0 ? Math.max(...validScores.map(s => s.marks)) : 0;
      const lowest = validScores.length > 0 ? Math.min(...validScores.map(s => s.marks)) : 0;

      return {
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        className: sub.className,
        maxMarks: sub.maxMarks,
        averageMarks: Number(avg),
        highestMarks: highest,
        lowestMarks: lowest,
        totalEvaluated: validScores.length,
        status: sub.submissionStatus
      };
    });

    return {
      examTitle: midExam ? midExam.name : 'Mid-Semester Exam',
      semester: 'Semester 5',
      subjectBreakdown
    };
  }

  async getAssignmentReport(faculty) {
    const assignments = await assignmentRepository.getAll({ facultyId: faculty.id });

    const items = assignments.map(a => {
      const rate = a.totalStudents > 0 ? Math.round((a.submittedCount / a.totalStudents) * 100) : 0;
      return {
        id: a.id,
        title: a.title,
        subjectCode: a.subjectCode,
        className: a.className,
        dueDate: a.dueDate,
        totalStudents: a.totalStudents,
        submittedCount: a.submittedCount,
        gradedCount: a.gradedCount,
        submissionRate: `${rate}%`,
        status: a.status
      };
    });

    return {
      totalAssignments: assignments.length,
      publishedCount: assignments.filter(a => a.status === 'Published').length,
      items
    };
  }

  async getAssessmentReport(faculty) {
    const assessments = await assessmentRepository.getAll({ facultyId: faculty.id });

    const items = assessments.map(a => {
      const marks = (a.results || []).filter(r => r.marksObtained !== null).map(r => r.marksObtained);
      const avg = marks.length > 0 ? (marks.reduce((x, y) => x + y, 0) / marks.length).toFixed(1) : 0;

      return {
        id: a.id,
        title: a.title,
        type: a.assessmentType,
        subjectCode: a.subjectCode,
        className: a.className,
        date: a.date,
        maxMarks: a.maxMarks,
        averageScore: Number(avg),
        status: a.status
      };
    });

    return {
      totalAssessments: assessments.length,
      items
    };
  }

  async getStudentPerformanceReport(faculty) {
    const students = await studentRepository.getAll();
    const facultyStudents = students.filter(s => faculty.assignedClasses.includes(s.className));

    return {
      totalStudents: facultyStudents.length,
      classPerformance: [
        { className: 'CSE-3A', studentCount: 6, averageCGPA: 8.16, passPercentage: 100, attendanceRate: 81.6 },
        { className: 'CSE-3B', studentCount: 4, averageCGPA: 8.55, passPercentage: 100, attendanceRate: 87.0 },
        { className: 'IT-3A', studentCount: 4, averageCGPA: 8.25, passPercentage: 100, attendanceRate: 84.7 }
      ],
      topPerformers: facultyStudents
        .sort((a, b) => b.cgpa - a.cgpa)
        .slice(0, 5)
        .map(s => ({
          rollNumber: s.rollNumber,
          name: s.name,
          className: s.className,
          cgpa: s.cgpa,
          attendance: s.attendancePercentage
        }))
    };
  }

  async getSubjectPerformanceReport(faculty) {
    const subjects = await facultyRepository.getSubjectsByFaculty(faculty.id);

    return {
      facultySubjects: subjects.map(s => ({
        code: s.code,
        name: s.name,
        classes: s.assignedClasses,
        credits: s.credits,
        enrolled: s.totalStudents,
        syllabusCompleted: `${s.syllabusProgress}%`,
        status: 'On Schedule'
      }))
    };
  }
}

module.exports = new ReportService();
