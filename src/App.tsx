import React, { useState, useEffect } from 'react';
import { ToastProvider } from './design-system/Toast';
import { Layout } from './components/Layout';
import { authService } from './services/authService';
import type { User } from './types/auth';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AttendancePage } from './pages/AttendancePage';
import { TimetablePage } from './pages/TimetablePage';
import { FeesPage } from './pages/FeesPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { ResultsPage } from './pages/ResultsPage';
import { ExamsPage } from './pages/ExamsPage';

// Access Denied Screen for non-Student roles
import { ShieldAlert } from 'lucide-react';
import { Button } from './design-system/Button';
import { Card, CardHeader, CardTitle, CardContent } from './design-system/Card';

export const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentSession());
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.hash.replace('#', '') || '/dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPath(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    navigateTo('/dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    navigateTo('/login');
  };

  // If not logged in or path is /login, show LoginPage
  if (!currentUser || currentPath === '/login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Role-Based Access Control (RBAC): Ensure user is a Student
  if (currentUser.role !== 'Student') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto text-red-500 mb-2">
              <ShieldAlert size={48} />
            </div>
            <CardTitle>Access Restricted (RBAC)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              You are logged in as <strong>{currentUser.role}</strong>. The Student Module is strictly restricted to authenticated <strong>Student</strong> accounts only.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                handleLogout();
              }}
            >
              Switch to Student Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Breadcrumb Page Titles
  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/dashboard': case '/': return 'Dashboard';
      case '/profile': return 'Profile';
      case '/attendance': return 'Attendance';
      case '/timetable': return 'Timetable';
      case '/fees': return 'Fees';
      case '/announcements': return 'Announcements';
      case '/results': return 'Results';
      case '/exams': return 'Exams';
      default: return 'Dashboard';
    }
  };

  // Page Routing Renderer
  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
      case '/':
        return <DashboardPage currentUser={currentUser} onNavigate={navigateTo} />;
      case '/profile':
        return <ProfilePage studentId={currentUser.studentId} currentUserRole={currentUser.role} />;
      case '/attendance':
        return <AttendancePage currentUserRole={currentUser.role} />;
      case '/timetable':
        return <TimetablePage currentUserRole={currentUser.role} />;
      case '/fees':
        return <FeesPage currentUserRole={currentUser.role} />;
      case '/announcements':
        return <AnnouncementsPage currentUserRole={currentUser.role} />;
      case '/results':
        return <ResultsPage currentUserRole={currentUser.role} />;
      case '/exams':
        return <ExamsPage currentUserRole={currentUser.role} />;
      default:
        return <DashboardPage currentUser={currentUser} onNavigate={navigateTo} />;
    }
  };

  return (
    <Layout
      currentPath={currentPath}
      pageTitle={getPageTitle(currentPath)}
      currentUser={currentUser}
      onNavigate={navigateTo}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
