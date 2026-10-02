import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './auth/LoginPage';

// Student Pages
import StudentDashboard from './student/pages/StudentDashboard';
import StudentProfile from './student/pages/StudentProfile';
import StudentAttendance from './student/pages/StudentAttendance';
import StudentTimetable from './student/pages/StudentTimetable';
import StudentFees from './student/pages/StudentFees';
import StudentAnnouncements from './student/pages/StudentAnnouncements';
import StudentResults from './student/pages/StudentResults';
import StudentExams from './student/pages/StudentExams';

// Faculty Pages
import FacultyDashboard from './faculty/pages/FacultyDashboard';
import FacultySubjects from './faculty/pages/FacultySubjects';
import FacultyStudents from './faculty/pages/FacultyStudents';
import FacultyAttendance from './faculty/pages/FacultyAttendance';
import FacultyTimetable from './faculty/pages/FacultyTimetable';
import FacultyContent from './faculty/pages/FacultyContent';
import FacultyAssignments from './faculty/pages/FacultyAssignments';
import FacultyAssessments from './faculty/pages/FacultyAssessments';
import FacultyExamScores from './faculty/pages/FacultyExamScores';
import FacultyNotices from './faculty/pages/FacultyNotices';
import FacultyReports from './faculty/pages/FacultyReports';
import FacultyProfile from './faculty/pages/FacultyProfile';

// Accountant Pages
import AccountantDashboard from './accountant/pages/AccountantDashboard';
import FeeStructure from './accountant/pages/FeeStructure';
import StudentFeesLedger from './accountant/pages/StudentFeesLedger';
import Payments from './accountant/pages/Payments';
import Receipts from './accountant/pages/Receipts';
import PendingFees from './accountant/pages/PendingFees';
import FinancialReports from './accountant/pages/FinancialReports';

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  const role = user.role.toLowerCase();
  return <Navigate to={`/${role}/dashboard`} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Student Module Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route element={<AppLayout />}>
                <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/attendance" element={<StudentAttendance />} />
                <Route path="/student/timetable" element={<StudentTimetable />} />
                <Route path="/student/fees" element={<StudentFees />} />
                <Route path="/student/announcements" element={<StudentAnnouncements />} />
                <Route path="/student/results" element={<StudentResults />} />
                <Route path="/student/exams" element={<StudentExams />} />
              </Route>
            </Route>

            {/* Faculty Module Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
              <Route element={<AppLayout />}>
                <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                <Route path="/faculty/subjects" element={<FacultySubjects />} />
                <Route path="/faculty/students" element={<FacultyStudents />} />
                <Route path="/faculty/attendance" element={<FacultyAttendance />} />
                <Route path="/faculty/timetable" element={<FacultyTimetable />} />
                <Route path="/faculty/content" element={<FacultyContent />} />
                <Route path="/faculty/assignments" element={<FacultyAssignments />} />
                <Route path="/faculty/assessments" element={<FacultyAssessments />} />
                <Route path="/faculty/exams" element={<FacultyExamScores />} />
                <Route path="/faculty/notices" element={<FacultyNotices />} />
                <Route path="/faculty/reports" element={<FacultyReports />} />
                <Route path="/faculty/profile" element={<FacultyProfile />} />
              </Route>
            </Route>

            {/* Accountant Module Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ACCOUNTANT']} />}>
              <Route element={<AppLayout />}>
                <Route path="/accountant" element={<Navigate to="/accountant/dashboard" replace />} />
                <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
                <Route path="/accountant/fee-structure" element={<FeeStructure />} />
                <Route path="/accountant/student-fees" element={<StudentFeesLedger />} />
                <Route path="/accountant/payments" element={<Payments />} />
                <Route path="/accountant/receipts" element={<Receipts />} />
                <Route path="/accountant/pending-fees" element={<PendingFees />} />
                <Route path="/accountant/reports" element={<FinancialReports />} />
              </Route>
            </Route>

            {/* Root & Catch All */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
