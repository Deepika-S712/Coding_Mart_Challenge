import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Users,
  Plus,
  Pencil,
  Trash2,
  Filter,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { timetableApi } from '../api/timetableApi';
import { facultyApi } from '../api/facultyApi';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_FORM = {
  dayOfWeek: 'Monday',
  startTime: '09:00',
  endTime: '10:00',
  subjectCode: 'CS301',
  subjectName: '',
  className: 'CSE-3A',
  room: 'Room 304',
  status: 'Scheduled'
};

export function TimetablePage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Primary Data
  const [timetable, setTimetable] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active View Tab: 'today' | 'weekly'
  const [activeTab, setActiveTab] = useState('today');

  // Filters for Weekly View
  const [filterDay, setFilterDay] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  // Modal State: Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all timetable and subjects data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ttRes, todayRes, subRes] = await Promise.all([
        timetableApi.getAll(),
        timetableApi.getToday(),
        facultyApi.getSubjects()
      ]);

      if (ttRes.success && ttRes.data) {
        setTimetable(ttRes.data);
      }
      if (todayRes.success && todayRes.data) {
        setTodayClasses(todayRes.data);
      }
      if (subRes.success && subRes.data) {
        setSubjects(subRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load timetable details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Today's day name calculation
  const currentDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Subject code to name lookup map
  const subjectMap = useMemo(() => {
    const map = {};
    subjects.forEach((s) => {
      map[s.code] = s.name;
    });
    return map;
  }, [subjects]);

  // Unique classes across all subjects
  const availableClasses = useMemo(() => {
    const set = new Set();
    subjects.forEach((s) => {
      if (Array.isArray(s.assignedClasses)) {
        s.assignedClasses.forEach((c) => set.add(c));
      }
    });
    timetable.forEach((t) => {
      if (t.className) set.add(t.className);
    });
    return Array.from(set);
  }, [subjects, timetable]);

  // Filtered timetable for weekly view
  const filteredTimetable = useMemo(() => {
    return timetable.filter((slot) => {
      if (filterDay !== 'ALL' && slot.dayOfWeek !== filterDay) return false;
      if (filterSubject !== 'ALL' && slot.subjectCode !== filterSubject) return false;
      if (filterClass !== 'ALL' && slot.className !== filterClass) return false;
      return true;
    });
  }, [timetable, filterDay, filterSubject, filterClass]);

  // Group filtered timetable by day of week
  const groupedByDay = useMemo(() => {
    const groups = {};
    DAYS_OF_WEEK.forEach((day) => {
      groups[day] = [];
    });
    filteredTimetable.forEach((slot) => {
      if (groups[slot.dayOfWeek]) {
        groups[slot.dayOfWeek].push(slot);
      }
    });
    // Sort each day's slots by startTime
    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return groups;
  }, [filteredTimetable]);

  // Today's counters
  const todayStats = useMemo(() => {
    const total = todayClasses.length;
    const completed = todayClasses.filter((c) => c.status === 'Completed').length;
    const scheduled = todayClasses.filter((c) => c.status === 'Scheduled').length;
    return { total, completed, scheduled };
  }, [todayClasses]);

  // Open modal to add a new slot
  const handleOpenAddModal = (presetDay = null) => {
    setIsEditing(false);
    setEditingId(null);
    setFormErrors({});
    const defaultSub = subjects[0]?.code || 'CS301';
    setFormData({
      ...DEFAULT_FORM,
      dayOfWeek: presetDay && DAYS_OF_WEEK.includes(presetDay) ? presetDay : 'Monday',
      subjectCode: defaultSub,
      subjectName: subjectMap[defaultSub] || '',
      className: subjects[0]?.assignedClasses?.[0] || 'CSE-3A'
    });
    setModalOpen(true);
  };

  // Open modal to edit existing slot
  const handleOpenEditModal = (slot) => {
    setIsEditing(true);
    setEditingId(slot.id);
    setFormErrors({});
    setFormData({
      dayOfWeek: slot.dayOfWeek || 'Monday',
      startTime: slot.startTime || '09:00',
      endTime: slot.endTime || '10:00',
      subjectCode: slot.subjectCode || 'CS301',
      subjectName: slot.subjectName || subjectMap[slot.subjectCode] || '',
      className: slot.className || 'CSE-3A',
      room: slot.room || 'Room 304',
      status: slot.status || 'Scheduled'
    });
    setModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.dayOfWeek) errors.dayOfWeek = 'Day of week is required';
    if (!formData.subjectCode) errors.subjectCode = 'Subject is required';
    if (!formData.className || !formData.className.trim()) errors.className = 'Class/Batch is required';
    if (!formData.room || !formData.room.trim()) errors.room = 'Classroom / Lab is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        errors.endTime = 'End time must be after start time';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add or Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName || subjectMap[formData.subjectCode] || formData.subjectCode,
        className: formData.className.trim(),
        room: formData.room.trim(),
        status: formData.status || 'Scheduled'
      };

      if (isEditing) {
        const res = await timetableApi.update(editingId, payload);
        if (res.success) {
          toast.success('Schedule slot updated successfully');
          setTimetable((prev) =>
            prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
          );
          setTodayClasses((prev) =>
            prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
          );
          setModalOpen(false);
        } else {
          throw new Error(res.message || 'Failed to update schedule');
        }
      } else {
        const res = await timetableApi.create(payload);
        if (res.success && res.data) {
          toast.success('New lecture slot added to timetable');
          setTimetable((prev) => [...prev, res.data]);
          if (res.data.dayOfWeek.toLowerCase() === currentDayName.toLowerCase()) {
            setTodayClasses((prev) => [...prev, res.data]);
          }
          setModalOpen(false);
        } else {
          throw new Error(res.message || 'Failed to add schedule slot');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error saving timetable slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Toggle for any class
  const handleQuickStatusChange = async (slot, newStatus) => {
    try {
      const updatedPayload = { ...slot, status: newStatus };
      const res = await timetableApi.update(slot.id, updatedPayload);
      if (res.success) {
        toast.success(`Class marked as ${newStatus}`);
        setTimetable((prev) =>
          prev.map((item) => (item.id === slot.id ? { ...item, status: newStatus } : item))
        );
        setTodayClasses((prev) =>
          prev.map((item) => (item.id === slot.id ? { ...item, status: newStatus } : item))
        );
      } else {
        throw new Error(res.message || 'Status update failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update class status');
    }
  };

  // Confirm delete
  const handleConfirmDelete = (slot) => {
    setSlotToDelete(slot);
    setDeleteModalOpen(true);
  };

  // Execute delete
  const executeDelete = async () => {
    if (!slotToDelete) return;
    setIsDeleting(true);
    try {
      const res = await timetableApi.delete(slotToDelete.id);
      if (res.success) {
        toast.success('Lecture slot removed from timetable');
        setTimetable((prev) => prev.filter((item) => item.id !== slotToDelete.id));
        setTodayClasses((prev) => prev.filter((item) => item.id !== slotToDelete.id));
        setDeleteModalOpen(false);
        setSlotToDelete(null);
      } else {
        throw new Error(res.message || 'Failed to delete schedule slot');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting timetable slot');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'Scheduled':
      default:
        return <Badge variant="primary">Scheduled</Badge>;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '8px 0' }}>
        <TableSkeleton rows={4} columns={3} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load Timetable"
        message={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="cms-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="cms-page-title">Timetable Management</h1>
            <Badge variant="primary">Faculty Schedule</Badge>
          </div>
          <p className="cms-page-subtitle">
            View today's lecture schedule and edit your weekly classes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            title="Refresh Timetable Data"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddModal()}
          >
            <Plus size={16} />
            <span>Add Lecture Slot</span>
          </Button>
        </div>
      </div>

      {/* Today Context Banner */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          marginBottom: '24px',
          padding: '20px 24px',
          border: '1px solid #334155',
          borderRadius: 'var(--cms-radius-lg)',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              {formattedDate}
            </h2>
            <p style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '4px', margin: 0 }}>
              You have <strong style={{ color: '#60A5FA' }}>{todayStats.total} lectures</strong> scheduled today.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              minWidth: '100px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Today Total</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>{todayStats.total}</div>
            </div>

            <div style={{
              background: 'rgba(34, 197, 94, 0.15)',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              minWidth: '100px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#86EFAC', textTransform: 'uppercase' }}>Completed</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ADE80', marginTop: '2px' }}>{todayStats.completed}</div>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.15)',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              minWidth: '100px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#93C5FD', textTransform: 'uppercase' }}>Scheduled</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#60A5FA', marginTop: '2px' }}>{todayStats.scheduled}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* View Switcher: Today's Classes vs Weekly Master Timetable */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--cms-border-subtle)',
        marginBottom: '24px',
        gap: '8px'
      }}>
        <button
          onClick={() => setActiveTab('today')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'today' ? '3px solid var(--cms-primary)' : '3px solid transparent',
            color: activeTab === 'today' ? 'var(--cms-primary)' : 'var(--cms-text-secondary)',
            fontWeight: activeTab === 'today' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock size={16} />
          <span>Today's Classes</span>
          <span style={{
            fontSize: '11px',
            backgroundColor: activeTab === 'today' ? 'var(--cms-primary-light)' : 'var(--cms-bg-muted)',
            color: activeTab === 'today' ? 'var(--cms-primary)' : 'var(--cms-text-secondary)',
            padding: '2px 7px',
            borderRadius: '10px',
            fontWeight: 600
          }}>
            {todayClasses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'weekly' ? '3px solid var(--cms-primary)' : '3px solid transparent',
            color: activeTab === 'weekly' ? 'var(--cms-primary)' : 'var(--cms-text-secondary)',
            fontWeight: activeTab === 'weekly' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <CalendarDays size={16} />
          <span>Weekly Master Timetable</span>
          <span style={{
            fontSize: '11px',
            backgroundColor: activeTab === 'weekly' ? 'var(--cms-primary-light)' : 'var(--cms-bg-muted)',
            color: activeTab === 'weekly' ? 'var(--cms-primary)' : 'var(--cms-text-secondary)',
            padding: '2px 7px',
            borderRadius: '10px',
            fontWeight: 600
          }}>
            {timetable.length} Slots
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S CLASSES                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'today' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cms-text-primary)' }}>
                Today's Lectures ({currentDayName})
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)' }}>
                Mark attendance, update class status, or edit your schedule.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenAddModal(currentDayName)}
            >
              <Plus size={15} />
              <span>Add Lecture for Today</span>
            </Button>
          </div>

          {todayClasses.length === 0 ? (
            <EmptyState
              title="No Classes Scheduled Today"
              message={`You have no teaching lectures or labs scheduled for ${currentDayName}. You can add an ad-hoc class or switch to the Weekly view.`}
              actionLabel="Add Class for Today"
              onAction={() => handleOpenAddModal(currentDayName)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {todayClasses.map((cls, index) => {
                const isCompleted = cls.status === 'Completed';
                const isInProgress = cls.status === 'In Progress';
                const isCancelled = cls.status === 'Cancelled';

                return (
                  <Card
                    key={cls.id}
                    style={{
                      borderLeft: `4px solid ${
                        isCompleted
                          ? 'var(--cms-success)'
                          : isInProgress
                          ? 'var(--cms-warning)'
                          : isCancelled
                          ? 'var(--cms-danger)'
                          : 'var(--cms-primary)'
                      }`,
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      {/* Left: Timing & Class details */}
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                        {/* Time block badge */}
                        <div style={{
                          backgroundColor: 'var(--cms-bg-page)',
                          border: '1px solid var(--cms-border-subtle)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          textAlign: 'center',
                          minWidth: '120px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--cms-text-secondary)', fontSize: '11px', fontWeight: 600 }}>
                            <Clock size={12} />
                            <span>TIME SLOT</span>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cms-text-primary)', marginTop: '4px' }}>
                            {cls.startTime} - {cls.endTime}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--cms-text-muted)', marginTop: '2px' }}>
                            Lecture #{index + 1}
                          </div>
                        </div>

                        {/* Subject info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{
                              backgroundColor: 'var(--cms-primary-light)',
                              color: 'var(--cms-primary)',
                              fontSize: '12px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {cls.subjectCode}
                            </span>
                            <span style={{
                              backgroundColor: 'var(--cms-bg-subtle)',
                              color: 'var(--cms-text-primary)',
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              Class: {cls.className}
                            </span>
                            {getStatusBadge(cls.status)}
                          </div>

                          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cms-text-primary)', marginBottom: '4px' }}>
                            {cls.subjectName || subjectMap[cls.subjectCode] || cls.subjectCode}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--cms-text-secondary)', marginTop: '6px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={14} color="var(--cms-text-muted)" />
                              <strong>Location:</strong> {cls.room}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={14} color="var(--cms-text-muted)" />
                              <strong>Batch:</strong> {cls.className}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Actions & Status dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Status Quick selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--cms-text-secondary)', fontWeight: 500 }}>
                            Status:
                          </label>
                          <select
                            value={cls.status || 'Scheduled'}
                            onChange={(e) => handleQuickStatusChange(cls, e.target.value)}
                            className="cms-select"
                            style={{ height: '34px', fontSize: '12px', padding: '0 8px', width: 'auto', minWidth: '120px' }}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Mark Attendance Button */}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/faculty/attendance?subjectCode=${cls.subjectCode}&className=${cls.className}`)}
                          title="Open attendance sheet for this class"
                        >
                          <CheckSquare size={14} />
                          <span>Attendance</span>
                        </Button>

                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(cls)}
                          title="Edit lecture schedule"
                        >
                          <Pencil size={14} />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleConfirmDelete(cls)}
                          title="Remove lecture from timetable"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WEEKLY MASTER TIMETABLE                                            */}
      {/* ========================================================================= */}
      {activeTab === 'weekly' && (
        <div>
          {/* Filters Bar */}
          <Card style={{ marginBottom: '20px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cms-text-secondary)', fontSize: '13px', fontWeight: 600 }}>
                <Filter size={16} />
                <span>Filters:</span>
              </div>

              {/* Day Filter */}
              <div style={{ minWidth: '160px' }}>
                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="cms-select"
                  style={{ height: '36px', fontSize: '13px' }}
                >
                  <option value="ALL">All Days of Week</option>
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div style={{ minWidth: '180px' }}>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="cms-select"
                  style={{ height: '36px', fontSize: '13px' }}
                >
                  <option value="ALL">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class/Batch Filter */}
              <div style={{ minWidth: '160px' }}>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="cms-select"
                  style={{ height: '36px', fontSize: '13px' }}
                >
                  <option value="ALL">All Batches</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {(filterDay !== 'ALL' || filterSubject !== 'ALL' || filterClass !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterDay('ALL');
                    setFilterSubject('ALL');
                    setFilterClass('ALL');
                  }}
                  style={{ color: 'var(--cms-danger)' }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </Card>

          {/* Day by Day Timetable Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {DAYS_OF_WEEK.filter((day) => filterDay === 'ALL' || filterDay === day).map((day) => {
              const daySlots = groupedByDay[day] || [];
              const isToday = currentDayName.toLowerCase() === day.toLowerCase();

              return (
                <div
                  key={day}
                  style={{
                    backgroundColor: 'var(--cms-bg-surface)',
                    borderRadius: 'var(--cms-radius-md)',
                    border: isToday ? '2px solid var(--cms-primary)' : '1px solid var(--cms-border-subtle)',
                    boxShadow: 'var(--cms-shadow-sm)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Day Header */}
                  <div
                    style={{
                      padding: '14px 20px',
                      backgroundColor: isToday ? 'var(--cms-primary-light)' : 'var(--cms-bg-page)',
                      borderBottom: '1px solid var(--cms-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cms-text-primary)' }}>
                        {day}
                      </span>
                      {isToday && (
                        <Badge variant="primary">Today</Badge>
                      )}
                      <span style={{ fontSize: '12px', color: 'var(--cms-text-secondary)' }}>
                        • {daySlots.length} {daySlots.length === 1 ? 'class' : 'classes'} scheduled
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddModal(day)}
                    >
                      <Plus size={14} />
                      <span>Add Slot on {day}</span>
                    </Button>
                  </div>

                  {/* Day Slots Body */}
                  <div style={{ padding: '16px 20px' }}>
                    {daySlots.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--cms-text-muted)', fontSize: '13px' }}>
                        No classes scheduled for {day}.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            style={{
                              backgroundColor: 'var(--cms-bg-page)',
                              border: '1px solid var(--cms-border-subtle)',
                              borderRadius: 'var(--cms-radius-sm)',
                              padding: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'box-shadow 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: 'var(--cms-primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Clock size={12} />
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                {getStatusBadge(slot.status)}
                              </div>

                              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--cms-text-primary)', marginBottom: '4px' }}>
                                {slot.subjectName || subjectMap[slot.subjectCode] || slot.subjectCode}
                              </div>

                              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--cms-text-secondary)', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--cms-primary)' }}>{slot.subjectCode}</span>
                                <span>•</span>
                                <span>Batch: {slot.className}</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--cms-text-muted)' }}>
                                <MapPin size={13} />
                                <span>{slot.room}</span>
                              </div>
                            </div>

                            {/* Slot Item Footer Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--cms-border-subtle)' }}>
                              <button
                                onClick={() => navigate(`/faculty/attendance?subjectCode=${slot.subjectCode}&className=${slot.className}`)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--cms-primary)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                Attendance <ChevronRight size={14} />
                              </button>

                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleOpenEditModal(slot)}
                                  title="Edit slot"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--cms-text-secondary)',
                                    padding: '4px'
                                  }}
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleConfirmDelete(slot)}
                                  title="Delete slot"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--cms-danger)',
                                    padding: '4px'
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TIMETABLE SCHEDULE SLOT                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !isSubmitting && setModalOpen(false)}
        title={isEditing ? 'Edit Timetable Schedule Slot' : 'Add New Lecture / Lab Slot'}
        maxWidth="540px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitForm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Slot...' : isEditing ? 'Update Schedule' : 'Add to Timetable'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm}>
          {/* Day of Week */}
          <div className="cms-form-group">
            <label className="cms-label">
              Day of Week <span style={{ color: 'var(--cms-danger)' }}>*</span>
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              className={`cms-select ${formErrors.dayOfWeek ? 'cms-input-error' : ''}`}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {formErrors.dayOfWeek && <p className="cms-error-text">{formErrors.dayOfWeek}</p>}
          </div>

          {/* Subject Selection */}
          <div className="cms-form-group">
            <label className="cms-label">
              Subject <span style={{ color: 'var(--cms-danger)' }}>*</span>
            </label>
            <select
              value={formData.subjectCode}
              onChange={(e) => {
                const selectedCode = e.target.value;
                const found = subjects.find((s) => s.code === selectedCode);
                setFormData({
                  ...formData,
                  subjectCode: selectedCode,
                  subjectName: found ? found.name : ''
                });
              }}
              className={`cms-select ${formErrors.subjectCode ? 'cms-input-error' : ''}`}
            >
              {subjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
            {formErrors.subjectCode && <p className="cms-error-text">{formErrors.subjectCode}</p>}
          </div>

          {/* Class / Batch & Room in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="cms-form-group">
              <label className="cms-label">
                Class / Batch <span style={{ color: 'var(--cms-danger)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. CSE-3A"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className={`cms-input ${formErrors.className ? 'cms-input-error' : ''}`}
              />
              {formErrors.className && <p className="cms-error-text">{formErrors.className}</p>}
            </div>

            <div className="cms-form-group">
              <label className="cms-label">
                Classroom / Lab <span style={{ color: 'var(--cms-danger)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Lab 3B, Room 402"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className={`cms-input ${formErrors.room ? 'cms-input-error' : ''}`}
              />
              {formErrors.room && <p className="cms-error-text">{formErrors.room}</p>}
            </div>
          </div>

          {/* Start Time & End Time in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="cms-form-group">
              <label className="cms-label">
                Start Time <span style={{ color: 'var(--cms-danger)' }}>*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={`cms-input ${formErrors.startTime ? 'cms-input-error' : ''}`}
              />
              {formErrors.startTime && <p className="cms-error-text">{formErrors.startTime}</p>}
            </div>

            <div className="cms-form-group">
              <label className="cms-label">
                End Time <span style={{ color: 'var(--cms-danger)' }}>*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={`cms-input ${formErrors.endTime ? 'cms-input-error' : ''}`}
              />
              {formErrors.endTime && <p className="cms-error-text">{formErrors.endTime}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="cms-form-group">
            <label className="cms-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="cms-select"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Remove Lecture Slot"
        maxWidth="450px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={executeDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Slot'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            backgroundColor: 'var(--cms-danger-bg)',
            color: 'var(--cms-danger)',
            padding: '10px',
            borderRadius: '50%',
            display: 'flex'
          }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: 'var(--cms-text-primary)', marginBottom: '8px' }}>
              Are you sure you want to delete this lecture slot?
            </p>
            {slotToDelete && (
              <div style={{
                backgroundColor: 'var(--cms-bg-page)',
                padding: '10px 14px',
                borderRadius: 'var(--cms-radius-sm)',
                fontSize: '13px',
                color: 'var(--cms-text-secondary)',
                lineHeight: 1.6
              }}>
                <div><strong>Day:</strong> {slotToDelete.dayOfWeek} ({slotToDelete.startTime} - {slotToDelete.endTime})</div>
                <div><strong>Subject:</strong> {slotToDelete.subjectCode} - {slotToDelete.subjectName}</div>
                <div><strong>Class & Room:</strong> {slotToDelete.className} ({slotToDelete.room})</div>
              </div>
            )}
            <p style={{ fontSize: '12px', color: 'var(--cms-text-muted)', marginTop: '8px' }}>
              This will remove the lecture from your timetable. You can add it back anytime.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TimetablePage;
