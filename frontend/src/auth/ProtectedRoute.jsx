import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ErrorState from '../components/common/ErrorState';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[#64748B] font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 403 Forbidden State with shortcut button to correct dashboard
    const userRole = user.role.toLowerCase();
    const correctDashboard = `/${userRole}/dashboard`;

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-[#E2E8F0] p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-red-100 text-error rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            403
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Access Forbidden</h2>
          <p className="text-[#64748B] text-sm mb-6">
            You do not have permission to view this module. Your current role is <span className="font-semibold text-[#0F172A]">{user.role}</span>.
          </p>
          <a
            href={correctDashboard}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition-colors"
          >
            Go to My Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
