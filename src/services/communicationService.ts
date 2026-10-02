import type { Announcement } from '../types/communication';
import { mockAnnouncements } from '../mockData/communicationData';
import { simulatedFetch, type ApiResponse } from './apiClient';

let activeAnnouncements = [...mockAnnouncements];

export const communicationService = {
  async getAnnouncements(currentUserRole: string = 'Student'): Promise<ApiResponse<Announcement[]>> {
    return simulatedFetch(
      () => activeAnnouncements,
      { delayMs: 350, requiredRole: 'Student', currentUserRole }
    );
  },

  async markAsRead(id: string): Promise<ApiResponse<boolean>> {
    return simulatedFetch(
      () => {
        activeAnnouncements = activeAnnouncements.map((ann) =>
          ann.id === id ? { ...ann, isRead: true } : ann
        );
        return true;
      },
      { delayMs: 150 }
    );
  },
};
