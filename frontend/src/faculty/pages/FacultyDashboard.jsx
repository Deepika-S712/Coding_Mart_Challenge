import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  BookOpen,
  Users,
  Calendar,
  FileCheck,
  CheckSquare,
  FileText,
  Award,
  Upload,
  Clock,
  Bell,
  ArrowRight,
  Plus
} from 'lucide-react';

export const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load faculty dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const { faculty, kpis, assignedSubjects = [], todayClasses = [], pendingEvaluationsList = [], recentNotices = [] } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">{faculty.name}</h2>
          <p className="text-xs text-[#64748B]">
            {faculty.designation} • {faculty.department}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/faculty/attendance">
            <Button variant="primary" size="sm" icon={CheckSquare}>
              Mark Attendance
            </Button>
          </Link>
          <Link to="/faculty/assignments">
            <Button variant="secondary" size="sm" icon={Plus}>
              New Assignment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Subjects"
          value={kpis.assignedSubjectsCount}
          subtitle="Course modules allocated"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Total Students"
          value={kpis.totalStudentsCount}
          subtitle="Class CSE-3A strength"
          icon={Users}
          color="info"
        />
        <StatCard
          title="Today's Classes"
          value={kpis.todayClassesCount}
          subtitle="Lectures & lab sessions"
          icon={Calendar}
          color="success"
        />
        <StatCard
          title="Pending Evaluations"
          value={kpis.pendingEvaluationsCount}
          subtitle="Unmarked student papers"
          icon={FileCheck}
          color={kpis.pendingEvaluationsCount > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Quick Actions Panel */}
      <Card title="Faculty Quick Actions" subtitle="One-click access to common academic workflows">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/faculty/attendance"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-blue-50 hover:border-blue-200 transition-all text-center group"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">Mark Attendance</span>
          </Link>

          <Link
            to="/faculty/assignments"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-emerald-50 hover:border-emerald-200 transition-all text-center group"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-success flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">Create Assignment</span>
          </Link>

          <Link
            to="/faculty/assessments"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-purple-50 hover:border-purple-200 transition-all text-center group"
          >
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">New Assessment</span>
          </Link>

          <Link
            to="/faculty/content"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-amber-50 hover:border-amber-200 transition-all text-center group"
          >
            <div className="w-9 h-9 rounded-full bg-amber-100 text-warning flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">Upload Content</span>
          </Link>

          <Link
            to="/faculty/exams"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-sky-50 hover:border-sky-200 transition-all text-center group"
          >
            <div className="w-9 h-9 rounded-full bg-sky-100 text-info flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">Enter Exam Marks</span>
          </Link>

          <Link
            to="/faculty/notices"
            className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-rose-50 hover:border-rose-200 transition-all text-center group"
          >
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">Publish Notice</span>
          </Link>
        </div>
      </Card>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Lectures and Assigned Subjects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Classes */}
          <Card
            title="Today's Teaching Schedule"
            subtitle="Scheduled lectures and lab sessions"
            action={
              <Link to="/faculty/timetable" className="text-xs font-semibold text-primary hover:underline">
                View Weekly Timetable →
              </Link>
            }
          >
            {todayClasses.length === 0 ? (
              <p className="text-xs text-[#64748B] py-3 text-center">No teaching sessions scheduled for today.</p>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {todayClasses.map((cls) => (
                  <div key={cls.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded bg-blue-50 text-primary font-bold text-xs min-w-[70px] text-center border border-blue-100">
                        {cls.subjectCode}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0F172A]">{cls.subjectName}</h4>
                        <p className="text-xs text-[#64748B]">
                          Class: {cls.class} • Room: {cls.room}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {cls.time}
                      </Badge>
                      <Link to="/faculty/attendance">
                        <Button variant="primary" size="sm">
                          Take Attendance
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Assigned Subjects Overview */}
          <Card
            title="My Assigned Subjects"
            subtitle="Syllabus progression & weekly contact hours"
            action={
              <Link to="/faculty/subjects" className="text-xs font-semibold text-primary hover:underline">
                Subject Directory →
              </Link>
            }
          >
            <div className="space-y-4">
              {assignedSubjects.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-lg border border-[#E2E8F0] bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-primary font-mono mr-2">{sub.code}</span>
                      <span className="text-sm font-semibold text-[#0F172A]">{sub.name}</span>
                    </div>
                    <Badge variant="primary" size="sm">
                      {sub.credits} Credits ({sub.weeklyHours} hrs/wk)
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#64748B]">
                      <span>Syllabus Covered:</span>
                      <span className="font-semibold text-[#0F172A]">{sub.syllabusCompletion}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${sub.syllabusCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Pending Evaluations & Department Notices */}
        <div className="space-y-6">
          {/* Pending Submissions */}
          <Card
            title="Pending Submissions"
            subtitle="Assignments requiring score evaluation"
            action={
              <Link to="/faculty/assignments" className="text-xs font-semibold text-primary hover:underline">
                Grade All →
              </Link>
            }
          >
            {pendingEvaluationsList.length === 0 ? (
              <p className="text-xs text-[#64748B] py-3 text-center">All submissions evaluated!</p>
            ) : (
              <div className="space-y-3">
                {pendingEvaluationsList.map((asn) => {
                  const pendingCount = asn.submissions.filter((s) => s.status === 'Pending Evaluation').length;
                  return (
                    <div key={asn.id} className="p-3 rounded-lg border border-[#E2E8F0] bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-primary font-semibold">{asn.subjectCode}</span>
                        <Badge variant="warning" size="sm">
                          {pendingCount} Pending
                        </Badge>
                      </div>
                      <h5 className="text-xs font-semibold text-[#0F172A] line-clamp-1">{asn.title}</h5>
                      <p className="text-[11px] text-[#64748B]">Due: {asn.dueDate}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Department Notices */}
          <Card
            title="Department Notices"
            subtitle="Broadcasts published by faculty"
            action={
              <Link to="/faculty/notices" className="text-xs font-semibold text-primary hover:underline">
                Manage →
              </Link>
            }
          >
            <div className="space-y-3">
              {recentNotices.map((not) => (
                <div key={not.id} className="p-3 bg-slate-50 rounded-lg border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={not.priority === 'High' ? 'error' : 'info'} size="sm">
                      {not.category}
                    </Badge>
                    <span className="text-[11px] text-[#64748B]">{not.date}</span>
                  </div>
                  <h5 className="text-xs font-semibold text-[#0F172A]">{not.title}</h5>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
