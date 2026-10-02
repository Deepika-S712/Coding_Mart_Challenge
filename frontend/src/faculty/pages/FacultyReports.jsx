import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  BarChart2,
  Users,
  CheckSquare,
  BookOpen,
  Award,
  FileText,
  TrendingUp,
  Percent
} from 'lucide-react';

const reportTabs = [
  'Student Performance',
  'Subject Performance',
  'Attendance Analytics',
  'Assignments & Assessments'
];

export const FacultyReports = () => {
  const [reportsData, setReportsData] = useState(null);
  const [activeTab, setActiveTab] = useState('Student Performance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/reports');
      setReportsData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load faculty analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchReports} />;
  }

  const { studentPerformance = [], subjectPerformance = [], summary = {} } = reportsData;

  const studentColumns = [
    {
      header: 'Roll No',
      key: 'rollNo',
      render: (val) => <span className="font-mono text-xs font-semibold text-primary">{val}</span>
    },
    {
      header: 'Student Name',
      key: 'name',
      render: (val) => <span className="font-semibold text-sm text-[#0F172A]">{val}</span>
    },
    {
      header: 'Class',
      key: 'class',
      render: (val) => <Badge variant="neutral" size="sm">{val}</Badge>
    },
    {
      header: 'Attendance %',
      key: 'attendanceRate',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                val >= 85 ? 'bg-success' : val >= 75 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="font-bold text-xs">{val}%</span>
        </div>
      )
    },
    {
      header: 'CGPA',
      key: 'cgpa',
      render: (val) => <span className="font-bold text-[#0F172A]">{val || '8.50'}</span>
    },
    {
      header: 'Academic Standing',
      key: 'status',
      render: (val) => (
        <Badge
          variant={val === 'Good Standing' ? 'success' : val === 'Warning' ? 'warning' : 'error'}
          size="sm"
          dot
        >
          {val}
        </Badge>
      )
    }
  ];

  const subjectColumns = [
    {
      header: 'Code',
      key: 'code',
      render: (val) => <span className="font-mono text-xs font-bold text-primary">{val}</span>
    },
    {
      header: 'Course Title',
      key: 'name',
      render: (val) => <span className="font-semibold text-sm text-[#0F172A]">{val}</span>
    },
    {
      header: 'Credits',
      key: 'credits',
      render: (val) => <span className="font-medium text-center">{val} Credits</span>
    },
    {
      header: 'Syllabus Progress',
      key: 'completionRate',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${val}%` }} />
          </div>
          <span className="text-xs font-semibold text-primary">{val}%</span>
        </div>
      )
    },
    {
      header: 'Assessments Held',
      key: 'assessmentsHeld',
      render: (val) => <span className="font-semibold text-center">{val} Tests</span>
    },
    {
      header: 'Assignments Given',
      key: 'assignmentsGiven',
      render: (val) => <span className="font-semibold text-center">{val} Problem Sets</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Faculty Academic Analytics & Reports</h2>
        <p className="text-xs text-[#64748B]">
          Comprehensive student performance metrics, course progressions, and attendance distributions
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={summary.totalStudents}
          subtitle="Enrolled in active courses"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Class Average Attendance"
          value={`${summary.averageClassAttendance}%`}
          subtitle="Across all lecture sessions"
          icon={CheckSquare}
          color="success"
        />
        <StatCard
          title="Subjects Managed"
          value={summary.totalSubjects}
          subtitle="Department curriculum"
          icon={BookOpen}
          color="info"
        />
        <StatCard
          title="Assessments Conducted"
          value={summary.totalAssessments + summary.totalAssignments}
          subtitle={`${summary.totalAssessments} Tests • ${summary.totalAssignments} Assignments`}
          icon={Award}
          color="warning"
        />
      </div>

      {/* Tab Controls */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-2">
        {reportTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Student Performance' && (
        <Card
          title="Student Performance & Academic Standing Ledger"
          subtitle="CGPA benchmarks and continuous attendance compliance"
        >
          <Table columns={studentColumns} data={studentPerformance} keyField="id" />
        </Card>
      )}

      {activeTab === 'Subject Performance' && (
        <Card
          title="Curriculum & Subject Progress Report"
          subtitle="Syllabus coverage and assessment frequency"
        >
          <Table columns={subjectColumns} data={subjectPerformance} keyField="code" />
        </Card>
      )}

      {activeTab === 'Attendance Analytics' && (
        <Card title="Attendance Distribution Matrix">
          <div className="space-y-4 text-xs">
            <p className="text-[#64748B]">
              Class attendance compliance breakdown for Semester 5 students:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-success text-lg block">8 Students (80%)</span>
                <span className="text-[#64748B]">Above 85% — Excellent Compliance</span>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-bold text-warning text-lg block">2 Students (20%)</span>
                <span className="text-[#64748B]">75% to 85% — Satisfactory</span>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <span className="font-bold text-error text-lg block">0 Students (0%)</span>
                <span className="text-[#64748B]">Below 75% — Attendance Shortage</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'Assignments & Assessments' && (
        <Card title="Continuous Internal Evaluation (CIE) Summary">
          <div className="space-y-3 text-xs">
            <p className="text-[#64748B]">
              Summary of all evaluation components completed for the current academic session.
            </p>
            <div className="p-4 bg-slate-50 rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                <span className="font-semibold text-[#0F172A]">Unit Tests Conducted:</span>
                <span className="font-bold text-primary">3 Tests Completed</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                <span className="font-semibold text-[#0F172A]">Homework & Problem Sets:</span>
                <span className="font-bold text-primary">3 Sets Published</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                <span className="font-semibold text-[#0F172A]">Average Pass Percentage:</span>
                <span className="font-bold text-success">96.7%</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FacultyReports;
