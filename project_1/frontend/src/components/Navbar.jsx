import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LayoutDashboard, Users, LogOut, ShieldCheck, UserCheck, CreditCard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 tracking-tight block">EduManage SMS</span>
                <span className="text-xs text-blue-600 font-medium tracking-wide uppercase">AI Debugging Training Lab</span>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-2">
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/students"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/students')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Students
              </Link>
              <Link
                to="/accountant/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/accountant')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Accountant
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{user.fullName || user.username}</div>
                <div className="flex items-center justify-end space-x-1">
                  {isAdmin ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      ADMIN
                    </span>
                  ) : user.role === 'ACCOUNTANT' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                      <CreditCard className="h-3 w-3 mr-1" />
                      ACCOUNTANT
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <UserCheck className="h-3 w-3 mr-1" />
                      TEACHER
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1.5 text-gray-500" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
