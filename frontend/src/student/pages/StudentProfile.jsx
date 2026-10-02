import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Shield, Home, Bus, Award } from 'lucide-react';

export const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/student/profile');
      setStudent(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchProfile} />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-24 h-24 rounded-full bg-blue-100 border-2 border-primary/20 text-primary flex items-center justify-center font-bold text-3xl shadow-inner">
          {student.name.charAt(0)}
        </div>
        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-[#0F172A]">{student.name}</h2>
            <Badge variant="primary" size="sm">
              {student.rollNo}
            </Badge>
            <Badge variant="success" size="sm">
              Enrolled: {student.admissionYear}
            </Badge>
          </div>
          <p className="text-sm font-medium text-[#64748B]">
            {student.department} • {student.year} ({student.semester})
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-primary" /> {student.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-primary" /> {student.phone}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-warning" /> CGPA: {student.cgpa}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Academic Details */}
        <Card title="Personal & Academic Information">
          <div className="divide-y divide-[#E2E8F0] text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Student ID:</span>
              <span className="font-semibold text-[#0F172A] font-mono">{student.id}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Date of Birth / Age:</span>
              <span className="font-medium text-[#0F172A]">{student.dob} ({student.age} yrs)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Gender / Blood Group:</span>
              <span className="font-medium text-[#0F172A]">{student.gender} / {student.bloodGroup}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Class & Section:</span>
              <span className="font-semibold text-primary">{student.class}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Current Semester:</span>
              <span className="font-medium text-[#0F172A]">{student.semester}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Department:</span>
              <span className="font-medium text-[#0F172A] text-right">{student.department}</span>
            </div>
          </div>
        </Card>

        {/* Parent & Logistics Details */}
        <Card title="Parent Contact & Campus Logistics">
          <div className="divide-y divide-[#E2E8F0] text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Parent / Guardian:</span>
              <span className="font-semibold text-[#0F172A]">{student.parentName}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#64748B]">Parent Contact Number:</span>
              <span className="font-medium text-[#0F172A]">{student.parentContact}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#64748B]">Accommodation Type:</span>
              <Badge variant={student.studentType === 'Hosteller' ? 'info' : 'neutral'} size="sm">
                <Home className="w-3 h-3 mr-1" /> {student.studentType}
              </Badge>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-[#64748B]">College Bus / CAB User:</span>
              <Badge variant={student.cabUser.startsWith('Yes') ? 'success' : 'neutral'} size="sm">
                <Bus className="w-3 h-3 mr-1" /> {student.cabUser}
              </Badge>
            </div>
            <div className="py-2.5 flex justify-between items-start">
              <span className="text-[#64748B]">Permanent Address:</span>
              <span className="font-medium text-[#0F172A] text-right max-w-[220px]">{student.address}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
