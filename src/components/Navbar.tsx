import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User as UserIcon, Settings, LogOut, ChevronDown, CheckCircle } from 'lucide-react';
import { Badge } from '../design-system/Badge';
import type { User } from '../types/auth';
import type { Announcement } from '../types/communication';
import './Navbar.css';

export interface NavbarProps {
  currentUser: User | null;
  pageTitle: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  unreadAnnouncements?: Announcement[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  pageTitle,
  onNavigate,
  onLogout,
  onToggleMobileSidebar,
  unreadAnnouncements = [],
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = unreadAnnouncements.length;

  return (
    <header className="cms-navbar">
      {/* Left Section: Mobile Toggle & Page Breadcrumb */}
      <div className="cms-navbar-left">
        <button
          className="cms-navbar-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="cms-navbar-breadcrumb">
          <span className="cms-breadcrumb-portal">Student Portal</span>
          <span className="cms-breadcrumb-separator">/</span>
          <span className="cms-breadcrumb-current">{pageTitle}</span>
        </div>
      </div>

      {/* Right Section: Notifications, Profile, Role Badge, Dropdown */}
      <div className="cms-navbar-right">
        {/* Notification Bell Dropdown */}
        <div className="cms-navbar-dropdown-wrapper" ref={notifRef}>
          <button
            className="cms-navbar-icon-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="cms-notif-badge">{unreadCount}</span>}
          </button>

          {notificationsOpen && (
            <div className="cms-navbar-popover cms-notif-popover animate-fade-in">
              <div className="cms-popover-header">
                <span className="cms-popover-title">Announcements & Alerts</span>
                <Badge variant="info" size="sm">{unreadCount} New</Badge>
              </div>
              <div className="cms-notif-list">
                {unreadAnnouncements.length === 0 ? (
                  <div className="cms-notif-empty">
                    <CheckCircle size={24} className="text-emerald-500 mb-1" />
                    <span>No unread notifications</span>
                  </div>
                ) : (
                  unreadAnnouncements.slice(0, 4).map((ann) => (
                    <div
                      key={ann.id}
                      className="cms-notif-item"
                      onClick={() => {
                        onNavigate('/announcements');
                        setNotificationsOpen(false);
                      }}
                    >
                      <div className="cms-notif-item-title">{ann.title}</div>
                      <div className="cms-notif-item-sub">
                        <span>{ann.category}</span> • <span>{ann.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="cms-popover-footer">
                <button
                  className="cms-popover-link-btn"
                  onClick={() => {
                    onNavigate('/announcements');
                    setNotificationsOpen(false);
                  }}
                >
                  View All Announcements
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Avatar Dropdown */}
        <div className="cms-navbar-dropdown-wrapper" ref={profileRef}>
          <button
            className="cms-navbar-profile-trigger"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <div className="cms-navbar-avatar-icon">
              <UserIcon size={18} />
            </div>
            <div className="cms-navbar-user-info">
              <span className="cms-navbar-user-name">{currentUser?.name || 'Alex Vance'}</span>
              <Badge variant="info" size="sm">Student</Badge>
            </div>
            <ChevronDown size={14} className="cms-navbar-chevron" />
          </button>

          {profileDropdownOpen && (
            <div className="cms-navbar-popover cms-profile-popover animate-fade-in">
              <div className="cms-profile-menu-header">
                <div className="cms-menu-user-name">{currentUser?.name}</div>
                <div className="cms-menu-user-email">{currentUser?.email}</div>
                <div className="cms-menu-student-id">ID: {currentUser?.studentId || 'STU2024-8942'}</div>
              </div>
              <div className="cms-profile-menu-items">
                <button
                  className="cms-menu-item"
                  onClick={() => {
                    onNavigate('/profile');
                    setProfileDropdownOpen(false);
                  }}
                >
                  <UserIcon size={16} />
                  <span>View Profile</span>
                </button>

                <button
                  className="cms-menu-item"
                  onClick={() => {
                    onNavigate('/profile');
                    setProfileDropdownOpen(false);
                  }}
                >
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>

                <div className="cms-menu-divider" />

                <button
                  className="cms-menu-item cms-menu-danger"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
