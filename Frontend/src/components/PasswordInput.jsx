import { useState, useId } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function calcPasswordStrength(password) {
  if (!password) return { score: 0, percent: 0, label: '', barClass: '' };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password))   score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: 'Very weak',    barClass: 'bg-red-400' },
    { label: 'Weak',         barClass: 'bg-orange-400' },
    { label: 'Fair',         barClass: 'bg-gilt-400' },
    { label: 'Good',         barClass: 'bg-azure-400' },
    { label: 'Strong',       barClass: 'bg-emerald-500' },
    { label: 'Very strong',  barClass: 'bg-emerald-600' },
  ];
  const idx     = Math.min(score, levels.length - 1);
  const percent = Math.min(100, Math.round((score / 5) * 100));
  return { score, percent, ...levels[idx] };
}

export default function PasswordInput({
  label, value, onChange, placeholder = '••••••••',
  showStrength = false, name, autoComplete = 'current-password',
  error, required = false,
}) {
  const [visible,  setVisible]  = useState(false);
  const [focused,  setFocused]  = useState(false);
  const id       = useId();
  const strength = showStrength ? calcPasswordStrength(value) : null;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-100">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-cream-50 px-4 py-3.5 transition-all duration-300 dark:bg-surface-darkAlt ${
          focused
            ? 'border-azure-400 shadow-[0_0_0_3px_rgba(47,93,159,0.18),0_0_18px_rgba(47,93,159,0.22)] dark:border-gilt-400 dark:shadow-[0_0_0_3px_rgba(240,199,94,0.18),0_0_18px_rgba(240,199,94,0.22)]'
            : error
            ? 'border-red-400'
            : 'border-cream-300 dark:border-ink-800'
        }`}
      >
        <Lock
          size={18}
          className={`shrink-0 transition-colors ${focused ? 'text-azure-500 dark:text-gilt-300' : 'text-ink-300'}`}
        />
        <input
          id={id} name={name}
          type={visible ? 'text' : 'password'}
          value={value} onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-200 dark:text-ink-50"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className={`shrink-0 rounded-full p-1 transition-colors ${focused ? 'text-azure-500 dark:text-gilt-300' : 'text-ink-300'} hover:text-azure-500 dark:hover:text-gilt-300`}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-200 dark:bg-ink-800">
            <motion.div
              className={`h-full rounded-full ${strength.barClass}`}
              initial={{ width: 0 }}
              animate={{ width: `${strength.percent}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            />
          </div>
          <p className="mt-1 text-xs text-ink-300">{strength.label}</p>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
