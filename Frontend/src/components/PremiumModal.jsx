import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Sparkles, Check, Zap } from 'lucide-react';
import { PREMIUM_PRICE_NGN, PREMIUM_PRICE_USD } from '../services/storage';

const PERKS = [
  'Unlimited searches every day',
  'No ads — ever',
  'All languages + translations',
  'Voice pronunciation for every word',
  'Save unlimited words to your list',
  'Priority on the fastest AI model',
];

export default function PremiumModal({ open, onClose, onUpgrade }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink-900/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md overflow-hidden rounded-3xl bg-cream-50 shadow-lifted dark:bg-surface-dark sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8"
          >
            {/* Gold header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gilt-400 to-gilt-500 px-6 py-7 text-ink-900">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-1.5 text-ink-900/60 hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/30 shadow-inner">
                  <Crown size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Upgrade to</p>
                  <h2 className="font-display text-2xl font-bold">ALZ Premium</h2>
                </div>
              </div>

              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-4xl font-bold">₦{PREMIUM_PRICE_NGN.toLocaleString()}</span>
                <span className="mb-1 text-sm opacity-70">/ month</span>
                <span className="mb-1 ml-2 rounded-full bg-white/25 px-2 py-0.5 text-xs font-medium">
                  ≈ ${PREMIUM_PRICE_USD}
                </span>
              </div>
            </div>

            {/* Perks list */}
            <div className="px-6 py-5">
              <ul className="space-y-2.5">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-sm text-ink-700 dark:text-ink-50">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gilt-100 dark:bg-gilt-900/40">
                      <Check size={12} className="text-gilt-600 dark:text-gilt-300" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onUpgrade}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gilt-400 px-6 py-3.5 font-semibold text-ink-900 shadow-glow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap size={17} />
                Upgrade now — ₦{PREMIUM_PRICE_NGN.toLocaleString()}/month
              </button>

              <p className="mt-3 text-center text-xs text-ink-300">
                Cancel anytime. No hidden charges.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
