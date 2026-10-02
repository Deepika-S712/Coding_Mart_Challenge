import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
} from 'lucide-react';
import { departmentService } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    department_name: '',
    department_code: '',
    hod_name: '',
    description: '',
    status: 'Active',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await departmentService.getAll({ search });
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      department_name: '',
      department_code: '',
      hod_name: '',
      description: '',
      status: 'Active',
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      department_name: dept.department_name,
      department_code: dept.department_code,
      hod_name: dept.hod_name || '',
      description: dept.description || '',
      status: dept.status || 'Active',
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.department_name.trim() || !formData.department_code.trim()) {
      setModalError('Department Name and Department Code are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingDept) {
        await departmentService.update(editingDept.id, formData);
        setSuccess(`Department "${formData.department_name}" updated successfully.`);
      } else {
        await departmentService.create(formData);
        setSuccess(`Department "${formData.department_name}" created successfully.`);
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (dept) => {
    setDeptToDelete(dept);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    try {
      setIsDeleting(true);
      await departmentService.delete(deptToDelete.id);
      setSuccess(`Department "${deptToDelete.department_name}" was deleted successfully.`);
      setDeleteModalOpen(false);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Department Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage academic faculties, department heads, and related student/faculty metrics
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="table-container">
        <div className="table-toolbar">
          <div className="toolbar-search">
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search departments by name, code, or HOD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading departments from PostgreSQL...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="empty-state">
            <Building2 className="empty-state-icon" />
            <h3 className="empty-state-title">No Departments Found</h3>
            <p className="empty-state-desc">
              {search
                ? 'No departments matched your search query.'
                : 'No departments configured yet. Click "Add Department" to create the first one.'}
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={14} />
              <span>Add Department</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Department Name</th>
                  <th>HOD Name</th>
                  <th>Enrolled Students</th>
                  <th>Faculty Count</th>
                  <th>Courses</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                        {d.department_code}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{d.department_name}</strong>
                        {d.description && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.hod_name || 'Unassigned'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <GraduationCap size={15} style={{ color: 'var(--primary)' }} />
                        <strong>{d.student_count || 0}</strong>
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Users size={15} style={{ color: 'var(--success)' }} />
                        <strong>{d.faculty_count || 0}</strong>
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <BookOpen size={15} style={{ color: 'var(--warning)' }} />
                        <strong>{d.course_count || 0}</strong>
                      </span>
                    </td>
                    <td>
                      <Badge status={d.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Department"
                          onClick={() => handleOpenEdit(d)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          title="Delete Department"
                          onClick={() => handleDeleteClick(d)}
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
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
      >
        <form onSubmit={handleModalSubmit}>
          <div className="modal-body">
            {modalError && <Alert type="error" message={modalError} />}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Department Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CSE"
                  value={formData.department_code}
                  onChange={(e) => setFormData({ ...formData, department_code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Department Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science & Engineering"
                value={formData.department_name}
                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Head of Department (HOD)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Arvind Sharma"
                value={formData.hod_name}
                onChange={(e) => setFormData({ ...formData, hod_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Brief department overview..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Department"
        message={`Are you sure you want to delete "${deptToDelete?.department_name}"? If there are courses, faculty, or students mapped to this department, PostgreSQL constraints may restrict deletion.`}
        confirmText="Yes, Delete Department"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeptToDelete(null);
        }}
      />
    </div>
  );
}
