import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Mail, Phone, Calendar, MapPin, Building2, BookOpen, GraduationCap } from 'lucide-react';
import { studentService } from '../../services/api';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await studentService.getById(id);
        if (res.data.success) {
          setStudent(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student details.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await studentService.delete(id);
      navigate('/admin/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '50vh' }}>
        <div className="spinner" />
        <p>Loading student profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div>
        <Alert type="error" message={error || 'Student not found.'} />
        <Link to="/admin/students" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Students</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/admin/students" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Students</span>
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/admin/students/edit/${student.id}`)}
          >
            <Edit2 size={16} />
            <span>Edit Student</span>
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '8px',
              backgroundColor: 'var(--light-blue)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '24px',
            }}
          >
            {student.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {student.name}
              </h1>
              <Badge status={student.status} />
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>ID: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{student.student_id}</strong></span>
              <span>•</span>
              <span>Year {student.year}</span>
              <span>•</span>
              <span>Enrolled: {student.admission_date}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Contact & Personal Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                <span>{student.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                <span>{student.phone || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span>DOB: {student.date_of_birth || 'Not recorded'} (Gender: {student.gender})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                <span>{student.address || 'No residential address recorded.'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Academic Program
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Department:</strong> {student.department_name || 'Unassigned'} ({student.department_code || '—'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <BookOpen size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Course:</strong> {student.course_name || 'Unassigned'} ({student.course_code || '—'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <GraduationCap size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Current Academic Level:</strong> Year {student.year}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${student.name}" (${student.student_id}) from PostgreSQL? This action cannot be reversed.`}
        confirmText="Yes, Delete Student"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
