import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Mic, MicOff, X, History, ChevronRight,
  AlertCircle, Wifi, Clock, Crown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  apiSearch, apiGetQuota, apiGetHistory,
  apiSaveWord, apiUnsaveWord, apiGetSaved,
} from '../services/api';
import { getWordOfTheDay } from '../data/wordOfDay';
import { SUGGESTIONS } from '../data/suggestions';
import GlowOrb from '../components/GlowOrb';
import ThinkingDots from '../components/ThinkingDots';
import SuggestionChip from '../components/SuggestionChip';
import WordOfDayCard from '../components/WordOfDayCard';
import ResultCard from '../components/ResultCard';
import AdBanner from '../components/AdBanner';
import PremiumModal from '../components/PremiumModal';

const wordOfDay = getWordOfTheDay();

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ errorCode, message, onUpgrade }) {
  if (errorCode === 'QUOTA_EXCEEDED') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gilt-200 bg-gilt-50 p-4 dark:border-gilt-900 dark:bg-gilt-900/20">
        <div className="flex items-start gap-3">
          <Clock size={18} className="mt-0.5 shrink-0 text-gilt-600 dark:text-gilt-300" />
          <div>
            <p className="text-sm font-medium text-gilt-900 dark:text-gilt-200">
              You've used all your free searches for today. Please try again tomorrow.
            </p>
            <button type="button" onClick={onUpgrade}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gilt-400 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-glow-gold hover:opacity-90">
              <Crown size={12} /> Upgrade to Premium — ₦11,200/month
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  if (errorCode === 'NETWORK_ERROR') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-300">
          <Wifi size={18} className="shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
      <div className="flex items-center gap-3 text-red-600 dark:text-red-300">
        <AlertCircle size={18} className="shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </motion.div>
  );
}

// ─── Quota bar ────────────────────────────────────────────────────────────────
function QuotaBar({ used, limit }) {
  if (!limit) return null;
  const pct      = Math.min(100, Math.round((used / limit) * 100));
  const barColor = pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-gilt-400' : 'bg-azure-400';
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200 dark:bg-ink-800">
        <motion.div className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }} />
      </div>
      <span className="text-xs text-ink-300 tabular-nums">{used}/{limit} free today</span>
    </div>
  );
}

