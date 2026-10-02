import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';

export const StudentTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const fetchTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/student/timetable');
      setTimetable(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchTimetable} />;
  }

  const currentDayGroup = (timetable.schedule || []).find(
    (s) => s.day.toLowerCase() === selectedDay.toLowerCase()
  );
  const daySlots = currentDayGroup ? currentDayGroup.slots : [];

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
      header: 'Subject',
      key: 'subjectName',
      render: (val, row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary font-mono text-xs px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
              {row.subjectCode}
            </span>
            <span className="font-medium text-[#0F172A] text-sm">{val}</span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
            <User className="w-3 h-3" /> {row.facultyName}
          </p>
        </div>
      )
    },
    {
      header: 'Location / Room',
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
        <Badge
          variant={val === 'Lab' ? 'info' : val === 'Tutorial' ? 'warning' : 'primary'}
          size="sm"
        >
          {val}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Weekly Class Timetable</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Class: <span className="font-semibold text-primary">{timetable.class}</span> • College Hours: {timetable.collegeTimings} (45-Min Periods)
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedDay === day
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule for Selected Day */}
      <Card
        title={`Schedule for ${selectedDay}`}
        subtitle="Includes classroom allocations, faculty instructor assignments, and break timings"
      >
        <Table columns={columns} data={daySlots} keyField="id" emptyMessage={`No lectures scheduled on ${selectedDay}.`} />
      </Card>

      {/* Break timings card */}
      <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">
          Daily Break & Recess Timings
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#0F172A]">
          <div className="bg-white p-2.5 rounded border border-[#E2E8F0]">
            <span className="font-semibold block text-primary">Morning Tea Break</span>
            <span className="text-[#64748B]">11:00 AM - 11:15 AM (15 Mins)</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-[#E2E8F0]">
            <span className="font-semibold block text-primary">Lunch Break</span>
            <span className="text-[#64748B]">12:45 PM - 01:30 PM (45 Mins)</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-[#E2E8F0]">
            <span className="font-semibold block text-primary">Afternoon Break</span>
            <span className="text-[#64748B]">03:00 PM - 03:15 PM (15 Mins)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
