# ALZ Dictionary — Backend API

Production-ready Node.js/Express backend for ALZ Dictionary.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express
- **Database**: PostgreSQL (any provider: Railway, Neon, Supabase, Render)
- **Auth**: JWT access tokens + rotating refresh tokens
- **Payments**: Paystack (Nigerian cards, bank transfer, USSD)
- **AI**: OpenRouter (model-agnostic — swap without code changes)
- **Dictionary data**: Free Dictionary API + Datamuse (no key needed)

---

## Search pipeline (how it works)

```
User types "ubiquitous"
        │
        ▼
  1. Quota check
     └─ Free users: max 10 searches/day
     └─ Premium: unlimited
        │
        ▼
  2. Free Dictionary API  (dictionaryapi.dev)
     └─ Real phonetics, IPA, audio MP3 URL
     └─ Part of speech, raw definitions, examples
     └─ Etymology / origin
        │
        ▼
  3. Datamuse API  (api.datamuse.com)
     └─ Supplements synonyms, antonyms, related words
        │
        ▼
  4. OpenRouter AI  (your chosen model)
     └─ Receives ALL the real dictionary data above
     └─ Rewrites it in child-friendly ALZ style
     └─ Adds translations (Yoruba, Hausa, Igbo, Pidgin, etc.)
     └─ CANNOT hallucinate facts — data is pre-supplied
        │
        ▼
  5. Response saved to DB (quota + history)
        │
        ▼
  6. Client receives enriched JSON result
```

---

## Quick start (local)

```bash
# 1. Clone and install
cd alz-backend
npm install

# 2. Configure environment
cp .env.example .env
# → Edit .env with your DB URL, JWT secret, OpenRouter key

# 3. Create database and run migrations
createdb alz_dictionary          # local Postgres
npm run migrate

# 4. Start development server
npm run dev
# → http://localhost:4000
# → http://localhost:4000/health
```

---

## Deploy to Railway (recommended for Nigeria latency)

```bash
# Install Railway CLI
npm install -g @railway/cli

railway login
railway init
railway add postgresql          # auto-provisions Postgres + DATABASE_URL

# Set env vars in Railway dashboard or CLI:
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
railway variables set OPENROUTER_API_KEY=sk-or-...
railway variables set OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
railway variables set ALLOWED_ORIGINS=https://your-frontend.vercel.app
railway variables set FREE_DAILY_LIMIT=10
railway variables set PREMIUM_PRICE_NGN=11200
railway variables set PAYSTACK_SECRET_KEY=sk_live_...
railway variables set PAYSTACK_WEBHOOK_SECRET=...

# Run migration on Railway
railway run npm run migrate

# Deploy
railway up
```

---

## Deploy to Render

1. New Web Service → connect your GitHub repo
2. Build command: `npm install`
3. Start command: `npm start`
4. Add a PostgreSQL database → copy the internal URL to `DATABASE_URL`
5. Add all env vars from `.env.example`
6. Run migration via Render Shell: `npm run migrate`

---

## API Reference

### Auth
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | `{fullName, email, phone?, password}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Log in |
| POST | `/api/auth/refresh` | `{refreshToken}` | Rotate tokens |
| POST | `/api/auth/logout` | `{refreshToken}` | Revoke session |

### User (🔒 Bearer token required)
| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/user` | — | Get own profile |
| PATCH | `/api/user` | `{fullName?, phone?}` | Update profile |
| PATCH | `/api/user/password` | `{currentPassword, newPassword}` | Change password |
| DELETE | `/api/user` | — | Delete account |

### Dictionary (🔒)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/dictionary/search` | `{term}` → AI result |
| GET | `/api/dictionary/quota` | Today's usage |
| GET | `/api/dictionary/history` | Last 12 searches |
| GET | `/api/dictionary/wotd` | Word of the day |
| GET | `/api/dictionary/saved` | All saved words |
| POST | `/api/dictionary/saved` | `{term, type?}` |
| DELETE | `/api/dictionary/saved/:term` | Remove saved word |

### Payments (🔒)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/payments/initialize` | Start Paystack checkout |
| GET | `/api/payments/verify/:ref` | Confirm payment |
| GET | `/api/payments/history` | Payment records |
| POST | `/api/payments/webhook` | Paystack webhook (no auth) |

---

## Paystack webhook setup

1. In Paystack dashboard → Settings → API Keys & Webhooks
2. Set webhook URL: `https://your-backend.com/api/payments/webhook`
3. Copy the webhook secret → `PAYSTACK_WEBHOOK_SECRET` env var
4. The webhook auto-activates Premium on successful payment

---

## Environment variables

See `.env.example` for full documentation of all variables.
