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
import { useToast } from '../../components/common/Toast';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Home,
  Bus,
  CheckSquare
} from 'lucide-react';

export const FacultyStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: 'CSE-3A',
    year: '3rd Year',
    semester: 'Semester 5',
    department: 'Computer Science & Engineering',
    parentName: '',
    parentContact: '',
    studentType: 'Day Scholar',
    cabUser: 'No',
    dob: '2003-01-01',
    age: 21,
    gender: 'Male'
  });
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/students', {
        params: { search: searchTerm }
      });
      setStudents(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load students directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '+91 ',
      class: 'CSE-3A',
      year: '3rd Year',
      semester: 'Semester 5',
      department: 'Computer Science & Engineering',
      parentName: '',
      parentContact: '+91 ',
      studentType: 'Day Scholar',
      cabUser: 'No',
      dob: '2003-05-15',
      age: 21,
      gender: 'Male'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({ ...student });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.post('/faculty/students', formData);
      toast.success(`Student ${res.data.name} enrolled successfully.`);
      setIsAddModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Failed to add student.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/faculty/students/${selectedStudent.id}`, formData);
      toast.success(`Student profile updated.`);
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Failed to update student.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    setSaving(true);
    try {
      await apiClient.delete(`/faculty/students/${selectedStudent.id}`);
      toast.success(`Student ${selectedStudent.name} deleted.`);
      setIsDeleteModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Failed to delete student.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Roll / ID',
      key: 'rollNo',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-primary font-mono text-xs">{val}</span>
          <span className="text-[11px] text-[#64748B] block">{row.id}</span>
        </div>
      )
    },
    {
      header: 'Student Name',
      key: 'name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-sm text-[#0F172A] block">{val}</span>
          <span className="text-xs text-[#64748B]">{row.email}</span>
        </div>
      )
    },
    {
      header: 'Class',
      key: 'class',
      render: (val) => <Badge variant="neutral" size="sm">{val}</Badge>
    },
    {
      header: 'Type',
      key: 'studentType',
      render: (val) => (
        <Badge variant={val === 'Hosteller' ? 'info' : 'neutral'} size="sm">
          {val}
        </Badge>
      )
    },
    {
      header: 'Attendance',
      key: 'attendanceRate',
      render: (val) => (
        <Badge variant={val >= 85 ? 'success' : val >= 75 ? 'warning' : 'error'} size="sm">
          {val || 88}%
        </Badge>
      )
    },
    {
      header: 'CGPA',
      key: 'cgpa',
      render: (val) => <span className="font-bold text-[#0F172A]">{val || '8.50'}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenView(row)}
            title="View Profile"
            className="p-1.5 text-[#64748B] hover:text-primary hover:bg-slate-100 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Student"
            className="p-1.5 text-[#64748B] hover:text-primary hover:bg-slate-100 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            title="Delete Student"
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
          <h2 className="text-xl font-bold text-[#0F172A]">Class Students Directory</h2>
          <p className="text-xs text-[#64748B]">
            Manage student registrations, personal records, and academic status
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Add New Student
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search by name, roll number, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs font-semibold text-[#64748B]">
          Total: {students.length} Enrolled
        </span>
      </div>

      {/* Students Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStudents} />
      ) : (
        <Card title="Enrolled Students Roster">
          <Table columns={columns} data={students} keyField="id" />
        </Card>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student"
        subtitle="Enroll a new student to class roster"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Anand Mahindra"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@cms.com"
            />
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={['Male', 'Female', 'Other']}
            />
            <Input
              label="Class / Section"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <Input
              label="Parent Name"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              placeholder="Guardian Name"
            />
            <Input
              label="Parent Contact"
              value={formData.parentContact}
              onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
              placeholder="+91 98450 12345"
            />
            <Select
              label="Accommodation"
              value={formData.studentType}
              onChange={(e) => setFormData({ ...formData, studentType: e.target.value })}
              options={['Day Scholar', 'Hosteller']}
            />
            <Select
              label="CAB / Bus Transport"
              value={formData.cabUser}
              onChange={(e) => setFormData({ ...formData, cabUser: e.target.value })}
              options={['No', 'Yes (Route 1)', 'Yes (Route 2)', 'Yes (Route 3)', 'Yes (Route 4)']}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save & Enroll
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Information"
        subtitle={`Updating records for ${selectedStudent?.name} (${selectedStudent?.rollNo})`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Class / Section"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
            <Input
              label="Parent Name"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
            />
            <Input
              label="Parent Contact"
              value={formData.parentContact}
              onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
            />
            <Select
              label="Accommodation"
              value={formData.studentType}
              onChange={(e) => setFormData({ ...formData, studentType: e.target.value })}
              options={['Day Scholar', 'Hosteller']}
            />
            <Select
              label="CAB / Bus Transport"
              value={formData.cabUser}
              onChange={(e) => setFormData({ ...formData, cabUser: e.target.value })}
              options={['No', 'Yes (Route 1)', 'Yes (Route 2)', 'Yes (Route 3)', 'Yes (Route 4)']}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Master Profile"
        subtitle={selectedStudent?.rollNo}
        maxWidth="max-w-xl"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">{selectedStudent.name}</h4>
                <p className="text-[#64748B]">{selectedStudent.department} • {selectedStudent.class}</p>
              </div>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              <div className="py-2 flex justify-between">
                <span className="text-[#64748B]">Roll Number:</span>
                <span className="font-semibold text-primary">{selectedStudent.rollNo}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#64748B]">Email Address:</span>
                <span className="font-medium text-[#0F172A]">{selectedStudent.email}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#64748B]">Phone Number:</span>
                <span className="font-medium text-[#0F172A]">{selectedStudent.phone}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#64748B]">Parent / Guardian:</span>
                <span className="font-medium text-[#0F172A]">{selectedStudent.parentName} ({selectedStudent.parentContact})</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#64748B]">Student Type / Bus:</span>
                <span className="font-medium text-[#0F172A]">{selectedStudent.studentType} • CAB: {selectedStudent.cabUser}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#64748B]">Attendance / CGPA:</span>
                <span className="font-semibold text-success">{selectedStudent.attendanceRate}% Attendance • {selectedStudent.cgpa} CGPA</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Student Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-[#64748B]">
            Are you sure you want to delete <span className="font-bold text-[#0F172A]">{selectedStudent?.name}</span> ({selectedStudent?.rollNo})?
            This will permanently remove their records from the in-memory roster.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={saving} onClick={handleDeleteStudent}>
              Delete Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyStudents;
