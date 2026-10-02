import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CalendarDays,
  Clock,
  MapPin,
  User,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import {
  timetableService,
  departmentService,
  courseService,
  subjectService,
  facultyService,
} from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';

export default function TimetableList() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [selectedDay, setSelectedDay] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('');

  // Reference lists
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    course_id: '',
    subject_id: '',
    faculty_id: '',
    room_number: '',
  });
  const [conflictError, setConflictError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load reference metadata
  useEffect(() => {
    async function loadMeta() {
      try {
        const [dRes, cRes, sRes, fRes] = await Promise.all([
          departmentService.getAll(),
          courseService.getAll(),
          subjectService.getAll(),
          facultyService.getAll({ limit: 100 }),
        ]);
        if (dRes.data.success) setDepartments(dRes.data.data);
        if (cRes.data.success) setCourses(cRes.data.data);
        if (sRes.data.success) setSubjects(sRes.data.data);
        if (fRes.data.success) setFacultyList(fRes.data.data.faculty);
      } catch (err) {
        console.error('Failed to load timetable metadata:', err);
      }
    }
    loadMeta();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        day: selectedDay || undefined,
        department_id: departmentId || undefined,
        course_id: courseId || undefined,
        semester: semester || undefined,
      };

      const res = await timetableService.getAll(params);
      if (res.data.success) {
        setTimetable(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load timetable slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedDay, departmentId, courseId, semester]);

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setFormData({
      day: selectedDay || 'Monday',
      start_time: '09:00',
      end_time: '10:00',
      course_id: courses[0]?.id ? String(courses[0].id) : '',
      subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
      faculty_id: facultyList[0]?.id ? String(facultyList[0].id) : '',
      room_number: 'LH-101',
    });
    setConflictError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
      course_id: String(slot.course_id),
      subject_id: String(slot.subject_id),
      faculty_id: String(slot.faculty_id),
      room_number: slot.room_number,
    });
    setConflictError('');
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');

    if (formData.start_time >= formData.end_time) {
      setConflictError('Start time must be strictly earlier than end time.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        course_id: parseInt(formData.course_id, 10),
        subject_id: parseInt(formData.subject_id, 10),
        faculty_id: parseInt(formData.faculty_id, 10),
        room_number: formData.room_number.trim(),
      };

      if (editingSlot) {
        await timetableService.update(editingSlot.id, payload);
        setSuccess('Timetable slot updated successfully.');
      } else {
        await timetableService.create(payload);
        setSuccess('Timetable slot scheduled successfully.');
      }

      setModalOpen(false);
      fetchTimetable();
    } catch (err) {
      // Catch Conflict Validation error from PostgreSQL/Express
      const message = err.response?.data?.message || 'Failed to save timetable slot.';
      setConflictError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (slot) => {
    setSlotToDelete(slot);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!slotToDelete) return;
    try {
      setIsDeleting(true);
      await timetableService.delete(slotToDelete.id);
      setSuccess(`Timetable slot on ${slotToDelete.day} (${slotToDelete.start_time} - ${slotToDelete.end_time}) was removed.`);
      setDeleteModalOpen(false);
      setSlotToDelete(null);
      fetchTimetable();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete timetable slot.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter subjects by selected course in modal
  const filteredSubjects = formData.course_id
    ? subjects.filter((s) => String(s.course_id) === String(formData.course_id))
    : subjects;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Timetable Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Organize weekly lecture schedules with automated double-booking and room conflict checks
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Create Schedule Slot</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by Day</label>
            <select
              className="form-select"
              style={{ fontSize: '13px', minWidth: '140px' }}
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="">All Days</option>
              {daysOfWeek.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by Department</label>
            <select
              className="form-select"
              style={{ fontSize: '13px', minWidth: '180px' }}
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
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by Course</label>
            <select
              className="form-select"
              style={{ fontSize: '13px', minWidth: '180px' }}
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
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Filter by Semester</label>
            <select
              className="form-select"
              style={{ fontSize: '13px', minWidth: '120px' }}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          {(selectedDay || departmentId || courseId || semester) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
              onClick={() => {
                setSelectedDay('');
                setDepartmentId('');
                setCourseId('');
                setSemester('');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Timetable Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading timetable entries from PostgreSQL...</p>
        </div>
      ) : timetable.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CalendarDays className="empty-state-icon" />
            <h3 className="empty-state-title">No Timetable Slots Found</h3>
            <p className="empty-state-desc">
              {selectedDay || departmentId || courseId || semester
                ? 'No slots match the current filter criteria.'
                : 'No timetable slots have been scheduled. Click "Create Schedule Slot" to build the college timetable.'}
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={14} />
              <span>Create Slot</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="timetable-grid">
          {timetable.map((slot) => (
            <div key={slot.id} className="timetable-card">
              <div className="timetable-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-neutral" style={{ fontWeight: '700' }}>
                    {slot.day}
                  </span>
                  <span className="timetable-time">
                    {slot.start_time} - {slot.end_time}
                  </span>
                </div>
                <span className="timetable-room">{slot.room_number}</span>
              </div>

              <div>
                <div className="timetable-subject">{slot.subject_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {slot.subject_code} • Sem {slot.semester}
                </div>
              </div>

              <div className="timetable-faculty">
                <User size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{slot.faculty_name} ({slot.faculty_code})</span>
              </div>

              <div className="timetable-course">
                <BookOpen size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} />
                <span>{slot.course_code} • {slot.department_code}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="btn-icon"
                  title="Edit Slot"
                  onClick={() => handleOpenEdit(slot)}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon delete"
                  title="Delete Slot"
                  onClick={() => handleDeleteClick(slot)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Timetable Modal with Conflict Display */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlot ? 'Edit Timetable Slot' : 'Create New Timetable Slot'}
        size="lg"
      >
        <form onSubmit={handleModalSubmit}>
          <div className="modal-body">
            {/* Display Conflict Validation Message Promptly */}
            {conflictError && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--error-bg)',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  color: 'var(--error)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <AlertTriangle size={18} className="flex-shrink-0" style={{ marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>Conflict Detected:</strong>
                  <span>{conflictError}</span>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Day of Week <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  required
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Start Time <span className="required">*</span>
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  End Time <span className="required">*</span>
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
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

              <div className="form-group">
                <label className="form-label">
                  Subject <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {filteredSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_code} - {s.subject_name} (Sem {s.semester})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Assigned Faculty <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.faculty_id}
                  onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                  required
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.faculty_id}) - {f.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Room / Lecture Hall <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. LH-101, Lab-A, Seminar Hall"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-hint" style={{ marginTop: '8px' }}>
              Notice: The server checks PostgreSQL in real-time to prevent assigning the same faculty or same room to overlapping classes.
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
              {submitting ? 'Validating Conflicts...' : editingSlot ? 'Update Slot' : 'Create Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Remove Timetable Slot"
        message={`Are you sure you want to remove the slot for "${slotToDelete?.subject_name}" in ${slotToDelete?.room_number} on ${slotToDelete?.day}?`}
        confirmText="Yes, Remove Slot"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSlotToDelete(null);
        }}
      />
    </div>
  );
}
