import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Bookmark, Info, LogOut, Copyright,
  FileText, ChevronRight, Sparkles, Crown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isPremium } from '../../services/storage';
import { ABOUT_US, COPYRIGHT, TERMS, PRIVACY } from '../../data/legal';

// ── Legal document modal ──────────────────────────────────────────────────────
function DocModal({ title, content, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm"
      />
      <motion.div
        key="panel"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="fixed inset-x-3 bottom-3 top-16 z-50 mx-auto flex max-w-lg flex-col overflow-hidden rounded-3xl bg-cream-50 shadow-lifted dark:bg-surface-dark sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-cream-300 px-5 py-4 dark:border-ink-800">
          <h2 className="font-display text-lg font-semibold text-ink-700 dark:text-ink-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-ink-300 hover:bg-cream-200 dark:hover:bg-ink-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="whitespace-pre-line text-sm leading-relaxed text-ink-500 dark:text-ink-200">
            {content}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Dropdown item ─────────────────────────────────────────────────────────────
function DropItem({ icon: Icon, label, onClick, accent = false, to }) {
  const cls = `flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-xl ${
    accent
      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
      : 'text-ink-700 hover:bg-cream-100 dark:text-ink-50 dark:hover:bg-ink-800'
  }`;

  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        <Icon size={17} className={accent ? 'text-red-400' : 'text-azure-500 dark:text-gilt-300'} />
        {label}
        <ChevronRight size={14} className="ml-auto text-ink-200" />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      <Icon size={17} className={accent ? 'text-red-400' : 'text-azure-500 dark:text-gilt-300'} />
      {label}
      <ChevronRight size={14} className="ml-auto text-ink-200" />
    </button>
  );
}

// ── Main dropdown ─────────────────────────────────────────────────────────────
export default function DropdownMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState(null); // { title, content }
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function close() { setOpen(false); }

  function openDoc(title, content) {
    close();
    setDoc({ title, content });
  }

  function handleLogout() {
    close();
    logout();
    navigate('/');
  }

  const userPremium = isPremium(user);

  return (
    <>
      <div ref={ref} className="relative">
        {/* Hamburger trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-700 shadow-soft transition-colors hover:border-azure-300 hover:text-azure-500 dark:border-ink-800 dark:bg-surface-darkAlt dark:text-ink-50 dark:hover:border-gilt-400 dark:hover:text-gilt-300"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'x' : 'menu'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Dropdown panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 top-12 z-40 w-72 overflow-hidden rounded-2xl border border-cream-300 bg-cream-50/95 shadow-lifted backdrop-blur dark:border-ink-800 dark:bg-surface-dark/95"
            >
              {/* User pill */}
              {user && (
                <div className="flex items-center gap-3 border-b border-cream-300 px-4 py-3.5 dark:border-ink-800">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-azure-400 to-azure-600 font-display text-sm font-bold text-cream-50 shadow-glow-blue dark:shadow-glow-gold">
                    {user.fullName?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-700 dark:text-ink-50">{user.fullName}</p>
                    <p className="truncate text-xs text-ink-300">{user.email}</p>
                  </div>
                  {userPremium && (
                    <span className="ml-auto shrink-0 inline-flex items-center gap-1 rounded-full bg-gilt-100 px-2 py-0.5 text-[10px] font-semibold text-gilt-700 dark:bg-gilt-900/40 dark:text-gilt-300">
                      <Crown size={10} /> PRO
                    </span>
                  )}
                </div>
              )}

              {/* Nav items */}
              <div className="p-2">
                <DropItem icon={Bookmark} label="Saved words" to="/saved" onClick={close} />
                <DropItem
                  icon={Info}
                  label="About ALZ Dictionary"
                  onClick={() => openDoc('About ALZ Dictionary', ABOUT_US)}
                />
                <DropItem
                  icon={FileText}
                  label="Terms & Privacy"
                  onClick={() => openDoc('Terms & Privacy', `${TERMS}\n\n─────────────────────\n\n${PRIVACY}`)}
                />
                <DropItem
                  icon={Copyright}
                  label="Copyright"
                  onClick={() => openDoc('Copyright', COPYRIGHT)}
                />
              </div>

              {/* Divider + logout */}
              <div className="border-t border-cream-300 p-2 dark:border-ink-800">
                <DropItem icon={LogOut} label="Log out" onClick={handleLogout} accent />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-1.5 border-t border-cream-200 py-2.5 text-[10px] text-ink-200 dark:border-ink-800">
                <Sparkles size={10} />
                ALZ Dictionary · © {new Date().getFullYear()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legal document modal (rendered outside the dropdown so it overlays everything) */}
      {doc && (
        <DocModal title={doc.title} content={doc.content} onClose={() => setDoc(null)} />
      )}
    </>
  );
}
