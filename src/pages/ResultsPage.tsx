import React, { useState, useEffect } from 'react';
import { Award, Lock, ShieldCheck, Printer, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import { Select } from '../design-system/Select';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../design-system/Table';
import { TableSkeleton, CardSkeleton } from '../design-system/Skeleton';
import { ErrorState } from '../design-system/ErrorState';
import { PasswordModal } from '../components/PasswordModal';
import type { SemesterResult } from '../types/academic';
import { academicService } from '../services/academicService';
import { useToast } from '../design-system/Toast';
import './ResultsPage.css';

export interface ResultsPageProps {
  currentUserRole?: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ currentUserRole = 'Student' }) => {
  const { showToast } = useToast();
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [resultData, setResultData] = useState<SemesterResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const fetchSemesterResult = async (sem: number) => {
    setIsLoading(true);
    setIsError(false);

    const res = await academicService.getSemesterResult(sem, currentUserRole);
    setIsLoading(false);

    if (res.success && res.data) {
      setResultData(res.data);
    } else {
      setIsError(true);
    }
  };

  useEffect(() => {
    fetchSemesterResult(selectedSemester);
  }, [selectedSemester, currentUserRole]);

  const handlePrintMarkSheet = () => {
    showToast(
      'Generating Printable Grade Card',
      `Official grade card for Semester ${selectedSemester} ready for printing.`,
      'success'
    );
    window.print();
  };

  if (isLoading) {
    return (
      <div className="cms-results-page">
        <CardSkeleton />
        <TableSkeleton rows={6} cols={8} />
      </div>
    );
  }

  if (isError || !resultData) {
    return (
      <ErrorState
        title="Semester Result Unavailable"
        message={`No published examination grade sheet record was found for Semester ${selectedSemester}.`}
        onRetry={() => fetchSemesterResult(selectedSemester)}
      />
    );
  }

  return (
    <div className="cms-results-page">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>
                <Award size={18} className="text-indigo-600" />
                <span>Academic Examination Grade Sheet</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Official SGPA & Cumulative CGPA Transcripts • Controller of Examinations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-44">
                <Select
                  label="Select Semester"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                  options={[
                    { value: 5, label: 'Semester 5 (Fall 2025)' },
                    { value: 4, label: 'Semester 4 (Spring 2025)' },
                    { value: 3, label: 'Semester 3 (Fall 2024)' },
                  ]}
                />
              </div>

              {!isUnlocked ? (
                <Button
                  variant="primary"
                  leftIcon={<Lock size={16} />}
                  onClick={() => setPasswordModalOpen(true)}
                >
                  Unlock Confidential Marksheet
                </Button>
              ) : (
                <Button
                  variant="outline"
                  leftIcon={<Printer size={16} />}
                  onClick={handlePrintMarkSheet}
                >
                  Print / Save PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {!isUnlocked ? (
        <Card className="cms-lock-overlay-card">
          <div className="cms-lock-content">
            <div className="cms-lock-icon">
              <Lock size={40} />
            </div>
            <h3 className="cms-lock-title">Confidential Grade Sheet Protection</h3>
            <p className="cms-lock-desc">
              In accordance with college security policy, official semester grade sheets require backend verification of your security password before revealing numerical marks and grade classifications.
            </p>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<ShieldCheck size={18} />}
              onClick={() => setPasswordModalOpen(true)}
            >
              Verify Password to View Marks
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <Card className="cms-result-metric-card">
              <div className="cms-result-label">Semester SGPA</div>
              <div className="cms-result-val text-indigo-600">{resultData.sgpa} / 10.0</div>
              <Badge variant="success" size="sm">First Class with Distinction</Badge>
            </Card>

            <Card className="cms-result-metric-card">
              <div className="cms-result-label">Cumulative CGPA</div>
              <div className="cms-result-val text-slate-800">{resultData.cgpa}</div>
              <span className="text-xs text-slate-500">Overall Course Average</span>
            </Card>

            <Card className="cms-result-metric-card">
              <div className="cms-result-label">Credits Earned</div>
              <div className="cms-result-val text-slate-800">{resultData.passedCredits} / {resultData.totalCredits}</div>
              <span className="text-xs text-emerald-700 font-medium">100% Credit Completion</span>
            </Card>

            <Card className="cms-result-metric-card">
              <div className="cms-result-label">Result Status</div>
              <div className="cms-result-val">
                <Badge variant="success" size="md">{resultData.resultStatus}</Badge>
              </div>
              <span className="text-xs text-slate-400">Published: {resultData.publishedDate}</span>
            </Card>
          </div>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>
                <FileText size={18} className="text-indigo-600" />
                <span>Subject Grade Breakdown — Semester {selectedSemester}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Title</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Internal Marks (40)</TableHead>
                    <TableHead>External Marks (60)</TableHead>
                    <TableHead>Total Marks (100)</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultData.subjects.map((sub) => (
                    <TableRow key={sub.subjectCode}>
                      <TableCell className="font-semibold text-slate-900">{sub.subjectCode}</TableCell>
                      <TableCell className="font-medium text-slate-800">{sub.subjectName}</TableCell>
                      <TableCell className="font-semibold">{sub.credits}</TableCell>
                      <TableCell>{sub.internalMarks} / 40</TableCell>
                      <TableCell>{sub.externalMarks} / 60</TableCell>
                      <TableCell className="font-bold text-slate-900">{sub.totalMarks} / 100</TableCell>
                      <TableCell>
                        <span className="cms-grade-chip">{sub.grade}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sub.resultStatus === 'PASS' ? 'success' : 'error'}
                          size="sm"
                          dot
                        >
                          {sub.resultStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => {
          setIsUnlocked(true);
          setPasswordModalOpen(false);
          showToast('Verification Successful', 'Confidential grade sheet unlocked.', 'success');
        }}
      />
    </div>
  );
};
