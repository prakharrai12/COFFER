import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext.jsx';
import FloatingInput from '../../components/common/FloatingInput.jsx';
import AnimatedGradient from '../../components/ui/animated-gradient';
import FeatureBento from '../../components/ui/feature-bento';
import Footer from '../../components/ui/footer-section';

const Login = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleDemoLogin = async () => {
    setSubmitting(true);
    setServerError('');
    try {
      if (demoLogin) {
        await demoLogin();
      } else {
        await login('demo@coffer.app', 'password123');
      }
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Failed to enter demo treasury.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutofillDemo = () => {
    setFormData({ email: 'demo@coffer.app', password: 'password123' });
    setErrors({});
    setServerError('');
  };

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
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-canvas text-ink relative overflow-hidden">
        {/* Left Column - Brand Editorial Panel with AnimatedGradient */}
        <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden">
          {/* WebGL animated gradient background */}
          <AnimatedGradient
            config={{ preset: "Vault", speed: 6 }}
            noise={{ opacity: 0.08, scale: 1 }}
          />

          {/* Content layer — sits above the gradient */}
          <div className="relative z-10 h-full w-full flex flex-col justify-between p-12 text-canvas">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center font-mono font-bold text-xs text-white shadow-[0_0_15px_rgba(63,163,127,0.4)] border border-white/20">
                  C
                </div>
                <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase text-white/80">
                  COFFER VAULT
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="my-auto py-12"
            >
              <h1 className="font-fraunces text-4xl xl:text-5xl font-light leading-[1.15] tracking-tight mb-6 text-white drop-shadow-sm">
                Return to your financial command center.
              </h1>
              <p className="text-white/70 text-base leading-relaxed font-sans max-w-md backdrop-blur-xs p-4 rounded-xl bg-black/20 border border-white/10">
                Review live net worth, inspect monthly budget limits, and audit transaction records with sub-3 second aggregation precision.
              </p>
            </motion.div>

            <div className="text-xs font-mono text-white/50 flex justify-between border-t border-white/10 pt-6">
              <span>COFFER v2.5 • LOCAL DEV</span>
              <span>SECURE HTTP-ONLY SESSIONS</span>
            </div>
          </div>
        </div>

        {/* Right Column - Form Panel with Glassmorphism */}
        <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Mobile brand header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center font-mono font-bold text-xs text-white shadow-sm border border-white/20">
                C
              </div>
              <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase text-ink">
                COFFER VAULT
              </span>
            </div>

            <div className="mb-6">
              <h2 className="font-fraunces text-3xl font-medium tracking-tight text-white mb-2">
                Sign in to Coffer
              </h2>
              <p className="text-sm text-ink-muted font-sans">
                Enter your email and password to access your accounts.
              </p>
            </div>

            {/* Quick Sign In Demo User Box */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brand/10 to-brand-light/10 border border-brand/30 backdrop-blur-md shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-brand-light uppercase tracking-wider flex items-center gap-1.5">
                  <span className="animate-pulse">⚡</span> Quick Demo Access
                </span>
                <button
                  type="button"
                  onClick={handleAutofillDemo}
                  className="text-xs font-sans font-medium text-ink-muted hover:text-brand-light underline underline-offset-2 transition-colors"
                >
                  Autofill credentials
                </button>
              </div>
              <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                Experience the full personal finance tracker with pre-seeded accounts (`$22,069.50 Net Worth`), budgets, and 10+ categorized transactions.
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDemoLogin}
                disabled={submitting}
                className="w-full glass-btn-secondary font-medium py-2.5 px-4 rounded-lg text-xs font-sans transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>🚀 Sign in instantly as Demo User (Alex Mercer)</span>
              </motion.button>
            </motion.div>

            {serverError && (
              <div className="mb-6 p-4 rounded-lg bg-negative/20 border border-negative/40 text-negative text-sm font-medium backdrop-blur-md">
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

              <div className="relative">
                <FloatingInput
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-ink-muted hover:text-white transition-colors text-xs font-mono font-medium px-2 py-1 rounded-md bg-white/10 border border-white/15 backdrop-blur-md"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              <div className="flex justify-end mb-6 -mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-ink-muted hover:text-brand-light transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="w-full glass-btn text-white font-medium py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 text-sm font-sans flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Access Ledger</span>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-ink-muted">
                Don't have a Coffer account yet?{' '}
                <Link to="/register" className="font-medium text-white hover:text-brand-light transition-colors duration-200 underline underline-offset-4">
                  Initialize new ledger
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marketing sections — scrollable landing below the auth fold */}
      <FeatureBento />
      <Footer />
    </>
  );
};

export default Login;
