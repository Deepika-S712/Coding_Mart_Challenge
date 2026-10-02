import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Mail, Phone, Calendar, Building2, BookOpen, User } from 'lucide-react';
import { facultyService } from '../../services/api';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';

export default function FacultyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await facultyService.getById(id);
        if (res.data.success) {
          setFaculty(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load faculty profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await facultyService.delete(id);
      navigate('/admin/faculty');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete faculty member.');
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '50vh' }}>
        <div className="spinner" />
        <p>Loading faculty profile...</p>
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div>
        <Alert type="error" message={error || 'Faculty member not found.'} />
        <Link to="/admin/faculty" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Faculty</span>
        </Link>
      </div>
    );
  }

  const assigned = Array.isArray(faculty.assigned_subjects) ? faculty.assigned_subjects : [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/admin/faculty" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Faculty</span>
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/admin/faculty/edit/${faculty.id}`)}
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
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
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '24px',
            }}
          >
            {faculty.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {faculty.name}
              </h1>
              <Badge status={faculty.status} />
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>ID: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{faculty.faculty_id}</strong></span>
              <span>•</span>
              <span>{faculty.designation}</span>
              <span>•</span>
              <span>Department: <strong>{faculty.department_name || 'Unassigned'}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Personal & Professional Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                <span>{faculty.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                <span>{faculty.phone || 'No phone number provided'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <User size={16} style={{ color: 'var(--text-muted)' }} />
                <span>Gender: {faculty.gender || 'Not specified'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span>Joining Date: {faculty.joining_date}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Assigned Subjects ({assigned.length})
            </h3>
            {assigned.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                No subjects currently assigned to this faculty member.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assigned.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--primary)' }}>{sub.subject_code}</strong>: {sub.subject_name}
                    </div>
                    <span className="badge badge-neutral">Sem {sub.semester}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Faculty Record"
        message={`Are you sure you want to permanently delete faculty member "${faculty.name}" (${faculty.faculty_id})?`}
        confirmText="Yes, Delete Faculty"
        cancelText="Cancel"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
