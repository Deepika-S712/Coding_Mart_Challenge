import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { CheckSquare, Calendar, Percent, AlertCircle, Award } from 'lucide-react';

export const StudentAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/student/attendance');
      setAttendance(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAttendance} />;
  }

  const { overallPercentage, totalHeld, totalAttended, monthlyTrend = [], subjectBreakdown = [] } = attendance;

  const tableColumns = [
    {
      header: 'Subject Code',
      key: 'subjectCode',
      render: (val) => <span className="font-semibold text-primary font-mono">{val}</span>
    },
    {
      header: 'Subject Name',
      key: 'subjectName',
      render: (val) => <span className="font-medium text-[#0F172A]">{val}</span>
    },
    {
      header: 'Faculty Instructor',
      key: 'facultyName',
      render: (val) => <span className="text-xs text-[#64748B]">{val}</span>
    },
    {
      header: 'Held',
      key: 'held',
      render: (val) => <span className="text-center font-medium">{val}</span>
    },
    {
      header: 'Attended',
      key: 'attended',
      render: (val) => <span className="text-center font-semibold text-success">{val}</span>
    },
    {
      header: 'Attendance %',
      key: 'percentage',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                val >= 85 ? 'bg-success' : val >= 75 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${Math.min(val, 100)}%` }}
            />
          </div>
          <Badge
            variant={val >= 85 ? 'success' : val >= 75 ? 'warning' : 'error'}
            size="sm"
          >
            {val}%
          </Badge>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (_, row) => (
        <span className="text-xs">
          {row.percentage >= 75 ? (
            <span className="text-success font-medium">Eligible for Exams</span>
          ) : (
            <span className="text-error font-medium">Shortage Warning</span>
          )}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Attendance Analytics & Records</h2>
        <p className="text-xs text-[#64748B]">Semester 5 Course-wise Attendance Progress</p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          subtitle="Minimum 75% required for exam eligibility"
          icon={Percent}
          color={overallPercentage >= 85 ? 'success' : overallPercentage >= 75 ? 'warning' : 'error'}
        />
        <StatCard
          title="Classes Attended"
          value={`${totalAttended} / ${totalHeld}`}
          subtitle={`${totalHeld - totalAttended} Sessions Missed`}
          icon={CheckSquare}
          color="primary"
        />
        <StatCard
          title="Academic Standing"
          value={overallPercentage >= 85 ? "Excellent" : overallPercentage >= 75 ? "Satisfactory" : "At Risk"}
          subtitle="Regular semester attendance criteria"
          icon={Award}
          color={overallPercentage >= 85 ? "success" : overallPercentage >= 75 ? "warning" : "error"}
        />
      </div>

      {/* Monthly Attendance Bar Chart */}
      <Card
        title="Monthly Attendance Trend"
        subtitle="Visual representation of monthly presence rates"
      >
        <div className="space-y-4 pt-2">
          {monthlyTrend.map((m) => (
            <div key={m.month} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[#0F172A]">
                <span>{m.month}</span>
                <span className="text-primary">{m.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${m.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Subject Breakdown Table */}
      <Card
        title="Subject-wise Attendance Breakdown"
        subtitle="Individual lecture hours, laboratory sessions, and attendance percentages"
      >
        <Table columns={tableColumns} data={subjectBreakdown} keyField="subjectCode" />
      </Card>
    </div>
  );
};

export default StudentAttendance;
