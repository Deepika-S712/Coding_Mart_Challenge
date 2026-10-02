import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import type { User } from '../types/auth';
import type { Announcement } from '../types/communication';
import { communicationService } from '../services/communicationService';
import './Layout.css';

export interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  pageTitle: string;
  currentUser: User | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPath,
  pageTitle,
  currentUser,
  onNavigate,
  onLogout,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Fetch unread announcements for navbar notification badge
    const fetchNotifs = async () => {
      if (currentUser) {
        const res = await communicationService.getAnnouncements(currentUser.role);
        if (res.success && res.data) {
          setUnreadAnnouncements(res.data.filter((a) => !a.isRead));
        }
      }
    };
    fetchNotifs();
  }, [currentUser, currentPath]);

  return (
    <div className="cms-app-layout">
      {/* Fixed Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="cms-main-wrapper">
        <Navbar
          currentUser={currentUser}
          pageTitle={pageTitle}
          onNavigate={onNavigate}
          onLogout={onLogout}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          unreadAnnouncements={unreadAnnouncements}
        />

        <main className="cms-page-container">
          <div className="cms-page-content animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
