import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  GraduationCap,
  Filter,
} from 'lucide-react';
import { studentService, departmentService, courseService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState('');

  // Dropdown reference data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Load departments and courses for filtering
  useEffect(() => {
    async function loadMeta() {
      try {
        const [deptRes, courseRes] = await Promise.all([
          departmentService.getAll(),
          courseService.getAll(),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (courseRes.data.success) setCourses(courseRes.data.data);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  const fetchStudents = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: pagination.limit,
        search,
        department_id: departmentId || undefined,
        course_id: courseId || undefined,
        year: year || undefined,
        status: status || undefined,
      };

      const res = await studentService.getAll(params);
      if (res.data.success) {
        setStudents(res.data.data.students);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError(err.response?.data?.message || 'Error loading students from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
  }, [search, departmentId, courseId, year, status]);

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeleting(true);
      await studentService.delete(studentToDelete.id);
      setSuccess(`Student "${studentToDelete.name}" (${studentToDelete.student_id}) has been deleted successfully.`);
      setDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Student Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage student enrollments, academic details, and status
          </p>
        </div>
        <Link to="/admin/students/add" className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Student</span>
        </Link>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Main Table Card */}
      <div className="table-container">
        {/* Toolbar & Filters */}
        <div className="table-toolbar">
          <div className="toolbar-search">
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, Name, Email, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-filters">
            <select
              className="form-select"
              style={{ fontSize: '13px', padding: '6px 10px' }}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_code} - {d.department_name}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ fontSize: '13px', padding: '6px 10px' }}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ fontSize: '13px', padding: '6px 10px' }}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>

            <select
              className="form-select"
              style={{ fontSize: '13px', padding: '6px 10px' }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>

            {(search || departmentId || courseId || year || status) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setDepartmentId('');
                  setCourseId('');
                  setYear('');
                  setStatus('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading students from PostgreSQL...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <GraduationCap className="empty-state-icon" />
            <h3 className="empty-state-title">No Students Found</h3>
            <p className="empty-state-desc">
              {search || departmentId || courseId || year || status
                ? 'Try adjusting your search query or filter criteria.'
                : 'No student records have been created yet. Click "Add New Student" to get started.'}
            </p>
            <Link to="/admin/students/add" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add Student</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Department</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {student.student_id}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{student.name}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.phone || '—'}</td>
                    <td>{student.gender || '—'}</td>
                    <td>{student.date_of_birth || '—'}</td>
                    <td>
                      <span title={student.department_name}>
                        {student.department_code || student.department_name || '—'}
                      </span>
                    </td>
                    <td>
                      <span title={student.course_name}>
                        {student.course_code || student.course_name || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">Year {student.year}</span>
                    </td>
                    <td>
                      <Badge status={student.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Student"
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Student"
                          onClick={() => navigate(`/admin/students/edit/${student.id}`)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          title="Delete Student"
                          onClick={() => handleDeleteClick(student)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={(p) => fetchStudents(p)}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${studentToDelete?.name}" (${studentToDelete?.student_id}) from PostgreSQL? This action cannot be reversed.`}
        confirmText="Yes, Delete Student"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
      />
    </div>
  );
}
