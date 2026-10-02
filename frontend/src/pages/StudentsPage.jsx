import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Eye, UserPlus, Phone, Mail, BookOpen } from 'lucide-react';
import { studentApi } from '../api/studentApi';
import { useToast } from '../context/ToastContext';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export function StudentsPage() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Modals state
  const [detailsModal, setDetailsModal] = useState({ open: false, student: null });
  const [formModal, setFormModal] = useState({ open: false, isEdit: false, student: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, student: null });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    phone: '',
    className: 'CSE-3A',
    semester: 5,
    gender: 'Male',
    cgpa: 8.0,
    guardianName: '',
    guardianPhone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentApi.getAll({ search, className: classFilter });
      if (res.success && res.data) {
        setStudents(res.data);
      } else {
        throw new Error(res.message || 'Failed to load students');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with student service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, classFilter]);

  const openCreateModal = () => {
    setFormData({
      name: '',
      rollNumber: '',
      email: '',
      phone: '',
      className: 'CSE-3A',
      semester: 5,
      gender: 'Male',
      cgpa: 8.0,
      guardianName: '',
      guardianPhone: ''
    });
    setFormErrors({});
    setFormModal({ open: true, isEdit: false, student: null });
  };

  const openEditModal = (student) => {
    setFormData({
      name: student.name || '',
      rollNumber: student.rollNumber || '',
      email: student.email || '',
      phone: student.phone || '',
      className: student.className || 'CSE-3A',
      semester: student.semester || 5,
      gender: student.gender || 'Male',
      cgpa: student.cgpa || 8.0,
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || ''
    });
    setFormErrors({});
    setFormModal({ open: true, isEdit: true, student });
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Roll number is required';
    if (!formData.className) errs.className = 'Class is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (formModal.isEdit) {
        const res = await studentApi.update(formModal.student.id, formData);
        if (res.success) {
          toast.success('Student profile updated successfully');
          setFormModal({ open: false, isEdit: false, student: null });
          fetchStudents();
        }
      } else {
        const res = await studentApi.create(formData);
        if (res.success) {
          toast.success('Student added successfully');
          setFormModal({ open: false, isEdit: false, student: null });
          fetchStudents();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save student details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.student) return;
    setIsSubmitting(true);
    try {
      await studentApi.delete(deleteModal.student.id);
      toast.success('Student removed successfully');
      setDeleteModal({ open: false, student: null });
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Failed to delete student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Roll No',
      accessor: 'rollNumber',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      header: 'Student Name',
      accessor: 'name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--cms-text-primary)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--cms-text-secondary)' }}>{row.email}</div>
        </div>
      )
    },
    {
      header: 'Class / Sem',
      accessor: 'className',
      render: (val, row) => (
        <span style={{ fontSize: '13px' }}>
          {val} • Sem {row.semester}
        </span>
      )
    },
    {
      header: 'Attendance',
      accessor: 'attendancePercentage',
      render: (val) => {
        const variant = val >= 85 ? 'success' : val >= 75 ? 'primary' : 'danger';
        return <Badge variant={variant}>{val}%</Badge>;
      }
    },
    {
      header: 'CGPA',
      accessor: 'cgpa',
      render: (val) => <span style={{ fontWeight: 600 }}>{Number(val).toFixed(1)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => (
        <Badge variant={val === 'Active' ? 'success' : 'neutral'}>{val}</Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDetailsModal({ open: true, student: row })}
            title="View Details"
          >
            <Eye size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(row)}
            title="Edit"
          >
            <Edit size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            style={{ color: 'var(--cms-danger)' }}
            onClick={() => setDeleteModal({ open: true, student: row })}
            title="Delete"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="cms-page-header">
        <div>
          <h1 className="cms-page-title">Student Directory</h1>
          <p className="cms-page-subtitle">
            Manage students across your assigned engineering batches
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Add New Student
        </Button>
      </div>

      {/* Filter Bar */}
      <div
        className="cms-card"
        style={{
          padding: '16px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} color="var(--cms-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            className="cms-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '160px' }}>
          <select
            className="cms-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            <option value="CSE-3A">CSE-3A</option>
            <option value="CSE-3B">CSE-3B</option>
            <option value="IT-3A">IT-3A</option>
          </select>
        </div>

        {(search || classFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setClassFilter('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Student List Table */}
      {loading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : error ? (
        <ErrorState title="Failed to load students" message={error} onRetry={fetchStudents} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No students match the criteria"
          description="Try adjusting your search terms or filter selection."
          actionLabel="Add Student"
          onAction={openCreateModal}
        />
      ) : (
        <Table
          columns={columns}
          data={students}
          keyField="id"
          onRowClick={(row) => setDetailsModal({ open: true, student: row })}
        />
      )}

      {/* Student Details Modal */}
      <Modal
        isOpen={detailsModal.open}
        onClose={() => setDetailsModal({ open: false, student: null })}
        title="Student Profile"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const s = detailsModal.student;
                setDetailsModal({ open: false, student: null });
                openEditModal(s);
              }}
            >
              Edit Student
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDetailsModal({ open: false, student: null })}
            >
              Close
            </Button>
          </div>
        }
      >
        {detailsModal.student && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--cms-radius-full)',
                  backgroundColor: 'var(--cms-primary-light)',
                  color: 'var(--cms-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px'
                }}
              >
                {detailsModal.student.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{detailsModal.student.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)' }}>
                  Roll: {detailsModal.student.rollNumber} • {detailsModal.student.className} (Sem {detailsModal.student.semester})
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--cms-text-muted)' }}>Email:</span>
                <p style={{ fontWeight: 500 }}>{detailsModal.student.email}</p>
              </div>
              <div>
                <span style={{ color: 'var(--cms-text-muted)' }}>Phone:</span>
                <p style={{ fontWeight: 500 }}>{detailsModal.student.phone}</p>
              </div>
              <div>
                <span style={{ color: 'var(--cms-text-muted)' }}>Attendance Rate:</span>
                <p style={{ fontWeight: 600, color: detailsModal.student.attendancePercentage >= 75 ? 'var(--cms-success)' : 'var(--cms-danger)' }}>
                  {detailsModal.student.attendancePercentage}%
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--cms-text-muted)' }}>Current CGPA:</span>
                <p style={{ fontWeight: 600 }}>{detailsModal.student.cgpa}</p>
              </div>
              <div>
                <span style={{ color: 'var(--cms-text-muted)' }}>Guardian Name:</span>
                <p style={{ fontWeight: 500 }}>{detailsModal.student.guardianName || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--cms-text-muted)' }}>Guardian Contact:</span>
                <p style={{ fontWeight: 500 }}>{detailsModal.student.guardianPhone || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, isEdit: false, student: null })}
        title={formModal.isEdit ? 'Edit Student Details' : 'Add New Student'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              onClick={() => setFormModal({ open: false, isEdit: false, student: null })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleFormSubmit}
              loading={isSubmitting}
            >
              {formModal.isEdit ? 'Update Details' : 'Save Student'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              placeholder="e.g. Ramesh Kumar"
              required
            />
            <Input
              label="Roll Number"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              error={formErrors.rollNumber}
              placeholder="e.g. 23CS107"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              placeholder="student@college.edu"
            />
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 00000"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="cms-form-group">
              <label className="cms-label">Class Allocation *</label>
              <select
                className="cms-select"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                <option value="CSE-3A">CSE-3A</option>
                <option value="CSE-3B">CSE-3B</option>
                <option value="IT-3A">IT-3A</option>
              </select>
            </div>
            <div className="cms-form-group">
              <label className="cms-label">Semester</label>
              <select
                className="cms-select"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              >
                <option value={5}>Semester 5</option>
                <option value={6}>Semester 6</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Guardian Name"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              placeholder="Parent or Guardian"
            />
            <Input
              label="Guardian Phone"
              value={formData.guardianPhone}
              onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
              placeholder="Parent Contact"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, student: null })}
        title="Confirm Student Deletion"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, student: null })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isSubmitting}
            >
              Delete Student
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: '14px', color: 'var(--cms-text-primary)' }}>
          Are you sure you want to remove <strong>{deleteModal.student?.name}</strong> ({deleteModal.student?.rollNumber}) from your roster?
        </p>
        <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)', marginTop: '8px' }}>
          This operation will update the repository layer immediately.
        </p>
      </Modal>
    </div>
  );
}
