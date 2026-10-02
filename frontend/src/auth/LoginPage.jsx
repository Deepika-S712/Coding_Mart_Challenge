import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../components/common/Toast';
import { GraduationCap, BookOpen, Calculator, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const demoCredentials = {
  STUDENT: {
    role: 'STUDENT',
    email: 'student@cms.com',
    password: 'Student@123',
    label: 'Student',
    dashboard: '/student/dashboard',
    desc: 'Access attendance, results, fees, timetables and exams.'
  },
  FACULTY: {
    role: 'FACULTY',
    email: 'faculty@cms.com',
    password: 'Faculty@123',
    label: 'Faculty',
    dashboard: '/faculty/dashboard',
    desc: 'Manage classes, attendance, assignments, assessments & scores.'
  },
  ACCOUNTANT: {
    role: 'ACCOUNTANT',
    email: 'accountant@cms.com',
    password: 'Accountant@123',
    label: 'Accountant',
    dashboard: '/accountant/dashboard',
    desc: 'Manage fee structures, record payments, generate receipts & reports.'
  }
};

export const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [email, setEmail] = useState('student@cms.com');
  const [password, setPassword] = useState('Student@123');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(demoCredentials[roleKey].email);
    setPassword(demoCredentials[roleKey].password);
    setFormError('');
  };

  const handleUseDemo = () => {
    setEmail(demoCredentials[selectedRole].email);
    setPassword(demoCredentials[selectedRole].password);
    toast.info(`Filled demo credentials for ${demoCredentials[selectedRole].label}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      const user = await login(email, password, selectedRole);
      toast.success(`Welcome back, ${user.name}!`);
      const targetDashboard = demoCredentials[user.role.toUpperCase()]?.dashboard || '/';
      navigate(targetDashboard);
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-md">
            CMS
          </div>
        </div>
        <h2 className="text-center text-2xl font-extrabold text-[#0F172A] tracking-tight">
          College Management System
        </h2>
        <p className="mt-1 text-center text-xs text-[#64748B]">
          Enterprise Campus Administration & Academic Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-lg border border-[#E2E8F0]">
          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2 text-center">
              Select Your Login Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleChange('STUDENT')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-semibold transition-all ${
                  selectedRole === 'STUDENT'
                    ? 'bg-white text-primary shadow-sm border border-slate-200'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-1" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('FACULTY')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-semibold transition-all ${
                  selectedRole === 'FACULTY'
                    ? 'bg-white text-primary shadow-sm border border-slate-200'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <BookOpen className="w-4 h-4 mb-1" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('ACCOUNTANT')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-semibold transition-all ${
                  selectedRole === 'ACCOUNTANT'
                    ? 'bg-white text-primary shadow-sm border border-slate-200'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Calculator className="w-4 h-4 mb-1" />
                <span>Accountant</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {formError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-error font-medium">
                {formError}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@cms.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                icon={ArrowRight}
              >
                Sign In as {demoCredentials[selectedRole].label}
              </Button>
            </div>
          </form>

          {/* Demo Credentials Helper Box */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <span>Demo Credentials</span>
              </div>
              <button
                type="button"
                onClick={handleUseDemo}
                className="text-xs font-medium text-primary hover:text-primary-hover hover:underline"
              >
                Use Demo Credentials
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-[#E2E8F0] text-xs space-y-1">
              <div className="flex justify-between text-[#64748B]">
                <span>Email:</span>
                <span className="font-mono text-[#0F172A] font-medium">{demoCredentials[selectedRole].email}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Password:</span>
                <span className="font-mono text-[#0F172A] font-medium">{demoCredentials[selectedRole].password}</span>
              </div>
              <p className="text-[11px] text-[#64748B] pt-1">
                {demoCredentials[selectedRole].desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
