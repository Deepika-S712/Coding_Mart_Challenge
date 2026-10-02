import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FacultyLayout } from './components/layout/FacultyLayout.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';

import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { StudentsPage } from './pages/StudentsPage.jsx';
import { AttendancePage } from './pages/AttendancePage.jsx';
import { SubjectsPage } from './pages/SubjectsPage.jsx';
import { TimetablePage } from './pages/TimetablePage.jsx';

import { AssignmentsPage } from './pages/AssignmentsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { ExamScoresPage } from './pages/ExamScoresPage.jsx';
import { NoticesPage } from './pages/NoticesPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<Navigate to="/faculty/dashboard" replace />} />
        
        <Route path="/faculty" element={
          <ProtectedRoute>
            <FacultyLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="exam-scores" element={<ExamScoresPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/faculty/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
