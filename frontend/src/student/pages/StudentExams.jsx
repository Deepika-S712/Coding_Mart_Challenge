import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { Clock, Calendar, MapPin, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

export const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/student/exams');
      setExams(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load exam timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchExams} />;
  }

  const nextExam = exams.find((e) => e.isNext) || exams[0];

  const columns = [
    {
      header: 'Subject Code',
      key: 'subjectCode',
      render: (val, row) => (
        <span
          className={`font-semibold font-mono text-xs px-2.5 py-1 rounded border ${
            row.isNext ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-[#0F172A] border-slate-200'
          }`}
        >
          {val}
        </span>
      )
    },
    {
      header: 'Course Name',
      key: 'subjectName',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-sm text-[#0F172A] block">{val}</span>
          <span className="text-xs text-[#64748B]">{row.examName}</span>
        </div>
      )
    },
    {
      header: 'Date & Day',
      key: 'date',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#0F172A] block">{val}</span>
          <span className="text-[11px] text-[#64748B]">{row.day}</span>
        </div>
      )
    },
    {
      header: 'Time & Duration',
      key: 'startTime',
      render: (val, row) => (
        <div>
          <span className="font-medium text-xs text-[#0F172A] block">
            {val} - {row.endTime}
          </span>
          <span className="text-[11px] text-[#64748B]">{row.duration}</span>
        </div>
      )
    },
    {
      header: 'Hall / Room',
      key: 'room',
      render: (val) => (
        <span className="text-xs font-medium text-[#0F172A] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" /> {val}
        </span>
      )
    },
    {
      header: 'Max Marks',
      key: 'maxMarks',
      render: (val) => <span className="font-semibold text-center">{val} Marks</span>
    },
    {
      header: 'Status',
      key: 'isNext',
      render: (val) =>
        val ? (
          <Badge variant="primary" size="sm" dot>
            Next Upcoming
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm">
            Scheduled
          </Badge>
        )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Semester Examination Schedule</h2>
        <p className="text-xs text-[#64748B]">Mid-Semester Theory & Practical Assessment Dates (Oct 2026)</p>
      </div>

      {/* Highlight Card for Next Upcoming Exam */}
      {nextExam && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg p-6 shadow-md border border-blue-600 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Next Upcoming Examination
                </span>
                <span className="text-xs text-blue-200">{nextExam.examName}</span>
              </div>
              <h3 className="text-xl font-bold">
                {nextExam.subjectCode} — {nextExam.subjectName}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {nextExam.date} ({nextExam.day})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {nextExam.startTime} - {nextExam.endTime} ({nextExam.duration})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {nextExam.room}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg text-center min-w-[140px]">
              <span className="text-xs uppercase text-blue-200 block">Total Weightage</span>
              <span className="text-2xl font-black">{nextExam.maxMarks}</span>
              <span className="text-xs text-blue-200 block">Maximum Marks</span>
            </div>
          </div>
        </div>
      )}

      {/* Complete Timetable Table */}
      <Card title="Official Date Sheet">
        <Table columns={columns} data={exams} keyField="id" />
      </Card>

      {/* Exam Instructions Banner */}
      <div className="bg-slate-50 border border-[#E2E8F0] p-4 rounded-lg text-xs space-y-1 text-[#64748B]">
        <h4 className="font-semibold text-[#0F172A] flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-warning" /> General Examination Hall Regulations:
        </h4>
        <ul className="list-disc list-inside space-y-0.5 pt-1">
          <li>Students must carry their official College Identity Card to all examination halls.</li>
          <li>Reporting time is 20 minutes prior to the commencement of the exam.</li>
          <li>Programmable calculators, mobile phones, and smart watches are strictly prohibited.</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentExams;
