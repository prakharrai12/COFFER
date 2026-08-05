import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api.js';
import FloatingInput from '../../components/common/FloatingInput.jsx';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter.jsx';
import AnimatedGradient from '../../components/ui/animated-gradient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters.';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setServerError('Invalid or missing recovery token. Please request a new link.');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await api.post('/auth/reset-password', { token, newPassword: formData.newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setServerError(err.message || 'Failed to reset password. The token may be expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-canvas">
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden">
        <AnimatedGradient config={{ preset: "Vault", speed: 6 }} noise={{ opacity: 0.08, scale: 1 }} />

        <div className="relative z-10 h-full w-full flex flex-col justify-between p-12 text-canvas">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand flex items-center justify-center font-mono font-bold text-xs text-white">
                C
              </div>
              <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase text-canvas/60">
                COFFER VAULT
              </span>
            </div>
          </div>

          <div className="my-auto py-12">
            <h1 className="font-fraunces text-4xl xl:text-5xl font-light leading-[1.15] tracking-tight mb-6 text-canvas">
              Establish new passphrase.
            </h1>
            <p className="text-canvas/60 text-base leading-relaxed font-sans max-w-md">
              Choose a strong passphrase with at least 8 characters to restore access and secure encrypted ledger states.
            </p>
          </div>

          <div className="text-xs font-mono text-canvas/40 flex justify-between border-t border-white/10 pt-6">
            <span>COFFER v1.0 • LOCAL DEV</span>
            <span>CREDENTIAL ROTATION</span>
          </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-fraunces text-3xl font-medium tracking-tight text-ink mb-2">
              Set new password
            </h2>
            <p className="text-sm text-ink-muted font-sans">
              Enter and verify your new passphrase below.
            </p>
          </div>

          {!token && !serverError && (
            <div className="mb-6 p-4 rounded-lg bg-negative/10 border border-negative/30 text-negative text-sm font-medium">
              Missing token parameter in URL. Please use the exact link from your email or terminal.
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 rounded-lg bg-negative/10 border border-negative/30 text-negative text-sm font-medium">
              {serverError}
            </div>
          )}

          {success ? (
            <div className="p-6 rounded-lg bg-surface border border-border text-center">
              <div className="w-12 h-12 rounded-full bg-positive/10 text-positive flex items-center justify-center mx-auto mb-4 text-xl">
                ✓
              </div>
              <h3 className="font-fraunces text-xl font-medium text-ink mb-2">
                Password updated
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-6">
                Your passphrase has been securely rotated. Redirecting to sign in momentarily...
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-brand hover:bg-brand-light text-white font-medium py-3 px-4 rounded-lg text-sm text-center transition-colors duration-200"
              >
                Sign in now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="relative">
                <FloatingInput
                  label="New Password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-ink-muted hover:text-ink transition-colors text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-surface/50 border border-border/40"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              <PasswordStrengthMeter password={formData.newPassword} />

              <div className="relative">
                <FloatingInput
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-ink-muted hover:text-ink transition-colors text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-surface/50 border border-border/40"
                >
                  {showConfirmPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || !token}
                className="w-full bg-brand hover:bg-brand-light text-white font-medium py-3.5 px-4 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 text-sm font-sans flex items-center justify-center gap-2 mb-6"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Passphrase...</span>
                  </>
                ) : (
                  <span>Update Passphrase</span>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-ink-muted hover:text-brand transition-colors duration-200 font-medium"
                >
                  ← Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
