import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { studentService, departmentService, courseService } from '../../services/api';
import Alert from '../../components/common/Alert';

export default function StudentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    address: '',
    department_id: '',
    course_id: '',
    year: '1',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load departments and courses
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
        console.error('Failed to load metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // If editing, load student data
  useEffect(() => {
    if (isEdit) {
      async function fetchStudent() {
        try {
          setLoading(true);
          const res = await studentService.getById(id);
          if (res.data.success) {
            const s = res.data.data;
            setFormData({
              student_id: s.student_id || '',
              name: s.name || '',
              email: s.email || '',
              phone: s.phone || '',
              gender: s.gender || 'Male',
              date_of_birth: s.date_of_birth || '',
              address: s.address || '',
              department_id: s.department_id ? String(s.department_id) : '',
              course_id: s.course_id ? String(s.course_id) : '',
              year: s.year ? String(s.year) : '1',
              admission_date: s.admission_date || '',
              status: s.status || 'Active',
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load student details.');
        } finally {
          setLoading(false);
        }
      }
      fetchStudent();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.student_id.trim() || !formData.name.trim() || !formData.email.trim() || !formData.admission_date) {
      setError('Student ID, Full Name, Email, and Admission Date are required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
        course_id: formData.course_id ? parseInt(formData.course_id, 10) : null,
        year: parseInt(formData.year, 10),
      };

      if (isEdit) {
        await studentService.update(id, payload);
      } else {
        await studentService.create(payload);
      }

      navigate('/admin/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student record to PostgreSQL.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter courses by selected department
  const filteredCourses = formData.department_id
    ? courses.filter((c) => String(c.department_id) === String(formData.department_id))
    : courses;

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '50vh' }}>
        <div className="spinner" />
        <p>Loading student information...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link to="/admin/students" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Students</span>
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
          {isEdit ? 'Edit Student Details' : 'Add New Student'}
        </h1>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h2 className="card-title">1. Basic Identification</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Student ID <span className="required">*</span>
              </label>
              <input
                type="text"
                name="student_id"
                className="form-input"
                placeholder="e.g. STU-2024-050"
                value={formData.student_id}
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
                placeholder="e.g. Rahul Sharma"
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
                placeholder="e.g. rahul.sharma@student.edu"
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
                placeholder="e.g. +91 98765 43210"
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
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                className="form-input"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admission Date <span className="required">*</span></label>
              <input
                type="date"
                name="admission_date"
                className="form-input"
                value={formData.admission_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Enrollment Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              name="address"
              className="form-textarea"
              placeholder="e.g. Flat 402, Green Valley Apartments, Mumbai"
              value={formData.address}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className="card-header" style={{ margin: '24px 0 16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h2 className="card-title">2. Academic Enrollment</h2>
          </div>

          <div className="form-row">
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
              <label className="form-label">Course</label>
              <select
                name="course_id"
                className="form-select"
                value={formData.course_id}
                onChange={handleChange}
              >
                <option value="">Select Course</option>
                {filteredCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} - {c.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                name="year"
                className="form-select"
                value={formData.year}
                onChange={handleChange}
              >
                <option value="1">Year 1 (Freshman)</option>
                <option value="2">Year 2 (Sophomore)</option>
                <option value="3">Year 3 (Junior)</option>
                <option value="4">Year 4 (Senior)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <Link to="/admin/students" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16} />
              <span>{submitting ? 'Saving to Database...' : isEdit ? 'Update Student' : 'Save Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
