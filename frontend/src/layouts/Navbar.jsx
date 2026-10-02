import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute page title and breadcrumbs from location.pathname
  const path = location.pathname;
  let pageTitle = 'Dashboard';
  let breadcrumbItem = 'Overview';

  if (path.includes('/admin/students/add')) {
    pageTitle = 'Add New Student';
    breadcrumbItem = 'Students / Add';
  } else if (path.includes('/admin/students/edit')) {
    pageTitle = 'Edit Student';
    breadcrumbItem = 'Students / Edit';
  } else if (path.match(/\/admin\/students\/\d+/)) {
    pageTitle = 'Student Details';
    breadcrumbItem = 'Students / View';
  } else if (path.includes('/admin/students')) {
    pageTitle = 'Student Management';
    breadcrumbItem = 'Students';
  } else if (path.includes('/admin/faculty/add')) {
    pageTitle = 'Add Faculty Member';
    breadcrumbItem = 'Faculty / Add';
  } else if (path.includes('/admin/faculty/edit')) {
    pageTitle = 'Edit Faculty Member';
    breadcrumbItem = 'Faculty / Edit';
  } else if (path.match(/\/admin\/faculty\/\d+/)) {
    pageTitle = 'Faculty Profile';
    breadcrumbItem = 'Faculty / View';
  } else if (path.includes('/admin/faculty')) {
    pageTitle = 'Faculty Management';
    breadcrumbItem = 'Faculty';
  } else if (path.includes('/admin/departments')) {
    pageTitle = 'Department Management';
    breadcrumbItem = 'Departments';
  } else if (path.includes('/admin/courses')) {
    pageTitle = 'Course Management';
    breadcrumbItem = 'Courses';
  } else if (path.includes('/admin/subjects')) {
    pageTitle = 'Subject Management';
    breadcrumbItem = 'Subjects';
  } else if (path.includes('/admin/timetable')) {
    pageTitle = 'Timetable Management';
    breadcrumbItem = 'Timetable';
  } else if (path.includes('/admin/reports')) {
    pageTitle = 'Reports & Analytics';
    breadcrumbItem = 'Reports';
  } else if (path.includes('/admin/settings')) {
    pageTitle = 'Admin Settings';
    breadcrumbItem = 'Settings';
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'AD';

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <h2 className="page-title">{pageTitle}</h2>
        <div className="breadcrumbs">
          <Link to="/admin/dashboard">Admin</Link>
          <span>/</span>
          <span>{breadcrumbItem}</span>
        </div>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="navbar-notification-btn"
          title="System Notifications"
          onClick={() => navigate('/admin/dashboard')}
        >
          <Bell size={18} />
          <span className="notification-badge">●</span>
        </button>

        <div className="admin-profile-pill" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="admin-avatar">{initials}</div>
          <div className="admin-details">
            <span className="admin-name">{user?.name || 'Administrator'}</span>
            <span className="admin-role-badge">ADMIN</span>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <button
                type="button"
                className="profile-dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/admin/settings');
                }}
              >
                <Settings size={15} />
                <span>Settings</span>
              </button>
              <button
                type="button"
                className="profile-dropdown-item danger"
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
