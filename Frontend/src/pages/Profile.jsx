import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit2, Check, X, Shield, Crown, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isPremium, PREMIUM_PRICE_NGN } from '../services/storage';
import { apiInitPayment } from '../services/api';

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50/60 p-3.5 dark:border-ink-800 dark:bg-surface-darkAlt/60">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-azure-50 dark:bg-azure-900/30">
        <Icon size={16} className="text-azure-500 dark:text-gilt-300" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
        <p className="mt-0.5 text-sm text-ink-700 dark:text-ink-50">{value}</p>
      </div>
    </div>
  );
}

function GlowInput({ label, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</label>
      <input type="text" value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full rounded-2xl border bg-cream-50 px-4 py-3 text-sm text-ink-700 outline-none transition-all duration-300 dark:bg-surface-darkAlt dark:text-ink-50 ${
          focused
            ? 'border-azure-400 shadow-[0_0_0_3px_rgba(47,93,159,0.18),0_0_18px_rgba(47,93,159,0.18)] dark:border-gilt-400 dark:shadow-[0_0_0_3px_rgba(240,199,94,0.18),0_0_16px_rgba(240,199,94,0.18)]'
            : 'border-cream-300 dark:border-ink-800'
        }`}
      />
    </div>
  );
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [saving,    setSaving]    = useState(false);
  const [savedMsg,  setSavedMsg]  = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const userIsPremium = user?.plan === 'premium' && user?.premiumUntil && new Date(user.premiumUntil) > new Date();

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile(form);
      setSavedMsg(true);
      setEditing(false);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const { authorizationUrl } = await apiInitPayment();
      window.location.href = authorizationUrl;
    } catch {
      alert('Could not start payment. Please try again.');
    } finally {
      setUpgrading(false);
    }
  }

  const initial  = user?.fullName?.[0]?.toUpperCase() || 'A';
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold text-ink-700 dark:text-ink-50 sm:text-4xl">
          My <span className="text-azure-500 dark:text-gilt-300">Profile</span>
        </h1>
      </motion.div>

      {/* Avatar card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="card-surface relative overflow-hidden rounded-3xl p-6 shadow-card dark:shadow-card-dark">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-azure-200/40 blur-3xl dark:bg-azure-800/25" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gilt-200/30 blur-2xl dark:bg-gilt-800/20" />

        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-azure-400 to-azure-600 font-display text-3xl font-bold text-cream-50 shadow-glow-blue dark:shadow-glow-gold">
              {initial}
            </div>
            {userIsPremium && (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gilt-400 shadow-glow-gold">
                <Crown size={13} className="text-ink-900" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-semibold text-ink-700 dark:text-ink-50">{user?.fullName}</h2>
            <p className="mt-0.5 truncate text-sm text-ink-300">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                userIsPremium
                  ? 'bg-gilt-100 text-gilt-700 dark:bg-gilt-900/40 dark:text-gilt-200'
                  : 'bg-cream-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300'
              }`}>
                {userIsPremium && <Crown size={11} />} {userIsPremium ? 'Premium member' : 'Free plan'}
              </span>
              {joinDate && (
                <span className="inline-flex items-center gap-1 text-xs text-ink-300">
                  <Calendar size={11} /> Joined {joinDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="card-surface rounded-3xl p-5 shadow-card dark:shadow-card-dark sm:p-6">
        <h3 className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-50">Your plan</h3>
        {userIsPremium ? (
          <div className="rounded-2xl border border-gilt-200 bg-gilt-50 p-4 dark:border-gilt-900 dark:bg-gilt-900/20">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={16} className="text-gilt-500" />
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
          <div className="flex items-center justify-between rounded-2xl border border-cream-300 bg-cream-100/60 p-4 dark:border-ink-800 dark:bg-surface-darkAlt/60">
            <div>
              <p className="text-sm font-medium text-ink-700 dark:text-ink-50">Free plan</p>
              <p className="text-xs text-ink-300">10 searches/day · Ads shown</p>
            </div>
            <button type="button" onClick={handleUpgrade} disabled={upgrading}
              className="inline-flex items-center gap-1.5 rounded-full bg-gilt-400 px-3.5 py-2 text-xs font-semibold text-ink-900 shadow-glow-gold transition-transform hover:scale-105 disabled:opacity-60">
              {upgrading ? <Loader2 size={13} className="animate-spin" /> : <Crown size={13} />}
              Upgrade · ₦{PREMIUM_PRICE_NGN.toLocaleString()}
            </button>
          </div>
        )}
      </motion.div>

      {/* Account info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card-surface rounded-3xl p-5 shadow-card dark:shadow-card-dark sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Account information</h3>
          {!editing ? (
            <button type="button" onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 px-3 py-1.5 text-xs font-medium text-ink-500 hover:border-azure-300 hover:text-azure-500 dark:border-ink-800 dark:text-ink-200 dark:hover:text-gilt-300">
              <Edit2 size={13} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button type="button" onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-azure-500 px-3 py-1.5 text-xs font-medium text-cream-50 shadow-glow-blue dark:bg-gilt-400 dark:text-ink-900 disabled:opacity-60">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 px-3 py-1.5 text-xs font-medium text-ink-500 dark:border-ink-800">
                <X size={13} /> Cancel
              </button>
            </div>
          )}
        </div>

        {savedMsg && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
            ✓ Profile updated successfully.
          </motion.div>
        )}

        {!editing ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <InfoRow icon={User}   label="Full name"  value={user?.fullName} />
            <InfoRow icon={Mail}   label="Email"      value={user?.email} />
            <InfoRow icon={Phone}  label="Phone"      value={user?.phone || '—'} />
            <InfoRow icon={Shield} label="Account ID" value={user?.id?.slice(0, 8)?.toUpperCase()} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GlowInput label="Full name" value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            <GlowInput label="Phone number" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
