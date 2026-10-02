import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Library,
  Users,
} from 'lucide-react';
import { subjectService, courseService, facultyService } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';

export default function SubjectList() {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subject_name: '',
    subject_code: '',
    course_id: '',
    semester: '1',
    credits: '3',
    description: '',
    status: 'Active',
    faculty_ids: [],
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await subjectService.getAll({
        search,
        course_id: courseId || undefined,
      });
      if (res.data.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, fRes] = await Promise.all([
          courseService.getAll(),
          facultyService.getAll({ limit: 100 }),
        ]);
        if (cRes.data.success) setCourses(cRes.data.data);
        if (fRes.data.success) setFacultyList(fRes.data.data.faculty);
      } catch (err) {
        console.error('Failed to load subject metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [search, courseId]);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      subject_name: '',
      subject_code: '',
      course_id: courses[0]?.id ? String(courses[0].id) : '',
      semester: '1',
      credits: '3',
      description: '',
      status: 'Active',
      faculty_ids: [],
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setEditingSubject(sub);
    const assignedIds = Array.isArray(sub.assigned_faculty)
      ? sub.assigned_faculty.map((f) => f.id)
      : [];

    setFormData({
      subject_name: sub.subject_name,
      subject_code: sub.subject_code,
      course_id: String(sub.course_id),
      semester: String(sub.semester),
      credits: String(sub.credits),
      description: sub.description || '',
      status: sub.status || 'Active',
      faculty_ids: assignedIds,
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleFacultyToggle = (fid) => {
    setFormData((prev) => {
      const exists = prev.faculty_ids.includes(fid);
      const newIds = exists
        ? prev.faculty_ids.filter((id) => id !== fid)
        : [...prev.faculty_ids, fid];
      return { ...prev, faculty_ids: newIds };
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.subject_name.trim() || !formData.subject_code.trim() || !formData.course_id || !formData.semester) {
      setModalError('Subject Name, Subject Code, Course, and Semester are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        course_id: parseInt(formData.course_id, 10),
        semester: parseInt(formData.semester, 10),
        credits: parseInt(formData.credits, 10),
      };

      if (editingSubject) {
        await subjectService.update(editingSubject.id, payload);
        setSuccess(`Subject "${formData.subject_name}" updated successfully.`);
      } else {
        await subjectService.create(payload);
        setSuccess(`Subject "${formData.subject_name}" created successfully.`);
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (sub) => {
    setSubjectToDelete(sub);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      setIsDeleting(true);
      await subjectService.delete(subjectToDelete.id);
      setSuccess(`Subject "${subjectToDelete.subject_name}" was deleted successfully.`);
      setDeleteModalOpen(false);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subject.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Subject Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage curriculum units, semester mapping, credit weights, and assigned professors
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Subject</span>
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
              placeholder="Search subjects by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-filters">
            <select
              className="form-select"
              style={{ fontSize: '13px', padding: '6px 10px' }}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Filter by Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>

            {(search || courseId) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setCourseId('');
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
            <p>Loading subjects from PostgreSQL...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="empty-state">
            <Library className="empty-state-icon" />
            <h3 className="empty-state-title">No Subjects Found</h3>
            <p className="empty-state-desc">
              {search || courseId
                ? 'No subjects found matching the filter criteria.'
                : 'No curriculum subjects added yet. Click "Add Subject" to begin.'}
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={14} />
              <span>Add Subject</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Assigned Faculty</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                        {sub.subject_code}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{sub.subject_name}</strong>
                        {sub.description && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sub.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <span title={sub.course_name}>{sub.course_code || sub.course_name}</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">Sem {sub.semester}</span>
                    </td>
                    <td>
                      <strong>{sub.credits}</strong> Credits
                    </td>
                    <td>
                      {sub.assigned_faculty && sub.assigned_faculty.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {sub.assigned_faculty.map((f) => (
                            <span
                              key={f.id}
                              className="badge badge-info"
                              style={{ fontSize: '11px' }}
                              title={`${f.name} (${f.designation})`}
                            >
                              {f.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <Badge status={sub.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Subject"
                          onClick={() => handleOpenEdit(sub)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon delete"
                          title="Delete Subject"
                          onClick={() => handleDeleteClick(sub)}
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
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        size="lg"
      >
        <form onSubmit={handleModalSubmit}>
          <div className="modal-body">
            {modalError && <Alert type="error" message={modalError} />}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Subject Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CS301"
                  value={formData.subject_code}
                  onChange={(e) => setFormData({ ...formData, subject_code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Course <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} - {c.course_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Subject Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Data Structures & Algorithms"
                value={formData.subject_name}
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select
                  className="form-select"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Credits</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
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
              <label className="form-label">Subject Description</label>
              <textarea
                className="form-textarea"
                placeholder="Key concepts, syllabus topics..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Assign Faculty Instructors
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#FAFAFA' }}>
                {facultyList.map((f) => {
                  const isChecked = formData.faculty_ids.includes(f.id);
                  return (
                    <label
                      key={f.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        backgroundColor: isChecked ? 'var(--light-blue)' : '#FFFFFF',
                        border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFacultyToggle(f.id)}
                      />
                      <div>
                        <strong>{f.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {f.designation}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
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
              {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Subject"
        message={`Are you sure you want to delete subject "${subjectToDelete?.subject_name}" (${subjectToDelete?.subject_code})? Any timetable allocations for this subject will also be removed.`}
        confirmText="Yes, Delete Subject"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSubjectToDelete(null);
        }}
      />
    </div>
  );
}
