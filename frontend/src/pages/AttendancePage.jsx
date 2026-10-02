import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, CheckCircle2, XCircle, Clock, Plus, Filter, Save, Eye, Edit } from 'lucide-react';
import { attendanceApi } from '../api/attendanceApi';
import { studentApi } from '../api/studentApi';
import { useToast } from '../context/ToastContext';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export function AttendancePage() {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subjectCode') || '');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('className') || '');
  const [selectedDate, setSelectedDate] = useState('');

  // Mark / Edit Modal
  const [takeModalOpen, setTakeModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSheetId, setCurrentSheetId] = useState(null);

  const [markSubject, setMarkSubject] = useState('CS301');
  const [markClass, setMarkClass] = useState('CSE-3A');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentRoster, setStudentRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // View Details Modal
  const [viewSheet, setViewSheet] = useState(null);

  const fetchSheets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getAll({
        subjectCode: selectedSubject,
        className: selectedClass,
        date: selectedDate
      });
      if (res.success && res.data) {
        setSheets(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching attendance sheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, [selectedSubject, selectedClass, selectedDate]);

  // Load students for marking attendance
  const loadClassStudents = async (className) => {
    setLoadingRoster(true);
    try {
      const res = await studentApi.getAll({ className });
      if (res.success && res.data) {
        setStudentRoster(res.data.map(s => ({
          studentId: s.id,
          studentName: s.name,
          rollNumber: s.rollNumber,
          status: 'Present',
          remarks: ''
        })));
      }
    } catch (err) {
      toast.error('Failed to load students for attendance');
    } finally {
      setLoadingRoster(false);
    }
  };

  const openMarkAttendance = () => {
    setIsEditing(false);
    setCurrentSheetId(null);
    setMarkSubject('CS301');
    setMarkClass('CSE-3A');
    setMarkDate(new Date().toISOString().split('T')[0]);
    loadClassStudents('CSE-3A');
    setTakeModalOpen(true);
  };

  const openEditAttendance = (sheet) => {
    setIsEditing(true);
    setCurrentSheetId(sheet.id);
    setMarkSubject(sheet.subjectCode);
    setMarkClass(sheet.className);
    setMarkDate(sheet.date);
    setStudentRoster(sheet.records.map(r => ({ ...r })));
    setTakeModalOpen(true);
  };

  const handleStatusChange = (studentId, status) => {
    setStudentRoster(prev => prev.map(item =>
      item.studentId === studentId ? { ...item, status } : item
    ));
  };

  const handleRemarkChange = (studentId, remarks) => {
    setStudentRoster(prev => prev.map(item =>
      item.studentId === studentId ? { ...item, remarks } : item
    ));
  };

  const handleMarkAll = (status) => {
    setStudentRoster(prev => prev.map(item => ({ ...item, status })));
  };

  const handleSaveAttendance = async () => {
    if (studentRoster.length === 0) {
      toast.error('No students in this class roster');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        date: markDate,
        subjectCode: markSubject,
        subjectName: markSubject === 'CS301' ? 'Data Structures & Algorithms' : markSubject === 'CS302' ? 'Database Management Systems' : 'Web Technologies & Architecture',
        className: markClass,
        records: studentRoster,
        status: 'Submitted'
      };

      if (isEditing) {
        await attendanceApi.update(currentSheetId, payload);
        toast.success('Attendance records updated successfully');
      } else {
        await attendanceApi.create(payload);
        toast.success('Attendance recorded and submitted');
      }

      setTakeModalOpen(false);
      fetchSheets();
    } catch (err) {
      toast.error(err.message || 'Failed to submit attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = studentRoster.filter(s => s.status === 'Present').length;
  const absentCount = studentRoster.filter(s => s.status === 'Absent').length;
  const attendanceRate = studentRoster.length > 0 ? Math.round((presentCount / studentRoster.length) * 100) : 0;

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      header: 'Subject',
      accessor: 'subjectName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{val}</div>
          <span style={{ fontSize: '12px', color: 'var(--cms-text-secondary)' }}>{row.subjectCode}</span>
        </div>
      )
    },
    {
      header: 'Class',
      accessor: 'className',
      render: (val) => <Badge variant="neutral">{val}</Badge>
    },
    {
      header: 'Present / Total',
      accessor: 'presentCount',
      render: (val, row) => (
        <span>
          <strong style={{ color: 'var(--cms-success)' }}>{val}</strong> / {row.totalStudents}
        </span>
      )
    },
    {
      header: 'Attendance %',
      accessor: 'presentCount',
      render: (val, row) => {
        const pct = row.totalStudents > 0 ? Math.round((val / row.totalStudents) * 100) : 0;
        const variant = pct >= 80 ? 'success' : pct >= 70 ? 'warning' : 'danger';
        return <Badge variant={variant}>{pct}%</Badge>;
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <Badge variant={val === 'Submitted' ? 'success' : 'neutral'}>{val}</Badge>
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewSheet(row)}
            title="View Details"
          >
            <Eye size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditAttendance(row)}
            title="Edit Attendance"
          >
            <Edit size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="cms-page-header">
        <div>
          <h1 className="cms-page-title">Attendance Tracking</h1>
          <p className="cms-page-subtitle">
            Record, update, and inspect student class attendance sheets
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openMarkAttendance}>
          Mark Attendance
        </Button>
      </div>

      {/* Filter bar */}
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
        <div style={{ width: '180px' }}>
          <select
            className="cms-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            <option value="CS301">CS301 - Data Structures</option>
            <option value="CS302">CS302 - DBMS</option>
            <option value="CS305">CS305 - Web Tech</option>
          </select>
        </div>

        <div style={{ width: '140px' }}>
          <select
            className="cms-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            <option value="CSE-3A">CSE-3A</option>
            <option value="CSE-3B">CSE-3B</option>
            <option value="IT-3A">IT-3A</option>
          </select>
        </div>

        <div style={{ width: '160px' }}>
          <input
            type="date"
            className="cms-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {(selectedSubject || selectedClass || selectedDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSubject('');
              setSelectedClass('');
              setSelectedDate('');
            }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Sheet Table */}
      {loading ? (
        <TableSkeleton rows={4} columns={7} />
      ) : error ? (
        <ErrorState title="Error fetching attendance sheets" message={error} onRetry={fetchSheets} />
      ) : sheets.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No attendance sheets found"
          description="There are no attendance sessions matching your current filter selections."
          actionLabel="Take Attendance Now"
          onAction={openMarkAttendance}
        />
      ) : (
        <Table
          columns={columns}
          data={sheets}
          keyField="id"
          onRowClick={(row) => setViewSheet(row)}
        />
      )}

      {/* Mark / Edit Attendance Modal */}
      <Modal
        isOpen={takeModalOpen}
        onClose={() => setTakeModalOpen(false)}
        title={isEditing ? `Edit Attendance Sheet (${markDate})` : 'Mark Class Attendance'}
        maxWidth="740px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--cms-text-secondary)' }}>
              Summary: <strong style={{ color: 'var(--cms-success)' }}>{presentCount} Present</strong>,{' '}
              <strong style={{ color: 'var(--cms-danger)' }}>{absentCount} Absent</strong> ({attendanceRate}%)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" onClick={() => setTakeModalOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="primary" icon={Save} onClick={handleSaveAttendance} loading={isSaving}>
                {isEditing ? 'Save Changes' : 'Submit Attendance'}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div className="cms-form-group" style={{ marginBottom: 0 }}>
            <label className="cms-label">Subject</label>
            <select
              className="cms-select"
              value={markSubject}
              disabled={isEditing}
              onChange={(e) => {
                const sub = e.target.value;
                setMarkSubject(sub);
                const cls = sub === 'CS305' ? 'IT-3A' : 'CSE-3A';
                setMarkClass(cls);
                loadClassStudents(cls);
              }}
            >
              <option value="CS301">CS301 - Data Structures</option>
              <option value="CS302">CS302 - DBMS</option>
              <option value="CS305">CS305 - Web Tech</option>
            </select>
          </div>

          <div className="cms-form-group" style={{ marginBottom: 0 }}>
            <label className="cms-label">Class</label>
            <select
              className="cms-select"
              value={markClass}
              disabled={isEditing}
              onChange={(e) => {
                setMarkClass(e.target.value);
                loadClassStudents(e.target.value);
              }}
            >
              {markSubject === 'CS305' ? (
                <option value="IT-3A">IT-3A</option>
              ) : (
                <>
                  <option value="CSE-3A">CSE-3A</option>
                  <option value="CSE-3B">CSE-3B</option>
                </>
              )}
            </select>
          </div>

          <div className="cms-form-group" style={{ marginBottom: 0 }}>
            <label className="cms-label">Session Date</label>
            <input
              type="date"
              className="cms-input"
              value={markDate}
              onChange={(e) => setMarkDate(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '8px 12px', backgroundColor: 'var(--cms-bg-page)', borderRadius: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Student Roster ({studentRoster.length})</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="outline" onClick={() => handleMarkAll('Present')}>
              Mark All Present
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleMarkAll('Absent')}>
              Mark All Absent
            </Button>
          </div>
        </div>

        {/* Student List */}
        {loadingRoster ? (
          <TableSkeleton rows={4} columns={3} />
        ) : (
          <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid var(--cms-border-subtle)', borderRadius: '6px' }}>
            <table className="cms-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Roll No</th>
                  <th>Student Name</th>
                  <th style={{ width: '180px' }}>Status</th>
                  <th style={{ width: '180px' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {studentRoster.map((s) => (
                  <tr key={s.studentId}>
                    <td style={{ fontWeight: 600 }}>{s.rollNumber}</td>
                    <td>{s.studentName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.studentId, 'Present')}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: '1px solid',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderColor: s.status === 'Present' ? 'var(--cms-success)' : 'var(--cms-border-default)',
                            backgroundColor: s.status === 'Present' ? 'var(--cms-success-bg)' : '#FFFFFF',
                            color: s.status === 'Present' ? 'var(--cms-success)' : 'var(--cms-text-secondary)'
                          }}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.studentId, 'Absent')}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: '1px solid',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderColor: s.status === 'Absent' ? 'var(--cms-danger)' : 'var(--cms-border-default)',
                            backgroundColor: s.status === 'Absent' ? 'var(--cms-danger-bg)' : '#FFFFFF',
                            color: s.status === 'Absent' ? 'var(--cms-danger)' : 'var(--cms-text-secondary)'
                          }}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Optional remarks"
                        className="cms-input"
                        style={{ height: '30px', fontSize: '12px' }}
                        value={s.remarks || ''}
                        onChange={(e) => handleRemarkChange(s.studentId, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* View Sheet Details Modal */}
      <Modal
        isOpen={!!viewSheet}
        onClose={() => setViewSheet(null)}
        title="Attendance Record Details"
        maxWidth="640px"
        footer={
          <Button variant="primary" size="sm" onClick={() => setViewSheet(null)}>
            Close
          </Button>
        }
      >
        {viewSheet && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: 'var(--cms-bg-page)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--cms-text-muted)' }}>Subject:</span>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>{viewSheet.subjectName}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--cms-text-muted)' }}>Class & Date:</span>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>{viewSheet.className} • {viewSheet.date}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--cms-text-muted)' }}>Present Ratio:</span>
                <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--cms-success)' }}>
                  {viewSheet.presentCount} / {viewSheet.totalStudents} ({Math.round((viewSheet.presentCount / viewSheet.totalStudents) * 100)}%)
                </p>
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {viewSheet.records.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.rollNumber}</td>
                      <td>{r.studentName}</td>
                      <td>
                        <Badge variant={r.status === 'Present' ? 'success' : 'danger'}>{r.status}</Badge>
                      </td>
                      <td style={{ color: 'var(--cms-text-secondary)', fontSize: '13px' }}>
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