// ─── Multi-color glow ring ────────────────────────────────────────────────────
function SearchGlowRing({ active }) {
  return (
    <div className={`absolute -inset-0.5 rounded-[28px] transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-azure-400 via-gilt-300 to-azure-500 opacity-70 blur-md animate-spin-slow" />
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const [query,         setQuery]         = useState('');
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [errorCode,     setErrorCode]     = useState('');
  const [savedTerms,    setSavedTerms]    = useState(new Set());
  const [history,       setHistory]       = useState([]);
  const [showHistory,   setShowHistory]   = useState(false);
  const [listening,     setListening]     = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [quota,         setQuota]         = useState({ used: 0, limit: 10, isPremium: false });
  const [premiumOpen,   setPremiumOpen]   = useState(false);
  // Pipeline status — shows the user what's happening
  const [pipelineStep,  setPipelineStep]  = useState(''); // 'dictionary' | 'ai' | ''

  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);
  const firstName      = user?.fullName?.split(' ')[0] || 'there';
  const userIsPremium  = user?.plan === 'premium' && user?.premiumUntil && new Date(user.premiumUntil) > new Date();

  // Load quota + history + saved words on mount
  useEffect(() => {
    if (!user) return;
    apiGetQuota().then((q) => setQuota(q)).catch(() => {});
    apiGetHistory().then(({ history: h }) => setHistory(h)).catch(() => {});
    apiGetSaved().then(({ saved }) => {
      setSavedTerms(new Set(saved.map((w) => w.term.toLowerCase())));
    }).catch(() => {});
  }, [user]);

  // Voice search
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = false;
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setQuery(t); setListening(false); runSearch(t); };
    rec.onerror  = () => setListening(false);
    rec.onend    = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const runSearch = useCallback(async (term) => {
    const trimmed = (term ?? query).trim();
    if (!trimmed) return;

    setError(''); setErrorCode(''); setResult(null);
    setLoading(true); setShowHistory(false);

    try {
      // Step 1 — show "Looking it up in dictionary…"
      setPipelineStep('dictionary');
      // Small yield so React paints the label before fetch blocks
      await new Promise((r) => setTimeout(r, 30));

      // Step 2 — show "ALZ is thinking…" while AI rewrites
      setPipelineStep('ai');

      const { result: res, quota: q } = await apiSearch(trimmed);

      setResult(res);
      setQuota(q);

      // Refresh history + saved
      apiGetHistory().then(({ history: h }) => setHistory(h)).catch(() => {});

    } catch (err) {
      const code = err.code || 'SERVICE_ERROR';
      setErrorCode(code);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setPipelineStep('');
    }
  }, [query]);

  function handleKeyDown(e) {
    if (e.key === 'Enter')  runSearch();
    if (e.key === 'Escape') { setQuery(''); setShowHistory(false); }
  }

  function toggleMic() {
    if (!recognitionRef.current) return;
    if (listening) { recognitionRef.current.stop(); setListening(false); }
    else           { recognitionRef.current.start(); setListening(true); }
  }

  async function handleToggleSave() {
    if (!user || !result) return;
    const term = result.term.toLowerCase();
    if (savedTerms.has(term)) {
      await apiUnsaveWord(term).catch(() => {});
      setSavedTerms((s) => { const n = new Set(s); n.delete(term); return n; });
    } else {
      await apiSaveWord(term, result.type).catch(() => {});
      setSavedTerms((s) => new Set([...s, term]));
    }
  }

  const hasResult    = !!result && !loading;
  const ringActive   = searchFocused || !!query;
  const isSaved      = result ? savedTerms.has(result.term?.toLowerCase()) : false;

  // Pipeline loading label
  const loadingLabel = pipelineStep === 'dictionary'
    ? 'Looking it up in the dictionary…'
    : 'ALZ is thinking…';

  return (
    <div className="flex flex-col gap-4 sm:gap-6">

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-700 dark:text-ink-50 sm:text-3xl lg:text-4xl">
          Hello, <span className="sweep-text">{firstName}</span> 👋
        </h1>
        <p className="mt-1 text-xs text-ink-300 sm:text-sm">
          {userIsPremium ? "You're on Premium — unlimited searches, no ads." : 'What word would you like to explore today?'}
        </p>
        {userIsPremium && (
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gilt-100 px-2.5 py-0.5 text-xs font-semibold text-gilt-700 dark:bg-gilt-900/40 dark:text-gilt-300">
            <Crown size={12} /> Premium
          </span>
        )}
      </motion.div>

      {/* ── Big Search section ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="relative">
        <SearchGlowRing active={ringActive} />

        <div className="relative z-10 overflow-hidden rounded-[24px] border border-cream-300 bg-cream-50 shadow-[0_8px_32px_rgba(30,42,56,0.10)] transition-all duration-300 dark:border-ink-800 dark:bg-surface-dark">

          {/* Input row */}
          <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors sm:h-10 sm:w-10 ${ringActive ? 'bg-azure-500 text-cream-50 dark:bg-gilt-400 dark:text-ink-900' : 'bg-cream-200 text-ink-300 dark:bg-ink-800'}`}>
              <Search size={17} className="sm:h-[19px] sm:w-[19px]" />
            </div>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowHistory(e.target.value === '' && history.length > 0); }}
              onFocus={() => { setSearchFocused(true); if (!query && history.length) setShowHistory(true); }}
              onBlur={() => { setSearchFocused(false); setTimeout(() => setShowHistory(false), 150); }}
              onKeyDown={handleKeyDown}
              placeholder="Search a word or phrase…"
              aria-label="Search dictionary"
              className="flex-1 bg-transparent text-sm font-medium text-ink-700 outline-none placeholder:font-normal placeholder:text-ink-200 dark:text-ink-50 sm:text-base"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResult(null); setError(''); inputRef.current?.focus(); }}
                aria-label="Clear" className="shrink-0 rounded-full p-1 text-ink-300 hover:bg-cream-200 hover:text-ink-500 dark:hover:bg-ink-800 sm:p-1.5">
                <X size={16} />
              </button>
            )}
            <button type="button" onClick={toggleMic}
              aria-label={listening ? 'Stop voice' : 'Voice search'} aria-pressed={listening}
              className={`shrink-0 rounded-full p-1.5 transition-all sm:p-2 ${listening ? 'animate-pulse bg-red-100 text-red-500 dark:bg-red-900/30' : 'text-ink-300 hover:bg-cream-200 hover:text-azure-500 dark:hover:bg-ink-800 dark:hover:text-gilt-300'}`}>
              {listening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
          </div>

          {/* Search button */}
          <div className="border-t border-cream-200 px-3 py-2.5 dark:border-ink-800 sm:px-5 sm:py-3.5">
            <button type="button" onClick={() => runSearch()} disabled={!query.trim() || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-azure-500 py-2.5 text-sm font-semibold text-cream-50 shadow-glow-blue transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 dark:bg-gilt-400 dark:text-ink-900 dark:shadow-glow-gold sm:py-3">
              <Search size={16} />
              {loading ? loadingLabel : 'Search ALZ Dictionary'}
            </button>
          </div>

          {/* History dropdown */}
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full z-20 overflow-hidden rounded-b-2xl border border-t-0 border-cream-300 bg-cream-50/98 shadow-lifted backdrop-blur dark:border-ink-800 dark:bg-surface-dark/98">
                <p className="px-5 pt-3 text-xs font-semibold uppercase tracking-wider text-ink-300">Recent</p>
                {history.map((term, i) => (
                  <button key={i} type="button" onMouseDown={() => { setQuery(term); runSearch(term); }}
                    className="flex w-full items-center gap-3 px-5 py-2.5 text-sm text-ink-700 hover:bg-cream-100 dark:text-ink-50 dark:hover:bg-ink-800">
                    <History size={14} className="text-ink-300" />
                    {term}
                    <ChevronRight size={14} className="ml-auto text-ink-200" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quota bar */}
      {!userIsPremium && (
        <QuotaBar used={quota.used} limit={quota.limit} />
      )}

      {/* Suggestion chips */}
      {!hasResult && !loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-1.5 sm:gap-2">
          {SUGGESTIONS.map((s, i) => (
            <SuggestionChip key={s.label} {...s} index={i} onClick={() => { setQuery(s.query); runSearch(s.query); }} />
          ))}
        </motion.div>
      )}

      {/* Loading with pipeline step label */}
      <AnimatePresence>
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-6 sm:gap-4 sm:py-10">
            <GlowOrb size={72} busy />
            <ThinkingDots label={loadingLabel} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorBanner errorCode={errorCode} message={error} onUpgrade={() => setPremiumOpen(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad banner for free users */}
      {hasResult && !userIsPremium && (
        <AdBanner onUpgradeClick={() => setPremiumOpen(true)} />
      )}

      {/* Result */}
      <AnimatePresence>
        {hasResult && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultCard result={result} saved={isSaved} onToggleSave={handleToggleSave} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word of the Day */}
      {!hasResult && !loading && !error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <WordOfDayCard word={wordOfDay} onExplore={(term) => { setQuery(term); runSearch(term); }} />
        </motion.div>
      )}

      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onUpgrade={async () => {
          setPremiumOpen(false);
          try {
            const { authorizationUrl } = await apiInitPayment();
            window.location.href = authorizationUrl;
          } catch {
            alert('Could not start payment. Please try again.');
          }
        }}
      />
    </div>
  );
}
