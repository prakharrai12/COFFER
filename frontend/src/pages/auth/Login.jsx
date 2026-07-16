import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import FloatingInput from '../../components/common/FloatingInput.jsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
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
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
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
            Return to your financial command center.
          </h1>
          <p className="text-ink-muted text-base leading-relaxed font-sans max-w-md">
            Review live net worth, inspect monthly budget limits, and audit transaction records with sub-3 second aggregation precision.
          </p>
        </div>

        <div className="relative z-10 text-xs font-mono text-ink-muted flex justify-between border-t border-border/10 pt-6">
          <span>COFFER v1.0 • LOCAL DEV</span>
          <span>SECURE HTTP-ONLY SESSIONS</span>
        </div>

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

          <div className="mb-8">
            <h2 className="font-fraunces text-3xl font-medium tracking-tight text-ink mb-2">
              Sign in to Coffer
            </h2>
            <p className="text-sm text-ink-muted font-sans">
              Enter your email and password to access your accounts.
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 rounded-lg bg-negative/10 border border-negative/30 text-negative text-sm font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
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

            <div className="flex justify-end mb-6 -mt-2">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-ink-muted hover:text-brand transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-light text-white font-medium py-3.5 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 text-sm font-sans flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Ledger</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-ink-muted">
              Don't have a Coffer account yet?{' '}
              <Link to="/register" className="font-medium text-ink hover:text-brand transition-colors duration-200 underline underline-offset-4">
                Initialize new ledger
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
