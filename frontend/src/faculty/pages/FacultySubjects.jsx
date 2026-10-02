import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { BookOpen, Users, Clock, Award, MapPin } from 'lucide-react';

export const FacultySubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/subjects');
      setSubjects(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load assigned subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchSubjects} />;
  }

  const columns = [
    {
      header: 'Subject Code',
      key: 'code',
      render: (val) => <span className="font-semibold text-primary font-mono">{val}</span>
    },
    {
      header: 'Subject Title',
      key: 'name',
      render: (val) => <span className="font-semibold text-[#0F172A]">{val}</span>
    },
    {
      header: 'Assigned Class',
      key: 'class',
      render: (val) => <Badge variant="neutral" size="sm">{val}</Badge>
    },
    {
      header: 'Credits',
      key: 'credits',
      render: (val) => <span className="text-center font-bold">{val} Credits</span>
    },
    {
      header: 'Weekly Hours',
      key: 'weeklyHours',
      render: (val) => <span className="text-center font-medium">{val} Hours</span>
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
      header: 'Syllabus Covered',
      key: 'syllabusCompletion',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${val}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-primary">{val}%</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Teaching Subjects & Curriculum</h2>
        <p className="text-xs text-[#64748B]">Assigned academic courses, credits, and syllabus tracker</p>
      </div>

      {/* Subjects Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm hover:border-blue-200 transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-primary font-mono px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                  {sub.code}
                </span>
                <h3 className="text-base font-bold text-[#0F172A] mt-2">{sub.name}</h3>
                <p className="text-xs text-[#64748B]">{sub.department} • {sub.semester}</p>
              </div>
              <Badge variant={sub.type === 'Practical' ? 'info' : 'primary'} size="sm">
                {sub.type}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#E2E8F0] text-center text-xs">
              <div>
                <span className="text-[#64748B] block">Credits</span>
                <span className="font-bold text-[#0F172A]">{sub.credits}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Weekly Hours</span>
                <span className="font-bold text-[#0F172A]">{sub.weeklyHours} Hrs</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Classroom</span>
                <span className="font-bold text-primary">{sub.room}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B] font-medium">Syllabus Progress:</span>
                <span className="font-bold text-primary">{sub.syllabusCompletion}% Completed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${sub.syllabusCompletion}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Complete Subjects Table */}
      <Card title="Subject Roster">
        <Table columns={columns} data={subjects} keyField="id" />
      </Card>
    </div>
  );
};

export default FacultySubjects;
