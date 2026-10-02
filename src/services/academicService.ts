import type {
  SubjectAttendance,
  AttendanceRecord,
  MonthlyAttendance,
  TimetableSlot,
  SemesterResult,
  ExamSchedule,
} from '../types/academic';
import {
  mockSubjectAttendance,
  mockAttendanceRecords,
  mockMonthlyAttendance,
  mockTimetableSlots,
  mockSemesterResults,
  mockExamSchedules,
} from '../mockData/academicData';
import { simulatedFetch, type ApiResponse } from './apiClient';

export const academicService = {
  async getSubjectAttendance(currentUserRole: string = 'Student'): Promise<ApiResponse<SubjectAttendance[]>> {
    return simulatedFetch(
      () => mockSubjectAttendance,
      { delayMs: 400, requiredRole: 'Student', currentUserRole }
    );
  },

  async getAttendanceRecords(currentUserRole: string = 'Student'): Promise<ApiResponse<AttendanceRecord[]>> {
    return simulatedFetch(
      () => mockAttendanceRecords,
      { delayMs: 300, requiredRole: 'Student', currentUserRole }
    );
  },

  async getMonthlyAttendance(currentUserRole: string = 'Student'): Promise<ApiResponse<MonthlyAttendance[]>> {
    return simulatedFetch(
      () => mockMonthlyAttendance,
      { delayMs: 250, requiredRole: 'Student', currentUserRole }
    );
  },

  async getTimetable(currentUserRole: string = 'Student'): Promise<ApiResponse<TimetableSlot[]>> {
    return simulatedFetch(
      () => mockTimetableSlots,
      { delayMs: 350, requiredRole: 'Student', currentUserRole }
    );
  },

  async verifyResultsPassword(password: string): Promise<ApiResponse<boolean>> {
    return simulatedFetch(
      () => {
        if (!password || password.trim() === '') {
          throw new Error('Security verification password cannot be empty.');
        }
        if (password.length < 4) {
          throw new Error('Incorrect security verification password. Please try again.');
        }
        return true;
      },
      { delayMs: 500 }
    );
  },

  async getSemesterResult(semester: number, currentUserRole: string = 'Student'): Promise<ApiResponse<SemesterResult>> {
    return simulatedFetch(
      () => {
        const result = mockSemesterResults[semester];
        if (!result) {
          throw new Error(`No published examination results found for Semester ${semester}.`);
        }
        return result;
      },
      { delayMs: 450, requiredRole: 'Student', currentUserRole }
    );
  },

  async getExamSchedules(currentUserRole: string = 'Student'): Promise<ApiResponse<ExamSchedule[]>> {
    return simulatedFetch(
      () => mockExamSchedules,
      { delayMs: 300, requiredRole: 'Student', currentUserRole }
    );
  },
};
