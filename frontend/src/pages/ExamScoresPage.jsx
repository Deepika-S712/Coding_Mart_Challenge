import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Save,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Award,
  Users,
  Search,
  CheckSquare
} from 'lucide-react';
import { examApi } from '../api/examApi';
import { studentApi } from '../api/studentApi';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

const SUBJECTS = [
  { code: 'CS301', name: 'Data Structures & Algorithms', className: 'CSE-3A' },
  { code: 'CS302', name: 'Database Management Systems', className: 'CSE-3A' },
  { code: 'CS305', name: 'Web Technologies & Architecture', className: 'IT-3A' }
];

// Helper to compute grade based on percentage
function calculateGrade(marks, maxMarks) {
  if (marks === null || marks === undefined || marks === '') return '—';
  const score = Number(marks);
  if (isNaN(score) || maxMarks <= 0) return '—';
  const pct = (score / maxMarks) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 40) return 'C';
  return 'F';
}

function getGradeVariant(grade) {
  if (grade === 'A+' || grade === 'A') return 'success';
  if (grade === 'B+' || grade === 'B') return 'primary';
  if (grade === 'C+' || grade === 'C') return 'warning';
  if (grade === 'F') return 'danger';
  return 'neutral';
}

export function ExamScoresPage() {
  const toast = useToast();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CS301');

  const [subjectExamData, setSubjectExamData] = useState(null);
  const [scoresList, setScoresList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);
  const [error, setError] = useState(null);

  // Search filter inside table
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Action States
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitConfirmModal, setSubmitConfirmModal] = useState(false);

  // Fetch initial exams list
  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await examApi.getAll();
      if (res.success && res.data && res.data.length > 0) {
        setExams(res.data);
        setSelectedExamId(res.data[0].id);
      } else {
        setExams([]);
      }
    } catch (err) {
      setError(err.message || 'Error fetching exam series');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Fetch scores when exam or subject changes
  const fetchScores = async () => {
    if (!selectedExamId || !selectedSubjectCode) return;
    setLoadingScores(true);
    try {
      const res = await examApi.getScores(selectedExamId, selectedSubjectCode);
      if (res.success && res.data) {
        setSubjectExamData(res.data);
        let loadedScores = res.data.scores || [];

        // If no scores in database yet, auto-populate from students of that class
        if (loadedScores.length === 0) {
          const subInfo = SUBJECTS.find((s) => s.code === selectedSubjectCode);
          const className = subInfo ? subInfo.className : 'CSE-3A';
          try {
            const stuRes = await studentApi.getAll({ className });
            if (stuRes.success && stuRes.data) {
              loadedScores = stuRes.data.map((stu, idx) => ({
                scoreId: `SC-GEN-${idx + 1}`,
                studentId: stu.id,
                rollNumber: stu.rollNumber,
                studentName: stu.name,
                marks: '',
                grade: '—',
                remarks: ''
              }));
            }
          } catch {
            // fallback empty
          }
        }

        setScoresList(loadedScores);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load exam scores');
    } finally {
      setLoadingScores(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      fetchScores();
    }
  }, [selectedExamId, selectedSubjectCode]);

  // Handle Mark Change
  const handleMarkChange = (index, value) => {
    const maxMarks = subjectExamData?.maxMarks || 50;
    const updated = [...scoresList];
    const valNum = value === '' ? '' : Number(value);

    if (valNum !== '' && (valNum < 0 || valNum > maxMarks)) {
      toast.warning(`Marks must be between 0 and ${maxMarks}`);
      return;
    }

    updated[index].marks = value === '' ? '' : valNum;
    updated[index].grade = calculateGrade(value, maxMarks);
    setScoresList(updated);
  };

  // Handle Remarks Change
  const handleRemarksChange = (index, value) => {
    const updated = [...scoresList];
    updated[index].remarks = value;
    setScoresList(updated);
  };

  // Save Draft Scores
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const formattedScores = scoresList.map((s) => ({
        ...s,
        marks: s.marks === '' ? null : Number(s.marks),
        grade: calculateGrade(s.marks, subjectExamData?.maxMarks || 50)
      }));

      const res = await examApi.saveScores(selectedExamId, selectedSubjectCode, formattedScores);
      if (res.success) {
        toast.success('Exam marks saved as draft');
        setSubjectExamData((prev) => ({
          ...prev,
          submissionStatus: 'Saved',
          scores: formattedScores
        }));
      } else {
        throw new Error(res.message || 'Failed to save scores');
      }
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Final Scores
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save current entries first
      const formattedScores = scoresList.map((s) => ({
        ...s,
        marks: s.marks === '' ? null : Number(s.marks),
        grade: calculateGrade(s.marks, subjectExamData?.maxMarks || 50)
      }));
      await examApi.saveScores(selectedExamId, selectedSubjectCode, formattedScores);

      const res = await examApi.submitScores(selectedExamId, selectedSubjectCode);
      if (res.success && res.data) {
        toast.success('Exam scores finalized and officially submitted');
        setSubjectExamData(res.data);
        setSubmitConfirmModal(false);
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistical calculations
  const stats = useMemo(() => {
    const maxMarks = subjectExamData?.maxMarks || 50;
    const validScores = scoresList
      .map((s) => (s.marks !== '' && s.marks !== null ? Number(s.marks) : null))
      .filter((m) => m !== null && !isNaN(m));

    const totalStudents = scoresList.length;
    const evaluated = validScores.length;

    if (evaluated === 0) {
      return { evaluated, totalStudents, average: 0, highest: 0, lowest: 0, passRate: 0 };
    }

    const sum = validScores.reduce((a, b) => a + b, 0);
    const average = (sum / evaluated).toFixed(1);
    const highest = Math.max(...validScores);
    const lowest = Math.min(...validScores);
    const passing = validScores.filter((m) => (m / maxMarks) * 100 >= 40).length;
    const passRate = Math.round((passing / evaluated) * 100);

    return { evaluated, totalStudents, average, highest, lowest, passRate };
  }, [scoresList, subjectExamData]);

  // Filtered table rows
  const filteredScores = useMemo(() => {
    return scoresList.filter((s) => {
      return (
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [scoresList, searchTerm]);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ height: '32px', width: '260px', backgroundColor: 'var(--cms-bg-muted)', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ height: '16px', width: '420px', backgroundColor: 'var(--cms-bg-muted)', borderRadius: '4px' }} />
        </div>
        <div className="cms-stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Error Loading Exam Module" message={error} onRetry={fetchExams} />;
  }

  const isSubmitted = subjectExamData?.submissionStatus === 'Submitted';

  return (
    <div>
      {/* Page Header */}
      <div className="cms-page-header">
        <div>
          <h1 className="cms-page-title">Formal Exam Scores & Grading</h1>
          <p className="cms-page-subtitle">
            Enter semester examination marks, compute official letter grades, and submit final score sheets
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSubmitted || isSaving || loadingScores}
          >
            <Save size={15} style={{ marginRight: '6px' }} />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setSubmitConfirmModal(true)}
            disabled={isSubmitted || isSubmitting || loadingScores}
          >
            {isSubmitted ? (
              <>
                <Lock size={15} style={{ marginRight: '6px' }} />
                Scores Locked
              </>
            ) : (
              <>
                <CheckCircle2 size={15} style={{ marginRight: '6px' }} />
                Finalize & Submit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">
              {stats.evaluated} / {stats.totalStudents}
            </div>
            <div className="cms-stat-label">Evaluated Roster</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: 'var(--cms-primary-light)', color: 'var(--cms-primary)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">
              {stats.average} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cms-text-secondary)' }}>/ {subjectExamData?.maxMarks || 50}</span>
            </div>
            <div className="cms-stat-label">Class Average Score</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#E0F2FE', color: 'var(--cms-info)' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">
              {stats.highest} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cms-text-secondary)' }}>/ {subjectExamData?.maxMarks || 50}</span>
            </div>
            <div className="cms-stat-label">Highest Score</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#DCFCE7', color: 'var(--cms-success)' }}>
            <Award size={24} />
          </div>
        </div>

        <div className="cms-stat-card">
          <div>
            <div className="cms-stat-value">{stats.passRate}%</div>
            <div className="cms-stat-label">Passing Rate</div>
          </div>
          <div className="cms-stat-icon" style={{ backgroundColor: '#FEF3C7', color: 'var(--cms-warning)' }}>
            <CheckSquare size={24} />
          </div>
        </div>
      </div>

      {/* Selector & Exam Status Toolbar */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Row: Exam Dropdown & Status Indicator */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--cms-border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label className="cms-label" style={{ marginBottom: 0, fontWeight: 600 }}>
                Examination:
              </label>
              <select
                className="cms-select"
                style={{ width: '320px' }}
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.semester})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--cms-text-secondary)' }}>Status:</span>
              <Badge variant={isSubmitted ? 'success' : subjectExamData?.submissionStatus === 'Saved' ? 'primary' : 'warning'}>
                {isSubmitted ? '● Submitted & Locked' : subjectExamData?.submissionStatus === 'Saved' ? 'Saved Draft' : 'Draft / Editing'}
              </Badge>
              {subjectExamData?.submittedAt && (
                <span style={{ fontSize: '12px', color: 'var(--cms-text-muted)' }}>
                  (Submitted: {subjectExamData.submittedAt})
                </span>
              )}
            </div>
          </div>

          {/* Bottom Row: Subject Tabs & Search */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.code}
                  onClick={() => setSelectedSubjectCode(sub.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: selectedSubjectCode === sub.code ? 600 : 500,
                    color: selectedSubjectCode === sub.code ? 'var(--cms-primary)' : 'var(--cms-text-secondary)',
                    backgroundColor: selectedSubjectCode === sub.code ? 'var(--cms-primary-light)' : 'var(--cms-bg-subtle)',
                    border: `1px solid ${selectedSubjectCode === sub.code ? 'var(--cms-primary-border)' : 'var(--cms-border-subtle)'}`,
                    borderRadius: 'var(--cms-radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{sub.code}</span>
                  <span style={{ fontSize: '12px', opacity: 0.85 }}>• {sub.name}</span>
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '240px' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--cms-text-muted)',
                  pointerEvents: 'none',
                  display: 'flex'
                }}
              >
                <Search size={15} />
              </div>
              <input
                type="text"
                className="cms-input"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '13px' }}
                placeholder="Search student or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Lock Notice Banner if Submitted */}
      {isSubmitted && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 'var(--cms-radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#1E40AF',
            fontSize: '13px'
          }}
        >
          <Lock size={18} color="#2563EB" />
          <span>
            <strong>Official Submission Locked:</strong> Marks for this subject have been submitted and permanently locked. Contact the Exam Cell / Registrar to request administrative corrections.
          </span>
        </div>
      )}

      {/* Score Entry Roster Table */}
      <Card
        title={`Scoring Sheet: ${selectedSubjectCode} - ${SUBJECTS.find((s) => s.code === selectedSubjectCode)?.name || ''}`}
        subtitle={`Class: ${subjectExamData?.className || 'CSE-3A'} • Maximum Marks: ${subjectExamData?.maxMarks || 50}`}
      >
        {loadingScores ? (
          <TableSkeleton rows={6} columns={5} />
        ) : filteredScores.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No student records found"
            description="No students are enrolled for this exam batch."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cms-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Roll No</th>
                  <th style={{ width: '220px' }}>Student Name</th>
                  <th style={{ width: '160px' }}>Marks Obtained (Max {subjectExamData?.maxMarks || 50})</th>
                  <th style={{ width: '100px' }}>Grade</th>
                  <th>Faculty Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((row, idx) => {
                  const currentGrade = calculateGrade(row.marks, subjectExamData?.maxMarks || 50);
                  const gradeVariant = getGradeVariant(currentGrade);

                  return (
                    <tr key={row.scoreId || row.studentId || idx}>
                      <td style={{ fontWeight: 600, color: 'var(--cms-text-primary)' }}>
                        {row.rollNumber}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {row.studentName}
                      </td>
                      <td>
                        <input
                          type="number"
                          className="cms-input"
                          style={{
                            width: '100px',
                            padding: '6px 10px',
                            fontWeight: 600,
                            textAlign: 'center',
                            backgroundColor: isSubmitted ? 'var(--cms-bg-subtle)' : 'var(--cms-bg-surface)'
                          }}
                          placeholder="0"
                          min="0"
                          max={subjectExamData?.maxMarks || 50}
                          value={row.marks !== null && row.marks !== undefined ? row.marks : ''}
                          disabled={isSubmitted}
                          onChange={(e) => handleMarkChange(idx, e.target.value)}
                        />
                      </td>
                      <td>
                        <Badge variant={gradeVariant}>
                          {currentGrade}
                        </Badge>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="cms-input"
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            backgroundColor: isSubmitted ? 'var(--cms-bg-subtle)' : 'var(--cms-bg-surface)'
                          }}
                          placeholder="Add remark..."
                          value={row.remarks || ''}
                          disabled={isSubmitted}
                          onChange={(e) => handleRemarksChange(idx, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* FINAL SUBMISSION CONFIRMATION MODAL */}
      <Modal
        isOpen={submitConfirmModal}
        onClose={() => setSubmitConfirmModal(false)}
        title="Confirm Official Exam Submission"
        maxWidth="480px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setSubmitConfirmModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Locking Scores...' : 'Confirm & Finalize'}
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
              backgroundColor: '#FEF3C7',
              color: 'var(--cms-warning)',
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
              Finalize scores for {selectedSubjectCode}?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)', lineHeight: 1.4 }}>
              Once submitted, marks and computed grades are officially recorded and locked against further edits. Ensure all {stats.evaluated} student scores are accurate.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
