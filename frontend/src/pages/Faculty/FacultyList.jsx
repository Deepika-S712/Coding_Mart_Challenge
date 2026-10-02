import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Users,
  BookOpen,
} from 'lucide-react';
import { facultyService, departmentService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState('');

  // Reference
  const [departments, setDepartments] = useState([]);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await departmentService.getAll();
        if (res.data.success) setDepartments(res.data.data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    }
    loadDepts();
  }, []);

  const fetchFaculty = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: pagination.limit,
        search,
        department_id: departmentId || undefined,
        designation: designation || undefined,
        status: status || undefined,
      };

      const res = await facultyService.getAll(params);
      if (res.data.success) {
        setFaculty(res.data.data.faculty);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
      setError(err.response?.data?.message || 'Error loading faculty records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty(1);
  }, [search, departmentId, designation, status]);

  const handleDeleteClick = (f) => {
    setFacultyToDelete(f);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!facultyToDelete) return;
    try {
      setIsDeleting(true);
      await facultyService.delete(facultyToDelete.id);
      setSuccess(`Faculty member "${facultyToDelete.name}" (${facultyToDelete.faculty_id}) was deleted successfully.`);
      setDeleteModalOpen(false);
      setFacultyToDelete(null);
      fetchFaculty(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete faculty member.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Faculty Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage instructors, academic designations, and subject allocations
          </p>
        </div>
        <Link to="/admin/faculty/add" className="btn btn-primary">
          <Plus size={16} />
          <span>Add Faculty Member</span>
        </Link>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="toolbar-search">
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search faculty by Name, ID, Email..."
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
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            >
              <option value="">All Designations</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
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
            </select>

            {(search || departmentId || designation || status) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setDepartmentId('');
                  setDesignation('');
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
            <p>Loading faculty records from database...</p>
          </div>
        ) : faculty.length === 0 ? (
          <div className="empty-state">
            <Users className="empty-state-icon" />
            <h3 className="empty-state-title">No Faculty Members Found</h3>
            <p className="empty-state-desc">
              {search || departmentId || designation || status
                ? 'No faculty matched the filter criteria.'
                : 'No faculty members exist. Click "Add Faculty Member" to register an instructor.'}
            </p>
            <Link to="/admin/faculty/add" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add Faculty</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Assigned Subjects</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {f.faculty_id}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{f.name}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{f.email}</td>
                    <td>
                      <span title={f.department_name}>
                        {f.department_code || f.department_name || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{f.designation}</span>
                    </td>
                    <td>
                      {f.assigned_subjects && f.assigned_subjects.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {f.assigned_subjects.map((sub) => (
                            <span
                              key={sub.id}
                              className="badge badge-info"
                              title={sub.subject_name}
                              style={{ fontSize: '10px' }}
                            >
                              {sub.subject_code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Unassigned</span>
                      )}
                    </td>
                    <td>{f.joining_date}</td>
                    <td>
                      <Badge status={f.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Faculty Profile"
                          onClick={() => navigate(`/admin/faculty/${f.id}`)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Faculty"
                          onClick={() => navigate(`/admin/faculty/edit/${f.id}`)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          title="Delete Faculty"
                          onClick={() => handleDeleteClick(f)}
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

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={(p) => fetchFaculty(p)}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Faculty Record"
        message={`Are you sure you want to permanently delete faculty member "${facultyToDelete?.name}" (${facultyToDelete?.faculty_id})?`}
        confirmText="Yes, Delete Faculty"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setFacultyToDelete(null);
        }}
      />
    </div>
  );
}
