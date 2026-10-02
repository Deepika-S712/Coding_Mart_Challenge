import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  CheckSquare,
  BookOpen,
  CreditCard,
  Clock,
  Calendar,
  Bell,
  GraduationCap,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/student/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load student dashboard.');
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
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
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

  const { student, kpis, todayClasses = [], recentAnnouncements = [], recentResults, feeSummary } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Welcome, {student?.name}</h2>
          <p className="text-xs text-[#64748B]">
            {student?.rollNo} • {student?.department} ({student?.class})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/student/results">
            <Button variant="secondary" size="sm" icon={GraduationCap}>
              View Results
            </Button>
          </Link>
          <Link to="/student/fees">
            <Button variant="primary" size="sm" icon={CreditCard}>
              Pay / View Fees
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${kpis.attendancePercentage}%`}
          subtitle="Above 75% requirement"
          icon={CheckSquare}
          color={kpis.attendancePercentage >= 85 ? 'success' : 'warning'}
        />
        <StatCard
          title="Current Semester"
          value={kpis.currentSemester}
          subtitle="Academic Year 2026-27"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Pending Fees"
          value={`₹${kpis.pendingFees.toLocaleString()}`}
          subtitle={`Status: ${kpis.feeStatus}`}
          icon={CreditCard}
          color={kpis.pendingFees > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Next Exam"
          value={kpis.nextExam ? kpis.nextExam.subjectCode : 'None'}
          subtitle={kpis.nextExam ? `${kpis.nextExam.date} (${kpis.nextExam.time})` : 'All clear'}
          icon={Clock}
          color="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Today's Classes & Lectures"
            subtitle="Scheduled periods for today according to college timetable"
            action={
              <Link to="/student/timetable" className="text-xs font-semibold text-primary hover:underline">
                Full Timetable →
              </Link>
            }
          >
            {todayClasses.length === 0 ? (
              <p className="text-sm text-[#64748B] py-4 text-center">No classes scheduled for today.</p>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {todayClasses.map((cls) => (
                  <div key={cls.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded bg-slate-100 text-[#0F172A] font-semibold text-xs min-w-[70px] text-center">
                        {cls.subjectCode}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0F172A]">{cls.subjectName}</h4>
                        <p className="text-xs text-[#64748B]">
                          {cls.facultyName} • Room: {cls.room}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {cls.time}
                      </Badge>
                      <Badge variant={cls.type === 'Lab' ? 'info' : 'primary'} size="sm">
                        {cls.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Exam Results Highlight */}
          <Card
            title="Recent Academic Results"
            subtitle={recentResults ? `${recentResults.semester} Summary` : 'Results'}
            action={
              <Link to="/student/results" className="text-xs font-semibold text-primary hover:underline">
                Unlock Full Report Card →
              </Link>
            }
          >
            {recentResults ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <span className="text-xs text-[#64748B]">Semester SGPA: </span>
                    <span className="text-lg font-bold text-primary">{recentResults.sgpa}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#64748B]">Cumulative CGPA: </span>
                    <span className="text-lg font-bold text-[#0F172A]">{student.cgpa || '8.74'}</span>
                  </div>
                  <Badge variant="success" size="md">
                    {recentResults.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentResults.subjects.slice(0, 4).map((sub) => (
                    <div key={sub.code} className="p-2.5 rounded border border-[#E2E8F0] flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-[#0F172A]">{sub.code}</p>
                        <p className="text-[11px] text-[#64748B] truncate max-w-[140px]">{sub.name}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary">{sub.grade}</span>
                        <p className="text-[11px] text-[#64748B]">{sub.total}/100</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No previous results records found.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Fee Summary & Announcements */}
        <div className="space-y-6">
          {/* Fee Summary Widget */}
          <Card
            title="Fee Summary"
            subtitle="Semester 5 Ledger"
            action={
              <Link to="/student/fees" className="text-xs font-semibold text-primary hover:underline">
                Details →
              </Link>
            }
          >
            {feeSummary ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs pb-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Total Invoiced:</span>
                  <span className="font-semibold text-[#0F172A]">₹{feeSummary.totalFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pb-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Paid Amount:</span>
                  <span className="font-semibold text-success">₹{feeSummary.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pb-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Pending Balance:</span>
                  <span className="font-bold text-error">₹{feeSummary.pendingAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-[#64748B]">Due Date: {feeSummary.dueDate}</span>
                  <Badge variant={feeSummary.status === 'Paid' ? 'success' : 'warning'} size="sm">
                    {feeSummary.status}
                  </Badge>
                </div>
              </div>
            ) : null}
          </Card>

          {/* Announcements Widget */}
          <Card
            title="Campus Notices"
            subtitle="Latest administrative bulletins"
            action={
              <Link to="/student/announcements" className="text-xs font-semibold text-primary hover:underline">
                View All →
              </Link>
            }
          >
            <div className="space-y-3">
              {recentAnnouncements.map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 rounded-lg border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={ann.priority === 'High' || ann.priority === 'Urgent' ? 'error' : 'info'} size="sm">
                      {ann.category}
                    </Badge>
                    <span className="text-[11px] text-[#64748B]">{ann.date}</span>
                  </div>
                  <h5 className="text-xs font-semibold text-[#0F172A] line-clamp-1">{ann.title}</h5>
                  <p className="text-[11px] text-[#64748B] line-clamp-2">{ann.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
