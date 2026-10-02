import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function FacultyLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="cms-app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="cms-main-wrapper">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="cms-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
