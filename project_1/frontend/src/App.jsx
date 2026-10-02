import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';

import { AccountantLayout } from './accountant/components/layout/AccountantLayout';
import { AccountantDashboardPage } from './accountant/pages/AccountantDashboardPage';
import { FeeStructurePage } from './accountant/pages/FeeStructurePage';
import { StudentFeesPage } from './accountant/pages/StudentFeesPage';
import { PaymentsPage } from './accountant/pages/PaymentsPage';
import { ReceiptsPage } from './accountant/pages/ReceiptsPage';
import { PendingFeesPage } from './accountant/pages/PendingFeesPage';
import { FinancialReportsPage } from './accountant/pages/FinancialReportsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              {/* Isolated Accountant Module Routes */}
              <Route path="/accountant" element={<AccountantLayout />}>
                <Route index element={<Navigate to="/accountant/dashboard" replace />} />
                <Route path="dashboard" element={<AccountantDashboardPage />} />
                <Route path="fee-structure" element={<FeeStructurePage />} />
                <Route path="student-fees" element={<StudentFeesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="receipts" element={<ReceiptsPage />} />
                <Route path="pending-fees" element={<PendingFeesPage />} />
                <Route path="reports" element={<FinancialReportsPage />} />
              </Route>

              {/* Shared Standard Pages */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </>
                }
              />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
