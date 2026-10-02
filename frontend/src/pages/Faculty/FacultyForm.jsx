import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { facultyService, departmentService, subjectService } from '../../services/api';
import Alert from '../../components/common/Alert';

export default function FacultyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    faculty_id: '',
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    department_id: '',
    designation: 'Assistant Professor',
    joining_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    subject_ids: [],
  });

  const [departments, setDepartments] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [deptRes, subRes] = await Promise.all([
          departmentService.getAll(),
          subjectService.getAll(),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (subRes.data.success) setAvailableSubjects(subRes.data.data);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (isEdit) {
      async function fetchFaculty() {
        try {
          setLoading(true);
          const res = await facultyService.getById(id);
          if (res.data.success) {
            const f = res.data.data;
            const assignedIds = Array.isArray(f.assigned_subjects)
              ? f.assigned_subjects.map((s) => s.id)
              : [];

            setFormData({
              faculty_id: f.faculty_id || '',
              name: f.name || '',
              email: f.email || '',
              phone: f.phone || '',
              gender: f.gender || 'Male',
              department_id: f.department_id ? String(f.department_id) : '',
              designation: f.designation || 'Assistant Professor',
              joining_date: f.joining_date || '',
              status: f.status || 'Active',
              subject_ids: assignedIds,
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load faculty details.');
        } finally {
          setLoading(false);
        }
      }
      fetchFaculty();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectToggle = (subId) => {
    setFormData((prev) => {
      const exists = prev.subject_ids.includes(subId);
      const newSubjectIds = exists
        ? prev.subject_ids.filter((sid) => sid !== subId)
        : [...prev.subject_ids, subId];
      return { ...prev, subject_ids: newSubjectIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.faculty_id.trim() || !formData.name.trim() || !formData.email.trim() || !formData.joining_date) {
      setError('Faculty ID, Name, Email, and Joining Date are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
      };

      if (isEdit) {
        await facultyService.update(id, payload);
      } else {
        await facultyService.create(payload);
      }

      navigate('/admin/faculty');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save faculty record to PostgreSQL.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '50vh' }}>
        <div className="spinner" />
        <p>Loading faculty data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link to="/admin/faculty" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Faculty</span>
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
          {isEdit ? 'Edit Faculty Member' : 'Add New Faculty Member'}
        </h1>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h2 className="card-title">1. Faculty Profile</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Faculty ID <span className="required">*</span>
              </label>
              <input
                type="text"
                name="faculty_id"
                className="form-input"
                placeholder="e.g. FAC-011"
                value={formData.faculty_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Dr. Ramesh Chander"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="e.g. ramesh.c@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="e.g. +91 98765 00112"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                name="department_id"
                className="form-select"
                value={formData.department_id}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_code} - {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation <span className="required">*</span></label>
              <select
                name="designation"
                className="form-select"
                value={formData.designation}
                onChange={handleChange}
                required
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Adjunct Faculty">Adjunct Faculty</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Joining Date <span className="required">*</span></label>
              <input
                type="date"
                name="joining_date"
                className="form-input"
                value={formData.joining_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ maxWidth: '300px' }}>
            <label className="form-label">Faculty Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="card-header" style={{ margin: '24px 0 16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h2 className="card-title">2. Assign Teaching Subjects</h2>
            <p className="card-subtitle">Select subjects this faculty member will instruct</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px', maxHeight: '220px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#FAFAFA' }}>
            {availableSubjects.map((sub) => {
              const isChecked = formData.subject_ids.includes(sub.id);
              return (
                <label
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    backgroundColor: isChecked ? 'var(--light-blue)' : '#FFFFFF',
                    border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleSubjectToggle(sub.id)}
                  />
                  <div>
                    <strong>{sub.subject_code}</strong>: {sub.subject_name}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Sem {sub.semester} • {sub.credits} Credits
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <Link to="/admin/faculty" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16} />
              <span>{submitting ? 'Saving to Database...' : isEdit ? 'Update Faculty' : 'Save Faculty'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
