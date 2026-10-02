export type AccommodationType = 'Hosteller' | 'Day Scholar';
export type TransportType = 'Cab User' | 'Bus User' | 'Self / None';

export interface ParentGuardianInfo {
  name: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  contact: string;
  email: string;
  occupation: string;
  emergencyContact: string;
}

export interface AcademicInfo {
  department: string;
  program: string;
  academicYear: string;
  semester: number;
  section: string;
  rollNo: string;
  enrolmentDate: string;
  advisorName: string;
  advisorEmail: string;
}

export interface AccommodationInfo {
  status: AccommodationType;
  hostelBlock?: string;
  roomNumber?: string;
  wardenName?: string;
  wardenContact?: string;
}

export interface TransportInfo {
  isCabUser: boolean;
  busRouteNumber?: string;
  pickupPoint?: string;
  driverName?: string;
  driverContact?: string;
}

export interface StudentProfile {
  id: string;
  studentId: string; // e.g. STU2024-8942
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string;
  email: string;
  phone: string;
  age: number;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  bloodGroup: string;
  address: string;
  academic: AcademicInfo;
  parent: ParentGuardianInfo;
  accommodation: AccommodationInfo;
  transport: TransportInfo;
}

export interface ProfileUpdateRequest {
  phone?: string;
  address?: string;
  emergencyContact?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}
