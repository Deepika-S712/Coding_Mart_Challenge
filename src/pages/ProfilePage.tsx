import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Users,
  Home,
  Bus,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import { Modal } from '../design-system/Modal';
import { Input } from '../design-system/Input';
import { CardSkeleton } from '../design-system/Skeleton';
import { ErrorState } from '../design-system/ErrorState';
import type { StudentProfile, ProfileUpdateRequest } from '../types/student';
import { studentService } from '../services/studentService';
import { useToast } from '../design-system/Toast';
import './ProfilePage.css';

export interface ProfilePageProps {
  studentId?: string;
  currentUserRole?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  studentId = 'STU2024-8942',
  currentUserRole = 'Student',
}) => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'parent' | 'accommodation' | 'transport'>('personal');

  // Update request modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEmergency, setNewEmergency] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<ProfileUpdateRequest | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setIsError(false);

    const res = await studentService.getStudentProfile(studentId, currentUserRole);
    setIsLoading(false);

    if (res.success && res.data) {
      setProfile(res.data);
      setNewPhone(res.data.phone);
      setNewAddress(res.data.address);
      setNewEmergency(res.data.parent.emergencyContact);
    } else {
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [studentId, currentUserRole]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateReason.trim()) {
      showToast('Validation Error', 'Please specify a reason for your profile modification request.', 'warning');
      return;
    }

    setIsSubmittingUpdate(true);
    const res = await studentService.submitProfileUpdateRequest(
      {
        phone: newPhone,
        address: newAddress,
        emergencyContact: newEmergency,
        reason: updateReason,
      },
      currentUserRole
    );
    setIsSubmittingUpdate(false);

    if (res.success && res.data) {
      setPendingRequest(res.data);
      setUpdateModalOpen(false);
      showToast('Update Request Submitted', 'Your request has been forwarded to the Registrar Office for verification.', 'success');
    } else {
      showToast('Submission Failed', res.error || 'Could not submit update request', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="cms-profile-page">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <ErrorState
        title="Unable to Load Student Profile"
        message="Could not retrieve student profile details from the registrar database."
        onRetry={fetchProfile}
      />
    );
  }

  return (
    <div className="cms-profile-page">
      <Card className="cms-profile-header-card">
        <div className="cms-profile-header-main">
          <div className="cms-profile-avatar-icon-lg">
            <User size={40} />
          </div>
          <div className="cms-profile-header-info">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="cms-profile-name">{profile.fullName}</h2>
              <Badge variant="info" size="md">ID: {profile.studentId}</Badge>
              <Badge variant="success" size="md">Active Student</Badge>
            </div>
            <p className="cms-profile-subtext">
              {profile.academic.program} • {profile.academic.department}
            </p>
            <div className="cms-profile-quick-contacts">
              <span><Mail size={14} /> {profile.email}</span>
              <span><Phone size={14} /> {profile.phone}</span>
              <span><MapPin size={14} /> {profile.address}</span>
            </div>
          </div>
        </div>

        <div className="cms-profile-header-action">
          <Button
            variant="outline"
            leftIcon={<Edit3 size={16} />}
            onClick={() => setUpdateModalOpen(true)}
          >
            Request Profile Update
          </Button>
        </div>
      </Card>

      {pendingRequest && (
        <Card className="cms-pending-banner">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Profile Update Request Pending Approval</h4>
              <p className="text-xs text-amber-800">
                Submitted on {pendingRequest.requestDate}: "{pendingRequest.reason}". The academic admin team is reviewing your changes.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="cms-profile-tabs">
        <button
          className={`cms-profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <User size={16} />
          <span>Personal Info</span>
        </button>
        <button
          className={`cms-profile-tab ${activeTab === 'academic' ? 'active' : ''}`}
          onClick={() => setActiveTab('academic')}
        >
          <GraduationCap size={16} />
          <span>Academic Info</span>
        </button>
        <button
          className={`cms-profile-tab ${activeTab === 'parent' ? 'active' : ''}`}
          onClick={() => setActiveTab('parent')}
        >
          <Users size={16} />
          <span>Parent / Guardian</span>
        </button>
        <button
          className={`cms-profile-tab ${activeTab === 'accommodation' ? 'active' : ''}`}
          onClick={() => setActiveTab('accommodation')}
        >
          <Home size={16} />
          <span>Accommodation Status</span>
        </button>
        <button
          className={`cms-profile-tab ${activeTab === 'transport' ? 'active' : ''}`}
          onClick={() => setActiveTab('transport')}
        >
          <Bus size={16} />
          <span>Transport Info</span>
        </button>
      </div>

      {activeTab === 'personal' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>
              <User size={18} className="text-indigo-600" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="cms-info-grid">
              <div className="cms-info-item">
                <span className="cms-info-label">Full Name</span>
                <span className="cms-info-value">{profile.fullName}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Student ID</span>
                <span className="cms-info-value">{profile.studentId}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Date of Birth</span>
                <span className="cms-info-value">{profile.dateOfBirth} (Age {profile.age})</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Gender</span>
                <span className="cms-info-value">{profile.gender}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Blood Group</span>
                <span className="cms-info-value">{profile.bloodGroup}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Institutional Email</span>
                <span className="cms-info-value">{profile.email}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Contact Phone</span>
                <span className="cms-info-value">{profile.phone}</span>
              </div>
              <div className="cms-info-item cms-info-full">
                <span className="cms-info-label">Permanent Residential Address</span>
                <span className="cms-info-value">{profile.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'academic' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>
              <GraduationCap size={18} className="text-indigo-600" />
              <span>Academic Enrollment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="cms-info-grid">
              <div className="cms-info-item">
                <span className="cms-info-label">Department</span>
                <span className="cms-info-value">{profile.academic.department}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Degree Program</span>
                <span className="cms-info-value">{profile.academic.program}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Academic Year</span>
                <span className="cms-info-value">{profile.academic.academicYear}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Current Semester</span>
                <span className="cms-info-value">Semester {profile.academic.semester}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Section</span>
                <span className="cms-info-value">{profile.academic.section}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Roll Number</span>
                <span className="cms-info-value">{profile.academic.rollNo}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Enrolment Date</span>
                <span className="cms-info-value">{profile.academic.enrolmentDate}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Faculty Advisor</span>
                <span className="cms-info-value">{profile.academic.advisorName} ({profile.academic.advisorEmail})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'parent' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>
              <Users size={18} className="text-indigo-600" />
              <span>Parent / Guardian Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="cms-info-grid">
              <div className="cms-info-item">
                <span className="cms-info-label">Guardian Name</span>
                <span className="cms-info-value">{profile.parent.name}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Relationship</span>
                <span className="cms-info-value">{profile.parent.relationship}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Contact Phone</span>
                <span className="cms-info-value">{profile.parent.contact}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Email Address</span>
                <span className="cms-info-value">{profile.parent.email}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Occupation</span>
                <span className="cms-info-value">{profile.parent.occupation}</span>
              </div>
              <div className="cms-info-item">
                <span className="cms-info-label">Emergency Helpline Contact</span>
                <span className="cms-info-value text-red-600 font-semibold">{profile.parent.emergencyContact}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'accommodation' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <Home size={18} className="text-indigo-600" />
                <span>Accommodation & Residence Status</span>
              </CardTitle>
              <Badge variant={profile.accommodation.status === 'Hosteller' ? 'info' : 'neutral'} size="md">
                {profile.accommodation.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="cms-info-grid">
              <div className="cms-info-item">
                <span className="cms-info-label">Residence Category</span>
                <span className="cms-info-value">{profile.accommodation.status}</span>
              </div>
              {profile.accommodation.status === 'Hosteller' ? (
                <>
                  <div className="cms-info-item">
                    <span className="cms-info-label">Hostel Block</span>
                    <span className="cms-info-value">{profile.accommodation.hostelBlock}</span>
                  </div>
                  <div className="cms-info-item">
                    <span className="cms-info-label">Room Number</span>
                    <span className="cms-info-value">{profile.accommodation.roomNumber}</span>
                  </div>
                  <div className="cms-info-item">
                    <span className="cms-info-label">Hostel Warden</span>
                    <span className="cms-info-value">{profile.accommodation.wardenName} ({profile.accommodation.wardenContact})</span>
                  </div>
                </>
              ) : (
                <div className="cms-info-item cms-info-full">
                  <span className="cms-info-label">Day Scholar Status</span>
                  <span className="cms-info-value text-slate-600">
                    Registered as a Day Scholar commuting directly from permanent NYC residential address.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'transport' && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <Bus size={18} className="text-indigo-600" />
                <span>Campus Transport & Commute Info</span>
              </CardTitle>
              <Badge variant={profile.transport.isCabUser ? 'success' : 'neutral'} size="md">
                Cab User: {profile.transport.isCabUser ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="cms-info-grid">
              <div className="cms-info-item">
                <span className="cms-info-label">Transport Service Enrolled</span>
                <span className="cms-info-value">{profile.transport.isCabUser ? 'Yes (Campus Express Bus)' : 'No (Self Commute)'}</span>
              </div>
              {profile.transport.isCabUser && (
                <>
                  <div className="cms-info-item">
                    <span className="cms-info-label">Assigned Route</span>
                    <span className="cms-info-value">{profile.transport.busRouteNumber}</span>
                  </div>
                  <div className="cms-info-item">
                    <span className="cms-info-label">Designated Pickup Point</span>
                    <span className="cms-info-value">{profile.transport.pickupPoint}</span>
                  </div>
                  <div className="cms-info-item">
                    <span className="cms-info-label">Driver / Fleet Contact</span>
                    <span className="cms-info-value">{profile.transport.driverName} ({profile.transport.driverContact})</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-indigo-600" />
            <span>Request Profile Update</span>
          </div>
        }
      >
        <form onSubmit={handleUpdateSubmit}>
          <p className="text-xs text-slate-600 mb-4">
            Official record changes require verification by the Academic Registrar. Enter updated fields and mandatory justification.
          </p>

          <Input
            label="Phone Number"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />

          <Input
            label="Emergency Contact"
            value={newEmergency}
            onChange={(e) => setNewEmergency(e.target.value)}
          />

          <div className="cms-input-wrapper cms-input-full">
            <label className="cms-input-label">Residential Address</label>
            <textarea
              className="cms-input-field"
              rows={3}
              style={{ height: 'auto', padding: '8px 12px' }}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
          </div>

          <div className="cms-input-wrapper cms-input-full">
            <label className="cms-input-label">Reason for Request (Required)</label>
            <textarea
              className="cms-input-field"
              rows={2}
              style={{ height: 'auto', padding: '8px 12px' }}
              placeholder="e.g. Relocated to new apartment building, updated contact number."
              value={updateReason}
              onChange={(e) => setUpdateReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setUpdateModalOpen(false)}
              disabled={isSubmittingUpdate}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmittingUpdate}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
