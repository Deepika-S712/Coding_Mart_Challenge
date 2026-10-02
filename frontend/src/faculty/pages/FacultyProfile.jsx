import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { useToast } from '../../components/common/Toast';
import {
  User,
  Mail,
  Phone,
  Building,
  Award,
  Calendar,
  BookOpen,
  Clock,
  MapPin,
  Edit2,
  Save
} from 'lucide-react';

export const FacultyProfile = () => {
  const [faculty, setFaculty] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/faculty/profile');
      setFaculty(res.data);
      setFormData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load faculty profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put('/faculty/profile', formData);
      setFaculty(res.data);
      toast.success('Faculty profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

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
          {faculty.name.charAt(0)}
        </div>
        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-[#0F172A]">{faculty.name}</h2>
            <Badge variant="primary" size="sm">
              {faculty.employeeId}
            </Badge>
            <Badge variant="neutral" size="sm">
              Joined: {faculty.joiningDate}
            </Badge>
          </div>
          <p className="text-sm font-medium text-primary">
            {faculty.designation} • {faculty.department}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-primary" /> {faculty.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-primary" /> {faculty.phone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> {faculty.officeRoom}
            </span>
          </div>
        </div>
        <div>
          {!isEditing ? (
            <Button
              variant="secondary"
              size="sm"
              icon={Edit2}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card title="Edit Faculty Profile Information">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Designation"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
              <Input
                label="Department"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="Office / Cabin Room"
                value={formData.officeRoom || ''}
                onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
                required
              />
              <Input
                label="Experience"
                value={formData.experience || ''}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
              <Input
                label="Academic Qualification"
                value={formData.qualification || ''}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="sm:col-span-2"
              />
            </div>
            <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
              <Button type="submit" variant="primary" loading={saving} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Qualifications & Experience */}
          <Card title="Academic Qualifications & Experience">
            <div className="divide-y divide-[#E2E8F0] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Employee ID:</span>
                <span className="font-semibold text-[#0F172A] font-mono">{faculty.employeeId}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Educational Qualification:</span>
                <span className="font-medium text-[#0F172A] text-right max-w-[240px]">{faculty.qualification}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Total Teaching Experience:</span>
                <span className="font-semibold text-primary">{faculty.experience}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Date of Joining:</span>
                <span className="font-medium text-[#0F172A]">{faculty.joiningDate}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Primary Research Areas:</span>
                <span className="font-medium text-[#0F172A] text-right max-w-[240px]">{faculty.researchAreas || 'Algorithms & Distributed Systems'}</span>
              </div>
            </div>
          </Card>

          {/* Department & Contact */}
          <Card title="Department & Teaching Workload">
            <div className="divide-y divide-[#E2E8F0] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Department:</span>
                <span className="font-medium text-[#0F172A]">{faculty.department}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Designation:</span>
                <span className="font-semibold text-primary">{faculty.designation}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Assigned Weekly Hours:</span>
                <span className="font-bold text-[#0F172A]">{faculty.weeklyHours || 14} Hours / Week</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Office / Cabin Room:</span>
                <span className="font-medium text-[#0F172A]">{faculty.officeRoom}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#64748B]">Official Email:</span>
                <span className="font-medium text-[#0F172A]">{faculty.email}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FacultyProfile;
