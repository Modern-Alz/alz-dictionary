/**
 * ALZ Dictionary — Dictionary Controller
 *
 * Search pipeline (per request):
 *   1. Quota check  — reject free users who exceeded daily limit
 *   2. Dictionary fetch  — Free Dictionary API + Datamuse (real phonetics, POS, defs, synonyms)
 *   3. AI rewrite  — OpenRouter rewrites the real data in ALZ child-friendly style
 *   4. Quota increment + history save
 *   5. Return enriched result to client
 */

const pool                = require('../db/pool');
const { fetchDictionaryData } = require('../services/dictionaryFetcher');
const { rewriteWithAI }   = require('../services/aiRewriter');

const FREE_DAILY_LIMIT = parseInt(process.env.FREE_DAILY_LIMIT || '5');

function isPremium(user) {
  return user.plan === 'premium' && user.premiumUntil && new Date(user.premiumUntil) > new Date();
}

async function getUsedToday(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query(
    'SELECT count FROM search_quota WHERE user_id = $1 AND quota_date = $2',
    [userId, today]
  );
  return rows[0]?.count || 0;
}

// ── GET /api/dictionary/quota ─────────────────────────────────────────────────
async function getQuota(req, res, next) {
  try {
    const used = await getUsedToday(req.user.id);
    res.json({
      used,
      limit:     isPremium(req.user) ? null : FREE_DAILY_LIMIT,
      isPremium: isPremium(req.user),
      remaining: isPremium(req.user) ? null : Math.max(0, FREE_DAILY_LIMIT - used),
    });
  } catch (err) { next(err); }
}

// ── POST /api/dictionary/search ───────────────────────────────────────────────
async function search(req, res, next) {
  try {
    const { term } = req.body;
    if (!term?.trim()) return res.status(400).json({ error: 'term is required.' });

    const today = new Date().toISOString().slice(0, 10);

    // ── 1. Quota check ────────────────────────────────────────────────────────
    if (!isPremium(req.user)) {
      const used = await getUsedToday(req.user.id);
      if (used >= FREE_DAILY_LIMIT) {
        return res.status(429).json({
          error: 'Daily search limit reached. Try again tomorrow or upgrade to Premium.',
          code:  'QUOTA_EXCEEDED',
          used,
          limit: FREE_DAILY_LIMIT,
        });
      }
    }

    // ── 2. Fetch real dictionary data ─────────────────────────────────────────
    let dictData;
    try {
      dictData = await fetchDictionaryData(term.trim());
    } catch (fetchErr) {
      // Non-fatal — pass minimal scaffold to AI so it can still respond
      console.warn('[dict] Dictionary fetch failed, degrading gracefully:', fetchErr.message);
      dictData = {
        isPhrase: false, term: term.trim().toLowerCase(),
        phonetic: '', audioUrl: '', etymology: '',
        partsOfSpeech: [], meanings: [],
        allSynonyms: [], allAntonyms: [], related: [],
        notFound: true,
      };
    }

    // ── 3. AI rewrite ─────────────────────────────────────────────────────────
    let result;
    try {
      result = await rewriteWithAI(dictData);
    } catch (aiErr) {
      const code = aiErr.code || 'SERVICE_ERROR';
      const status = code === 'QUOTA_EXCEEDED' || code === 'RATE_LIMIT' ? 429
                   : code === 'NETWORK_ERROR'                          ? 503
                   : 503;
      return res.status(status).json({
        error: aiErr.message === 'SERVICE_QUOTA'
          ? 'Service temporarily unavailable. Please try again later.'
          : aiErr.message,
        code,
      });
    }

    // ── 4a. Increment quota ───────────────────────────────────────────────────
    await pool.query(
      `INSERT INTO search_quota (user_id, quota_date, count)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, quota_date)
       DO UPDATE SET count = search_quota.count + 1`,
      [req.user.id, today]
    );

    // ── 4b. Save to history (keep most recent 20 unique terms) ────────────────
    await pool.query(
      `INSERT INTO search_history (user_id, term) VALUES ($1, $2)`,
      [req.user.id, term.trim()]
    );
    await pool.query(
      `DELETE FROM search_history
       WHERE user_id = $1
         AND id NOT IN (
           SELECT id FROM search_history
           WHERE user_id = $1
           ORDER BY searched_at DESC
           LIMIT 20
         )`,
      [req.user.id]
    );

    // ── 5. Return ─────────────────────────────────────────────────────────────
    const usedNow = await getUsedToday(req.user.id);

    // Attach dictionary-sourced audio URL if AI didn't include it
    if (dictData.audioUrl && result.type === 'word' && !result.audioUrl) {
      result.audioUrl = dictData.audioUrl;
    }

    res.json({
      result: { ...result, term: result.term || term.trim() },
      dictSource: {
        foundInDictionary: !dictData.notFound && !dictData.isPhrase,
        phonetic:  dictData.phonetic  || null,
        audioUrl:  dictData.audioUrl  || null,
        etymology: dictData.etymology || null,
      },
      quota: {
        used:      usedNow,
        limit:     isPremium(req.user) ? null : FREE_DAILY_LIMIT,
        isPremium: isPremium(req.user),
        remaining: isPremium(req.user) ? null : Math.max(0, FREE_DAILY_LIMIT - usedNow),
      },
    });

  } catch (err) { next(err); }
}

