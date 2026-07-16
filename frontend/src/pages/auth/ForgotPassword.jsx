import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import FloatingInput from '../../components/common/FloatingInput.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset instructions.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-canvas">
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
            Recover ledger credentials.
          </h1>
          <p className="text-ink-muted text-base leading-relaxed font-sans max-w-md">
            We will dispatch an encrypted reset link directly to your registered email address with a 1-hour expiration window.
          </p>
        </div>

        <div className="relative z-10 text-xs font-mono text-ink-muted flex justify-between border-t border-border/10 pt-6">
          <span>COFFER v1.0 • LOCAL DEV</span>
          <span>SECURITY & RECOVERY</span>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-fraunces text-3xl font-medium tracking-tight text-ink mb-2">
              Reset password
            </h2>
            <p className="text-sm text-ink-muted font-sans">
              Enter your email address to receive recovery instructions.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-negative/10 border border-negative/30 text-negative text-sm font-medium">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="p-6 rounded-lg bg-surface border border-border text-center">
              <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4 text-xl">
                ✓
              </div>
              <h3 className="font-fraunces text-xl font-medium text-ink mb-2">
                Instructions dispatched
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-6">
                If an active account exists for <span className="font-medium text-ink">{email}</span>, a reset link has been sent. Check your inbox or terminal output.
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-surface hover:bg-surface-raised border border-border text-ink font-medium py-3 px-4 rounded-lg text-sm text-center transition-colors duration-200"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <FloatingInput
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                error={error}
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand hover:bg-brand-light text-white font-medium py-3.5 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 text-sm font-sans flex items-center justify-center gap-2 mb-6"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dispatching Link...</span>
                  </>
                ) : (
                  <span>Send Recovery Link</span>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-ink-muted hover:text-brand transition-colors duration-200 font-medium"
                >
                  ← Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
