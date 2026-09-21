import React, { useState } from 'react';
import { Lock, Mail, Key, ShieldCheck, AlertCircle, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { loginUser, registerUser } from '../services/api.js';

export default function AuthPage({ initialMode = 'login', onAuthSuccess, onBackToDashboard }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your confirmation.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        const response = await registerUser({ email, password, confirmPassword });
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          onAuthSuccess(response.user, response.token);
        }, 600);
      } else {
        const response = await loginUser({ email, password });
        setSuccessMessage('Signed in successfully! Redirecting...');
        setTimeout(() => {
          onAuthSuccess(response.user, response.token);
        }, 600);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12" id="auth-page-container">
      <div className="w-full max-w-md">
        {/* Back navigation button */}
        <button
          onClick={onBackToDashboard}
          id="btn-back-to-dashboard"
          className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-cyan-400 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Threat Scanner</span>
        </button>

        {/* Auth Card */}
        <div className="p-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/80">
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-950/60">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'PhishGuard Sign In' : 'Create PhishGuard Account'}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {mode === 'login'
                ? 'Sign in to access protected cybersecurity features'
                : 'Register for token-authenticated URL threat scanning'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 mb-6 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              id="tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2 rounded-md transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-2 rounded-md transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error & Success Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2" id="auth-error-alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start space-x-2" id="auth-success-alert">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="form-auth">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5" htmlFor="auth-email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@security.org"
                  required
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5" htmlFor="auth-password">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-50"
                />
              </div>
              {mode === 'register' && (
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Minimum 6 characters with secure bcrypt hashing
                </span>
              )}
            </div>

            {/* Confirm Password Field (Register Mode Only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5" htmlFor="auth-confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm rounded-lg shadow-lg shadow-cyan-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Register Account'}</span>
              )}
            </button>
          </form>

          {/* Footer Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500 font-mono flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>JWT authentication • bcryptjs hashing</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
