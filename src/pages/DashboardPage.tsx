import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CalendarCheck,
  CreditCard,
  FileText,
  Bell,
  ArrowRight,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import { CardSkeleton } from '../design-system/Skeleton';
import { ErrorState } from '../design-system/ErrorState';
import type { User } from '../types/auth';
import type { StudentProfile } from '../types/student';
import type { SubjectAttendance, TimetableSlot, ExamSchedule } from '../types/academic';
import type { FeeSummary } from '../types/finance';
import type { Announcement } from '../types/communication';
import { studentService } from '../services/studentService';
import { academicService } from '../services/academicService';
import { financeService } from '../services/financeService';
import { communicationService } from '../services/communicationService';
import './DashboardPage.css';

export interface DashboardPageProps {
  currentUser: User | null;
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onNavigate }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [attendance, setAttendance] = useState<SubjectAttendance[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [nextExam, setNextExam] = useState<ExamSchedule | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const role = currentUser?.role || 'Student';
      const studentId = currentUser?.studentId || 'STU2024-8942';

      const [pRes, aRes, tRes, fRes, eRes, cRes] = await Promise.all([
        studentService.getStudentProfile(studentId, role),
        academicService.getSubjectAttendance(role),
        academicService.getTimetable(role),
        financeService.getFeeSummary(role),
        academicService.getExamSchedules(role),
        communicationService.getAnnouncements(role),
      ]);

      if (pRes.success && pRes.data) setProfile(pRes.data);
      if (aRes.success && aRes.data) setAttendance(aRes.data);
      if (tRes.success && tRes.data) setTimetable(tRes.data);
      if (fRes.success && fRes.data) setFeeSummary(fRes.data);
      if (eRes.success && eRes.data) setNextExam(eRes.data[0] || null);
      if (cRes.success && cRes.data) setAnnouncements(cRes.data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const totalClasses = attendance.reduce((acc, cur) => acc + cur.totalClasses, 0);
  const totalPresent = attendance.reduce((acc, cur) => acc + cur.present, 0);
  const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : '0';
  const unreadAnnouncementsCount = announcements.filter((a) => !a.isRead).length;

  if (isLoading) {
    return (
      <div className="cms-dashboard-page">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Dashboard Data Unavailable"
        message="Unable to fetch dashboard metrics from the campus server. Please verify network connectivity and try again."
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <div className="cms-dashboard-page">
      <Card className="cms-welcome-card">
        <div className="cms-welcome-content">
          <div className="cms-welcome-badge">
            <Sparkles size={16} />
            <span>Spring 2026 Academic Session</span>
          </div>
          <h2 className="cms-welcome-title">
            Welcome back, {profile?.fullName || currentUser?.name || 'Alex Vance'}!
          </h2>
          <p className="cms-welcome-subtitle">
            {profile?.academic.program} • {profile?.academic.academicYear} ({profile?.academic.semester}th Semester, {profile?.academic.section})
          </p>
          <div className="cms-welcome-advisor">
            <span>Faculty Advisor: <strong>{profile?.academic.advisorName}</strong></span>
          </div>
        </div>

        <div className="cms-welcome-actions">
          <Button variant="primary" onClick={() => onNavigate('/attendance')}>
            Check Attendance
          </Button>
          <Button variant="outline" onClick={() => onNavigate('/results')}>
            View Grade Card
          </Button>
        </div>
      </Card>

      <div className="cms-stats-grid">
        <Card hoverable className="cms-stat-card" onClick={() => onNavigate('/attendance')}>
          <div className="cms-stat-header">
            <span className="cms-stat-label">Overall Attendance</span>
            <div className="cms-stat-icon-wrapper cms-icon-emerald">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="cms-stat-value">{overallPercentage}%</div>
          <div className="cms-stat-footer">
            <Badge variant={Number(overallPercentage) >= 75 ? 'success' : 'error'} size="sm">
              {Number(overallPercentage) >= 75 ? 'Safe Status (>= 75%)' : 'Attendance Warning (< 75%)'}
            </Badge>
          </div>
        </Card>

        <Card hoverable className="cms-stat-card" onClick={() => onNavigate('/fees')}>
          <div className="cms-stat-header">
            <span className="cms-stat-label">Pending Fees</span>
            <div className="cms-stat-icon-wrapper cms-icon-amber">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="cms-stat-value">
            ${feeSummary?.totalPending || 0}
          </div>
          <div className="cms-stat-footer">
            {feeSummary?.totalPending && feeSummary.totalPending > 0 ? (
              <Badge variant="warning" size="sm">Due Date: {feeSummary.nextDueDate}</Badge>
            ) : (
              <Badge variant="success" size="sm">All Dues Cleared</Badge>
            )}
          </div>
        </Card>

        <Card hoverable className="cms-stat-card" onClick={() => onNavigate('/exams')}>
          <div className="cms-stat-header">
            <span className="cms-stat-label">Next Exam</span>
            <div className="cms-stat-icon-wrapper cms-icon-indigo">
              <FileText size={20} />
            </div>
          </div>
          <div className="cms-stat-value cms-text-truncate">
            {nextExam ? nextExam.subjectCode : 'None'}
          </div>
          <div className="cms-stat-footer">
            <span className="text-xs text-slate-500 font-medium">
              {nextExam ? `${nextExam.date} • ${nextExam.subjectName}` : 'No scheduled exams'}
            </span>
          </div>
        </Card>

        <Card hoverable className="cms-stat-card" onClick={() => onNavigate('/announcements')}>
          <div className="cms-stat-header">
            <span className="cms-stat-label">Announcements</span>
            <div className="cms-stat-icon-wrapper cms-icon-blue">
              <Bell size={20} />
            </div>
          </div>
          <div className="cms-stat-value">{unreadAnnouncementsCount} Unread</div>
          <div className="cms-stat-footer">
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              View All Campus Notices <ArrowRight size={12} />
            </span>
          </div>
        </Card>
      </div>

      <div className="cms-dashboard-grid">
        <div className="cms-dashboard-col-left">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <Clock size={18} className="text-indigo-600" />
                  <span>Today's Classes & Schedule</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('/timetable')}>
                  Full Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="cms-schedule-list">
                {timetable.slice(0, 3).map((slot) => (
                  <div key={slot.id} className="cms-schedule-item">
                    <div className="cms-schedule-time">
                      <Clock size={14} className="text-slate-400" />
                      <span>{slot.startTime}</span>
                    </div>
                    <div className="cms-schedule-details">
                      <div className="cms-schedule-subject">{slot.subjectName} ({slot.subjectCode})</div>
                      <div className="cms-schedule-meta">
                        <span>{slot.staffName}</span> • <span className="font-semibold text-slate-700">{slot.venue}</span>
                      </div>
                    </div>
                    <Badge variant={slot.courseType === 'Lab' ? 'info' : 'neutral'} size="sm">
                      {slot.courseType}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {attendance.some((a) => a.percentage < 75) && (
            <Card className="cms-alert-card">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm">Attendance Alert (&lt; 75%)</h4>
                  <p className="text-xs text-amber-800 mt-1">
                    You have subject attendance below the mandatory 75% threshold (
                    {attendance.filter((a) => a.percentage < 75).map((a) => a.subjectCode).join(', ')}
                    ). Please consult your course instructor or advisor.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="cms-dashboard-col-right">
          <Card>
            <CardHeader>
              <CardTitle>
                <Bell size={18} className="text-indigo-600" />
                <span>Recent Announcements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="cms-announcement-preview-list">
                {announcements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    className="cms-announcement-preview-item"
                    onClick={() => onNavigate('/announcements')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={ann.importance === 'High' ? 'error' : 'info'} size="sm">
                        {ann.category}
                      </Badge>
                      <span className="text-xs text-slate-400">{ann.date}</span>
                    </div>
                    <h4 className="cms-ann-title">{ann.title}</h4>
                    <p className="cms-ann-desc">{ann.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="cms-quick-actions-grid">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  leftIcon={<Award size={16} />}
                  onClick={() => onNavigate('/results')}
                >
                  View SGPA Results
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  leftIcon={<CreditCard size={16} />}
                  onClick={() => onNavigate('/fees')}
                >
                  Pay Semester Fees
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  leftIcon={<BookOpen size={16} />}
                  onClick={() => onNavigate('/exams')}
                >
                  Download Admit Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
