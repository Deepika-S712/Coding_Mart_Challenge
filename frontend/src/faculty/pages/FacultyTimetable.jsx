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
import { Calendar, Clock, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const FacultyTimetable = () => {
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [formData, setFormData] = useState({
    day: 'Monday',
    time: '09:30 AM - 10:15 AM',
    period: 'Period 1',
    subjectCode: 'CS301',
    subjectName: 'Design & Analysis of Algorithms',
    class: 'CSE-3A',
    room: 'LH-201',
    type: 'Lecture'
  });
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const fetchTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/timetable');
      setSlots(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load faculty timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      day: selectedDay,
      time: '09:30 AM - 10:15 AM',
      period: 'Period 1',
      subjectCode: 'CS301',
      subjectName: 'Design & Analysis of Algorithms',
      class: 'CSE-3A',
      room: 'LH-201',
      type: 'Lecture'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setSelectedSlot(slot);
    setFormData({ ...slot });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (slot) => {
    setSelectedSlot(slot);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/faculty/timetable', formData);
      toast.success('Teaching timetable slot added successfully.');
      setIsAddModalOpen(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.message || 'Failed to add slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/faculty/timetable/${selectedSlot.id}`, formData);
      toast.success('Timetable slot updated.');
      setIsEditModalOpen(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.message || 'Failed to update slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async () => {
    setSaving(true);
    try {
      await apiClient.delete(`/faculty/timetable/${selectedSlot.id}`);
      toast.success('Timetable slot removed.');
      setIsDeleteModalOpen(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.message || 'Failed to delete slot.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSlots = slots.filter(
    (s) => s.day.toLowerCase() === selectedDay.toLowerCase()
  );

  const columns = [
    {
      header: 'Period & Time',
      key: 'time',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-[#0F172A] block">{row.period}</span>
          <span className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-primary" /> {val}
          </span>
        </div>
      )
    },
    {
      header: 'Subject Code',
      key: 'subjectCode',
      render: (val, row) => (
        <div>
          <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
            {val}
          </span>
          <span className="font-medium text-[#0F172A] text-sm block mt-1">{row.subjectName}</span>
        </div>
      )
    },
    {
      header: 'Class',
      key: 'class',
      render: (val) => <Badge variant="neutral" size="sm">{val}</Badge>
    },
    {
      header: 'Room',
      key: 'room',
      render: (val) => (
        <span className="text-xs font-medium text-[#0F172A] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" /> {val}
        </span>
      )
    },
    {
      header: 'Type',
      key: 'type',
      render: (val) => (
        <Badge variant={val === 'Lab' ? 'info' : 'primary'} size="sm">
          {val}
        </Badge>
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
            title="Edit Slot"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-[#64748B] hover:text-error hover:bg-red-50 rounded"
            title="Delete Slot"
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
          <h2 className="text-xl font-bold text-[#0F172A]">Faculty Teaching Schedule</h2>
          <p className="text-xs text-[#64748B]">
            Weekly lecture allocations, laboratory hours, and classroom assignments
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Add Schedule Slot
        </Button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-white rounded-lg border border-[#E2E8F0]">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              selectedDay === day
                ? 'bg-primary text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Slots Table */}
      {loading ? (
        <Skeleton className="h-80 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTimetable} />
      ) : (
        <Card
          title={`Schedule for ${selectedDay}`}
          subtitle={`${filteredSlots.length} lecture & lab periods assigned`}
        >
          <Table columns={columns} data={filteredSlots} keyField="id" emptyMessage={`No teaching slots assigned on ${selectedDay}.`} />
        </Card>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Schedule Slot"
        subtitle="Allocate a new period in the faculty timetable"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          <Select
            label="Day of Week"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            options={days}
          />
          <Input
            label="Period"
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            placeholder="e.g. Period 1"
            required
          />
          <Input
            label="Time Slot"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            placeholder="e.g. 09:30 AM - 10:15 AM"
            required
          />
          <Input
            label="Subject Code"
            value={formData.subjectCode}
            onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
            placeholder="CS301"
            required
          />
          <Input
            label="Subject Title"
            value={formData.subjectName}
            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
            placeholder="Design & Analysis of Algorithms"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
            <Input
              label="Room"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
          </div>
          <Select
            label="Slot Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={['Lecture', 'Lab', 'Tutorial', 'Project Work']}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Add Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Schedule Slot"
      >
        <form onSubmit={handleUpdateSlot} className="space-y-4">
          <Select
            label="Day of Week"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            options={days}
          />
          <Input
            label="Period"
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
          />
          <Input
            label="Time Slot"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
          <Input
            label="Subject Code"
            value={formData.subjectCode}
            onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
          />
          <Input
            label="Subject Title"
            value={formData.subjectName}
            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
            <Input
              label="Room"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Schedule Slot"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-sm">
          <p className="text-[#64748B]">
            Are you sure you want to remove the slot for <span className="font-bold text-[#0F172A]">{selectedSlot?.subjectCode} ({selectedSlot?.time})</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={saving} onClick={handleDeleteSlot}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyTimetable;
