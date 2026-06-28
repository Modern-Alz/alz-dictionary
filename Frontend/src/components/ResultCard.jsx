import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Sparkles,
  Languages,
  ScrollText,
  Info,
} from 'lucide-react';
import { speak, isSpeechSupported } from '../services/speech';

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-azure-500 dark:text-gilt-300">
      <Icon size={14} />
      {children}
    </div>
  );
}

function Chip({ children, tone = 'azure' }) {
  const tones = {
    azure: 'border-azure-200 bg-azure-50 text-azure-600 dark:border-azure-900 dark:bg-azure-900/40 dark:text-azure-200',
    gilt: 'border-gilt-200 bg-gilt-50 text-gilt-900 dark:border-gilt-900 dark:bg-gilt-900/40 dark:text-gilt-200',
    neutral: 'border-cream-300 bg-cream-100 text-ink-700 dark:border-ink-800 dark:bg-surface-darkAlt dark:text-ink-100',
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function TranslationGrid({ translations, term }) {
  const [open, setOpen] = useState(null);
  const entries = Object.entries(translations || {}).filter(([, v]) => v);
  if (!entries.length) return null;

  return (
    <div>
      <SectionLabel icon={Languages}>Translation</SectionLabel>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {entries.map(([lang, value], i) => {
          return (
            <motion.button
              key={lang}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setOpen(open === lang ? null : lang)}
              className="flex flex-col gap-1 rounded-xl border border-cream-300 bg-cream-50 px-3.5 py-2.5 text-left transition-colors hover:border-azure-300 dark:border-ink-800 dark:bg-surface-darkAlt dark:hover:border-gilt-400"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-300">{lang}</span>
                {isSpeechSupported() && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Play pronunciation in ${lang}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const code = LANG_SPEECH[lang] || 'en-US';
                      speak(value, code);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        const code = LANG_SPEECH[lang] || 'en-US';
                        speak(value, code);
                      }
                    }}
                    className="rounded-full p-1 text-ink-300 hover:text-azure-500 dark:hover:text-gilt-300"
                  >
                    <Volume2 size={14} />
                  </span>
                )}
              </div>
              <span className="font-display text-sm text-ink-700 dark:text-ink-50">{value}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

const LANG_SPEECH = {
  French: 'fr-FR',
  Spanish: 'es-ES',
  Portuguese: 'pt-PT',
  German: 'de-DE',
  Arabic: 'ar-SA',
  'Chinese (Simplified)': 'zh-CN',
  Yoruba: 'en-US',
  Hausa: 'en-US',
  Igbo: 'en-US',
  'Nigerian Pidgin': 'en-US',
};

export default function ResultCard({ result, saved, onToggleSave, index = 0 }) {
  if (!result) return null;
  const isWord = result.type === 'word';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="card-surface w-full rounded-3xl p-4 shadow-card transition-shadow hover:shadow-lifted dark:shadow-card-dark dark:hover:shadow-lifted-dark sm:p-7"
    >
      {/* Header */}
      <header className="mb-4 flex items-start justify-between gap-2 sm:mb-5 sm:gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2
              key={result.term}
              className="font-display text-xl font-semibold capitalize text-ink-700 dark:text-ink-50 sm:text-3xl animate-fade-up"
            >
              {result.term}
            </h2>
            {result.partsOfSpeech?.map((p) => (
              <Chip key={p} tone="gilt">
                {p}
              </Chip>
            ))}
            {!isWord && (
              <Chip tone="azure">{result.category || 'phrase'}</Chip>
            )}
          </div>
          {isWord && result.phonetic && (
            <p className="font-mono text-sm text-ink-300">{result.phonetic}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isSpeechSupported() && (
            <button
              type="button"
              onClick={() => speak(result.term, result.audioLang || 'en-US')}
              aria-label={`Hear pronunciation of ${result.term}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-azure-500 shadow-soft transition-all hover:shadow-glow-blue dark:border-ink-800 dark:bg-surface-darkAlt dark:text-gilt-300 dark:hover:shadow-glow-gold sm:h-10 sm:w-10"
            >
              <Volume2 size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={saved ? 'Remove from saved words' : 'Save word'}
            aria-pressed={saved}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-azure-500 shadow-soft transition-all hover:shadow-glow-blue dark:border-ink-800 dark:bg-surface-darkAlt dark:text-gilt-300 dark:hover:shadow-glow-gold"
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </header>

      {isWord ? (
        <div className="space-y-6">
          {/* Definitions */}
          {!!result.definitions?.length && (
            <div>
              <SectionLabel icon={BookOpen}>Definitions</SectionLabel>
              <ol className="space-y-2 sm:space-y-3">
                {result.definitions.map((d, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="rounded-2xl border border-cream-300 bg-cream-50/60 p-3 dark:border-ink-800 dark:bg-surface-darkAlt/60 sm:p-3.5"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-azure-500 text-[11px] font-bold text-cream-50 dark:bg-gilt-400 dark:text-ink-900">
                        {i + 1}
                      </span>
                      {d.partOfSpeech && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-ink-300">
                          {d.partOfSpeech}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-700 dark:text-ink-50">{d.meaning}</p>
                    {d.example && (
                      <p className="mt-1.5 text-sm italic text-ink-300">“{d.example}”</p>
                    )}
                  </motion.li>
                ))}
              </ol>
            </div>
          )}

          {/* Vocabulary enhancement */}
          {result.vocabulary && (
            <div>
              <SectionLabel icon={Sparkles}>Vocabulary enhancement</SectionLabel>
              <div className="space-y-3">
                {!!result.vocabulary.synonyms?.length && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-ink-300">Synonyms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.vocabulary.synonyms.map((s) => (
                        <Chip key={s} tone="azure">
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                {!!result.vocabulary.antonyms?.length && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-ink-300">Antonyms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.vocabulary.antonyms.map((s) => (
                        <Chip key={s} tone="neutral">
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                {!!result.vocabulary.related?.length && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-ink-300">Related words</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.vocabulary.related.map((s) => (
                        <Chip key={s} tone="gilt">
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                {result.vocabulary.tip && (
                  <div className="flex items-start gap-2 rounded-2xl border border-gilt-200 bg-gilt-50 p-3 text-sm text-ink-700 dark:border-gilt-900 dark:bg-gilt-900/30 dark:text-ink-50">
                    <Info size={16} className="mt-0.5 shrink-0 text-gilt-500 dark:text-gilt-300" />
                    <p>{result.vocabulary.tip}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <TranslationGrid translations={result.translations} term={result.term} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Meaning */}
          {result.meaning && (
            <div>
              <SectionLabel icon={BookOpen}>Meaning</SectionLabel>
              <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-50">{result.meaning}</p>
            </div>
          )}

          {/* Usage */}
          {result.usage && (
            <div>
              <SectionLabel icon={Info}>Usage</SectionLabel>
              <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-50">{result.usage}</p>
            </div>
          )}

          {/* Examples */}
          {!!result.examples?.length && (
            <div>
              <SectionLabel icon={ScrollText}>Examples</SectionLabel>
              <ul className="space-y-2">
                {result.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-cream-300 bg-cream-50/60 p-3 text-sm italic text-ink-700 dark:border-ink-800 dark:bg-surface-darkAlt/60 dark:text-ink-50"
                  >
                    “{ex}”
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Origin */}
          {result.origin && (
            <div>
              <SectionLabel icon={Sparkles}>Origin</SectionLabel>
              <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-50">{result.origin}</p>
            </div>
          )}

          <TranslationGrid translations={result.translations} term={result.term} />
        </div>
      )}
    </motion.article>
  );
}
