import type { StudentProfile, ProfileUpdateRequest } from '../types/student';
import { mockStudentProfile } from '../mockData/studentData';
import { simulatedFetch, type ApiResponse } from './apiClient';

export const studentService = {
  async getStudentProfile(studentId: string, currentUserRole: string = 'Student'): Promise<ApiResponse<StudentProfile>> {
    return simulatedFetch(
      () => {
        if (!studentId) {
          throw new Error('Student ID is required');
        }
        return mockStudentProfile;
      },
      {
        delayMs: 350,
        requiredRole: 'Student',
        currentUserRole,
      }
    );
  },

  async submitProfileUpdateRequest(
    updateData: Partial<ProfileUpdateRequest>,
    currentUserRole: string = 'Student'
  ): Promise<ApiResponse<ProfileUpdateRequest>> {
    return simulatedFetch(
      () => {
        if (!updateData.reason || updateData.reason.trim().length < 5) {
          throw new Error('Please provide a valid reason for updating your personal profile details.');
        }

        const newRequest: ProfileUpdateRequest = {
          phone: updateData.phone,
          address: updateData.address,
          emergencyContact: updateData.emergencyContact,
          reason: updateData.reason,
          status: 'Pending',
          requestDate: new Date().toISOString().split('T')[0],
        };

        return newRequest;
      },
      {
        delayMs: 450,
        requiredRole: 'Student',
        currentUserRole,
      }
    );
  },
};
