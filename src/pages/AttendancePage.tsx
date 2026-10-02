import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  BarChart2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Input } from '../design-system/Input';
import { Select } from '../design-system/Select';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../design-system/Table';
import { TableSkeleton, CardSkeleton } from '../design-system/Skeleton';
import { ErrorState } from '../design-system/ErrorState';
import { EmptyState } from '../design-system/EmptyState';
import { Modal } from '../design-system/Modal';
import type { SubjectAttendance, AttendanceRecord, MonthlyAttendance } from '../types/academic';
import { academicService } from '../services/academicService';
import './AttendancePage.css';

export interface AttendancePageProps {
  currentUserRole?: string;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ currentUserRole = 'Student' }) => {
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendance[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('6');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Detail Modal
  const [selectedSubject, setSelectedSubject] = useState<SubjectAttendance | null>(null);

  const fetchAttendance = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const [subRes, recRes, monRes] = await Promise.all([
        academicService.getSubjectAttendance(currentUserRole),
        academicService.getAttendanceRecords(currentUserRole),
        academicService.getMonthlyAttendance(currentUserRole),
      ]);

      if (subRes.success && subRes.data) setSubjectAttendance(subRes.data);
      if (recRes.success && recRes.data) setRecords(recRes.data);
      if (monRes.success && monRes.data) setMonthlyData(monRes.data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentUserRole]);

  const totalClasses = subjectAttendance.reduce((a, b) => a + b.totalClasses, 0);
  const totalPresent = subjectAttendance.reduce((a, b) => a + b.present, 0);
  const totalAbsent = subjectAttendance.reduce((a, b) => a + b.absent, 0);
  const overallPct = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : '0';

  const filteredSubjects = subjectAttendance.filter((s) => {
    const matchesSearch =
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="cms-attendance-page">
        <CardSkeleton />
        <TableSkeleton rows={6} cols={7} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Attendance Records Unavailable"
        message="Unable to fetch attendance log entries from the server."
        onRetry={fetchAttendance}
      />
    );
  }

  return (
    <div className="cms-attendance-page">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cms-att-metric-card">
          <div className="cms-metric-header">
            <span className="cms-metric-title">Overall Attendance</span>
            <CalendarCheck size={20} className="text-indigo-600" />
          </div>
          <div className="cms-metric-value">{overallPct}%</div>
          <div className="cms-metric-sub font-medium">
            <Badge variant={Number(overallPct) >= 75 ? 'success' : 'error'} size="sm">
              {Number(overallPct) >= 75 ? 'Safe Status' : 'Warning Status'}
            </Badge>
          </div>
        </Card>

        <Card className="cms-att-metric-card">
          <div className="cms-metric-header">
            <span className="cms-metric-title">Total Conducted</span>
            <BookOpen size={20} className="text-slate-500" />
          </div>
          <div className="cms-metric-value">{totalClasses}</div>
          <div className="cms-metric-sub text-slate-500">Classes Scheduled</div>
        </Card>

        <Card className="cms-att-metric-card">
          <div className="cms-metric-header">
            <span className="cms-metric-title">Classes Attended</span>
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div className="cms-metric-value text-emerald-600">{totalPresent}</div>
          <div className="cms-metric-sub text-emerald-700">Present Days</div>
        </Card>

        <Card className="cms-att-metric-card">
          <div className="cms-metric-header">
            <span className="cms-metric-title">Classes Missed</span>
            <XCircle size={20} className="text-red-500" />
          </div>
          <div className="cms-metric-value text-red-600">{totalAbsent}</div>
          <div className="cms-metric-sub text-red-700">Absent Days</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <BarChart2 size={18} className="text-indigo-600" />
            <span>Monthly Attendance Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="cms-bar-chart-container">
            {monthlyData.map((m) => (
              <div key={m.month} className="cms-bar-item">
                <div className="cms-bar-val">{m.percentage}%</div>
                <div className="cms-bar-track">
                  <div
                    className={`cms-bar-fill ${m.percentage >= 85 ? 'fill-emerald' : m.percentage >= 75 ? 'fill-indigo' : 'fill-amber'}`}
                    style={{ height: `${m.percentage}%` }}
                  />
                </div>
                <div className="cms-bar-label">{m.month}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>
              <CalendarCheck size={18} className="text-indigo-600" />
              <span>Subject-Wise Attendance Breakdown</span>
            </CardTitle>

            <div className="cms-table-filters">
              <div className="w-48">
                <Input
                  placeholder="Search subject or staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={14} />}
                />
              </div>

              <div className="w-36">
                <Select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  options={[
                    { value: '6', label: 'Semester 6' },
                    { value: '5', label: 'Semester 5' },
                    { value: '4', label: 'Semester 4' },
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Statuses' },
                    { value: 'Safe', label: 'Safe (>=75%)' },
                    { value: 'Warning', label: 'Warning (70-74%)' },
                    { value: 'Critical', label: 'Critical (<70%)' },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubjects.length === 0 ? (
            <EmptyState
              title="No Attendance Records Found"
              description="No subject attendance entry matched your applied filter criteria."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedStatus('All');
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Faculty / Instructor</TableHead>
                  <TableHead>Total Classes</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>Status Badge</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((sub) => (
                  <TableRow key={sub.subjectId}>
                    <TableCell className="font-semibold text-slate-800">{sub.subjectCode}</TableCell>
                    <TableCell className="font-medium">{sub.subjectName}</TableCell>
                    <TableCell>{sub.staffName}</TableCell>
                    <TableCell>{sub.totalClasses}</TableCell>
                    <TableCell className="text-emerald-700 font-semibold">{sub.present}</TableCell>
                    <TableCell className="text-red-600 font-semibold">{sub.absent}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="cms-progress-bar">
                          <div
                            className={`cms-progress-fill ${sub.percentage >= 75 ? 'fill-green' : sub.percentage >= 70 ? 'fill-yellow' : 'fill-red'}`}
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold">{sub.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.status === 'Safe' ? 'success' : sub.status === 'Warning' ? 'warning' : 'error'}
                        size="sm"
                        dot
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                        onClick={() => setSelectedSubject(sub)}
                      >
                        View Logs
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!selectedSubject}
        onClose={() => setSelectedSubject(null)}
        size="lg"
        title={
          selectedSubject ? (
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              <span>Attendance History — {selectedSubject.subjectCode}: {selectedSubject.subjectName}</span>
            </div>
          ) : undefined
        }
      >
        {selectedSubject && (
          <div>
            <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>Instructor: <strong>{selectedSubject.staffName}</strong></div>
              <div>Overall: <strong>{selectedSubject.percentage}%</strong> ({selectedSubject.present}/{selectedSubject.totalClasses} Present)</div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic Covered</TableHead>
                  <TableHead>Marked Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records
                  .filter((r) => r.subjectCode === selectedSubject.subjectCode)
                  .map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-semibold">{rec.date}</TableCell>
                      <TableCell>{rec.subjectName}</TableCell>
                      <TableCell>{rec.topicCovered}</TableCell>
                      <TableCell>
                        <Badge
                          variant={rec.status === 'Present' ? 'success' : rec.status === 'Absent' ? 'error' : 'neutral'}
                          size="sm"
                        >
                          {rec.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Modal>
    </div>
  );
};
