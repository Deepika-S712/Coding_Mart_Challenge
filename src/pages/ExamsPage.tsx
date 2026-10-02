import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Download,
  Printer,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../design-system/Table';
import { TableSkeleton, CardSkeleton } from '../design-system/Skeleton';
import { ErrorState } from '../design-system/ErrorState';
import { Modal } from '../design-system/Modal';
import type { ExamSchedule } from '../types/academic';
import { academicService } from '../services/academicService';
import { useToast } from '../design-system/Toast';
import './ExamsPage.css';

export interface ExamsPageProps {
  currentUserRole?: string;
}

export const ExamsPage: React.FC<ExamsPageProps> = ({ currentUserRole = 'Student' }) => {
  const { showToast } = useToast();
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Admit Card Modal
  const [admitCardModalOpen, setAdmitCardModalOpen] = useState(false);

  const fetchExams = async () => {
    setIsLoading(true);
    setIsError(false);

    const res = await academicService.getExamSchedules(currentUserRole);
    setIsLoading(false);

    if (res.success && res.data) {
      setExams(res.data);
    } else {
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [currentUserRole]);

  const nextExam = exams[0] || null;

  const handlePrintAdmitCard = () => {
    showToast(
      'Admit Card Generation',
      'Official Examination Hall Ticket generated for download/print.',
      'success'
    );
    window.print();
  };

  if (isLoading) {
    return (
      <div className="cms-exams-page">
        <CardSkeleton />
        <TableSkeleton rows={5} cols={7} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Exam Schedule Unavailable"
        message="Unable to retrieve examination dates and hall allocation from the exam controller service."
        onRetry={fetchExams}
      />
    );
  }

  return (
    <div className="cms-exams-page">
      {nextExam && (
        <Card className="cms-next-exam-card">
          <div className="cms-next-exam-main">
            <div className="cms-next-exam-badge">
              <Clock size={16} />
              <span>Next Upcoming Examination</span>
            </div>
            <h2 className="cms-next-exam-title">
              {nextExam.subjectCode}: {nextExam.subjectName}
            </h2>
            <p className="cms-next-exam-sub">
              {nextExam.examType} • Duration: {nextExam.durationMinutes} Minutes ({nextExam.totalMarks} Marks)
            </p>
            <div className="cms-next-exam-meta">
              <span><Calendar size={14} /> {nextExam.day}, {nextExam.date}</span>
              <span><Clock size={14} /> {nextExam.time}</span>
              <span><MapPin size={14} /> {nextExam.venue} (Seat #{nextExam.seatNumber})</span>
            </div>
          </div>

          <div className="cms-next-exam-action">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Download size={18} />}
              onClick={() => setAdmitCardModalOpen(true)}
            >
              Get Hall Ticket / Admit Card
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>
                <FileText size={18} className="text-indigo-600" />
                <span>Fall 2026 Examination Schedule & Hall Allocation</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Approved by the Office of the Controller of Examinations
              </p>
            </div>

            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
              onClick={() => setAdmitCardModalOpen(true)}
            >
              Download Official Admit Card
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Day</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Subject Code</TableHead>
                <TableHead>Subject Title</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Venue / Hall</TableHead>
                <TableHead>Seat Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="whitespace-nowrap font-semibold">
                    <div>{ex.date}</div>
                    <div className="text-xs text-slate-400 font-normal">{ex.day}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-slate-700">{ex.time}</TableCell>
                  <TableCell className="font-bold text-indigo-600">{ex.subjectCode}</TableCell>
                  <TableCell className="font-medium text-slate-900">{ex.subjectName}</TableCell>
                  <TableCell>
                    <Badge variant={ex.examType.includes('Practical') ? 'info' : 'neutral'} size="sm">
                      {ex.examType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin size={14} className="text-slate-400" />
                      {ex.venue}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{ex.seatNumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={admitCardModalOpen}
        onClose={() => setAdmitCardModalOpen(false)}
        size="lg"
        title={
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            <span>Examination Admit Card / Hall Ticket — Fall 2026</span>
          </div>
        }
      >
        <div className="cms-hall-ticket-container">
          <div className="cms-ticket-header">
            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900">CMS COLLEGE OF ENGINEERING & TECHNOLOGY</h3>
              <p className="text-xs text-slate-500">Official End-Semester Examination Hall Pass</p>
            </div>
          </div>

          <div className="cms-ticket-info-grid">
            <div><strong>Student Name:</strong> Alex Vance</div>
            <div><strong>Student ID:</strong> STU2024-8942</div>
            <div><strong>Program:</strong> B.Tech Computer Science</div>
            <div><strong>Semester:</strong> Semester 6</div>
            <div><strong>Academic Year:</strong> 2025-2026</div>
            <div><strong>Center:</strong> Main Examination Blocks</div>
          </div>

          <div className="my-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Hall & Seat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-semibold">{e.date}</TableCell>
                    <TableCell className="font-bold">{e.subjectCode}</TableCell>
                    <TableCell>{e.subjectName}</TableCell>
                    <TableCell>{e.venue} ({e.seatNumber})</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle size={16} /> Controller Clearance Verified
            </span>
            <Button
              variant="primary"
              leftIcon={<Printer size={16} />}
              onClick={handlePrintAdmitCard}
            >
              Print / Save Official Hall Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
