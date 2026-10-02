import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  FileCheck,
  Download,
  Paperclip,
  CheckSquare,
  Award,
  Users,
  Filter,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { assignmentApi } from '../api/assignmentApi';
import { facultyApi } from '../api/facultyApi';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { TableSkeleton, CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

const SUBJECT_OPTIONS = [
  { code: 'CS301', name: 'Data Structures & Algorithms', defaultClass: 'CSE-3A' },
  { code: 'CS302', name: 'Database Management Systems', defaultClass: 'CSE-3A' },
  { code: 'CS305', name: 'Web Technologies & Architecture', defaultClass: 'IT-3A' }
];

const STATUS_OPTIONS = ['All', 'Published', 'Draft', 'Closed'];

export function AssignmentsPage() {
  const toast = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [formModal, setFormModal] = useState({ open: false, isEdit: false, assignment: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, assignment: null });
  const [submissionsModal, setSubmissionsModal] = useState({ open: false, assignment: null });
  const [gradeModal, setGradeModal] = useState({ open: false, submission: null, assignment: null });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subjectCode: 'CS301',
    subjectName: 'Data Structures & Algorithms',
    className: 'CSE-3A',
    dueDate: '',
    dueTime: '23:59',
    maxMarks: 50,
    status: 'Published',
    instructions: '',
    attachmentUrl: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Grading Form State
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  // Submissions filter
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('All');

  // Fetch Assignments
  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assignmentApi.getAll({
        subjectCode: selectedSubject,
        status: selectedStatus === 'All' ? '' : selectedStatus
      });
      if (res.success && res.data) {
        setAssignments(res.data);
      } else {
        throw new Error(res.message || 'Failed to fetch assignments');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with assignment service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedSubject, selectedStatus]);

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = assignments.length;
    const published = assignments.filter((a) => a.status === 'Published').length;
    const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submittedCount || 0), 0);
    const totalGraded = assignments.reduce((acc, a) => acc + (a.gradedCount || 0), 0);
    const pendingGrading = totalSubmissions - totalGraded;

    return { total, published, totalSubmissions, pendingGrading };
  }, [assignments]);

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.instructions && item.instructions.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSearch;
    });
  }, [assignments, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultSub = SUBJECT_OPTIONS[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    setFormData({
      title: '',
      subjectCode: defaultSub.code,
      subjectName: defaultSub.name,
      className: defaultSub.defaultClass,
      dueDate: defaultDate,
      dueTime: '23:59',
      maxMarks: 50,
      status: 'Published',
      instructions: '',
      attachmentUrl: ''
    });
    setFormErrors({});
    setFormModal({ open: true, isEdit: false, assignment: null });
  };

  // Open Edit Modal
  const handleOpenEdit = (assignment) => {
    setFormData({
      title: assignment.title,
      subjectCode: assignment.subjectCode,
      subjectName: assignment.subjectName,
      className: assignment.className,
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime || '23:59',
      maxMarks: assignment.maxMarks,
      status: assignment.status,
      instructions: assignment.instructions || '',
      attachmentUrl: assignment.attachmentUrl || ''
    });
    setFormErrors({});
    setFormModal({ open: true, isEdit: true, assignment });
  };

  // Subject change in create/edit modal
  const handleSubjectChange = (e) => {
    const subCode = e.target.value;
    const found = SUBJECT_OPTIONS.find((s) => s.code === subCode);
    setFormData((prev) => ({
      ...prev,
      subjectCode: subCode,
      subjectName: found ? found.name : prev.subjectName,
      className: found ? found.defaultClass : prev.className
    }));
  };

  // Validate form
  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Assignment title is required';
    if (!formData.subjectCode) errs.subjectCode = 'Please select a subject';
    if (!formData.className.trim()) errs.className = 'Class name is required';
    if (!formData.dueDate) errs.dueDate = 'Due date is required';
    if (!formData.maxMarks || Number(formData.maxMarks) <= 0) {
      errs.maxMarks = 'Max marks must be greater than 0';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Create / Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmittingForm(true);
    try {
      if (formModal.isEdit) {
        const res = await assignmentApi.update(formModal.assignment.id, {
          ...formData,
          maxMarks: Number(formData.maxMarks)
        });
        if (res.success) {
          toast.success('Assignment updated successfully');
          setFormModal({ open: false, isEdit: false, assignment: null });
          fetchAssignments();
        } else {
          throw new Error(res.message || 'Failed to update assignment');
        }
      } else {
        const res = await assignmentApi.create({
          ...formData,
          maxMarks: Number(formData.maxMarks)
        });
        if (res.success) {
          toast.success('Assignment created successfully');
          setFormModal({ open: false, isEdit: false, assignment: null });
          fetchAssignments();
        } else {
          throw new Error(res.message || 'Failed to create assignment');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async () => {
    if (!deleteModal.assignment) return;
    try {
      const res = await assignmentApi.delete(deleteModal.assignment.id);
      if (res.success) {
        toast.success('Assignment deleted successfully');
        setDeleteModal({ open: false, assignment: null });
        fetchAssignments();
      } else {
        throw new Error(res.message || 'Failed to delete assignment');
      }
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // Open Submissions Modal
  const handleOpenSubmissions = async (assignment) => {
    try {
      const res = await assignmentApi.getById(assignment.id);
      if (res.success && res.data) {
        setSubmissionsModal({ open: true, assignment: res.data });
      } else {
        setSubmissionsModal({ open: true, assignment });
      }
    } catch (err) {
      setSubmissionsModal({ open: true, assignment });
    }
  };

  // Open Grade Modal
  const handleOpenGrade = (submission, assignment) => {
    setGradeScore(submission.score !== null && submission.score !== undefined ? String(submission.score) : '');
    setGradeFeedback(submission.feedback || '');
    setGradeError('');
    setGradeModal({ open: true, submission, assignment });
  };

  // Submit Grade
  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    const scoreNum = Number(gradeScore);
    const maxMarks = gradeModal.assignment?.maxMarks || 100;

    if (gradeScore === '' || isNaN(scoreNum)) {
      setGradeError('Please enter a valid numeric score');
      return;
    }
    if (scoreNum < 0 || scoreNum > maxMarks) {
      setGradeError(`Score must be between 0 and ${maxMarks}`);
      return;
    }

    setIsSubmittingGrade(true);
    try {
      const res = await assignmentApi.gradeSubmission(
        gradeModal.assignment.id,
        gradeModal.submission.submissionId,
        {
          score: scoreNum,
          feedback: gradeFeedback.trim()
        }
      );

      if (res.success) {
        toast.success(`Marks saved for ${gradeModal.submission.studentName}`);
        setGradeModal({ open: false, submission: null, assignment: null });

        // Refresh single assignment details for the submissions drawer
        const updatedRes = await assignmentApi.getById(gradeModal.assignment.id);
        if (updatedRes.success && updatedRes.data) {
          setSubmissionsModal({ open: true, assignment: updatedRes.data });
        }
        // Refresh master list
        fetchAssignments();
      } else {
        throw new Error(res.message || 'Failed to submit grade');
      }
    } catch (err) {
      toast.error(err.message || 'Grading failed');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // Submissions filtered list
  const filteredSubmissions = useMemo(() => {
    if (!submissionsModal.assignment || !submissionsModal.assignment.submissions) return [];
    const subs = submissionsModal.assignment.submissions;
    if (submissionStatusFilter === 'All') return subs;
    if (submissionStatusFilter === 'Graded') return subs.filter((s) => s.status === 'Graded');
    if (submissionStatusFilter === 'Pending') return subs.filter((s) => s.status === 'Pending');
    return subs;
  }, [submissionsModal.assignment, submissionStatusFilter]);

  return (
    <div>
      {/* Page Header */}
      <div className="cms-page-header">
        <div>
          <h1 className="cms-page-title">Assignments & Coursework</h1>
          <p className="cms-page-subtitle">
            Manage course assignments, evaluate submitted student papers, and record grades
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus size={16} style={{ marginRight: '6px' }} />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{metrics.total}</div>
            <div className="cms-stat-label">Total Assignments</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: 'var(--cms-primary-light)', color: 'var(--cms-primary)' }}>
            <FileText size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{metrics.published}</div>
            <div className="cms-stat-label">Published & Active</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#DCFCE7', color: 'var(--cms-success)' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{metrics.totalSubmissions}</div>
            <div className="cms-stat-label">Submissions Received</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#E0F2FE', color: 'var(--cms-info)' }}>
            <FileCheck size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{metrics.pendingGrading}</div>
            <div className="cms-stat-label">Pending Evaluation</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#FEF3C7', color: 'var(--cms-warning)' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <Card style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Search */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--cms-text-muted)',
                pointerEvents: 'none',
                display: 'flex'
              }}
            >
              <Search size={16} />
            </div>
            <input
              type="text"
              className="cms-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search assignments by title or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Subject Filter */}
          <div style={{ flex: '0 1 220px' }}>
            <select
              className="cms-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--cms-bg-subtle)', padding: '4px', borderRadius: 'var(--cms-radius-md)' }}>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: selectedStatus === status ? 600 : 500,
                  color: selectedStatus === status ? 'var(--cms-primary)' : 'var(--cms-text-secondary)',
                  backgroundColor: selectedStatus === status ? 'var(--cms-bg-surface)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--cms-radius-sm)',
                  cursor: 'pointer',
                  boxShadow: selectedStatus === status ? 'var(--cms-shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Error Loading Assignments"
          message={error}
          onRetry={fetchAssignments}
        />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments found"
          description={
            searchQuery || selectedSubject || selectedStatus !== 'All'
              ? 'No assignments match the selected filter criteria. Try resetting filters.'
              : 'Create your first assignment to assign tasks and evaluate students.'
          }
          action={
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <Plus size={16} style={{ marginRight: '6px' }} />
              Create Assignment
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredAssignments.map((assignment) => {
            const statusVariant =
              assignment.status === 'Published'
                ? 'success'
                : assignment.status === 'Draft'
                ? 'warning'
                : 'neutral';

            const submissionPercent = assignment.totalStudents
              ? Math.round(((assignment.submittedCount || 0) / assignment.totalStudents) * 100)
              : 0;

            const isDuePassed = new Date(assignment.dueDate) < new Date();

            return (
              <Card
                key={assignment.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${
                    assignment.status === 'Published'
                      ? 'var(--cms-primary)'
                      : assignment.status === 'Draft'
                      ? 'var(--cms-warning)'
                      : 'var(--cms-border-subtle)'
                  }`
                }}
              >
                <div>
                  {/* Card Badges Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--cms-primary)',
                          backgroundColor: 'var(--cms-primary-light)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {assignment.subjectCode}
                      </span>
                      <Badge variant="neutral">{assignment.className}</Badge>
                    </div>
                    <Badge variant={statusVariant}>{assignment.status}</Badge>
                  </div>

                  {/* Title & Subject */}
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--cms-text-primary)',
                      marginBottom: '4px',
                      lineHeight: 1.3
                    }}
                  >
                    {assignment.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)', marginBottom: '12px' }}>
                    {assignment.subjectName}
                  </p>

                  {/* Instructions Snippet */}
                  {assignment.instructions && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--cms-text-secondary)',
                        backgroundColor: 'var(--cms-bg-subtle)',
                        padding: '10px 12px',
                        borderRadius: 'var(--cms-radius-sm)',
                        marginBottom: '16px',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {assignment.instructions}
                    </p>
                  )}

                  {/* Key Metadata Rows */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '12px',
                      color: 'var(--cms-text-secondary)',
                      marginBottom: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="var(--cms-text-muted)" />
                        Due Date:
                      </span>
                      <span style={{ fontWeight: 600, color: isDuePassed ? 'var(--cms-danger)' : 'var(--cms-text-primary)' }}>
                        {assignment.dueDate} {assignment.dueTime ? `at ${assignment.dueTime}` : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} color="var(--cms-text-muted)" />
                        Max Marks:
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--cms-text-primary)' }}>
                        {assignment.maxMarks} Marks
                      </span>
                    </div>

                    {assignment.attachmentUrl && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Paperclip size={14} color="var(--cms-text-muted)" />
                          Attachment:
                        </span>
                        <span
                          style={{
                            fontWeight: 500,
                            color: 'var(--cms-primary)',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {assignment.attachmentUrl.split('/').pop()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submissions Progress Bar */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--cms-text-secondary)' }}>
                        Submissions: {assignment.submittedCount || 0} / {assignment.totalStudents || 6}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--cms-success)' }}>
                        {assignment.gradedCount || 0} Graded
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--cms-bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${submissionPercent}%`,
                          backgroundColor: 'var(--cms-primary)',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderTop: '1px solid var(--cms-border-subtle)',
                    paddingTop: '14px'
                  }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    style={{ flex: 1 }}
                    onClick={() => handleOpenSubmissions(assignment)}
                  >
                    <Eye size={14} style={{ marginRight: '6px' }} />
                    Submissions ({assignment.submittedCount || 0})
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(assignment)}
                    aria-label="Edit assignment"
                  >
                    <Edit2 size={14} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    style={{ color: 'var(--cms-danger)', borderColor: '#FCA5A5' }}
                    onClick={() => setDeleteModal({ open: true, assignment })}
                    aria-label="Delete assignment"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, isEdit: false, assignment: null })}
        title={formModal.isEdit ? 'Edit Assignment' : 'Create New Assignment'}
        maxWidth="620px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setFormModal({ open: false, isEdit: false, assignment: null })}
              disabled={isSubmittingForm}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitForm}
              disabled={isSubmittingForm}
            >
              {isSubmittingForm
                ? 'Saving...'
                : formModal.isEdit
                ? 'Update Assignment'
                : 'Publish Assignment'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Assignment Title"
            required
            placeholder="e.g. Assignment 1: Data Structures Analysis"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="cms-form-group">
              <label className="cms-label">
                Subject <span style={{ color: 'var(--cms-danger)' }}>*</span>
              </label>
              <select
                className={`cms-select ${formErrors.subjectCode ? 'cms-input-error' : ''}`}
                value={formData.subjectCode}
                onChange={handleSubjectChange}
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="cms-form-group">
              <label className="cms-label">
                Class Batch <span style={{ color: 'var(--cms-danger)' }}>*</span>
              </label>
              <select
                className="cms-select"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                <option value="CSE-3A">CSE-3A (Semester 5)</option>
                <option value="CSE-3B">CSE-3B (Semester 5)</option>
                <option value="IT-3A">IT-3A (Semester 5)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
            <Input
              label="Due Date"
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              error={formErrors.dueDate}
            />

            <Input
              label="Due Time"
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
            />

            <Input
              label="Max Marks"
              type="number"
              required
              min="1"
              max="200"
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
              error={formErrors.maxMarks}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="cms-form-group">
              <label className="cms-label">Publishing Status</label>
              <select
                className="cms-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Published">Published (Visible to Students)</option>
                <option value="Draft">Draft (Saved only)</option>
                <option value="Closed">Closed (Submissions Locked)</option>
              </select>
            </div>

            <Input
              label="Reference / Problem PDF Link"
              placeholder="e.g. /assignments/problem-sheet.pdf"
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
              helperText="Optional file path or external download link"
            />
          </div>

          <div className="cms-form-group">
            <label className="cms-label">Instructions & Rubrics</label>
            <textarea
              className="cms-input"
              rows={3}
              placeholder="Explain problems, constraints, allowed programming languages, and submission guidelines..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>

      {/* SUBMISSIONS LIST MODAL */}
      <Modal
        isOpen={submissionsModal.open}
        onClose={() => setSubmissionsModal({ open: false, assignment: null })}
        title={submissionsModal.assignment ? `Submissions: ${submissionsModal.assignment.title}` : 'Submissions'}
        maxWidth="820px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: '13px', color: 'var(--cms-text-secondary)' }}>
              Total: {submissionsModal.assignment?.submissions?.length || 0} submissions submitted
            </span>
            <Button
              variant="outline"
              size="md"
              onClick={() => setSubmissionsModal({ open: false, assignment: null })}
            >
              Close
            </Button>
          </div>
        }
      >
        {submissionsModal.assignment && (
          <div>
            {/* Header info strip */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--cms-bg-subtle)',
                padding: '12px 16px',
                borderRadius: 'var(--cms-radius-md)',
                marginBottom: '16px',
                gap: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cms-text-primary)' }}>
                  {submissionsModal.assignment.subjectCode} • {submissionsModal.assignment.className}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--cms-text-secondary)', marginLeft: '8px' }}>
                  Due: {submissionsModal.assignment.dueDate}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--cms-text-secondary)' }}>Filter:</span>
                {['All', 'Pending', 'Graded'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSubmissionStatusFilter(f)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: submissionStatusFilter === f ? 600 : 500,
                      color: submissionStatusFilter === f ? 'var(--cms-primary)' : 'var(--cms-text-secondary)',
                      backgroundColor: submissionStatusFilter === f ? 'var(--cms-bg-surface)' : 'transparent',
                      border: '1px solid var(--cms-border-subtle)',
                      borderRadius: 'var(--cms-radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions Table */}
            {filteredSubmissions.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No submissions found"
                description={
                  submissionsModal.assignment.submissions && submissionsModal.assignment.submissions.length > 0
                    ? 'No submissions match the selected filter.'
                    : 'No student has submitted work for this assignment yet.'
                }
              />
            ) : (
              <Table
                columns={[
                  {
                    header: 'Roll No',
                    accessor: 'rollNumber',
                    render: (val) => (
                      <span style={{ fontWeight: 600, color: 'var(--cms-text-primary)' }}>{val}</span>
                    )
                  },
                  {
                    header: 'Student Name',
                    accessor: 'studentName',
                    render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>
                  },
                  {
                    header: 'Submitted At',
                    accessor: 'submittedAt',
                    render: (val) => (
                      <span style={{ fontSize: '12px', color: 'var(--cms-text-secondary)' }}>
                        {val}
                      </span>
                    )
                  },
                  {
                    header: 'File Paper',
                    accessor: 'fileName',
                    render: (val, row) => (
                      <a
                        href={`#${val}`}
                        onClick={(e) => {
                          e.preventDefault();
                          toast.info(`Simulating download of ${val}`);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: 'var(--cms-primary)',
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={13} />
                        <span>{val}</span>
                      </a>
                    )
                  },
                  {
                    header: 'Status',
                    accessor: 'status',
                    render: (val) => (
                      <Badge variant={val === 'Graded' ? 'success' : 'warning'}>
                        {val === 'Graded' ? 'Graded' : 'Pending'}
                      </Badge>
                    )
                  },
                  {
                    header: 'Score',
                    accessor: 'score',
                    render: (val, row) => (
                      <span style={{ fontWeight: 600, color: val !== null ? 'var(--cms-text-primary)' : 'var(--cms-text-muted)' }}>
                        {val !== null ? `${val} / ${submissionsModal.assignment.maxMarks}` : '—'}
                      </span>
                    )
                  },
                  {
                    header: 'Action',
                    accessor: 'submissionId',
                    render: (_, row) => (
                      <Button
                        variant={row.status === 'Graded' ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleOpenGrade(row, submissionsModal.assignment)}
                      >
                        {row.status === 'Graded' ? 'Edit Marks' : 'Grade'}
                      </Button>
                    )
                  }
                ]}
                data={filteredSubmissions}
              />
            )}
          </div>
        )}
      </Modal>

      {/* GRADE SUBMISSION MODAL */}
      <Modal
        isOpen={gradeModal.open}
        onClose={() => setGradeModal({ open: false, submission: null, assignment: null })}
        title="Grade Student Submission"
        maxWidth="520px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setGradeModal({ open: false, submission: null, assignment: null })}
              disabled={isSubmittingGrade}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitGrade}
              disabled={isSubmittingGrade}
            >
              {isSubmittingGrade ? 'Saving Grade...' : 'Save Evaluation'}
            </Button>
          </div>
        }
      >
        {gradeModal.submission && gradeModal.assignment && (
          <form onSubmit={handleSubmitGrade} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Student metadata banner */}
            <div
              style={{
                backgroundColor: 'var(--cms-bg-subtle)',
                padding: '12px 16px',
                borderRadius: 'var(--cms-radius-md)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ color: 'var(--cms-text-secondary)' }}>Student: </span>
                <span style={{ fontWeight: 600, color: 'var(--cms-text-primary)' }}>
                  {gradeModal.submission.studentName}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--cms-text-secondary)' }}>Roll Number: </span>
                <span style={{ fontWeight: 600, color: 'var(--cms-text-primary)' }}>
                  {gradeModal.submission.rollNumber}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--cms-text-secondary)' }}>Submitted: </span>
                <span style={{ color: 'var(--cms-text-primary)' }}>
                  {gradeModal.submission.submittedAt}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--cms-text-secondary)' }}>File: </span>
                <span style={{ color: 'var(--cms-primary)', fontWeight: 500 }}>
                  {gradeModal.submission.fileName}
                </span>
              </div>
            </div>

            {/* Score Input */}
            <Input
              label={`Score (Max ${gradeModal.assignment.maxMarks} Marks)`}
              type="number"
              required
              min="0"
              max={gradeModal.assignment.maxMarks}
              placeholder={`Enter marks 0 - ${gradeModal.assignment.maxMarks}`}
              value={gradeScore}
              onChange={(e) => {
                setGradeScore(e.target.value);
                setGradeError('');
              }}
              error={gradeError}
              helperText={`Evaluated against maximum score of ${gradeModal.assignment.maxMarks}`}
            />

            {/* Feedback textarea */}
            <div className="cms-form-group">
              <label className="cms-label">Evaluation Feedback / Comments</label>
              <textarea
                className="cms-input"
                rows={4}
                placeholder="Add constructive notes, code review suggestions, or grading remarks..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, assignment: null })}
        title="Delete Assignment"
        maxWidth="460px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteModal({ open: false, assignment: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteAssignment}
            >
              Delete Assignment
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--cms-radius-full)',
              backgroundColor: '#FEE2E2',
              color: 'var(--cms-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertCircle size={22} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cms-text-primary)', marginBottom: '6px' }}>
              Are you sure you want to delete this assignment?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)', lineHeight: 1.4 }}>
              <strong>{deleteModal.assignment?.title}</strong> ({deleteModal.assignment?.subjectCode}) and all student submissions will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
