import React from 'react';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  CalendarCheck,
  Clock,
  Award,
  FileText,
  CreditCard,
  Bell,
  ChevronDown,
  X,
} from 'lucide-react';
import './Sidebar.css';

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}





export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [academicOpen, setAcademicOpen] = React.useState(true);
  const [financeOpen, setFinanceOpen] = React.useState(true);
  const [communicationOpen, setCommunicationOpen] = React.useState(true);

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpenMobile && (
        <div className="cms-sidebar-mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`cms-sidebar ${isOpenMobile ? 'is-mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="cms-sidebar-brand">
          <div className="cms-sidebar-logo-icon">
            <GraduationCap size={24} />
          </div>
          <div className="cms-sidebar-brand-text">
            <span className="cms-brand-acronym">CMS</span>
            <span className="cms-brand-fullname">College Management System</span>
          </div>
          {isOpenMobile && (
            <button className="cms-sidebar-mobile-close" onClick={onCloseMobile} aria-label="Close menu">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="cms-sidebar-nav">
          {/* Main Direct Links */}
          <div className="cms-sidebar-group">
            <button
              className={`cms-sidebar-link ${currentPath === '/dashboard' || currentPath === '/' ? 'active' : ''}`}
              onClick={() => handleLinkClick('/dashboard')}
            >
              <span className="cms-sidebar-link-icon"><LayoutDashboard size={18} /></span>
              <span className="cms-sidebar-link-label">Dashboard</span>
            </button>

            <button
              className={`cms-sidebar-link ${currentPath === '/profile' ? 'active' : ''}`}
              onClick={() => handleLinkClick('/profile')}
            >
              <span className="cms-sidebar-link-icon"><User size={18} /></span>
              <span className="cms-sidebar-link-label">Profile</span>
            </button>
          </div>

          {/* Academic Section */}
          <div className="cms-sidebar-section">
            <button
              className="cms-sidebar-section-header"
              onClick={() => setAcademicOpen(!academicOpen)}
            >
              <span className="cms-sidebar-section-title">Academic</span>
              <ChevronDown
                size={14}
                className={`cms-sidebar-chevron ${academicOpen ? 'expanded' : ''}`}
              />
            </button>

            {academicOpen && (
              <div className="cms-sidebar-subnav">
                <button
                  className={`cms-sidebar-sublink ${currentPath === '/attendance' ? 'active' : ''}`}
                  onClick={() => handleLinkClick('/attendance')}
                >
                  <span className="cms-sidebar-link-icon"><CalendarCheck size={16} /></span>
                  <span>Attendance</span>
                </button>

                <button
                  className={`cms-sidebar-sublink ${currentPath === '/timetable' ? 'active' : ''}`}
                  onClick={() => handleLinkClick('/timetable')}
                >
                  <span className="cms-sidebar-link-icon"><Clock size={16} /></span>
                  <span>Timetable</span>
                </button>

                <button
                  className={`cms-sidebar-sublink ${currentPath === '/results' ? 'active' : ''}`}
                  onClick={() => handleLinkClick('/results')}
                >
                  <span className="cms-sidebar-link-icon"><Award size={16} /></span>
                  <span>Results</span>
                </button>

                <button
                  className={`cms-sidebar-sublink ${currentPath === '/exams' ? 'active' : ''}`}
                  onClick={() => handleLinkClick('/exams')}
                >
                  <span className="cms-sidebar-link-icon"><FileText size={16} /></span>
                  <span>Exams</span>
                </button>
              </div>
            )}
          </div>

          {/* Finance Section */}
          <div className="cms-sidebar-section">
            <button
              className="cms-sidebar-section-header"
              onClick={() => setFinanceOpen(!financeOpen)}
            >
              <span className="cms-sidebar-section-title">Finance</span>
              <ChevronDown
                size={14}
                className={`cms-sidebar-chevron ${financeOpen ? 'expanded' : ''}`}
              />
            </button>

            {financeOpen && (
              <div className="cms-sidebar-subnav">
                <button
                  className={`cms-sidebar-sublink ${currentPath === '/fees' ? 'active' : ''}`}
                  onClick={() => handleLinkClick('/fees')}
                >
                  <span className="cms-sidebar-link-icon"><CreditCard size={16} /></span>
                  <span>Fees</span>
                </button>
              </div>
            )}
          </div>

          {/* Communication Section */}
          <div className="cms-sidebar-section">
            <button
              className="cms-sidebar-section-header"
              onClick={() => setCommunicationOpen(!communicationOpen)}
            >
              <span className="cms-sidebar-section-title">Communication</span>
              <ChevronDown
                size={14}
                className={`cms-sidebar-chevron ${communicationOpen ? 'expanded' : ''}`}
              />
            </button>

            {communicationOpen && (
              <div className="cms-sidebar-subnav">
                <button
                  className={`cms-sidebar-sublink ${currentPath === '/announcements' ? 'active' : ''}`}
                  onClick={() => handleLinkClick('/announcements')}
                >
                  <span className="cms-sidebar-link-icon"><Bell size={16} /></span>
                  <span>Announcements</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer Badge */}
        <div className="cms-sidebar-footer">
          <div className="cms-sidebar-version">CMS-DS v1.0 • Student Portal</div>
        </div>
      </aside>
    </>
  );
};
