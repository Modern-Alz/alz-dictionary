// Lightweight local persistence layer.
// API key is baked into the app by the developer — users never see or touch it.

const KEYS = {
  USERS: 'alz_users',
  SESSION: 'alz_session',
  SAVED: 'alz_saved_words',
  SETTINGS: 'alz_settings',
  HISTORY: 'alz_history',
  QUOTA: 'alz_quota',       // daily free-tier search counter per user
};

// ── IMPORTANT ─────────────────────────────────────────────────────────────────
// Replace this value with your real OpenRouter API key before deploying.
// It is stored only in the built JS bundle, never exposed in the UI.
// When you add a real backend later, move it server-side and proxy requests.
export const APP_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
export const APP_MODEL   = import.meta.env.VITE_OPENROUTER_MODEL   || 'meta-llama/llama-3.1-8b-instruct:free';

// Free tier: max daily searches before showing "try again later / go premium"
export const FREE_DAILY_LIMIT = 5;

// Premium price in Naira (₦) — $7 converted at ~1,600 ₦/$
export const PREMIUM_PRICE_NGN = 11200;
export const PREMIUM_PRICE_USD = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Password hashing ─────────────────────────────────────────────────────────
export async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Users ────────────────────────────────────────────────────────────────────
export function getUsers() {
  return read(KEYS.USERS, []);
}

export function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(payload) {
  const users = getUsers();
  if (findUserByEmail(payload.email)) {
    throw new Error('An account with this email already exists.');
  }
  const passwordHash = await hashPassword(payload.password);
  const user = {
    id: crypto.randomUUID(),
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone || '',
    passwordHash,
    plan: 'free',          // 'free' | 'premium'
    premiumUntil: null,    // ISO date string or null
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  write(KEYS.USERS, users);
  return sanitize(user);
}

export async function verifyCredentials(email, password) {
  const user = findUserByEmail(email);
  if (!user) throw new Error('No account found with that email.');
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) throw new Error('Incorrect password. Please try again.');
  return sanitize(user);
}

export function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('User not found.');
  users[idx] = { ...users[idx], ...updates };
  write(KEYS.USERS, users);
  const updated = sanitize(users[idx]);
  if (getSession()?.id === id) setSession(updated);
  return updated;
}

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// ─── Plan helpers ─────────────────────────────────────────────────────────────
export function isPremium(user) {
  if (!user) return false;
  if (user.plan === 'premium' && user.premiumUntil) {
    return new Date(user.premiumUntil) > new Date();
  }
  return false;
}

// ─── Daily quota (free tier) ──────────────────────────────────────────────────
function todayKey(userId) {
  return `${userId}_${new Date().toISOString().slice(0, 10)}`; // e.g. "abc_2025-06-16"
}

export function getQuota(userId) {
  const all = read(KEYS.QUOTA, {});
  return all[todayKey(userId)] || 0;
}

export function incrementQuota(userId) {
  const all = read(KEYS.QUOTA, {});
  const key = todayKey(userId);
  all[key] = (all[key] || 0) + 1;
  // prune old keys to save storage
  const today = new Date().toISOString().slice(0, 10);
  Object.keys(all).forEach((k) => { if (!k.endsWith(today)) delete all[k]; });
  write(KEYS.QUOTA, all);
  return all[key];
}

export function quotaExceeded(user) {
  if (isPremium(user)) return false;
  return getQuota(user.id) >= FREE_DAILY_LIMIT;
}

// ─── Session ──────────────────────────────────────────────────────────────────
export function getSession() { return read(KEYS.SESSION, null); }
export function setSession(user) { write(KEYS.SESSION, user); }
export function clearSession() { localStorage.removeItem(KEYS.SESSION); }

// ─── Saved words ──────────────────────────────────────────────────────────────
export function getSavedWords(userId) {
  const all = read(KEYS.SAVED, {});
  return all[userId] || [];
}

export function toggleSavedWord(userId, entry) {
  const all = read(KEYS.SAVED, {});
  const list = all[userId] || [];
  const idx = list.findIndex((w) => w.term.toLowerCase() === entry.term.toLowerCase());
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift({ ...entry, savedAt: new Date().toISOString() });
  all[userId] = list;
  write(KEYS.SAVED, all);
  return list;
}

export function isWordSaved(userId, term) {
  return getSavedWords(userId).some((w) => w.term.toLowerCase() === term.toLowerCase());
}

export function removeSavedWord(userId, term) {
  const all = read(KEYS.SAVED, {});
  const list = (all[userId] || []).filter((w) => w.term.toLowerCase() !== term.toLowerCase());
  all[userId] = list;
  write(KEYS.SAVED, all);
  return list;
}

// ─── Search history ───────────────────────────────────────────────────────────
export function getHistory(userId) {
  const all = read(KEYS.HISTORY, {});
  return all[userId] || [];
}

export function addHistory(userId, term) {
  const all = read(KEYS.HISTORY, {});
  const list = (all[userId] || []).filter((t) => t.toLowerCase() !== term.toLowerCase());
  list.unshift(term);
  all[userId] = list.slice(0, 12);
  write(KEYS.HISTORY, all);
  return all[userId];
}

// ─── App settings (theme only — API key removed from user settings) ───────────
const DEFAULT_SETTINGS = { theme: 'light' };

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.SETTINGS, {}) };
}

export function saveSettings(updates) {
  const next = { ...getSettings(), ...updates };
  write(KEYS.SETTINGS, next);
  return next;
}
