import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  GraduationCap,
  Library,
} from 'lucide-react';
import { courseService, departmentService } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    department_id: '',
    duration: '4 Years',
    degree_type: 'Undergraduate',
    description: '',
    status: 'Active',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await courseService.getAll({
        search,
        department_id: departmentId || undefined,
      });
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchCourses();
  }, [search, departmentId]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      course_name: '',
      course_code: '',
      department_id: departments[0]?.id ? String(departments[0].id) : '',
      duration: '4 Years',
      degree_type: 'Undergraduate',
      description: '',
      status: 'Active',
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setFormData({
      course_name: c.course_name,
      course_code: c.course_code,
      department_id: String(c.department_id),
      duration: c.duration,
      degree_type: c.degree_type,
      description: c.description || '',
      status: c.status || 'Active',
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.course_name.trim() || !formData.course_code.trim() || !formData.department_id) {
      setModalError('Course Name, Course Code, and Department are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10),
      };

      if (editingCourse) {
        await courseService.update(editingCourse.id, payload);
        setSuccess(`Course "${formData.course_name}" updated successfully.`);
      } else {
        await courseService.create(payload);
        setSuccess(`Course "${formData.course_name}" created successfully.`);
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (c) => {
    setCourseToDelete(c);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      setIsDeleting(true);
      await courseService.delete(courseToDelete.id);
      setSuccess(`Course "${courseToDelete.course_name}" was deleted successfully.`);
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Course Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Define degree programs, durations, and department affiliations
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Course</span>
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
              placeholder="Search courses by name or code..."
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
              <option value="">Filter by Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_code} - {d.department_name}
                </option>
              ))}
            </select>

            {(search || departmentId) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setDepartmentId('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading courses from PostgreSQL...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-state-icon" />
            <h3 className="empty-state-title">No Courses Found</h3>
            <p className="empty-state-desc">
              {search || departmentId
                ? 'No courses found matching the search or department filter.'
                : 'No courses registered. Click "Add Course" to get started.'}
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={14} />
              <span>Add Course</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Degree Type</th>
                  <th>Duration</th>
                  <th>Enrolled Students</th>
                  <th>Subjects</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                        {c.course_code}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{c.course_name}</strong>
                        {c.description && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <span title={c.department_name}>{c.department_code || c.department_name}</span>
                    </td>
                    <td>
                      <Badge status={c.degree_type} />
                    </td>
                    <td>{c.duration}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <GraduationCap size={15} style={{ color: 'var(--primary)' }} />
                        <strong>{c.student_count || 0}</strong>
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Library size={15} style={{ color: 'var(--info)' }} />
                        <strong>{c.subject_count || 0}</strong>
                      </span>
                    </td>
                    <td>
                      <Badge status={c.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Course"
                          onClick={() => handleOpenEdit(c)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          title="Delete Course"
                          onClick={() => handleDeleteClick(c)}
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
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
      >
        <form onSubmit={handleModalSubmit}>
          <div className="modal-body">
            {modalError && <Alert type="error" message={modalError} />}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Course Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CS101"
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Department <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_code} - {d.department_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Course Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.Tech Computer Science"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Degree Type</label>
                <select
                  className="form-select"
                  value={formData.degree_type}
                  onChange={(e) => setFormData({ ...formData, degree_type: e.target.value })}
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Doctorate">Doctorate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 4 Years"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Course curriculum summary..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
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
              {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Course"
        message={`Are you sure you want to delete course "${courseToDelete?.course_name}" (${courseToDelete?.course_code})? Any subjects or enrolled students linked to this course will be affected.`}
        confirmText="Yes, Delete Course"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
      />
    </div>
  );
}
