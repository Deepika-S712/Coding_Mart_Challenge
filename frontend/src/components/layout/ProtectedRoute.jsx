import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cms-bg-page)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} color="var(--cms-primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: 'var(--cms-text-secondary)' }}>Verifying Faculty Authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
