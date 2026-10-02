import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Drawer from '../common/Drawer';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar (260px width) */}
        <aside className="hidden lg:block w-[260px] flex-shrink-0 sticky top-0 h-screen z-20">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Off-Canvas Drawer */}
        <Drawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          title="Navigation Menu"
          width="w-72"
        >
          <div className="-m-4 h-full">
            <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </Drawer>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
