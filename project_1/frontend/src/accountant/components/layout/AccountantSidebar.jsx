import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  CreditCard,
  Receipt,
  AlertCircle,
  BarChart3,
  X
} from 'lucide-react';

const navItems = [
  {
    name: 'Dashboard',
    path: '/accountant/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Fee Structure',
    path: '/accountant/fee-structure',
    icon: Layers,
  },
  {
    name: 'Student Fees',
    path: '/accountant/student-fees',
    icon: GraduationCap,
  },
  {
    name: 'Payments',
    path: '/accountant/payments',
    icon: CreditCard,
  },
  {
    name: 'Receipts',
    path: '/accountant/receipts',
    icon: Receipt,
  },
  {
    name: 'Pending Fees',
    path: '/accountant/pending-fees',
    icon: AlertCircle,
  },
  {
    name: 'Financial Reports',
    path: '/accountant/reports',
    icon: BarChart3,
  },
];

export const AccountantSidebar = ({ mobileOpen, setMobileOpen }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Header */}
        <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#2563EB] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A] leading-tight">CMS Finance</h2>
              <span className="text-[12px] font-medium text-[#475569]">Accountant Portal</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-[6px] text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Finance & Accounts
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-[8px] text-[14px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#DBEAFE] text-[#1D4ED8] font-semibold'
                      : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 shrink-0 stroke-[1.75]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom System Info */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center space-x-2 text-[12px] text-[#475569]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            <span>CMS-DS v1.0 Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
