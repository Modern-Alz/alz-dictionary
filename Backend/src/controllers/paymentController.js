const crypto = require('crypto');
const pool   = require('../db/pool');

const PAYSTACK_SECRET  = process.env.PAYSTACK_SECRET_KEY;
const PREMIUM_PRICE_NGN = parseInt(process.env.PREMIUM_PRICE_NGN || '11200');
const PLAN_MONTHS      = 1;

// POST /api/payments/initialize  — create a Paystack transaction
async function initializePayment(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    const user = rows[0];

    // Amount in kobo (₦1 = 100 kobo)
    const amountKobo = PREMIUM_PRICE_NGN * 100;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
      },
      body: JSON.stringify({
        email:    user.email,
        amount:   amountKobo,
        currency: 'NGN',
        metadata: {
          userId:     user.id,
          planMonths: PLAN_MONTHS,
          product:    'ALZ Dictionary Premium',
        },
        callback_url: `${process.env.ALLOWED_ORIGINS?.split(',')[0]}/payment/success`,
      }),
    });

    const data = await paystackRes.json();
    if (!data.status) {
      return res.status(502).json({ error: 'Could not initialise payment. Please try again.' });
    }

    // Store pending payment record
    await pool.query(
      `INSERT INTO payments (user_id, paystack_ref, amount_ngn, status, plan_months)
       VALUES ($1, $2, $3, 'pending', $4)`,
      [user.id, data.data.reference, PREMIUM_PRICE_NGN, PLAN_MONTHS]
    );

    res.json({
      authorizationUrl: data.data.authorization_url,
      reference:        data.data.reference,
    });
  } catch (err) { next(err); }
}

// POST /api/payments/verify/:reference  — called by frontend after redirect
async function verifyPayment(req, res, next) {
  try {
    const { reference } = req.params;

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET}` },
    });
    const data = await paystackRes.json();

    if (!data.status || data.data.status !== 'success') {
      return res.status(402).json({ error: 'Payment not completed.', status: data.data?.status });
    }

    const meta = data.data.metadata;
    if (meta.userId !== req.user.id) {
      return res.status(403).json({ error: 'Payment does not belong to this account.' });
    }

    await activatePremium(meta.userId, meta.planMonths, reference);
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [meta.userId]);

    res.json({
      message:      'Premium activated successfully!',
      premiumUntil: rows[0].premium_until,
    });
  } catch (err) { next(err); }
}

// POST /api/payments/webhook  — Paystack webhook (signature-verified)
async function webhook(req, res, next) {
  try {
    const signature = req.headers['x-paystack-signature'];
    const secret    = process.env.PAYSTACK_WEBHOOK_SECRET || PAYSTACK_SECRET;
    const hash      = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      if (metadata?.userId && metadata?.planMonths) {
        await activatePremium(metadata.userId, metadata.planMonths, reference);
      }
    }

    res.json({ received: true });
  } catch (err) { next(err); }
}

async function activatePremium(userId, months, reference) {
  // Calculate new expiry: extend from current if already premium, else from now
  const { rows } = await pool.query('SELECT premium_until FROM users WHERE id = $1', [userId]);
  const base = rows[0]?.premium_until && new Date(rows[0].premium_until) > new Date()
    ? new Date(rows[0].premium_until)
    : new Date();

  base.setMonth(base.getMonth() + (months || 1));

  await pool.query(
    `UPDATE users SET plan = 'premium', premium_until = $1, updated_at = NOW() WHERE id = $2`,
    [base.toISOString(), userId]
  );

  await pool.query(
    `UPDATE payments SET status = 'success', paid_at = NOW()
     WHERE paystack_ref = $1`,
    [reference]
  );
}

// GET /api/payments/history
async function getHistory(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT paystack_ref, amount_ngn, status, plan_months, paid_at, created_at
       FROM payments WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json({ payments: rows });
  } catch (err) { next(err); }
}

module.exports = { initializePayment, verifyPayment, webhook, getHistory };
