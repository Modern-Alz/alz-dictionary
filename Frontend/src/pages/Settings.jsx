import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Crown, Sun, Moon, ChevronRight, Bell, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getSettings, saveSettings, isPremium, PREMIUM_PRICE_NGN } from '../services/storage';

function SectionCard({ title, icon: Icon, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-surface rounded-3xl p-5 shadow-card dark:shadow-card-dark sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-ink-50">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-azure-50 dark:bg-azure-900/30">
          <Icon size={15} className="text-azure-500 dark:text-gilt-300" />
        </div>
        {title}
      </div>
      {children}
    </motion.div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [settings, setSettingsState] = useState(getSettings);
  const [saved, setSaved] = useState(false);
  const userIsPremium = isPremium(user);

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold text-ink-700 dark:text-ink-50 sm:text-4xl">
          <span className="text-azure-500 dark:text-gilt-300">Settings</span>
        </h1>
        <p className="mt-1 text-sm text-ink-300">Manage your preferences.</p>
      </motion.div>

      {/* Theme */}
      <SectionCard title="Display theme" icon={Palette} delay={0.06}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'light', label: 'Light mode',  Icon: Sun },
            { value: 'dark',  label: 'Dark mode',   Icon: Moon },
          ].map(({ value, label, Icon }) => {
            const active = theme === value;
            return (
              <button
                key={value} type="button"
                onClick={() => { setTheme(value); setSettingsState((s) => ({ ...s, theme: value })); }}
                aria-pressed={active}
                className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all ${
                  active
                    ? 'border-azure-400 bg-azure-50 text-azure-600 shadow-glow-blue dark:border-gilt-400 dark:bg-gilt-900/30 dark:text-gilt-200 dark:shadow-glow-gold'
                    : 'border-cream-300 bg-cream-50 text-ink-500 hover:border-azure-200 dark:border-ink-800 dark:bg-surface-darkAlt dark:text-ink-300'
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <Check size={14} className="ml-auto" />}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Plan */}
      <SectionCard title="Subscription plan" icon={Crown} delay={0.12}>
        {userIsPremium ? (
          <div className="rounded-2xl border border-gilt-200 bg-gilt-50 p-4 dark:border-gilt-900 dark:bg-gilt-900/20">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={16} className="text-gilt-500 dark:text-gilt-300" />
              <span className="font-semibold text-gilt-800 dark:text-gilt-200">ALZ Premium — Active</span>
            </div>
            <p className="text-xs text-gilt-600 dark:text-gilt-300">Unlimited searches · No ads · All features</p>
            {user?.premiumUntil && (
              <p className="mt-1 text-xs text-gilt-500 dark:text-gilt-400">
                Renews {new Date(user.premiumUntil).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-cream-300 dark:border-ink-800">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-ink-700 dark:text-ink-50">Free plan</p>
                <p className="text-xs text-ink-300">10 searches per day · Ads shown</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Payment integration coming soon!')}
                className="inline-flex items-center gap-1.5 rounded-full bg-gilt-400 px-3.5 py-2 text-xs font-semibold text-ink-900 shadow-glow-gold transition-transform hover:scale-105"
              >
                <Crown size={13} /> Upgrade
                <ChevronRight size={13} />
              </button>
            </div>
            <div className="border-t border-cream-200 bg-cream-100/60 px-4 py-3 dark:border-ink-800 dark:bg-ink-900/40">
              <p className="text-xs text-ink-400 dark:text-ink-300">
                Premium is{' '}
                <span className="font-semibold text-ink-700 dark:text-ink-100">
                  ₦{PREMIUM_PRICE_NGN.toLocaleString()}/month
                </span>{' '}
                — unlimited searches, zero ads.
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Privacy */}
      <SectionCard title="Privacy & data" icon={Shield} delay={0.18}>
        <p className="text-sm text-ink-500 dark:text-ink-200 leading-relaxed">
          Your saved words and search history are stored on this device only.
          ALZ Dictionary does not sell your data. See our{' '}
          <span className="font-medium text-azure-500 dark:text-gilt-300">Privacy Policy</span>
          {' '}in the menu above.
        </p>
      </SectionCard>

      {/* Save */}
      <motion.button
        type="button"
        onClick={handleSave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-azure-500 px-6 py-3.5 text-sm font-semibold text-cream-50 shadow-glow-blue transition-all dark:bg-gilt-400 dark:text-ink-900 dark:shadow-glow-gold"
      >
        {saved ? <><Check size={16} /> Saved!</> : 'Save settings'}
      </motion.button>
    </div>
  );
}
