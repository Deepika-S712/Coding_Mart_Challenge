import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Library,
  Clock,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { dashboardService } from '../services/api';
import StatsCard from '../components/common/StatsCard';
import Alert from '../components/common/Alert';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getStats();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data from PostgreSQL server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Loading real-time college data from PostgreSQL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert type="error" message={error} />
        <button type="button" className="btn btn-secondary" onClick={fetchDashboardData}>
          <RefreshCw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const totals = data?.totals || {};
  const charts = data?.charts || {};
  const recentActivities = data?.recentActivities || [];

  // Chart 1: Students by Department
  const studentDeptLabels = charts.studentsByDepartment?.map((d) => d.department_code || d.department_name) || [];
  const studentDeptCounts = charts.studentsByDepartment?.map((d) => d.student_count) || [];

  const studentsChartData = {
    labels: studentDeptLabels,
    datasets: [
      {
        label: 'Students Enrolled',
        data: studentDeptCounts,
        backgroundColor: '#2563EB',
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: '#F1F5F9' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Chart 2: Faculty Distribution by Department
  const facultyDeptLabels = charts.facultyByDepartment?.map((d) => d.department_code || d.department_name) || [];
  const facultyDeptCounts = charts.facultyByDepartment?.map((d) => d.faculty_count) || [];

  const facultyColors = ['#2563EB', '#16A34A', '#F59E0B', '#7C3AED', '#0284C7', '#64748B'];

  const facultyChartData = {
    labels: facultyDeptLabels,
    datasets: [
      {
        label: 'Faculty Count',
        data: facultyDeptCounts,
        backgroundColor: facultyColors.slice(0, facultyDeptLabels.length),
        borderWidth: 1,
        borderColor: '#FFFFFF',
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 14, font: { size: 12 } },
      },
    },
    cutout: '65%',
  };

  // Chart 3: Course Statistics by Department
  const courseDeptLabels = charts.coursesByDepartment?.map((c) => c.department_name) || [];
  const courseDeptCounts = charts.coursesByDepartment?.map((c) => c.course_count) || [];

  const courseChartData = {
    labels: courseDeptLabels,
    datasets: [
      {
        label: 'Number of Courses',
        data: courseDeptCounts,
        backgroundColor: '#16A34A',
        borderRadius: 4,
      },
    ],
  };

  const formatActivityTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            College Overview
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time administrative stats from PostgreSQL database
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Students"
          value={totals.students}
          icon={<GraduationCap size={22} />}
          color="blue"
        />
        <StatsCard
          title="Total Faculty"
          value={totals.faculty}
          icon={<Users size={22} />}
          color="green"
        />
        <StatsCard
          title="Total Departments"
          value={totals.departments}
          icon={<Building2 size={22} />}
          color="purple"
        />
        <StatsCard
          title="Total Courses"
          value={totals.courses}
          icon={<BookOpen size={22} />}
          color="amber"
        />
        <StatsCard
          title="Total Subjects"
          value={totals.subjects}
          icon={<Library size={22} />}
          color="cyan"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Chart 1: Student Statistics */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Student Statistics</h2>
              <p className="card-subtitle">Students distribution by department</p>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <Bar data={studentsChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Chart 2: Faculty Statistics */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Faculty Statistics</h2>
              <p className="card-subtitle">Faculty distribution across departments</p>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <Doughnut data={facultyChartData} options={doughnutChartOptions} />
          </div>
        </div>

        {/* Chart 3: Course Statistics */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Course Statistics</h2>
              <p className="card-subtitle">Number of active courses per department</p>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <Bar data={courseChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Admin Activities */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Admin Activities</h2>
            <p className="card-subtitle">Latest administrative operations logged in PostgreSQL</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Clock size={14} />
            <span>Activity Log Feed</span>
          </div>
        </div>

        {recentActivities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>
            No recent activities recorded yet.
          </p>
        ) : (
          <div className="activity-feed">
            {recentActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-dot" />
                <div className="activity-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="activity-action">{act.action}</span>
                    <span className="activity-time">{formatActivityTime(act.created_at)}</span>
                  </div>
                  {act.details && <div className="activity-details">{act.details}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
