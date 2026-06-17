import { useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder ad banners — swap the content array with real ad network tags
// (Google AdSense, AdMob, etc.) when you're ready to monetize.
const ADS = [
  {
    id: 1,
    label: 'Sponsored',
    headline: 'Learn faster with ALZ Premium',
    body: 'Unlimited searches, no ads, all languages. Just ₦11,200/month.',
    cta: 'Upgrade',
    bg: 'from-azure-50 to-cream-100 dark:from-azure-900/30 dark:to-ink-800',
    accent: 'text-azure-600 dark:text-azure-200',
  },
  {
    id: 2,
    label: 'Sponsored',
    headline: 'Boost your vocabulary every day',
    body: 'ALZ Premium — unlimited words, zero interruptions.',
    cta: 'Try Premium',
    bg: 'from-gilt-50 to-cream-100 dark:from-gilt-900/30 dark:to-ink-800',
    accent: 'text-gilt-700 dark:text-gilt-200',
  },
];

export default function AdBanner({ onUpgradeClick }) {
  const [dismissed, setDismissed] = useState(false);
  const ad = ADS[Math.floor(Math.random() * ADS.length)];

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${ad.bg} border border-cream-300 dark:border-ink-800`}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 dark:bg-ink-800/60">
              <Megaphone size={15} className={ad.accent} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-300">
                  {ad.label}
                </span>
              </div>
              <p className={`text-xs font-semibold ${ad.accent}`}>{ad.headline}</p>
              <p className="text-xs text-ink-300 leading-snug">{ad.body}</p>
            </div>
            <button
              type="button"
              onClick={onUpgradeClick}
              className="shrink-0 rounded-full bg-gilt-400 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-glow-gold transition-transform hover:scale-105"
            >
              {ad.cta}
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss ad"
              className="shrink-0 rounded-full p-1 text-ink-200 hover:text-ink-400"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
