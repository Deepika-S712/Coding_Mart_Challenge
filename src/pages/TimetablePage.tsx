import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../design-system/Table';
import { TableSkeleton } from '../design-system/Skeleton';
import { ErrorState } from '../design-system/ErrorState';
import { EmptyState } from '../design-system/EmptyState';
import type { TimetableSlot } from '../types/academic';
import { academicService } from '../services/academicService';
import './TimetablePage.css';

export interface TimetablePageProps {
  currentUserRole?: string;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({ currentUserRole = 'Student' }) => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('All');

  const fetchTimetable = async () => {
    setIsLoading(true);
    setIsError(false);

    const res = await academicService.getTimetable(currentUserRole);
    setIsLoading(false);

    if (res.success && res.data) {
      setTimetable(res.data);
    } else {
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [currentUserRole]);

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredSlots = timetable.filter((slot) => {
    return selectedDay === 'All' || slot.day === selectedDay;
  });

  if (isLoading) {
    return (
      <div className="cms-timetable-page">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Timetable Schedule Unavailable"
        message="Failed to load weekly course timetable from the academic schedule database."
        onRetry={fetchTimetable}
      />
    );
  }

  return (
    <div className="cms-timetable-page">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>
                <Clock size={18} className="text-indigo-600" />
                <span>Weekly Class Schedule — Semester 6</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                B.Tech Computer Science & Engineering (Section A) • Main Campus Blocks
              </p>
            </div>

            <div className="cms-day-filter-pills">
              <button
                className={`cms-day-pill ${selectedDay === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedDay('All')}
              >
                All Days
              </button>
              {daysList.map((d) => (
                <button
                  key={d}
                  className={`cms-day-pill ${selectedDay === d ? 'active' : ''}`}
                  onClick={() => setSelectedDay(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredSlots.length === 0 ? (
            <EmptyState
              title="No Classes Scheduled"
              description={`There are no lectures or practical laboratory sessions scheduled for ${selectedDay}.`}
              actionLabel="View All Days"
              onAction={() => setSelectedDay('All')}
            />
          ) : (
            <>
              <div className="cms-desktop-timetable">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Subject Code & Name</TableHead>
                      <TableHead>Course Type</TableHead>
                      <TableHead>Faculty Instructor</TableHead>
                      <TableHead>Classroom / Lab Venue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSlots.map((slot, index) => (
                      <TableRow key={slot.id} className={index === 0 && selectedDay === 'Monday' ? 'cms-active-class-row' : ''}>
                        <TableCell className="font-semibold">{slot.day}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-slate-700">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={14} className="text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800">{slot.subjectName}</div>
                          <div className="text-xs text-indigo-600 font-medium">{slot.subjectCode}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={slot.courseType === 'Lab' ? 'info' : 'neutral'} size="sm">
                            {slot.courseType}
                          </Badge>
                        </TableCell>
                        <TableCell>{slot.staffName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <MapPin size={14} className="text-indigo-600" />
                            {slot.venue}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="cms-mobile-timetable-cards">
                {filteredSlots.map((slot) => (
                  <div key={slot.id} className="cms-mobile-tt-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{slot.day}</span>
                      <Badge variant={slot.courseType === 'Lab' ? 'info' : 'neutral'} size="sm">
                        {slot.courseType}
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold text-indigo-600 mb-1">
                      {slot.subjectCode} — {slot.subjectName}
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={13} className="text-slate-400" />
                        <span>{slot.staffName}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        <MapPin size={13} className="text-indigo-600" />
                        <span>{slot.venue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
