const bcrypt = require('bcryptjs');
const pool   = require('../db/pool');

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

// GET /api/user/me
async function getMe(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: publicUser(rows[0]) });
  } catch (err) { next(err); }
}

// PATCH /api/user/me
async function updateMe(req, res, next) {
  try {
    const { fullName, phone } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET
         full_name  = COALESCE(NULLIF($1, ''), full_name),
         phone      = COALESCE($2, phone),
         updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [fullName?.trim(), phone, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: publicUser(rows[0]) });
  } catch (err) { next(err); }
}

// PATCH /api/user/password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user.id]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) { next(err); }
}

// DELETE /api/user/me  (account deletion)
async function deleteMe(req, res, next) {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, changePassword, deleteMe };
