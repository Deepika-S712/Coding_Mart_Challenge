import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { Building2, Plus, Edit2, Trash2, Calculator, Search, DollarSign } from 'lucide-react';

const departments = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Mechanical Engineering'
];

const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

export const FeeStructure = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(null);

  const [formData, setFormData] = useState({
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    academicYear: '2026-2027',
    tuitionFee: 65000,
    examFee: 3500,
    hostelFee: 30000,
    cabFee: 12000,
    libraryFee: 2500,
    otherFee: 4000
  });

  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchStructures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/accountant/fee-structures');
      setStructures(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load fee structures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      department: 'Computer Science & Engineering',
      semester: 'Semester 5',
      academicYear: '2026-2027',
      tuitionFee: 65000,
      examFee: 3500,
      hostelFee: 30000,
      cabFee: 12000,
      libraryFee: 2500,
      otherFee: 4000
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (struct) => {
    setSelectedStructure(struct);
    setFormData({ ...struct });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (struct) => {
    setSelectedStructure(struct);
    setIsDeleteModalOpen(true);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field.endsWith('Fee') ? Number(value) : value
    }));
  };

  // Automatic calculation of total
  const calculatedTotal =
    (Number(formData.tuitionFee) || 0) +
    (Number(formData.examFee) || 0) +
    (Number(formData.hostelFee) || 0) +
    (Number(formData.cabFee) || 0) +
    (Number(formData.libraryFee) || 0) +
    (Number(formData.otherFee) || 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/accountant/fee-structures', formData);
      toast.success('Fee structure created.');
      setIsAddModalOpen(false);
      fetchStructures();
    } catch (err) {
      toast.error(err.message || 'Failed to create fee structure.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/accountant/fee-structures/${selectedStructure.id}`, formData);
      toast.success('Fee structure updated.');
      setIsEditModalOpen(false);
      fetchStructures();
    } catch (err) {
      toast.error(err.message || 'Failed to update fee structure.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await apiClient.delete(`/accountant/fee-structures/${selectedStructure.id}`);
      toast.success('Fee structure removed.');
      setIsDeleteModalOpen(false);
      fetchStructures();
    } catch (err) {
      toast.error(err.message || 'Failed to delete fee structure.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Department',
      key: 'department',
      render: (val) => <span className="font-semibold text-sm text-[#0F172A]">{val}</span>
    },
    {
      header: 'Semester',
      key: 'semester',
      render: (val) => <Badge variant="primary" size="sm">{val}</Badge>
    },
    {
      header: 'Tuition',
      key: 'tuitionFee',
      render: (val) => <span className="text-xs font-mono">₹{val?.toLocaleString()}</span>
    },
    {
      header: 'Exam',
      key: 'examFee',
      render: (val) => <span className="text-xs font-mono">₹{val?.toLocaleString()}</span>
    },
    {
      header: 'Hostel',
      key: 'hostelFee',
      render: (val) => <span className="text-xs font-mono">₹{val?.toLocaleString()}</span>
    },
    {
      header: 'CAB / Bus',
      key: 'cabFee',
      render: (val) => <span className="text-xs font-mono">₹{val?.toLocaleString()}</span>
    },
    {
      header: 'Library / Other',
      key: 'libraryFee',
      render: (val, row) => (
        <span className="text-xs font-mono">₹{((row.libraryFee || 0) + (row.otherFee || 0)).toLocaleString()}</span>
      )
    },
    {
      header: 'Total Gross Fee',
      key: 'totalFee',
      render: (val) => (
        <span className="font-bold text-sm text-primary font-mono">₹{val?.toLocaleString()}</span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-[#64748B] hover:text-primary hover:bg-slate-100 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-[#64748B] hover:text-error hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Department Fee Structures</h2>
          <p className="text-xs text-[#64748B]">
            Configure tuition, exam, amenities, hostel, and transport fee schedules
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Create Fee Structure
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStructures} />
      ) : structures.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No fee structures defined"
          description="Create department and semester fee schedules."
        />
      ) : (
        <Card title="Configured Fee Schedules">
          <Table columns={columns} data={structures} keyField="id" />
        </Card>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Department Fee Structure"
        subtitle="Specify components with automatic gross calculation"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => handleFieldChange('department', e.target.value)}
              options={departments}
            />
            <Select
              label="Semester"
              value={formData.semester}
              onChange={(e) => handleFieldChange('semester', e.target.value)}
              options={semesters}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Tuition Fee (₹)"
              type="number"
              required
              value={formData.tuitionFee}
              onChange={(e) => handleFieldChange('tuitionFee', e.target.value)}
            />
            <Input
              label="Exam Fee (₹)"
              type="number"
              required
              value={formData.examFee}
              onChange={(e) => handleFieldChange('examFee', e.target.value)}
            />
            <Input
              label="Hostel Fee (₹)"
              type="number"
              value={formData.hostelFee}
              onChange={(e) => handleFieldChange('hostelFee', e.target.value)}
            />
            <Input
              label="CAB / Bus Fee (₹)"
              type="number"
              value={formData.cabFee}
              onChange={(e) => handleFieldChange('cabFee', e.target.value)}
            />
            <Input
              label="Library Fee (₹)"
              type="number"
              value={formData.libraryFee}
              onChange={(e) => handleFieldChange('libraryFee', e.target.value)}
            />
            <Input
              label="Other Amenities (₹)"
              type="number"
              value={formData.otherFee}
              onChange={(e) => handleFieldChange('otherFee', e.target.value)}
            />
          </div>

          {/* Computed Gross Total Badge */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Calculated Total Gross Fee:</span>
            <span className="font-bold text-lg text-primary font-mono">
              ₹{calculatedTotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Fee Structure
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Fee Structure"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => handleFieldChange('department', e.target.value)}
              options={departments}
            />
            <Select
              label="Semester"
              value={formData.semester}
              onChange={(e) => handleFieldChange('semester', e.target.value)}
              options={semesters}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Tuition Fee (₹)"
              type="number"
              required
              value={formData.tuitionFee}
              onChange={(e) => handleFieldChange('tuitionFee', e.target.value)}
            />
            <Input
              label="Exam Fee (₹)"
              type="number"
              required
              value={formData.examFee}
              onChange={(e) => handleFieldChange('examFee', e.target.value)}
            />
            <Input
              label="Hostel Fee (₹)"
              type="number"
              value={formData.hostelFee}
              onChange={(e) => handleFieldChange('hostelFee', e.target.value)}
            />
            <Input
              label="CAB / Bus Fee (₹)"
              type="number"
              value={formData.cabFee}
              onChange={(e) => handleFieldChange('cabFee', e.target.value)}
            />
            <Input
              label="Library Fee (₹)"
              type="number"
              value={formData.libraryFee}
              onChange={(e) => handleFieldChange('libraryFee', e.target.value)}
            />
            <Input
              label="Other Amenities (₹)"
              type="number"
              value={formData.otherFee}
              onChange={(e) => handleFieldChange('otherFee', e.target.value)}
            />
          </div>

          {/* Computed Gross Total Badge */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Calculated Total Gross Fee:</span>
            <span className="font-bold text-lg text-primary font-mono">
              ₹{calculatedTotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Fee Structure"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-sm">
          <p className="text-[#64748B]">
            Are you sure you want to delete the fee schedule for <span className="font-bold text-[#0F172A]">{selectedStructure?.department} ({selectedStructure?.semester})</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeeStructure;
