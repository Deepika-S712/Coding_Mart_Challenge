import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { useToast } from '../../components/common/Toast';
import {
  FileCheck,
  Save,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Award
} from 'lucide-react';

export const FacultyExamScores = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [activeExam, setActiveExam] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Submit Final confirmation modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const toast = useToast();

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/exams');
      setExams(res.data);
      if (res.data.length > 0) {
        const first = res.data[0];
        setSelectedExamId(first.id);
        setActiveExam(first);
        setScores(JSON.parse(JSON.stringify(first.scores || [])));
      }
    } catch (err) {
      setError(err.message || 'Failed to load exam score sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSelectExam = (examId) => {
    setSelectedExamId(examId);
    const found = exams.find((e) => e.id === examId);
    if (found) {
      setActiveExam(found);
      setScores(JSON.parse(JSON.stringify(found.scores || [])));
    }
  };

  const handleScoreChange = (index, field, value) => {
    if (isSubmitted) return;
    setScores((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await apiClient.post(`/faculty/exams/${selectedExamId}/scores`, {
        scores: scores.map((s) => ({
          ...s,
          marks: Number(s.marks) || 0
        }))
      });
      toast.success('Scores saved as Draft. You can continue editing.');
      setActiveExam(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitFinal = async () => {
    setSaving(true);
    try {
      // First save current scores
      await apiClient.post(`/faculty/exams/${selectedExamId}/scores`, {
        scores: scores.map((s) => ({
          ...s,
          marks: Number(s.marks) || 0
        }))
      });

      // Then lock scores
      const res = await apiClient.post(`/faculty/exams/${selectedExamId}/scores/submit`);
      toast.success('Exam marks officially submitted to Controller of Examinations! Scores are now locked.');
      setIsSubmitModalOpen(false);
      setActiveExam(res.data);
      fetchExams();
    } catch (err) {
      toast.error(err.message || 'Failed to submit final marks.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchExams} />;
  }

  const isSubmitted = activeExam?.status === 'SUBMITTED';

  const columns = [
    {
      header: 'Roll No',
      key: 'rollNo',
      render: (val) => <span className="font-mono text-xs font-semibold text-primary">{val}</span>
    },
    {
      header: 'Student Name',
      key: 'studentName',
      render: (val) => <span className="font-semibold text-sm text-[#0F172A]">{val}</span>
    },
    {
      header: `Marks (Max: ${activeExam?.maxMarks || 50})`,
      key: 'marks',
      render: (val, row, idx) => (
        <div className="w-24">
          <input
            type="number"
            min="0"
            max={activeExam?.maxMarks || 50}
            disabled={isSubmitted}
            value={val}
            onChange={(e) => handleScoreChange(idx, 'marks', e.target.value)}
            className={`w-full px-2.5 py-1 text-center font-bold text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isSubmitted
                ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                : 'bg-white border-[#E2E8F0] text-[#0F172A]'
            }`}
          />
        </div>
      )
    },
    {
      header: 'Grade',
      key: 'grade',
      render: (val, row, idx) => (
        <div className="w-20">
          <input
            type="text"
            disabled={isSubmitted}
            value={val}
            onChange={(e) => handleScoreChange(idx, 'grade', e.target.value.toUpperCase())}
            placeholder="A+"
            className={`w-full px-2 py-1 text-center font-bold text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary ${
              isSubmitted
                ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                : 'bg-white border-[#E2E8F0] text-primary'
            }`}
          />
        </div>
      )
    },
    {
      header: 'Faculty Remarks',
      key: 'remarks',
      render: (val, row, idx) => (
        <div className="w-64">
          <input
            type="text"
            disabled={isSubmitted}
            value={val || ''}
            onChange={(e) => handleScoreChange(idx, 'remarks', e.target.value)}
            placeholder="Performance notes..."
            className={`w-full px-2.5 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary ${
              isSubmitted
                ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                : 'bg-white border-[#E2E8F0] text-[#0F172A]'
            }`}
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Semester Examination Score Entry</h2>
          <p className="text-xs text-[#64748B]">
            Official evaluation grade sheet with draft saving & lock-in submission
          </p>
        </div>

        {/* Lock status banner */}
        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <Badge variant="error" size="md" dot>
              <Lock className="w-3.5 h-3.5 mr-1" /> FINAL SCORES SUBMITTED & LOCKED
            </Badge>
          ) : (
            <Badge variant="warning" size="md" dot>
              <Unlock className="w-3.5 h-3.5 mr-1" /> DRAFT MODE — EDITABLE
            </Badge>
          )}
        </div>
      </div>

      {/* Exam Selector and Action Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Select Examination Paper:
          </span>
          {exams.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelectExam(ex.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                selectedExamId === ex.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {ex.subjectCode} ({ex.examType})
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="secondary"
            size="md"
            icon={Save}
            disabled={isSubmitted || saving}
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Lock}
            disabled={isSubmitted || saving}
            onClick={() => setIsSubmitModalOpen(true)}
          >
            Submit Final Scores
          </Button>
        </div>
      </div>

      {/* Lock Notice if Submitted */}
      {isSubmitted && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3 text-xs text-amber-800">
          <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
          <div>
            <span className="font-bold block text-sm">Marks Record Locked</span>
            This mark sheet has been formally submitted to the Controller of Examinations and Dean of Academics. Inputs are locked to prevent tampering.
          </div>
        </div>
      )}

      {/* Exam Score Table */}
      <Card
        title={`${activeExam?.subjectCode} - ${activeExam?.subjectName}`}
        subtitle={`${activeExam?.examType} • Max Marks: ${activeExam?.maxMarks} • Class: ${activeExam?.class}`}
      >
        <Table columns={columns} data={scores} keyField="studentId" />
      </Card>

      {/* Submit Final Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Final Exam Scores"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-error">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Important Security Notice:</span>
              Once submitted, marks cannot be altered or modified by faculty. All records will be permanently locked and made available for Controller verification.
            </div>
          </div>

          <p className="text-xs text-[#64748B]">
            Are you sure you want to finalize and lock the scores for <span className="font-bold text-[#0F172A]">{activeExam?.subjectCode} ({activeExam?.subjectName})</span>?
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSubmitFinal}>
              Confirm & Lock Marks
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyExamScores;
