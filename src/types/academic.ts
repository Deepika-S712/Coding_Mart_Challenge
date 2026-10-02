export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  staffName: string;
  staffEmail: string;
}

export type AttendanceStatus = 'Safe' | 'Warning' | 'Critical'; // Safe >=75%, Warning 70-74%, Critical <70%

export interface SubjectAttendance {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  staffName: string;
  totalClasses: number;
  present: number;
  absent: number;
  percentage: number;
  status: AttendanceStatus;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  subjectCode: string;
  subjectName: string;
  status: 'Present' | 'Absent' | 'Leave';
  topicCovered: string;
}

export interface MonthlyAttendance {
  month: string; // e.g., "Jan", "Feb"
  percentage: number;
  classesHeld: number;
  classesAttended: number;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g., "09:00 AM"
  endTime: string;   // e.g., "10:00 AM"
  subjectCode: string;
  subjectName: string;
  staffName: string;
  venue: string;     // e.g., "Lab 3" or "Hall 204"
  courseType: 'Theory' | 'Lab' | 'Tutorial';
}

export interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarks: number; // max 40
  externalMarks: number; // max 60
  totalMarks: number;    // max 100
  grade: 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  resultStatus: 'PASS' | 'FAIL';
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  passedCredits: number;
  resultStatus: 'PASSED' | 'FAILED' | 'PROMOTED';
  publishedDate: string;
  subjects: SubjectResult[];
}

export type ExamType = 'Mid-Term' | 'End-Semester Theory' | 'End-Semester Practical' | 'Quiz';

export interface ExamSchedule {
  id: string;
  date: string;       // YYYY-MM-DD
  day: string;        // e.g., "Monday"
  time: string;       // e.g., "10:00 AM - 01:00 PM"
  subjectCode: string;
  subjectName: string;
  examType: ExamType;
  venue: string;
  seatNumber: string;
  durationMinutes: number;
  totalMarks: number;
}
