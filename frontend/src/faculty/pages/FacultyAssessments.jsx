import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
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
import { Award, Plus, Edit2, Trash2, Users, Save, BarChart2, CheckCircle2 } from 'lucide-react';

const assessmentTypes = ['Unit Test', 'Lab Quiz', 'Surprise Test', 'Internal Assessment'];

export const FacultyAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [marksList, setMarksList] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Unit Test',
    subjectCode: 'CS301',
    subjectName: 'Design & Analysis of Algorithms',
    class: 'CSE-3A',
    date: new Date().toISOString().split('T')[0],
    maxMarks: 20,
    passMarks: 8
  });

  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [asmRes, stuRes] = await Promise.all([
        apiClient.get('/faculty/assessments'),
        apiClient.get('/faculty/students')
      ]);
      setAssessments(asmRes.data);
      setStudents(stuRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      type: 'Unit Test',
      subjectCode: 'CS301',
      subjectName: 'Design & Analysis of Algorithms',
      class: 'CSE-3A',
      date: new Date().toISOString().split('T')[0],
      maxMarks: 20,
      passMarks: 8
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (asm) => {
    setSelectedAssessment(asm);
    setFormData({ ...asm });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (asm) => {
    setSelectedAssessment(asm);
    setIsDeleteModalOpen(true);
  };

  const handleOpenMarks = (asm) => {
    setSelectedAssessment(asm);
    // Build marks list matching students
    const existing = asm.marks || [];
    const populated = students.map((s) => {
      const record = existing.find((m) => m.studentId === s.id);
      return {
        studentId: s.id,
        studentName: s.name,
        rollNo: s.rollNo,
        marksObtained: record ? record.marksObtained : ''
      };
    });
    setMarksList(populated);
    setIsMarksModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/faculty/assessments', formData);
      toast.success('Assessment test created.');
      setIsAddModalOpen(false);
      fetchAssessments();
    } catch (err) {
      toast.error(err.message || 'Failed to create assessment.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/faculty/assessments/${selectedAssessment.id}`, formData);
      toast.success('Assessment updated.');
      setIsEditModalOpen(false);
      fetchAssessments();
    } catch (err) {
      toast.error(err.message || 'Failed to update assessment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await apiClient.delete(`/faculty/assessments/${selectedAssessment.id}`);
      toast.success('Assessment deleted.');
      setIsDeleteModalOpen(false);
      fetchAssessments();
    } catch (err) {
      toast.error(err.message || 'Failed to delete assessment.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formatted = marksList.map((m) => ({
        ...m,
        marksObtained: Number(m.marksObtained) || 0
      }));
      await apiClient.put(`/faculty/assessments/${selectedAssessment.id}/marks`, {
        marks: formatted
      });
      toast.success('Assessment scores saved and statistics updated!');
      setIsMarksModalOpen(false);
      fetchAssessments();
    } catch (err) {
      toast.error(err.message || 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Assessment Title',
      key: 'title',
      render: (val, row) => (
        <div>
          <span className="font-bold text-sm text-[#0F172A] block">{val}</span>
          <span className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-primary font-semibold">{row.subjectCode}</span> • {row.date}
          </span>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'type',
      render: (val) => (
        <Badge
          variant={
            val === 'Unit Test'
              ? 'primary'
              : val === 'Lab Quiz'
              ? 'info'
              : val === 'Surprise Test'
              ? 'warning'
              : 'success'
          }
          size="sm"
        >
          {val}
        </Badge>
      )
    },
    {
      header: 'Max / Pass',
      key: 'maxMarks',
      render: (val, row) => (
        <span className="text-xs font-semibold text-[#0F172A]">
          {val} / <span className="text-[#64748B]">{row.passMarks}</span>
        </span>
      )
    },
    {
      header: 'Class Statistics',
      key: 'stats',
      render: (val) =>
        val ? (
          <div className="text-xs space-y-0.5">
            <div className="flex gap-2">
              <span className="text-[#64748B]">Avg: <span className="font-bold text-primary">{val.average}</span></span>
              <span className="text-[#64748B]">High: <span className="font-bold text-success">{val.highest}</span></span>
              <span className="text-[#64748B]">Low: <span className="font-bold text-error">{val.lowest}</span></span>
            </div>
            <span className="text-[11px] text-[#64748B]">
              Pass Rate: <span className="font-semibold text-[#0F172A]">{val.passRate}%</span> ({val.passCount}/{val.totalCount})
            </span>
          </div>
        ) : (
          '--'
        )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={Award}
            onClick={() => handleOpenMarks(row)}
          >
            Enter Scores
          </Button>
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
          <h2 className="text-xl font-bold text-[#0F172A]">Class Tests & Continuous Assessments</h2>
          <p className="text-xs text-[#64748B]">
            Unit tests, surprise quizzes, lab assessments, and analytical score distributions
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Create New Assessment
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAssessments} />
      ) : assessments.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No assessments recorded"
          description="Create unit tests or quizzes to record continuous internal evaluation."
        />
      ) : (
        <Card title="Assessment Tests Roster">
          <Table columns={columns} data={assessments} keyField="id" />
        </Card>
      )}

      {/* Add Assessment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Assessment Test"
        subtitle="Set test type, maximum marks, and passing threshold"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Assessment Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Unit Test 2 - Graph Algorithms"
          />
          <Select
            label="Assessment Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={assessmentTypes}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              required
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
            />
            <Input
              label="Test Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Maximum Marks"
              type="number"
              required
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
            />
            <Input
              label="Pass Marks"
              type="number"
              required
              value={formData.passMarks}
              onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Create Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Assessment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Assessment"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Assessment Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            label="Assessment Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={assessmentTypes}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Maximum Marks"
              type="number"
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
            />
            <Input
              label="Pass Marks"
              type="number"
              value={formData.passMarks}
              onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
            />
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

      {/* Enter Marks Modal */}
      <Modal
        isOpen={isMarksModalOpen}
        onClose={() => setIsMarksModalOpen(false)}
        title={`Enter Scores: ${selectedAssessment?.title}`}
        subtitle={`Max Marks: ${selectedAssessment?.maxMarks} • Pass Marks: ${selectedAssessment?.passMarks}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveMarks} className="space-y-4">
          <div className="max-h-96 overflow-y-auto divide-y divide-[#E2E8F0] border rounded-lg p-2">
            {marksList.map((m, idx) => (
              <div key={m.studentId} className="py-2 px-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-xs text-[#0F172A] block truncate">{m.studentName}</span>
                  <span className="font-mono text-[11px] text-[#64748B]">{m.rollNo}</span>
                </div>
                <div className="w-32 flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max={selectedAssessment?.maxMarks}
                    value={m.marksObtained}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMarksList((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, marksObtained: val } : item))
                      );
                    }}
                    placeholder="0"
                    className="w-16 px-2 py-1 text-center font-bold border rounded border-[#E2E8F0] focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    required
                  />
                  <span className="text-xs text-[#64748B]">/ {selectedAssessment?.maxMarks}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsMarksModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              Save & Recalculate Stats
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Assessment"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-sm">
          <p className="text-[#64748B]">
            Are you sure you want to delete <span className="font-bold text-[#0F172A]">{selectedAssessment?.title}</span>?
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

export default FacultyAssessments;
