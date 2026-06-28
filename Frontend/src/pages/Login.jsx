import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';
import GlowOrb from '../components/GlowOrb';
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
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-cream-50 px-4 py-3.5 transition-all duration-300 dark:bg-surface-darkAlt ${
          focused
            ? 'border-azure-400 shadow-[0_0_0_3px_rgba(47,93,159,0.18),0_0_18px_rgba(47,93,159,0.22)] dark:border-gilt-400 dark:shadow-[0_0_0_3px_rgba(240,199,94,0.18),0_0_18px_rgba(240,199,94,0.2)]'
            : 'border-cream-300 dark:border-ink-800'
        }`}
      >
        {Icon && (
          <Icon size={18} className={`shrink-0 transition-colors ${focused ? 'text-azure-500 dark:text-gilt-300' : 'text-ink-300'}`} />
        )}
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
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-cream-100 dark:bg-ink-900">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 animate-float rounded-full bg-azure-300/30 blur-3xl dark:bg-azure-800/30" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 animate-float rounded-full bg-gilt-300/30 blur-3xl dark:bg-gilt-900/25" style={{ animationDelay: '2.5s' }} />

      {/* Header Container */}
      <div className="relative flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo size={24} withText={false} />
        <div className="flex-1" />
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Glowing border */}
          <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-br from-azure-400 via-gilt-300 to-azure-500 opacity-30 blur-sm dark:opacity-40" />
          <div className="relative rounded-3xl border border-cream-300/80 bg-cream-50 p-5 shadow-[0_20px_60px_rgba(30,42,56,0.14)] dark:border-ink-800 dark:bg-surface-dark sm:p-8">

            <div className="mb-6 flex flex-col items-center text-center">
              <GlowOrb size={56} className="mb-3" />
              <h1 className="font-display text-xl font-semibold text-ink-700 dark:text-ink-50 sm:text-2xl">
                Welcome back
              </h1>
              <p className="mt-2 text-xs text-ink-300 sm:text-sm">
                Log in to continue exploring words.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300 sm:text-sm"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-azure-500 px-6 py-3 text-sm font-semibold text-cream-50 shadow-glow-blue transition-all disabled:opacity-60 sm:py-3.5"
              >
                {loading ? 'Logging in…' : 'Log in'}
                {!loading && <ArrowRight size={16} />}
              </motion.button>
            </form>

            <p className="mt-5 text-center text-xs text-ink-300 sm:mt-6 sm:text-sm">
              New to ALZ Dictionary?{' '}
              <Link to="/signup" className="font-semibold text-azure-500 hover:underline dark:text-gilt-300">
                Create a free account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
