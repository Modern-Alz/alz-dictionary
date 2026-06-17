const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const pool   = require('../db/pool');

const SALT_ROUNDS = 12;
const ACCESS_TTL  = process.env.JWT_EXPIRES_IN  || '7d';
const REFRESH_TTL = 30 * 24 * 60 * 60 * 1000;  // 30 days in ms

function makeAccessToken(user) {
  return jwt.sign(
    {
      id:           user.id,
      email:        user.email,
      plan:         user.plan,
      premiumUntil: user.premium_until,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function publicUser(u) {
  return {
    id:           u.id,
    fullName:     u.full_name,
    email:        u.email,
    phone:        u.phone,
    plan:         u.plan,
    premiumUntil: u.premium_until,
    createdAt:    u.created_at,
  };
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { fullName, email, phone = '', password } = req.body;

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fullName.trim(), email.toLowerCase().trim(), phone, passwordHash]
    );

    const user        = rows[0];
    const accessToken = makeAccessToken(user);

    // Create refresh token
    const rawRefresh  = crypto.randomBytes(48).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
    const expiresAt   = new Date(Date.now() + REFRESH_TTL);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshHash, expiresAt]
    );

    res.status(201).json({ accessToken, refreshToken: rawRefresh, user: publicUser(user) });
  } catch (err) { next(err); }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found with that email.' });
    }

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const accessToken = makeAccessToken(user);
    const rawRefresh  = crypto.randomBytes(48).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
    const expiresAt   = new Date(Date.now() + REFRESH_TTL);

    // Rotate: delete old refresh tokens for this user beyond 3 active sessions
    await pool.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1
       AND id NOT IN (
         SELECT id FROM refresh_tokens WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 2
       )`,
      [user.id]
    );

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshHash, expiresAt]
    );

    res.json({ accessToken, refreshToken: rawRefresh, user: publicUser(user) });
  } catch (err) { next(err); }
}

// POST /api/auth/refresh
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required.' });
    }

    const hash  = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const { rows } = await pool.query(
      `SELECT rt.*, u.* FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [hash]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired refresh token. Please log in again.', code: 'REFRESH_EXPIRED' });
    }

    const row  = rows[0];
    const user = { id: row.user_id, email: row.email, plan: row.plan, premium_until: row.premium_until };

    // Rotate refresh token
    const newRaw  = crypto.randomBytes(48).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRaw).digest('hex');
    const newExp  = new Date(Date.now() + REFRESH_TTL);

    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, newHash, newExp]
    );

    const accessToken = makeAccessToken(user);
    res.json({ accessToken, refreshToken: newRaw });
  } catch (err) { next(err); }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]);
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (err) { next(err); }
}

module.exports = { signup, login, refresh, logout };
