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
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const FacultyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subjectCode: 'CS301',
    subjectName: 'Design & Analysis of Algorithms',
    class: 'CSE-3A',
    dueDate: '2026-10-20',
    dueTime: '11:59 PM',
    maxMarks: 25,
    instructions: '',
    attachment: 'Assignment_Spec.pdf',
    status: 'Published'
  });

  const [gradeData, setGradeData] = useState({
    marks: '',
    feedback: ''
  });

  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/assignments');
      setAssignments(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      subjectCode: 'CS301',
      subjectName: 'Design & Analysis of Algorithms',
      class: 'CSE-3A',
      dueDate: '2026-10-20',
      dueTime: '11:59 PM',
      maxMarks: 25,
      instructions: '',
      attachment: 'Assignment_Spec.pdf',
      status: 'Published'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({ ...assignment });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteModalOpen(true);
  };

  const handleOpenSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsModalOpen(true);
  };

  const handleOpenGrade = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      marks: submission.marks !== null ? submission.marks : '',
      feedback: submission.feedback || ''
    });
    setIsGradeModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/faculty/assignments', formData);
      toast.success('Assignment created & published to students.');
      setIsAddModalOpen(false);
      fetchAssignments();
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/faculty/assignments/${selectedAssignment.id}`, formData);
      toast.success('Assignment updated.');
      setIsEditModalOpen(false);
      fetchAssignments();
    } catch (err) {
      toast.error(err.message || 'Failed to update assignment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await apiClient.delete(`/faculty/assignments/${selectedAssignment.id}`);
      toast.success('Assignment deleted.');
      setIsDeleteModalOpen(false);
      fetchAssignments();
    } catch (err) {
      toast.error(err.message || 'Failed to delete assignment.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post(
        `/faculty/assignments/${selectedAssignment.id}/submissions/${selectedSubmission.submissionId}/grade`,
        gradeData
      );
      toast.success(`Marks recorded for ${selectedSubmission.studentName}.`);
      setIsGradeModalOpen(false);
      // Refresh local assignment submissions
      fetchAssignments();
      // Update active selected assignment submissions list locally
      if (selectedAssignment) {
        const updatedSubs = selectedAssignment.submissions.map((s) =>
          s.submissionId === selectedSubmission.submissionId
            ? { ...s, marks: Number(gradeData.marks), feedback: gradeData.feedback, status: 'Graded' }
            : s
        );
        setSelectedAssignment({ ...selectedAssignment, submissions: updatedSubs });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save grade.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Title & Subject',
      key: 'title',
      render: (val, row) => (
        <div>
          <span className="font-bold text-sm text-[#0F172A] block">{val}</span>
          <span className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-primary font-semibold">{row.subjectCode}</span> • Class: {row.class}
          </span>
        </div>
      )
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (val, row) => (
        <div>
          <span className="font-medium text-xs text-[#0F172A] block">{val}</span>
          <span className="text-[11px] text-[#64748B]">{row.dueTime}</span>
        </div>
      )
    },
    {
      header: 'Max Marks',
      key: 'maxMarks',
      render: (val) => <span className="font-bold text-center">{val} Marks</span>
    },
    {
      header: 'Submissions',
      key: 'submissions',
      render: (val = []) => {
        const graded = val.filter((s) => s.status === 'Graded').length;
        return (
          <span className="text-xs font-semibold">
            <span className="text-primary">{val.length}</span> turned in ({graded} graded)
          </span>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <Badge variant={val === 'Published' ? 'success' : 'neutral'} size="sm" dot>
          {val}
        </Badge>
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
            icon={Users}
            onClick={() => handleOpenSubmissions(row)}
          >
            Submissions ({row.submissions?.length || 0})
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

  const submissionColumns = [
    {
      header: 'Student',
      key: 'studentName',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#0F172A] block">{val}</span>
          <span className="font-mono text-[11px] text-[#64748B]">{row.rollNo}</span>
        </div>
      )
    },
    {
      header: 'Submitted At',
      key: 'submittedAt',
      render: (val) => <span className="text-xs text-[#64748B]">{val}</span>
    },
    {
      header: 'File / Solution',
      key: 'fileUrl',
      render: (val) => (
        <span className="text-xs text-primary font-mono flex items-center gap-1 hover:underline cursor-pointer">
          <FileText className="w-3.5 h-3.5" /> {val}
        </span>
      )
    },
    {
      header: 'Marks',
      key: 'marks',
      render: (val, row) => (
        <span className="text-xs font-bold text-[#0F172A]">
          {val !== null ? `${val} / ${selectedAssignment?.maxMarks}` : '--'}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => (
        <Badge variant={val === 'Graded' ? 'success' : 'warning'} size="sm" dot>
          {val}
        </Badge>
      )
    },
    {
      header: 'Grade Action',
      key: 'action',
      render: (_, row) => (
        <Button variant="secondary" size="sm" icon={Award} onClick={() => handleOpenGrade(row)}>
          {row.status === 'Graded' ? 'Edit Marks' : 'Grade Paper'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Course Assignments & Evaluations</h2>
          <p className="text-xs text-[#64748B]">
            Create student homework tasks, track submissions, and assign feedback & marks
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Create New Assignment
        </Button>
      </div>

      {/* Assignments Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAssignments} />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments created yet"
          description="Create your first homework or problem set for students."
        />
      ) : (
        <Card title="Assignments Registry">
          <Table columns={columns} data={assignments} keyField="id" />
        </Card>
      )}

      {/* Add Assignment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Assignment"
        subtitle="Set task description, deadlines, and maximum score"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Assignment Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Dynamic Programming & Greedy Approaches"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Subject Code"
              required
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
            />
            <Input
              label="Target Class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
            <Input
              label="Maximum Marks"
              type="number"
              required
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <Input
              label="Due Time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              placeholder="11:59 PM"
            />
          </div>
          <Input
            label="Detailed Problem Statement / Instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="Specify problem numbers, submission format, requirements..."
          />
          <Input
            label="Attachment Specification File"
            value={formData.attachment}
            onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Assignment"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Assignment Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <Input
              label="Maximum Marks"
              type="number"
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
            />
          </div>
          <Input
            label="Instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          />

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

      {/* Submissions Modal */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        title={`Student Submissions: ${selectedAssignment?.title}`}
        subtitle={`${selectedAssignment?.subjectCode} • Max Marks: ${selectedAssignment?.maxMarks}`}
        maxWidth="max-w-4xl"
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <Table
              columns={submissionColumns}
              data={selectedAssignment.submissions || []}
              keyField="submissionId"
              emptyMessage="No student has submitted this assignment yet."
            />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setIsSubmissionsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Grade Submission Modal */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title={`Evaluate: ${selectedSubmission?.studentName}`}
        subtitle={`Roll No: ${selectedSubmission?.rollNo} • Maximum Marks: ${selectedAssignment?.maxMarks}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <Input
            label={`Marks Obtained (Out of ${selectedAssignment?.maxMarks})`}
            type="number"
            min="0"
            max={selectedAssignment?.maxMarks}
            required
            value={gradeData.marks}
            onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
            placeholder="e.g. 24"
          />
          <Input
            label="Faculty Evaluation Feedback / Notes"
            value={gradeData.feedback}
            onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
            placeholder="Feedback on solution structure, correctness..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsGradeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Submit Grade
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Assignment"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-sm">
          <p className="text-[#64748B]">
            Are you sure you want to delete <span className="font-bold text-[#0F172A]">{selectedAssignment?.title}</span>?
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

export default FacultyAssignments;
