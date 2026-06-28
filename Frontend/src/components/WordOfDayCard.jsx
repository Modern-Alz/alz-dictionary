import { motion } from 'framer-motion';
import { Volume2, Sparkles, CalendarDays } from 'lucide-react';
import { speak, isSpeechSupported } from '../services/speech';

export default function WordOfDayCard({ word, onExplore }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-surface relative overflow-hidden rounded-3xl p-4 shadow-card dark:shadow-card-dark sm:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gilt-300/30 blur-2xl dark:bg-azure-400/20" />

      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-azure-500 dark:text-gilt-300">
        <CalendarDays size={14} />
        Word of the day
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold capitalize text-ink-700 dark:text-ink-50 sm:text-3xl">
            {word.term}
          </h3>
          <p className="font-mono text-sm text-ink-300">{word.phonetic}</p>
        </div>
        {isSpeechSupported() && (
          <button
            type="button"
            onClick={() => speak(word.term, 'en-US')}
            aria-label={`Hear pronunciation of ${word.term}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-azure-500 shadow-soft transition-all hover:shadow-glow-blue dark:border-ink-800 dark:bg-surface-darkAlt dark:text-gilt-300 dark:hover:shadow-glow-gold sm:h-10 sm:w-10"
          >
            <Volume2 size={18} />
          </button>
        )}
      </div>

      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-300">{word.partOfSpeech}</p>
      <p className="mt-1 text-sm text-ink-700 dark:text-ink-50">{word.definition}</p>
      <p className="mt-1.5 text-sm italic text-ink-300">“{word.example}”</p>

      <button
        type="button"
        onClick={() => onExplore(word.term)}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-azure-500 px-4 py-2 text-sm font-semibold text-cream-50 shadow-glow-blue transition-transform hover:scale-[1.03] dark:bg-gilt-400 dark:text-ink-900 dark:shadow-glow-gold"
      >
        <Sparkles size={15} />
        Explore with AI
      </button>
    </motion.div>
  );
}
