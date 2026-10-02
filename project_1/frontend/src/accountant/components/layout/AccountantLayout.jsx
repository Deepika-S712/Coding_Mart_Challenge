import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AccountantSidebar } from './AccountantSidebar';
import { AccountantNavbar } from './AccountantNavbar';

export const AccountantLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex">
      {/* Sidebar Navigation */}
      <AccountantSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AccountantNavbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
