import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import StudentList from './pages/Students/StudentList';
import StudentForm from './pages/Students/StudentForm';
import StudentDetail from './pages/Students/StudentDetail';

import FacultyList from './pages/Faculty/FacultyList';
import FacultyForm from './pages/Faculty/FacultyForm';
import FacultyDetail from './pages/Faculty/FacultyDetail';

import DepartmentList from './pages/Departments/DepartmentList';
import CourseList from './pages/Courses/CourseList';
import SubjectList from './pages/Subjects/SubjectList';
import TimetableList from './pages/Timetable/TimetableList';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect to Admin */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Students */}
            <Route path="students" element={<StudentList />} />
            <Route path="students/add" element={<StudentForm />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="students/edit/:id" element={<StudentForm />} />

            {/* Faculty */}
            <Route path="faculty" element={<FacultyList />} />
            <Route path="faculty/add" element={<FacultyForm />} />
            <Route path="faculty/:id" element={<FacultyDetail />} />
            <Route path="faculty/edit/:id" element={<FacultyForm />} />

            {/* Academic Structure */}
            <Route path="departments" element={<DepartmentList />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="subjects" element={<SubjectList />} />
            <Route path="timetable" element={<TimetableList />} />

            {/* Reports & System */}
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />

            {/* 404 inside layout */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
