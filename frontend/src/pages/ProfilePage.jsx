import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  Save,
  CheckCircle2,
  BookOpen,
  Users,
  ShieldCheck,
  LogOut,
  Building,
  Award
} from 'lucide-react';
import { facultyApi } from '../api/facultyApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';

export function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    phone: '',
    office: '',
    qualification: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Faculty Profile
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facultyApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          phone: res.data.phone || '',
          office: res.data.office || '',
          qualification: res.data.qualification || ''
        });
      } else {
        throw new Error(res.message || 'Failed to fetch faculty profile');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with profile service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    }
    if (!formData.office.trim()) {
      errs.office = 'Office / cabin location is required';
    }
    if (!formData.qualification.trim()) {
      errs.qualification = 'Highest educational qualification is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Profile Updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const res = await facultyApi.updateProfile({
        phone: formData.phone.trim(),
        office: formData.office.trim(),
        qualification: formData.qualification.trim()
      });

      if (res.success && res.data) {
        toast.success('Profile details updated successfully');
        setProfile((prev) => ({
          ...prev,
          ...res.data
        }));
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ height: '32px', width: '220px', backgroundColor: 'var(--cms-bg-muted)', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ height: '16px', width: '380px', backgroundColor: 'var(--cms-bg-muted)', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(0, 2fr)', gap: '24px' }}>
          <CardSkeleton />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load Faculty Profile"
        message={error}
        onRetry={fetchProfile}
      />
    );
  }

  const {
    id = 'FAC001',
    name = 'Dr. Arun Kumar',
    email = 'teacher@college.edu',
    designation = 'Associate Professor',
    department = 'Computer Science & Engineering',
    experienceYears = 12,
    joiningDate = '2014-08-01',
    subjects = []
  } = profile || {};

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
    : 'AK';

  return (
    <div>
      {/* Page Header */}
      <div className="cms-page-header">
        <div>
          <h1 className="cms-page-title">Faculty Profile & Settings</h1>
          <p className="cms-page-subtitle">
            Manage your personal contact details, view teaching allocations, and verify account security
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.1fr) minmax(0, 2.2fr)',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Identity Card & Security Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Identity Overview Card */}
          <Card>
            <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--cms-border-subtle)' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: 'var(--cms-radius-full)',
                  backgroundColor: 'var(--cms-primary-light)',
                  color: 'var(--cms-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  border: '2px solid var(--cms-primary-border)',
                  marginBottom: '14px'
                }}
              >
                {initials}
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cms-text-primary)', marginBottom: '4px' }}>
                {name}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)', marginBottom: '10px' }}>
                {designation}
              </p>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--cms-primary)',
                    backgroundColor: 'var(--cms-primary-light)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {id}
                </span>
                <Badge variant="success">Active Faculty</Badge>
              </div>
            </div>

            {/* Quick Metadata Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <Building size={16} color="var(--cms-text-muted)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--cms-text-muted)' }}>Department</span>
                  <span style={{ fontWeight: 500, color: 'var(--cms-text-primary)' }}>{department}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <Mail size={16} color="var(--cms-text-muted)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--cms-text-muted)' }}>Email Address</span>
                  <span style={{ fontWeight: 500, color: 'var(--cms-text-primary)' }}>{email}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <Calendar size={16} color="var(--cms-text-muted)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--cms-text-muted)' }}>Joining Date</span>
                  <span style={{ fontWeight: 500, color: 'var(--cms-text-primary)' }}>{joiningDate}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <Award size={16} color="var(--cms-text-muted)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--cms-text-muted)' }}>Teaching Experience</span>
                  <span style={{ fontWeight: 500, color: 'var(--cms-text-primary)' }}>{experienceYears} Years</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Account & Security Information */}
          <Card title="Account & Security">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--cms-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--cms-success)" />
                  Account Role
                </span>
                <Badge variant="primary">FACULTY</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--cms-text-secondary)' }}>Session Status</span>
                <span style={{ color: 'var(--cms-success)', fontWeight: 600, fontSize: '12px' }}>
                  ● Authenticated
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--cms-border-subtle)', paddingTop: '14px', marginTop: '4px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ width: '100%', color: 'var(--cms-danger)', borderColor: '#FCA5A5' }}
                  onClick={logout}
                >
                  <LogOut size={14} style={{ marginRight: '6px' }} />
                  Sign Out of Account
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Editable Contact Information & Teaching Workload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Edit Contact & Professional Information */}
          <Card
            title="Edit Contact & Professional Details"
            subtitle="Keep your official contact coordinates up-to-date for students and administration"
          >
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Readonly identity fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input
                  label="Full Name"
                  value={name}
                  disabled
                  helperText="Name registered with college administration"
                />
                <Input
                  label="Employee ID"
                  value={id}
                  disabled
                  helperText="Permanent Faculty Identification Number"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input
                  label="Department"
                  value={department}
                  disabled
                />
                <Input
                  label="Official Email"
                  value={email}
                  disabled
                />
              </div>

              {/* Editable Fields */}
              <div style={{ borderTop: '1px solid var(--cms-border-subtle)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cms-text-primary)', marginBottom: '14px' }}>
                  Contact & Qualification Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <Input
                    label="Phone Number"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={formErrors.phone}
                  />

                  <Input
                    label="Office / Cabin Location"
                    required
                    placeholder="e.g. Room 304, Academic Block A"
                    value={formData.office}
                    onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                    error={formErrors.office}
                  />
                </div>

                <Input
                  label="Highest Educational Qualification"
                  required
                  placeholder="e.g. Ph.D. in Computer Science"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  error={formErrors.qualification}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSaving}
                >
                  <Save size={15} style={{ marginRight: '6px' }} />
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Teaching Workload & Assigned Subjects Overview */}
          <Card
            title="Assigned Curriculum & Teaching Workload"
            subtitle="Courses and student batches assigned for the current academic semester"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {subjects.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--cms-text-secondary)', padding: '12px 0' }}>
                  No subjects currently allocated.
                </p>
              ) : (
                subjects.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      border: '1px solid var(--cms-border-subtle)',
                      borderRadius: 'var(--cms-radius-md)',
                      padding: '14px 16px',
                      backgroundColor: 'var(--cms-bg-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--cms-primary)',
                              backgroundColor: 'var(--cms-primary-light)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {sub.code}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cms-text-primary)' }}>
                            {sub.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--cms-text-secondary)' }}>
                          {sub.department} • Semester {sub.semester}
                        </span>
                      </div>
                      <Badge variant="primary">{sub.credits} Credits</Badge>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--cms-text-secondary)' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span>
                          <strong>Batches:</strong> {sub.assignedClasses?.join(', ')}
                        </span>
                        <span>
                          <strong>Students:</strong> {sub.totalStudents} Enrolled
                        </span>
                      </div>
                      <span>
                        <strong>Syllabus:</strong> {sub.syllabusProgress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '5px', backgroundColor: 'var(--cms-bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${sub.syllabusProgress}%`,
                          backgroundColor: 'var(--cms-primary)',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
