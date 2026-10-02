import { studentRepository } from '../repositories/studentRepository.js';
import { attendanceRepository } from '../repositories/attendanceRepository.js';
import { timetableRepository } from '../repositories/timetableRepository.js';
import { feeRepository } from '../repositories/feeRepository.js';
import { noticeRepository } from '../repositories/noticeRepository.js';
import { resultRepository } from '../repositories/resultRepository.js';
import { examRepository } from '../repositories/examRepository.js';

export const studentService = {
  getDashboard(studentId) {
    const student = studentRepository.findById(studentId) || studentRepository.findById("STU001");
    const attendanceSummary = attendanceRepository.getStudentSummary(student.id);
    const feeRecord = feeRepository.getStudentFee(student.id);
    const allExams = examRepository.getTimetable();
    const nextExam = allExams.find(e => e.isNext) || allExams[0];
    
    // Today's classes from timetable
    const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    const validDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(todayDay) ? todayDay : "Monday";
    const todayClasses = timetableRepository.getAll({ classVal: student.class, day: validDay });

    const recentAnnouncements = noticeRepository.getAllAnnouncements().slice(0, 4);
    const resultsData = resultRepository.getByStudentId(student.id);
    const recentSemesterResult = resultsData.semesters[0] || null;

    return {
      student: {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        class: student.class,
        department: student.department,
        semester: student.semester,
        year: student.year
      },
      kpis: {
        attendancePercentage: attendanceSummary.overallPercentage,
        currentSemester: student.semester,
        pendingFees: feeRecord ? feeRecord.pendingAmount : 0,
        totalFees: feeRecord ? feeRecord.totalFee : 0,
        paidFees: feeRecord ? feeRecord.paidAmount : 0,
        feeStatus: feeRecord ? feeRecord.status : "Paid",
        nextExam: nextExam ? {
          subjectCode: nextExam.subjectCode,
          subjectName: nextExam.subjectName,
          date: nextExam.date,
          day: nextExam.day,
          time: nextExam.startTime,
          room: nextExam.room
        } : null
      },
      todayClasses,
      recentAnnouncements,
      recentResults: recentSemesterResult,
      feeSummary: feeRecord
    };
  },

  getProfile(studentId) {
    const student = studentRepository.findById(studentId) || studentRepository.findById("STU001");
    if (!student) {
      throw { status: 404, code: "STUDENT_NOT_FOUND", message: "Student profile not found." };
    }
    return student;
  },

  getAttendance(studentId) {
    const summary = attendanceRepository.getStudentSummary(studentId || "STU001");
    return summary;
  },

  getTimetable(studentId) {
    const student = studentRepository.findById(studentId) || studentRepository.findById("STU001");
    const classVal = student ? student.class : "CSE-3A";
    const allSlots = timetableRepository.getAll({ classVal });
    
    // Group slots by day
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const grouped = days.map(day => ({
      day,
      slots: allSlots.filter(s => s.day.toLowerCase() === day.toLowerCase())
    }));

    return {
      class: classVal,
      department: student ? student.department : "Computer Science & Engineering",
      collegeTimings: "09:30 AM - 04:30 PM",
      schedule: grouped,
      allSlots
    };
  },

  getFees(studentId) {
    const fee = feeRepository.getStudentFee(studentId || "STU001");
    if (!fee) {
      throw { status: 404, code: "FEE_RECORD_NOT_FOUND", message: "No fee record found for student." };
    }
    return fee;
  },

  getAnnouncements(query) {
    return noticeRepository.getAllAnnouncements(query);
  },

  verifyResultsPassword(password) {
    const isValid = resultRepository.verifyResultPassword(password);
    if (!isValid) {
      throw { status: 401, code: "INVALID_RESULT_PASSWORD", message: "Incorrect result verification password." };
    }
    return { verified: true };
  },

  getResults(studentId) {
    return resultRepository.getByStudentId(studentId || "STU001");
  },

  getExams() {
    return examRepository.getTimetable();
  }
};
