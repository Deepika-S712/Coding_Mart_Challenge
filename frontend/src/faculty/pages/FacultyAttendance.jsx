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
import { CheckSquare, Calendar, Users, Save, Check, X, Clock, Eye } from 'lucide-react';

export const FacultyAttendance = () => {
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Attendance Form state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CS301');
  const [selectedClass, setSelectedClass] = useState('CSE-3A');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1 (09:30 - 10:15)');
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);

  // View modal state
  const [viewSessionModal, setViewSessionModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const toast = useToast();

  const periods = [
    'Period 1 (09:30 - 10:15)',
    'Period 2 (10:15 - 11:00)',
    'Period 3 (11:15 - 12:00)',
    'Period 4 (12:00 - 12:45)',
    'Period 5 (01:30 - 02:15)',
    'Period 6 (02:15 - 03:00)',
    'Period 7 & 8 Lab (03:15 - 04:30)'
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, subjectsRes, studentsRes] = await Promise.all([
        apiClient.get('/faculty/attendance'),
        apiClient.get('/faculty/subjects'),
        apiClient.get('/faculty/students')
      ]);

      setSessions(sessionsRes.data);
      setSubjects(subjectsRes.data);
      setStudents(studentsRes.data);

      // Initialize records from students
      if (studentsRes.data && studentsRes.data.length > 0) {
        setRecords(
          studentsRes.data.map((s) => ({
            studentId: s.id,
            studentName: s.name,
            rollNo: s.rollNo,
            status: 'PRESENT'
          }))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = (studentId) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, status: r.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' }
          : r
      )
    );
  };

  const handleMarkAll = (status) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    setSaving(true);

    const activeSub = subjects.find((s) => s.code === selectedSubjectCode);

    const payload = {
      date: selectedDate,
      subjectCode: selectedSubjectCode,
      subjectName: activeSub ? activeSub.name : 'Computer Science Subject',
      class: selectedClass,
      period: selectedPeriod,
      records
    };

    try {
      await apiClient.post('/faculty/attendance', payload);
      toast.success('Attendance recorded and synced successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  // Summary statistics for current form
  const totalStudents = records.length;
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = totalStudents - presentCount;
  const currentPercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

  const sessionColumns = [
    {
      header: 'Date & Period',
      key: 'date',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#0F172A] block">{val}</span>
          <span className="text-[11px] text-[#64748B]">{row.period}</span>
        </div>
      )
    },
    {
      header: 'Subject',
      key: 'subjectCode',
      render: (val, row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-primary mr-1.5">{val}</span>
          <span className="text-xs text-[#0F172A]">{row.subjectName}</span>
        </div>
      )
    },
    {
      header: 'Class',
      key: 'class',
      render: (val) => <Badge variant="neutral" size="sm">{val}</Badge>
    },
    {
      header: 'Present / Total',
      key: 'presentCount',
      render: (val, row) => (
        <span className="text-xs font-medium">
          <span className="text-success font-bold">{val}</span> / {row.totalCount} Students
        </span>
      )
    },
    {
      header: 'Attendance %',
      key: 'percentage',
      render: (val) => (
        <Badge variant={val >= 80 ? 'success' : val >= 60 ? 'warning' : 'error'} size="sm">
          {val}%
        </Badge>
      )
    },
    {
      header: 'Action',
      key: 'action',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => {
            setActiveSession(row);
            setViewSessionModal(true);
          }}
        >
          View Log
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Class Attendance Management</h2>
        <p className="text-xs text-[#64748B]">
          Daily attendance register, student roll call & analytics
        </p>
      </div>

      {/* Attendance Marking Sheet Card */}
      <Card
        title="Mark Session Attendance"
        subtitle="Select subject, class date, period and toggle present/absent states"
      >
        <form onSubmit={handleSaveAttendance} className="space-y-5">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-[#E2E8F0]">
            <Input
              label="Session Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
            <Select
              label="Subject"
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              options={subjects.map((s) => ({ value: s.code, label: `${s.code} - ${s.name}` }))}
            />
            <Select
              label="Target Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={['CSE-3A', 'CSE-3B', 'IT-3A']}
            />
            <Select
              label="Period / Slot"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              options={periods}
            />
          </div>

          {/* Quick Summary & Bulk Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-4 text-xs">
              <span className="font-semibold text-[#0F172A]">
                Total: <span className="text-primary">{totalStudents}</span>
              </span>
              <span className="font-semibold text-success">
                Present: {presentCount}
              </span>
              <span className="font-semibold text-error">
                Absent: {absentCount}
              </span>
              <span className="font-bold text-primary">
                Rate: {currentPercentage}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleMarkAll('PRESENT')}
              >
                Mark All Present
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleMarkAll('ABSENT')}
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {/* Student Roll Call Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {records.map((rec) => {
              const isPresent = rec.status === 'PRESENT';
              return (
                <div
                  key={rec.studentId}
                  onClick={() => handleToggleStatus(rec.studentId)}
                  className={`p-3 rounded-lg border cursor-pointer select-none transition-all flex items-center justify-between ${
                    isPresent
                      ? 'bg-emerald-50/40 border-emerald-300 hover:bg-emerald-50'
                      : 'bg-red-50/40 border-red-300 hover:bg-red-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-[11px] font-bold text-[#64748B] block">
                      {rec.rollNo}
                    </span>
                    <h5 className="text-xs font-semibold text-[#0F172A]">{rec.studentName}</h5>
                  </div>

                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                      isPresent
                        ? 'bg-success text-white shadow-sm'
                        : 'bg-error text-white shadow-sm'
                    }`}
                  >
                    {isPresent ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Present
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" /> Absent
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              icon={Save}
            >
              Save Attendance Record ({currentPercentage}%)
            </Button>
          </div>
        </form>
      </Card>

      {/* Past Sessions History Table */}
      <Card
        title="Recorded Attendance Logs"
        subtitle="Recent attendance registers and class coverage history"
      >
        <Table columns={sessionColumns} data={sessions} keyField="id" />
      </Card>

      {/* View Session Log Modal */}
      <Modal
        isOpen={viewSessionModal}
        onClose={() => setViewSessionModal(false)}
        title="Attendance Session Breakdown"
        subtitle={activeSession ? `${activeSession.date} • ${activeSession.subjectCode} (${activeSession.subjectName})` : ''}
        maxWidth="max-w-xl"
      >
        {activeSession && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-lg border border-[#E2E8F0]">
              <div>
                <span className="text-[#64748B] block">Total</span>
                <span className="font-bold text-[#0F172A]">{activeSession.totalCount}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Present</span>
                <span className="font-bold text-success">{activeSession.presentCount}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Percentage</span>
                <span className="font-bold text-primary">{activeSession.percentage}%</span>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-[#E2E8F0] border rounded-lg">
              {activeSession.records.map((r) => (
                <div key={r.studentId} className="p-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[#64748B] mr-2">{r.rollNo}</span>
                    <span className="font-semibold text-[#0F172A]">{r.studentName}</span>
                  </div>
                  <Badge variant={r.status === 'PRESENT' ? 'success' : 'error'} size="sm">
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setViewSessionModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FacultyAttendance;
