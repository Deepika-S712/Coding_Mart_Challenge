import React from 'react';
import { Menu, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const AccountantNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-[8px] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[14px] font-semibold text-[#0F172A]">
            College Management System
          </span>
          <span className="hidden sm:inline-block text-[12px] text-[#94A3B8] ml-2">
            / Accountant Module
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-3 pr-2 sm:pr-4 border-r border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center font-bold text-[14px]">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[14px] font-semibold text-[#0F172A] leading-tight">
              {user?.fullName || user?.username || 'College Accountant'}
            </div>
            <div className="flex items-center justify-end space-x-1 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[12px] font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                <UserCheck className="w-3 h-3 mr-1" />
                ACCOUNTANT
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="inline-flex items-center px-3 py-1.5 border border-[#CBD5E1] rounded-[8px] text-[14px] font-medium text-[#475569] bg-white hover:bg-[#F8FAFC] hover:text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-colors"
          title="Sign out of account"
        >
          <LogOut className="w-4 h-4 mr-1.5 text-[#94A3B8]" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
