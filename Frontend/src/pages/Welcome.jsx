import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn, Sparkles, BookOpen, Languages, Volume2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GlowOrb from '../components/GlowOrb';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

const FEATURES = [
  { icon: BookOpen,  text: 'Clear definitions anyone can understand' },
  { icon: Volume2,   text: 'Audio pronunciation for every word' },
  { icon: Languages, text: 'Translate to Yoruba, Hausa, Igbo & more' },
  { icon: Sparkles,  text: 'AI-powered vocabulary building' },
];

export default function Welcome() {
  const { user, ready } = useAuth();
  if (ready && user) return <Navigate to="/home" replace />;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream-100 px-6 py-12 dark:bg-ink-900">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 animate-float rounded-full bg-azure-300/25 blur-3xl dark:bg-azure-800/30" />
      <div className="pointer-events-none absolute -bottom-20 -right-24 h-96 w-96 animate-float rounded-full bg-gilt-300/25 blur-3xl dark:bg-gilt-900/25" style={{ animationDelay: '3s' }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-azure-200/15 blur-3xl dark:bg-azure-900/20" />

      {/* Top bar */}
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
        <Logo size={30} />
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-col items-center text-center">
        {/* Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlowOrb size={110} className="mb-6" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="font-display text-4xl font-semibold tracking-tight text-ink-700 dark:text-ink-50 sm:text-5xl"
        >
          ALZ{' '}
          <span className="text-azure-500 dark:text-gilt-300">Dictionary</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-3 text-base leading-relaxed text-ink-500 dark:text-ink-200"
        >
          The AI dictionary that explains every word simply — like a great teacher would.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-col gap-2.5 w-full"
        >
          {FEATURES.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.44 + i * 0.08 }}
              className="flex items-center gap-3 rounded-2xl border border-cream-300 bg-cream-50/80 px-4 py-2.5 text-left shadow-soft dark:border-ink-800 dark:bg-surface-darkAlt/80"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-azure-50 dark:bg-azure-900/30">
                <Icon size={15} className="text-azure-500 dark:text-gilt-300" />
              </div>
              <span className="text-sm text-ink-600 dark:text-ink-100">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72 }}
          className="mt-8 flex w-full flex-col gap-3"
        >
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-azure-500 px-6 py-3.5 text-sm font-semibold text-cream-50 shadow-glow-blue transition-transform hover:scale-[1.02] dark:bg-gilt-400 dark:text-ink-900 dark:shadow-glow-gold"
          >
            Get started for free
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-6 py-3.5 text-sm font-semibold text-ink-700 shadow-soft transition-colors hover:border-azure-300 dark:border-ink-800 dark:bg-surface-darkAlt dark:text-ink-50 dark:hover:border-gilt-400"
          >
            <LogIn size={16} />
            I already have an account
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-5 text-xs text-ink-200 dark:text-ink-300"
        >
          Free to use · No credit card needed
        </motion.p>
      </div>
    </div>
  );
}
