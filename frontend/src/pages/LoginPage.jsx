import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Info
} from 'lucide-react';
import { api } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENT_YEAR = new Date().getFullYear();

export default function LoginPage({ onLoginSuccess, sessionExpiredMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Institutional email is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g., admin@university.edu).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.login({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (data && data.token && data.user) {
        api.setToken(data.token);
        api.setUser(data.user);
        onLoginSuccess(data.user, data.token);
      } else {
        throw new Error('Authentication succeeded but invalid response received.');
      }
    } catch (err) {
      let msg = err.message || 'Unable to connect to the server. Please try again.';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror') || msg.toLowerCase().includes('load failed')) {
        msg = 'Connecting to backend... If the free cloud server was sleeping, it takes ~30-40 seconds to spin up. Please wait a moment and click Sign In again!';
      }
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for convenience
  const handleFillDemo = () => {
    setEmail('admin@university.edu');
    setPassword('Admin@123');
    setErrors({});
    setServerError('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Institutional Branding Card Header */}
        <div className="login-brand-header">
          <div className="login-badge">
            <ShieldCheck size={14} />
            <span>Secure Institutional Portal</span>
          </div>
          <div className="login-title-row">
            <div className="login-logo-icon">
              <GraduationCap size={28} color="#60a5fa" />
            </div>
            <div>
              <h1 className="login-brand-title">FacultyHub</h1>
              <p className="login-brand-subtitle">Faculty Performance & Academic Activity System</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>Institutional Sign In</h2>
            <p>Access your faculty workload, publications, and appraisal dashboard.</p>
          </div>

          {/* Session Expired / Timeout Notification */}
          {sessionExpiredMessage && !serverError && (
            <div className="login-alert alert-warning">
              <AlertCircle size={18} className="alert-icon" />
              <span>{sessionExpiredMessage}</span>
            </div>
          )}

          {/* Server Error Message */}
          {serverError && (
            <div className="login-alert alert-danger" role="alert">
              <AlertCircle size={18} className="alert-icon" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Institutional Email Address <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className={`form-control input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="e.g. admin@university.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  autoComplete="username"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control input-field ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Institution Notice */}
          <div className="login-institution-note">
            <Info size={16} />
            <div>
              <span>Institution-Managed System:</span> Accounts are provisioned and managed by your university academic administration. Public registration is not permitted.
            </div>
          </div>

          {/* Quick test credentials card */}
          <div className="login-demo-helper">
            <div className="demo-helper-header">
              <span>Quick Administrator Access</span>
              <button
                type="button"
                className="btn-demo-fill"
                onClick={handleFillDemo}
                disabled={isLoading}
              >
                Auto-fill
              </button>
            </div>
            <div className="demo-credentials">
              <code>admin@university.edu</code> / <code>Admin@123</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>© {CURRENT_YEAR} FacultyHub · Academic Activity & Performance Platform</p>
        </div>
      </div>
    </div>
  );
}
