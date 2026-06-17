import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * The ambient "AI orb" — a softly glowing, floating sphere that anchors the
 * home screen, echoing an illuminated word on a page. Pulses gold in light
 * mode and blue in dark mode.
 */
export default function GlowOrb({ size = 88, busy = false, className = '' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-azure-400 via-gilt-300 to-azure-500 opacity-70 blur-xl dark:from-azure-300 dark:via-gilt-400 dark:to-azure-600"
        animate={{ scale: busy ? [1, 1.18, 1] : [1, 1.08, 1] }}
        transition={{ duration: busy ? 1.4 : 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-azure-400 to-azure-600 text-cream-50 shadow-glow-gold dark:shadow-glow-blue animate-glow-pulse"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles size={size * 0.4} className={busy ? 'animate-spin-slow' : ''} />
      </motion.div>
    </div>
  );
}
