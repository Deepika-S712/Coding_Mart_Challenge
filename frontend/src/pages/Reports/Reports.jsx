import React, { useState, useEffect } from 'react';
import {
  Download,
  BarChart3,
  GraduationCap,
  Users,
  BookOpen,
  Library,
  FileSpreadsheet,
  RefreshCw,
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
import { reportService } from '../../services/api';
import Alert from '../../components/common/Alert';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('students');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reportService.getReports();
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = (entity) => {
    const url = reportService.downloadCsvUrl(entity);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p>Generating reports from PostgreSQL database...</p>
      </div>
    );
  }

  const { students, faculty, courses, subjects } = reportData || {};

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#F1F5F9' } },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
    },
    cutout: '65%',
  };

  // Student charts
  const studentsByDeptData = {
    labels: students?.byDepartment?.map((d) => d.department_code || d.department_name) || [],
    datasets: [
      {
        label: 'Enrolled Students',
        data: students?.byDepartment?.map((d) => d.count) || [],
        backgroundColor: '#2563EB',
        borderRadius: 4,
      },
    ],
  };

  const studentsByYearData = {
    labels: students?.byYear?.map((y) => `Year ${y.year}`) || [],
    datasets: [
      {
        label: 'Students by Year',
        data: students?.byYear?.map((y) => y.count) || [],
        backgroundColor: ['#2563EB', '#16A34A', '#F59E0B', '#7C3AED'],
      },
    ],
  };

  // Faculty charts
  const facultyByDeptData = {
    labels: faculty?.byDepartment?.map((d) => d.department_code || d.department_name) || [],
    datasets: [
      {
        label: 'Faculty Count',
        data: faculty?.byDepartment?.map((d) => d.count) || [],
        backgroundColor: '#16A34A',
        borderRadius: 4,
      },
    ],
  };

  const facultyByDesigData = {
    labels: faculty?.byDesignation?.map((d) => d.designation) || [],
    datasets: [
      {
        label: 'Designations',
        data: faculty?.byDesignation?.map((d) => d.count) || [],
        backgroundColor: ['#2563EB', '#0284C7', '#16A34A', '#F59E0B', '#7C3AED'],
      },
    ],
  };

  // Courses by Dept
  const coursesByDeptData = {
    labels: courses?.byDepartment?.map((c) => c.department_name) || [],
    datasets: [
      {
        label: 'Course Count',
        data: courses?.byDepartment?.map((c) => c.count) || [],
        backgroundColor: '#7C3AED',
        borderRadius: 4,
      },
    ],
  };

  // Subjects by Course
  const subjectsByCourseData = {
    labels: subjects?.byCourse?.map((s) => s.course_code || s.course_name) || [],
    datasets: [
      {
        label: 'Subjects Taught',
        data: subjects?.byCourse?.map((s) => s.count) || [],
        backgroundColor: '#0284C7',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Administrative Reports & Analytics
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Visual breakdown of enrollment, staffing, and academic structure with CSV export
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchReports}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleExportCsv(activeTab)}
          >
            <Download size={14} />
            <span>Export {activeTab.toUpperCase()} CSV</span>
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('students')}
        >
          <GraduationCap size={15} />
          <span>Student Reports</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'faculty' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('faculty')}
        >
          <Users size={15} />
          <span>Faculty Reports</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={15} />
          <span>Course Reports</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('subjects')}
        >
          <Library size={15} />
          <span>Subject Reports</span>
        </button>
      </div>

      {/* STUDENT REPORTS TAB */}
      {activeTab === 'students' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Students by Department</h3>
                <span className="badge badge-neutral">Total: {students?.total || 0}</span>
              </div>
              <div style={{ height: '240px' }}>
                <Bar data={studentsByDeptData} options={barOptions} />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Students by Academic Year</h3>
                <span className="badge badge-neutral">4 Batches</span>
              </div>
              <div style={{ height: '240px' }}>
                <Doughnut data={studentsByYearData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Enrolled Students by Course</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleExportCsv('students')}
              >
                <FileSpreadsheet size={14} />
                <span>Export Students CSV</span>
              </button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Students Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.byCourse?.map((c) => {
                    const pct = students.total > 0 ? ((c.count / students.total) * 100).toFixed(1) : 0;
                    return (
                      <tr key={c.id}>
                        <td><strong>{c.course_code}</strong></td>
                        <td>{c.course_name}</td>
                        <td><strong>{c.count}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '80px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FACULTY REPORTS TAB */}
      {activeTab === 'faculty' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Faculty Distribution by Department</h3>
                <span className="badge badge-neutral">Total: {faculty?.total || 0}</span>
              </div>
              <div style={{ height: '240px' }}>
                <Bar data={facultyByDeptData} options={barOptions} />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Faculty by Designation</h3>
              </div>
              <div style={{ height: '240px' }}>
                <Doughnut data={facultyByDesigData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Faculty Staffing Summary</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleExportCsv('faculty')}
              >
                <FileSpreadsheet size={14} />
                <span>Export Faculty CSV</span>
              </button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Code</th>
                    <th>Faculty Count</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty?.byDepartment?.map((f) => (
                    <tr key={f.id}>
                      <td><strong>{f.department_name}</strong></td>
                      <td>{f.department_code}</td>
                      <td><strong>{f.count}</strong> Members</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COURSE REPORTS TAB */}
      {activeTab === 'courses' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Courses Distributed by Department</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleExportCsv('courses')}
            >
              <FileSpreadsheet size={14} />
              <span>Export Courses CSV</span>
            </button>
          </div>
          <div style={{ height: '280px', marginBottom: '20px' }}>
            <Bar data={coursesByDeptData} options={barOptions} />
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Offered Courses</th>
                </tr>
              </thead>
              <tbody>
                {courses?.byDepartment?.map((c, i) => (
                  <tr key={i}>
                    <td><strong>{c.department_name}</strong></td>
                    <td><strong>{c.count}</strong> Degree Programs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBJECT REPORTS TAB */}
      {activeTab === 'subjects' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Curriculum Subjects by Course</h3>
            <span className="badge badge-neutral">Active Subjects</span>
          </div>
          <div style={{ height: '280px', marginBottom: '20px' }}>
            <Bar data={subjectsByCourseData} options={barOptions} />
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Subjects Count</th>
                </tr>
              </thead>
              <tbody>
                {subjects?.byCourse?.map((s, idx) => (
                  <tr key={idx}>
                    <td><strong>{s.course_code}</strong></td>
                    <td>{s.course_name}</td>
                    <td><strong>{s.count}</strong> Subjects</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