// ── GET /api/dictionary/history ───────────────────────────────────────────────
async function getHistory(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (LOWER(term)) term, searched_at
       FROM search_history
       WHERE user_id = $1
       ORDER BY LOWER(term), searched_at DESC
       LIMIT 12`,
      [req.user.id]
    );
    // Return most-recent first
    const sorted = rows.sort((a, b) => new Date(b.searched_at) - new Date(a.searched_at));
    res.json({ history: sorted.map((r) => r.term) });
  } catch (err) { next(err); }
}

// ── GET /api/dictionary/saved ─────────────────────────────────────────────────
async function getSaved(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, term, type, saved_at
       FROM saved_words
       WHERE user_id = $1
       ORDER BY saved_at DESC`,
      [req.user.id]
    );
    res.json({
      saved: rows.map((r) => ({ id: r.id, term: r.term, type: r.type, savedAt: r.saved_at })),
    });
  } catch (err) { next(err); }
}

// ── POST /api/dictionary/saved ────────────────────────────────────────────────
async function saveWord(req, res, next) {
  try {
    const { term, type = 'word' } = req.body;
    if (!term?.trim()) return res.status(400).json({ error: 'term is required.' });

    await pool.query(
      `INSERT INTO saved_words (user_id, term, type)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, term) DO NOTHING`,
      [req.user.id, term.trim().toLowerCase(), type]
    );
    res.status(201).json({ message: 'Word saved.' });
  } catch (err) { next(err); }
}

// ── DELETE /api/dictionary/saved/:term ───────────────────────────────────────
async function unsaveWord(req, res, next) {
  try {
    const term = decodeURIComponent(req.params.term).toLowerCase();
    await pool.query(
      `DELETE FROM saved_words WHERE user_id = $1 AND term = $2`,
      [req.user.id, term]
    );
    res.json({ message: 'Word removed.' });
  } catch (err) { next(err); }
}

// ── GET /api/dictionary/wotd ──────────────────────────────────────────────────
async function wordOfDay(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { rows } = await pool.query(
      `SELECT * FROM word_of_day WHERE active_date = $1`,
      [today]
    );
    if (rows.length > 0) {
      const w = rows[0];
      return res.json({
        term:         w.term,
        phonetic:     w.phonetic,
        partOfSpeech: w.part_of_speech,
        definition:   w.definition,
        example:      w.example,
        fromDatabase: true,
      });
    }
    res.json({ useStatic: true });
  } catch (err) { next(err); }
}

module.exports = {
  getQuota, search, getHistory,
  getSaved, saveWord, unsaveWord,
  wordOfDay,
};
