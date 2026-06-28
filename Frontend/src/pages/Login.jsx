import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

function GlowField({ icon: Icon, label, id, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-100">
          {label}
        </label>
      )}
<<<<<<< HEAD
      <div className={`flex items-center gap-3 rounded-2xl border bg-cream-50 px-4 py-3.5 transition-all duration-300 dark:bg-surface-darkAlt ${
        focused
          ? 'border-azure-400 shadow-[0_0_0_3px_rgba(47,93,159,0.18),0_0_18px_rgba(47,93,159,0.22)] dark:border-gilt-400 dark:shadow-[0_0_0_3px_rgba(240,199,94,0.18),0_0_18px_rgba(240,199,94,0.22)]'
          : 'border-cream-300 dark:border-ink-800'
      }`}>
        {Icon && <Icon size={18} className={`shrink-0 transition-colors ${focused ? 'text-azure-500 dark:text-gilt-300' : 'text-ink-300'}`} />}

        <input
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-200 dark:text-ink-50"
          {...props}
        />
      </div>
    </div>
  );
}

export default function Login() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  if (ready && user) return <Navigate to="/home" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Could not log in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-100 px-4 py-8 dark:bg-ink-900 sm:px-6">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 animate-float rounded-full bg-azure-300/25 blur-3xl dark:bg-azure-800/30" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 animate-float rounded-full bg-gilt-300/25 blur-3xl dark:bg-gilt-900/25"
           style={{ animationDelay: '2.5s' }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Glowing card border */}
        <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-br from-azure-400 via-gilt-300 to-azure-500 opacity-25 blur-sm dark:opacity-35" />

        <div className="relative rounded-3xl border border-cream-300/80 bg-cream-50 shadow-[0_20px_60px_rgba(30,42,56,0.14)] dark:border-ink-800 dark:bg-surface-dark">

          {/* ── TOP BAR: Logo + icon on left, ThemeToggle on right ── */}
          <div className="flex items-center justify-between rounded-t-3xl border-b border-cream-200 bg-cream-100/60 px-5 py-4 dark:border-ink-800 dark:bg-ink-900/40">
            <Logo size={34} withText />
            <ThemeToggle />
          </div>

          {/* ── FORM BODY ── */}
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {/* Welcome heading */}
            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-semibold text-ink-700 dark:text-ink-50 sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-ink-300">
                Log in to continue exploring words.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <GlowField
                id="email" label="Email address" icon={Mail}
                type="email" required placeholder="you@example.com"
                autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordInput
                label="Password" name="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" required
              />

              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-azure-500 px-6 py-3.5 text-sm font-semibold text-cream-50 shadow-glow-blue transition-all disabled:opacity-60 dark:bg-gilt-400 dark:text-ink-900 dark:shadow-glow-gold"
              >
                {loading ? 'Logging in…' : 'Log in'}
                {!loading && <ArrowRight size={16} />}
              </motion.button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-300">
              New to ALZ Dictionary?{' '}
              <Link to="/signup" className="font-semibold text-azure-500 hover:underline dark:text-gilt-300">
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
