import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, Search, BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGetSaved, apiUnsaveWord } from '../services/api';

export default function Saved() {
  const navigate = useNavigate();
  const [words,   setWords]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetSaved()
      .then(({ saved }) => setWords(saved))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(term) {
    await apiUnsaveWord(term).catch(() => {});
    setWords((w) => w.filter((x) => x.term !== term));
  }

  function handleSearch(term) {
    navigate('/home');
    // Small delay so Home mounts before we'd fire search
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('alz:search', { detail: term }));
    }, 150);
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold text-ink-700 dark:text-ink-50 sm:text-4xl">
          Saved <span className="text-azure-500 dark:text-gilt-300">Words</span>
        </h1>
        <p className="mt-1 text-sm text-ink-300">
          {loading ? 'Loading…' : words.length === 0 ? 'No saved words yet.' : `${words.length} word${words.length !== 1 ? 's' : ''} saved`}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-azure-400 dark:text-gilt-300" />
        </div>
      ) : words.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-20 text-center text-ink-300">
          <Bookmark size={48} strokeWidth={1.2} className="opacity-30" />
          <p className="text-sm">Tap the bookmark icon on any result to save a word here.</p>
        </motion.div>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {words.map((w, i) => (
              <motion.li key={w.id} layout
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ delay: i * 0.035 }}
                className="card-surface flex items-center gap-4 rounded-2xl p-4 shadow-soft">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azure-50 dark:bg-azure-900/30">
                  <BookOpen size={18} className="text-azure-500 dark:text-gilt-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base font-semibold capitalize text-ink-700 dark:text-ink-50">{w.term}</p>
                  <p className="text-xs capitalize text-ink-300">{w.type}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => handleSearch(w.term)} aria-label={`Look up ${w.term}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 text-ink-300 transition-colors hover:text-azure-500 dark:border-ink-800 dark:hover:text-gilt-300">
                    <Search size={15} />
                  </button>
                  <button type="button" onClick={() => handleRemove(w.term)} aria-label={`Remove ${w.term}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 text-ink-300 transition-colors hover:border-red-300 hover:text-red-500 dark:border-ink-800">
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
