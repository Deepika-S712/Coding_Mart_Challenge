import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { StatCard } from '../components/StatCard';
import { Users, Award, Percent, CheckCircle2, XCircle, ArrowRight, Building2 } from 'lucide-react';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Overview Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time enrollment, academic scores, and attendance indicators across university departments.
          </p>
        </div>
        <Link
          to="/students"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <span>Manage Students</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled cohort"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Average Marks"
          value={stats?.averageMarks ? `${stats.averageMarks}%` : '0%'}
          subtitle="Across all courses"
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Average Attendance"
          value={stats?.averageAttendance ? `${stats.averageAttendance}%` : '0%'}
          subtitle="Academic attendance"
          icon={Percent}
          color="amber"
        />
        <StatCard
          title="Students Passed"
          value={stats?.passedCount || 0}
          subtitle="Passing criteria met"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Students Failed"
          value={stats?.failedCount || 0}
          subtitle="Remedial required"
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Department-wise Distribution</h2>
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {Object.keys(stats?.departmentCounts || {}).length} Departments Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(stats?.departmentCounts || {}).map(([dept, count]) => {
            const percentage = stats?.totalStudents
              ? Math.round((count / stats.totalStudents) * 100)
              : 0;

            return (
              <div key={dept} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{dept}</span>
                  <span className="text-sm font-bold text-blue-600">{count} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-right mt-1.5">{percentage}% of total student body</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
