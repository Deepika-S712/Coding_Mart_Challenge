import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Calendar,
  CheckSquare,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton, CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';

export function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facultyApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton height="32px" width="240px" style={{ marginBottom: '8px' }} />
          <Skeleton height="18px" width="380px" />
        </div>
        <div className="cms-stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load Faculty Dashboard"
        message={error}
        onRetry={fetchDashboardData}
      />
    );
  }

  const { stats, todayClasses = [], recentActivities = [], faculty } = data || {};

  const classColumns = [
    {
      header: 'Time',
      accessor: 'startTime',
      render: (_, row) => (
        <span style={{ fontWeight: 600, color: 'var(--cms-text-primary)' }}>
          {row.startTime} - {row.endTime}
        </span>
      )
    },
    {
      header: 'Subject',
      accessor: 'subjectName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--cms-text-secondary)' }}>{row.subjectCode}</div>
        </div>
      )
    },
    {
      header: 'Class',
      accessor: 'className',
      render: (val) => <Badge variant="neutral">{val}</Badge>
    },
    {
      header: 'Room',
      accessor: 'room',
      render: (val) => <span style={{ color: 'var(--cms-text-secondary)' }}>{val}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => {
        const variant = val === 'Completed' ? 'success' : val === 'Scheduled' ? 'primary' : 'warning';
        return <Badge variant={variant}>{val}</Badge>;
      }
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/faculty/attendance?subjectCode=${row.subjectCode}&className=${row.className}`)}
        >
          Mark Attendance
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="cms-page-header">
        <div>
          <h1 className="cms-page-title">Welcome back, {faculty?.name || 'Dr. Arun Kumar'}</h1>
          <p className="cms-page-subtitle">
            {faculty?.designation} • {faculty?.department}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/faculty/timetable')}
          >
            Full Timetable
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/faculty/attendance')}
          >
            Take Attendance
          </Button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{stats?.mySubjectsCount ?? 3}</div>
            <div className="cms-stat-label">My Subjects</div>
          </div>
          <div className="cms-stat-icon">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{stats?.totalStudentsCount ?? 14}</div>
            <div className="cms-stat-label">Total Students</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#DCFCE7', color: 'var(--cms-success)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{stats?.todayClassesCount ?? 2}</div>
            <div className="cms-stat-label">Today's Classes</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#FEF3C7', color: 'var(--cms-warning)' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{stats?.pendingTasksCount ?? 4}</div>
            <div className="cms-stat-label">Pending Tasks</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#E0F2FE', color: 'var(--cms-info)' }}>
            <CheckSquare size={24} />
          </div>
        </div>
      </div>

      {/* Today's Classes & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '20px' }}>
        {/* Today's Classes Table */}
        <Card
          title="Today's Classes"
          subtitle="Real-time schedule for today's lectures and labs"
          action={
            <Link
              to="/faculty/timetable"
              style={{ fontSize: '13px', color: 'var(--cms-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View Timetable</span>
              <ArrowRight size={14} />
            </Link>
          }
        >
          <Table
            columns={classColumns}
            data={todayClasses}
            emptyMessage="No classes scheduled for today"
          />
        </Card>

        {/* Recent Activity Feed */}
        <Card
          title="Recent Activity Feed"
          subtitle="Updates across your classes and courses"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--cms-border-subtle)'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--cms-radius-full)',
                    backgroundColor: 'var(--cms-bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {act.type === 'assignment' && <FileText size={16} color="var(--cms-primary)" />}
                  {act.type === 'attendance' && <CheckCircle2 size={16} color="var(--cms-success)" />}
                  {act.type === 'marks' && <FileCheck size={16} color="var(--cms-info)" />}
                  {act.type === 'content' && <BookOpen size={16} color="var(--cms-warning)" />}
                  {act.type === 'assessment' && <Clock size={16} color="#7C3AED" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cms-text-primary)' }}>
                      {act.action}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cms-text-muted)' }}>
                      {act.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--cms-text-secondary)', marginTop: '2px' }}>
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
