export type AnnouncementCategory = 'Academic' | 'Exams' | 'Placement' | 'Events' | 'General' | 'Urgent';
export type AnnouncementImportance = 'High' | 'Medium' | 'Normal';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;       // ISO or YYYY-MM-DD
  time: string;       // e.g., "10:30 AM"
  category: AnnouncementCategory;
  importance: AnnouncementImportance;
  postedBy: string;   // e.g., "Dean of Academics"
  isRead?: boolean;
  attachmentName?: string;
  attachmentSize?: string;
}
