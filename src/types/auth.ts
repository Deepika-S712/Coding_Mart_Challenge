import type { StudentProfile } from './student';

export type UserRole = 'Student' | 'Faculty' | 'Admin' | 'HOD' | 'Accountant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string;
}

export interface AuthState {
  user: User | null;
  studentProfile: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
