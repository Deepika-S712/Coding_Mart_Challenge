import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarCheck,
  Clock,
  FileText,
  GraduationCap,
  Bell,
  User,
  GraduationCap as CollegeIcon,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
  { label: 'My Subjects', path: '/faculty/subjects', icon: BookOpen },
  { label: 'Students', path: '/faculty/students', icon: Users },
  { label: 'Attendance', path: '/faculty/attendance', icon: CalendarCheck },
  { label: 'Timetable', path: '/faculty/timetable', icon: Clock },
  { label: 'Assignments', path: '/faculty/assignments', icon: FileText },
  { label: 'Exam Scores', path: '/faculty/exam-scores', icon: GraduationCap },
  { label: 'Notices', path: '/faculty/notices', icon: Bell },
  { label: 'Profile', path: '/faculty/profile', icon: User }
];

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`cms-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`cms-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cms-sidebar-header">
          <div className="cms-brand-logo">
            <div className="cms-brand-icon">
              <CollegeIcon size={20} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, lineHeight: 1.2 }}>Faculty Portal</span>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--cms-text-secondary)', fontWeight: 400 }}>
                Faculty Module
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            style={{
              display: isOpen ? 'block' : 'none',
              background: 'none',
              border: 'none',
              color: 'var(--cms-text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="cms-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `cms-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
