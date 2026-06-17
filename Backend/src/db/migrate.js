/**
 * ALZ Dictionary — Database Migration
 * Run once on a fresh database:  node src/db/migrate.js
 *
 * Re-running is safe — all statements use IF NOT EXISTS.
 */

require('dotenv').config();
const pool = require('./pool');

const SQL = `
-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive email

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT        NOT NULL,
  email          CITEXT      NOT NULL UNIQUE,
  phone          TEXT,
  password_hash  TEXT        NOT NULL,
  plan           TEXT        NOT NULL DEFAULT 'free'   CHECK (plan IN ('free', 'premium')),
  premium_until  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ─── Refresh tokens (persistent sessions) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);

-- ─── Daily search quota ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_quota (
  user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quota_date DATE    NOT NULL DEFAULT CURRENT_DATE,
  count      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, quota_date)
);

-- ─── Search history ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term       TEXT        NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user_date ON search_history (user_id, searched_at DESC);

-- ─── Saved words ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_words (
  id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term     TEXT        NOT NULL,
  type     TEXT        NOT NULL DEFAULT 'word'  CHECK (type IN ('word', 'phrase')),
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, term)
);

CREATE INDEX IF NOT EXISTS idx_saved_words_user ON saved_words (user_id, saved_at DESC);

-- ─── Payments (Paystack transactions) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paystack_ref    TEXT        NOT NULL UNIQUE,
  amount_ngn      INTEGER     NOT NULL,   -- in kobo (₦1 = 100 kobo)
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'success', 'failed')),
  plan_months     INTEGER     NOT NULL DEFAULT 1,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id, created_at DESC);

-- ─── Word-of-the-day overrides (optional — admin can set a custom WOTD) ───────
CREATE TABLE IF NOT EXISTS word_of_day (
  id          SERIAL      PRIMARY KEY,
  term        TEXT        NOT NULL,
  phonetic    TEXT,
  part_of_speech TEXT,
  definition  TEXT        NOT NULL,
  example     TEXT,
  active_date DATE        NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Auto-update updated_at on users ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('[migrate] Running ALZ Dictionary migrations…');
    await client.query(SQL);
    console.log('[migrate] ✅  All tables created / verified.');
  } catch (err) {
    console.error('[migrate] ❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
