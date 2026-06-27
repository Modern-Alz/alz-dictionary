require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const { globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);


// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const PRODUCTION_ORIGINS = ['https://alz-dictionary.vercel.app'];

function buildAllowedOrigins() {
  const origins = new Set([
    'http://localhost:5173',
    ...PRODUCTION_ORIGINS,
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : []),
    ...(process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ]);
  return [...origins];
}

const allowedOrigins = buildAllowedOrigins();

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Vercel preview deployments (e.g. alz-dictionary-git-main-user.vercel.app)
  return /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin);
}

app.use(cors({
  origin: (origin, cb) => {
    if (isOriginAllowed(origin)) return cb(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    cb(null, false);
  },
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
// Raw body for Paystack webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '32kb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Global rate limiter (all routes) ─────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again in a few minutes.' },
}));

// ── Stricter limiter for auth ─────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        authLimiter, require('./routes/auth'));
app.use('/api/user',        require('./routes/user'));
app.use('/api/dictionary',  require('./routes/dictionary'));
app.use('/api/payments',    require('./routes/payments'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000');
app.listen(PORT, () => {
  console.log(`\n🚀  ALZ Dictionary API running on port ${PORT}`);
  console.log(`   ENV:       ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS:      ${allowedOrigins.join(', ')} (+ *.vercel.app previews)`);
  console.log(`   Health:    http://localhost:${PORT}/health\n`);
});

module.exports = app;
