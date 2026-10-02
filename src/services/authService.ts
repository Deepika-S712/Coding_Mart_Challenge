import type { User, UserRole } from '../types/auth';
import { simulatedFetch, type ApiResponse } from './apiClient';

const STORAGE_KEY = 'cms_student_auth_session';

export interface LoginCredentials {
  email: string;
  password?: string;
  role: UserRole;
}

export const authService = {
  getCurrentSession(): User | null {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const defaultUser: User = {
        id: 'stu-user-101',
        email: 'alex.vance@student.cms.edu',
        name: 'Alex Vance',
        role: 'Student',
        studentId: 'STU2024-8942',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    return simulatedFetch(
      () => {
        if (!credentials.email.includes('@')) {
          throw new Error('Please enter a valid institutional email address.');
        }

        if (credentials.role !== 'Student') {
          throw new Error(`Unauthorized role access: Only Student accounts can log in to the Student Portal. Requested role: ${credentials.role}`);
        }

        const user: User = {
          id: 'stu-user-101',
          email: credentials.email,
          name: 'Alex Vance',
          role: 'Student',
          studentId: 'STU2024-8942',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return user;
      },
      { delayMs: 400 }
    );
  },

  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return simulatedFetch(
      () => {
        if (!email || !email.includes('@')) {
          throw new Error('Please enter a valid institutional email address to reset password.');
        }
        return {
          message: `Password reset instructions have been sent to ${email}. Please check your inbox.`,
        };
      },
      { delayMs: 500 }
    );
  },

  async logout(): Promise<ApiResponse<boolean>> {
    return simulatedFetch(
      () => {
        localStorage.removeItem(STORAGE_KEY);
        return true;
      },
      { delayMs: 200 }
    );
  },
};
