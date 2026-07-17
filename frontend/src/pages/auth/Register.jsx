import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import FloatingInput from '../../components/common/FloatingInput.jsx';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter.jsx';

const CURRENCY_OPTIONS = [
  { code: '$ USD', label: 'USD ($) - United States Dollar' },
  { code: '€ EUR', label: 'EUR (€) - Euro' },
  { code: '£ GBP', label: 'GBP (£) - British Pound' },
  { code: '₹ INR', label: 'INR (₹) - Indian Rupee' },
  { code: '¥ JPY', label: 'JPY (¥) - Japanese Yen' },
  { code: 'CA$ CAD', label: 'CAD (CA$) - Canadian Dollar' },
  { code: 'A$ AUD', label: 'AUD (A$) - Australian Dollar' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    currency: '$ USD',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleAutofillSample = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData({
      displayName: `Elena Rostova • Portfolio ${randomNum}`,
      email: `elena.${randomNum}@coffer.app`,
      password: 'password123',
      currency: '$ USD',
    });
    setErrors({});
    setServerError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await register(formData.email, formData.password, formData.displayName, formData.currency);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-canvas">
      {/* Left Column - Brand Editorial Panel */}
      <div className="hidden lg:flex lg:col-span-5 bg-ink text-canvas p-12 flex-col justify-between border-r border-border/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center font-mono font-bold text-xs text-white">
              C
            </div>
            <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase text-ink-muted">
              COFFER VAULT
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12">
          <h1 className="font-fraunces text-4xl xl:text-5xl font-light leading-[1.15] tracking-tight mb-6 text-canvas">
            Quiet precision for the modern treasury.
          </h1>
          <p className="text-ink-muted text-base leading-relaxed font-sans max-w-md">
            No spreadsheets, no clutter, no pastel cartoon avatars. Track accounts, categorize expenses, and monitor monthly budgets with surgical clarity.
          </p>
        </div>

        <div className="relative z-10 text-xs font-mono text-ink-muted flex justify-between border-t border-border/10 pt-6">
          <span>COFFER v1.0 • LOCAL DEV</span>
          <span>ZERO SPREADSHEET FRICTION</span>
        </div>

        {/* Subtle geometric background accents */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-border/10 pointer-events-none" />
        <div className="absolute top-1/4 -right-12 w-64 h-64 rounded-full bg-brand/5 pointer-events-none blur-3xl" />
      </div>

      {/* Right Column - Form Panel */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center font-mono font-bold text-xs text-white">
              C
            </div>
            <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase text-ink">
              COFFER VAULT
            </span>
          </div>

          <div className="mb-6">
            <h2 className="font-fraunces text-3xl font-medium tracking-tight text-ink mb-2">
              Create your ledger
            </h2>
            <p className="text-sm text-ink-muted font-sans">
              Enter your credentials to set up your personal workspace.
            </p>
          </div>

          {/* Quick Autofill Test Box */}
          <div className="mb-6 p-4 rounded-xl bg-brand/5 border border-brand/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span> Quick Sample Registration
              </span>
              <button
                type="button"
                onClick={handleAutofillSample}
                className="text-xs font-sans font-medium text-ink-muted hover:text-brand underline underline-offset-2 transition-colors"
              >
                Autofill test profile
              </button>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Instantly generate realistic credentials (`elena.***@coffer.app`) to test initial account setup and category customization.
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 rounded-lg bg-negative/10 border border-negative/30 text-negative text-sm font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FloatingInput
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              error={errors.displayName}
              required
            />

            <FloatingInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <FloatingInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <PasswordStrengthMeter password={formData.password} />

            <div className="mb-6">
              <label htmlFor="currency" className="block text-xs font-medium uppercase tracking-wider text-ink-muted mb-2">
                Primary Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm text-ink font-sans focus:outline-none focus:border-brand transition-colors duration-200"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-muted">
                You can add multi-currency accounts anytime from settings.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-light text-white font-medium py-3.5 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 text-sm font-sans flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Configuring Ledger...</span>
                </>
              ) : (
                <span>Initialize Coffer</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-ink-muted">
              Already have an active ledger?{' '}
              <Link to="/login" className="font-medium text-ink hover:text-brand transition-colors duration-200 underline underline-offset-4">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
