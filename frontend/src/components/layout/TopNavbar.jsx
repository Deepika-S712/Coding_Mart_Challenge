import React from 'react';
import { Menu, LogOut, Bell, Shield, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TopNavbar = ({ onOpenMobileMenu }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Academic Session indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B] font-medium bg-slate-50 px-3 py-1.5 rounded-md border border-[#E2E8F0]">
          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
          <span>Academic Year 2026-2027</span>
          <span className="text-slate-300">|</span>
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-primary border border-blue-200 text-xs font-semibold">
          <Shield className="w-3 h-3" />
          <span>{role}</span>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[#0F172A] leading-tight">{user?.name}</p>
            <p className="text-[11px] text-[#64748B]">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-error bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
