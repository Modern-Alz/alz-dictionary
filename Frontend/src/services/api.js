/**
 * ALZ Dictionary — API client
 * All calls go through this module so the base URL is configured in one place.
 *
 * Set VITE_API_URL in your .env file, e.g.:
 *   VITE_API_URL=https://your-backend.railway.app
 *
 * Tokens are stored in localStorage under 'alz_access' and 'alz_refresh'.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Token helpers ─────────────────────────────────────────────────────────────
export function getAccessToken()  { return localStorage.getItem('alz_access'); }
export function getRefreshToken() { return localStorage.getItem('alz_refresh'); }
function setTokens(access, refresh) {
  localStorage.setItem('alz_access',  access);
  if (refresh) localStorage.setItem('alz_refresh', refresh);
}
export function clearTokens() {
  localStorage.removeItem('alz_access');
  localStorage.removeItem('alz_refresh');
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, retry = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401 TOKEN_EXPIRED
  if (res.status === 401 && retry) {
    const body = await res.clone().json().catch(() => ({}));
    if (body.code === 'TOKEN_EXPIRED') {
      const refreshed = await tryRefresh();
      if (refreshed) return apiFetch(path, options, false);
    }
  }

  return res;
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    });
    if (!res.ok) { clearTokens(); return false; }
    const { accessToken, refreshToken: newRefresh } = await res.json();
    setTokens(accessToken, newRefresh);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function json(res) {
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { code: data.code, status: res.status });
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function apiSignup(payload) {
  const data = await json(await apiFetch('/api/auth/signup', {
    method: 'POST', body: JSON.stringify(payload),
  }));
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function apiLogin(email, password) {
  const data = await json(await apiFetch('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }));
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function apiLogout() {
  const refreshToken = getRefreshToken();
  await apiFetch('/api/auth/logout', {
    method: 'POST', body: JSON.stringify({ refreshToken }),
  }).catch(() => {});
  clearTokens();
}

// ── User ──────────────────────────────────────────────────────────────────────
export async function apiGetMe()           { return json(await apiFetch('/api/user')); }
export async function apiUpdateMe(updates) {
  return json(await apiFetch('/api/user', { method: 'PATCH', body: JSON.stringify(updates) }));
}
export async function apiDeleteMe() {
  return json(await apiFetch('/api/user', { method: 'DELETE' }));
}

// ── Dictionary ────────────────────────────────────────────────────────────────
export async function apiSearch(term) {
  return json(await apiFetch('/api/dictionary/search', {
    method: 'POST', body: JSON.stringify({ term }),
  }));
}

export async function apiGetQuota()   { return json(await apiFetch('/api/dictionary/quota')); }
export async function apiGetHistory() { return json(await apiFetch('/api/dictionary/history')); }
export async function apiGetWotd()    { return json(await apiFetch('/api/dictionary/wotd')); }

export async function apiGetSaved()   { return json(await apiFetch('/api/dictionary/saved')); }
export async function apiSaveWord(term, type = 'word') {
  return json(await apiFetch('/api/dictionary/saved', {
    method: 'POST', body: JSON.stringify({ term, type }),
  }));
}
export async function apiUnsaveWord(term) {
  return json(await apiFetch(`/api/dictionary/saved/${encodeURIComponent(term)}`, { method: 'DELETE' }));
}

// ── Payments ──────────────────────────────────────────────────────────────────
export async function apiInitPayment() {
  return json(await apiFetch('/api/payments/initialize', { method: 'POST' }));
}
export async function apiVerifyPayment(reference) {
  return json(await apiFetch(`/api/payments/verify/${reference}`));
}
export async function apiGetPaymentHistory() {
  return json(await apiFetch('/api/payments/history'));
}
