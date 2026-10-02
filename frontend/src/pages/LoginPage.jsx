import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/faculty/dashboard';
      navigate(from, { replace: true });
    }
    const savedEmail = localStorage.getItem('cms_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [isAuthenticated, navigate, location]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password, rememberMe);
      const from = location.state?.from?.pathname || '/faculty/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // Backend returns: "Invalid email or password"
      setServerError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('teacher@college.edu');
    setPassword('password123');
    setErrors({});
    setServerError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '36px 32px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2563EB',
              borderRadius: '8px',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '6px'
            }}
          >
            Teacher / Faculty Login
          </h1>
          <p style={{ fontSize: '14px', color: '#475569' }}>
            Sign in to access your faculty dashboard
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              color: '#DC2626',
              fontSize: '13px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="teacher@college.edu"
            error={errors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="Enter your password"
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              marginTop: '4px'
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#475569',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#2563EB',
                  cursor: 'pointer'
                }}
              />
              Remember me
            </label>

            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset instructions have been forwarded to the college administrator.');
              }}
              style={{
                fontSize: '13px',
                color: '#2563EB',
                textDecoration: 'none',
                fontWeight: 500
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Forgot Password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            style={{ width: '100%', height: '42px', fontSize: '14px', fontWeight: 600 }}
          >
            Sign In to Faculty Portal
          </Button>
        </form>

        {/* Quick Demo Credentials Box */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
            Faculty Demo Credentials:
          </p>
          <code
            style={{
              display: 'block',
              padding: '6px 10px',
              backgroundColor: '#F1F5F9',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#0F172A',
              marginBottom: '10px'
            }}
          >
            teacher@college.edu / password123
          </code>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Autofill Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
