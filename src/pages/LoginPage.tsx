import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, LogIn, Key, ShieldAlert } from 'lucide-react';
import { Input } from '../design-system/Input';
import { Button } from '../design-system/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/Card';
import { Modal } from '../design-system/Modal';
import { authService } from '../services/authService';
import type { User, UserRole } from '../types/auth';
import { useToast } from '../design-system/Toast';
import './LoginPage.css';

export interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('alex.vance@student.cms.edu');
  const [password, setPassword] = useState('student123');
  const [role, setRole] = useState<UserRole>('Student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await authService.login({ email, password, role });
    setIsLoading(false);

    if (res.success && res.data) {
      showToast('Welcome Back!', `Logged in successfully as ${res.data.name}`, 'success');
      onLoginSuccess(res.data);
    } else {
      setError(res.error || 'Invalid credentials or unauthorized role.');
      showToast('Authentication Failed', res.error || 'Invalid email or password', 'error');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResetting(true);
    const res = await authService.requestPasswordReset(resetEmail);
    setIsResetting(false);

    if (res.success && res.data) {
      showToast('Reset Link Sent', res.data.message, 'success');
      setForgotModalOpen(false);
      setResetEmail('');
    } else {
      showToast('Password Reset Error', res.error || 'Could not send reset email', 'error');
    }
  };

  return (
    <div className="cms-login-page">
      <div className="cms-login-container animate-fade-in">
        <div className="cms-login-brand">
          <div className="cms-login-logo">
            <GraduationCap size={36} />
          </div>
          <h1 className="cms-login-title">College Management System</h1>
          <p className="cms-login-subtitle">Student Portal Authentication • CMS-DS v1.0</p>
        </div>

        <Card className="cms-login-card">
          <CardHeader>
            <CardTitle>
              <LogIn size={20} className="text-indigo-600" />
              <span>Student Account Login</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="cms-login-error-banner">
                <ShieldAlert size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="cms-login-form">
              <div className="cms-role-selector-container">
                <label className="cms-input-label">Select Access Role</label>
                <div className="cms-role-options">
                  {(['Student', 'Faculty', 'Admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`cms-role-chip ${role === r ? 'active' : ''}`}
                      onClick={() => {
                        setRole(r);
                        setError(null);
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {role !== 'Student' && (
                  <p className="cms-role-warning">
                    ⚠️ Note: Non-student roles will be blocked by backend role-based access control (RBAC).
                  </p>
                )}
              </div>

              <Input
                label="Student Email Address"
                type="email"
                placeholder="student@cms.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />

              <div className="cms-login-options">
                <label className="cms-remember-me">
                  <input type="checkbox" defaultChecked />
                  <span>Remember my session</span>
                </label>

                <button
                  type="button"
                  className="cms-forgot-btn"
                  onClick={() => setForgotModalOpen(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                fullWidth
                isLoading={isLoading}
                leftIcon={<LogIn size={18} />}
              >
                Sign In to Student Portal
              </Button>
            </form>

            <div className="cms-demo-credentials">
              <span className="cms-demo-title">Demo Credentials:</span>
              <code>Email: alex.vance@student.cms.edu | Pass: student123</code>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        size="sm"
        title={
          <div className="flex items-center gap-2">
            <Key size={18} className="text-indigo-600" />
            <span>Reset Password</span>
          </div>
        }
      >
        <form onSubmit={handleForgotSubmit}>
          <p className="text-xs text-slate-600 mb-4">
            Enter your institutional email address below. We will send a secure link to reset your account password.
          </p>

          <Input
            label="Registered Institutional Email"
            type="email"
            placeholder="alex.vance@student.cms.edu"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
            required
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setForgotModalOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isResetting}>
              Send Reset Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
