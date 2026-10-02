import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  CheckSquare,
  Calendar,
  CreditCard,
  Bell,
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  FolderOpen,
  FileText,
  Award,
  BarChart2,
  Receipt,
  FileCheck,
  Building2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const navItems = {
  STUDENT: [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/student/profile', icon: User },
    { label: 'Attendance', path: '/student/attendance', icon: CheckSquare },
    { label: 'Timetable', path: '/student/timetable', icon: Calendar },
    { label: 'Fees', path: '/student/fees', icon: CreditCard },
    { label: 'Announcements', path: '/student/announcements', icon: Bell },
    { label: 'Results', path: '/student/results', icon: GraduationCap },
    { label: 'Exam Timetable', path: '/student/exams', icon: Clock }
  ],
  FACULTY: [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Subjects', path: '/faculty/subjects', icon: BookOpen },
    { label: 'Students', path: '/faculty/students', icon: Users },
    { label: 'Attendance', path: '/faculty/attendance', icon: CheckSquare },
    { label: 'Timetable', path: '/faculty/timetable', icon: Calendar },
    { label: 'Content', path: '/faculty/content', icon: FolderOpen },
    { label: 'Assignments', path: '/faculty/assignments', icon: FileText },
    { label: 'Assessments', path: '/faculty/assessments', icon: Award },
    { label: 'Exam Scores', path: '/faculty/exams', icon: FileCheck },
    { label: 'Notices', path: '/faculty/notices', icon: Bell },
    { label: 'Reports', path: '/faculty/reports', icon: BarChart2 },
    { label: 'Profile', path: '/faculty/profile', icon: User }
  ],
  ACCOUNTANT: [
    { label: 'Dashboard', path: '/accountant/dashboard', icon: LayoutDashboard },
    { label: 'Fee Structure', path: '/accountant/fee-structure', icon: Building2 },
    { label: 'Student Fees', path: '/accountant/student-fees', icon: DollarSign },
    { label: 'Payments', path: '/accountant/payments', icon: CreditCard },
    { label: 'Receipts', path: '/accountant/receipts', icon: Receipt },
    { label: 'Pending Fees', path: '/accountant/pending-fees', icon: AlertCircle },
    { label: 'Financial Reports', path: '/accountant/reports', icon: BarChart2 }
  ]
};

export const Sidebar = ({ onItemClick }) => {
  const { user, role } = useAuth();
  const items = navItems[role?.toUpperCase()] || [];

  const roleLabels = {
    STUDENT: 'Student Portal',
    FACULTY: 'Faculty Portal',
    ACCOUNTANT: 'Accounts & Finance'
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-[#E2E8F0] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm">
          CMS
        </div>
        <div>
          <h1 className="font-bold text-sm text-[#0F172A] tracking-tight">Apex Institute of Tech</h1>
          <p className="text-[11px] font-medium text-primary uppercase tracking-wider">{roleLabels[role?.toUpperCase()] || 'Portal'}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
          Main Menu
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info card in sidebar bottom */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-semibold text-xs border border-blue-200 flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#0F172A] truncate">{user?.name}</p>
            <p className="text-[11px] text-[#64748B] truncate">{user?.id} • {user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
