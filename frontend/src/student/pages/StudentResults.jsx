import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table } from '../../components/common/Table';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../components/common/Toast';
import {
  Lock,
  Unlock,
  KeyRound,
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  Printer
} from 'lucide-react';

export const StudentResults = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('Result@123');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultsData, setResultsData] = useState(null);
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setErrorMsg('');

    try {
      await apiClient.post('/student/results/verify', { password });
      toast.success('Identity verified! Academic marks card unlocked.');
      setIsUnlocked(true);
      fetchResults();
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect result password.');
      toast.error(err.message || 'Incorrect result password.');
    } finally {
      setVerifying(false);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/student/results');
      setResultsData(res.data);
    } catch (err) {
      toast.error('Failed to load marks card.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] shadow-sm text-center space-y-5">
          <div className="w-14 h-14 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#0F172A]">Protected Academic Transcript</h3>
            <p className="text-xs text-[#64748B]">
              In accordance with university examination security policy, enter your personal result PIN/password to decrypt your semester marks and grade sheet.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4 text-left">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-error text-xs rounded-md">
                {errorMsg}
              </div>
            )}

            <Input
              label="Result Security Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Result Password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={verifying}
              className="w-full"
              icon={Unlock}
            >
              Verify & View Marks
            </Button>
          </form>

          <div className="pt-3 border-t border-[#E2E8F0] bg-slate-50 p-3 rounded-md text-xs text-left">
            <div className="flex items-center gap-1.5 font-semibold text-[#0F172A] mb-1">
              <KeyRound className="w-3.5 h-3.5 text-primary" /> Demo Result Password:
            </div>
            <p className="font-mono text-primary font-bold text-sm">Result@123</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !resultsData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const currentSem = resultsData.semesters[selectedSemesterIndex] || resultsData.semesters[0];

  const columns = [
    {
      header: 'Subject Code',
      key: 'code',
      render: (val) => <span className="font-semibold text-primary font-mono">{val}</span>
    },
    {
      header: 'Course Title',
      key: 'name',
      render: (val) => <span className="font-medium text-[#0F172A]">{val}</span>
    },
    {
      header: 'Internal (30)',
      key: 'internal',
      render: (val) => <span className="font-medium text-center">{val}</span>
    },
    {
      header: 'External (70)',
      key: 'external',
      render: (val) => <span className="font-medium text-center">{val}</span>
    },
    {
      header: 'Total (100)',
      key: 'total',
      render: (val) => <span className="font-bold text-[#0F172A] text-center">{val}</span>
    },
    {
      header: 'Grade',
      key: 'grade',
      render: (val) => (
        <Badge variant={val === 'O' || val === 'A+' ? 'success' : 'primary'} size="sm">
          {val}
        </Badge>
      )
    },
    {
      header: 'Grade Point',
      key: 'gradePoint',
      render: (val) => <span className="font-bold text-center">{val}</span>
    },
    {
      header: 'Credits',
      key: 'credits',
      render: (val) => <span className="text-center font-medium">{val}</span>
    },
    {
      header: 'Result',
      key: 'result',
      render: (val) => (
        <Badge variant={val === 'PASS' ? 'success' : 'error'} size="sm" dot>
          {val}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-lg border border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Semester Academic Grade Sheet</h2>
          <p className="text-xs text-[#64748B]">
            Student: <span className="font-semibold text-[#0F172A]">{resultsData.studentName}</span> ({resultsData.rollNo})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint} className="no-print">
            Print Grade Sheet
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Lock}
            onClick={() => setIsUnlocked(false)}
            className="no-print"
          >
            Lock
          </Button>
        </div>
      </div>

      {/* GPA KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Semester SGPA"
          value={currentSem.sgpa}
          subtitle={`Session: ${currentSem.examSession}`}
          icon={Award}
          color="primary"
        />
        <StatCard
          title="Cumulative CGPA"
          value={resultsData.cgpa}
          subtitle="Across all semesters"
          icon={GraduationCap}
          color="success"
        />
        <StatCard
          title="Credits Earned"
          value={`${currentSem.earnedCredits} / ${currentSem.totalCredits}`}
          subtitle="100% Credit Completion"
          icon={CheckCircle2}
          color="info"
        />
        <StatCard
          title="Semester Status"
          value={currentSem.status}
          subtitle="Controller of Examinations"
          icon={FileCheck2}
          color="success"
        />
      </div>

      {/* Semester Switcher Tabs */}
      <div className="flex gap-2 border-b border-[#E2E8F0] pb-2 no-print">
        {resultsData.semesters.map((sem, idx) => (
          <button
            key={sem.semester}
            onClick={() => setSelectedSemesterIndex(idx)}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              selectedSemesterIndex === idx
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {sem.semester} (SGPA: {sem.sgpa})
          </button>
        ))}
      </div>

      {/* Marks Table */}
      <Card
        title={`${currentSem.semester} Mark Statement`}
        subtitle={`Examination Session: ${currentSem.examSession}`}
      >
        <Table columns={columns} data={currentSem.subjects} keyField="code" />
      </Card>
    </div>
  );
};

export default StudentResults;
