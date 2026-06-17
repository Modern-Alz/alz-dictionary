/**
 * ALZ Dictionary — Dictionary Data Fetcher
 *
 * Two-stage pipeline:
 *   1. Free Dictionary API (dictionaryapi.dev) — phonetics, raw definitions,
 *      part of speech, audio URL, etymology, synonyms, antonyms.
 *   2. Datamuse API — richer synonyms/antonyms/related words as fallback or
 *      supplement when Free Dictionary returns sparse data.
 *
 * For PHRASES (multi-word), we skip the dictionary lookup (these APIs are
 * word-only) and pass a minimal scaffold to OpenRouter.
 *
 * The resolved `DictionaryData` object is then injected into the OpenRouter
 * system prompt so the AI rewrites it in ALZ's child-friendly style without
 * having to invent facts.
 */

const FREE_DICT_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const DATAMUSE_BASE  = 'https://api.datamuse.com/words';

// ── Helpers ───────────────────────────────────────────────────────────────────

function isPhrase(term) {
  return term.trim().split(/\s+/).length > 1;
}

function pickPhonetic(entries) {
  for (const entry of entries) {
    if (entry.phonetic) return entry.phonetic;
    const found = entry.phonetics?.find((p) => p.text);
    if (found) return found.text;
  }
  return '';
}

function pickAudio(entries) {
  for (const entry of entries) {
    const found = entry.phonetics?.find((p) => p.audio && p.audio.trim());
    if (found) return found.audio;
  }
  return '';
}

function collectMeanings(entries) {
  // Returns array of { partOfSpeech, definitions[{definition, example, synonyms, antonyms}] }
  const seen = new Set();
  const results = [];
  for (const entry of entries) {
    for (const meaning of (entry.meanings || [])) {
      const key = meaning.partOfSpeech;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        partOfSpeech: meaning.partOfSpeech,
        definitions:  (meaning.definitions || []).slice(0, 3).map((d) => ({
          definition: d.definition || '',
          example:    d.example    || '',
          synonyms:   d.synonyms   || [],
          antonyms:   d.antonyms   || [],
        })),
        synonyms: meaning.synonyms || [],
        antonyms: meaning.antonyms || [],
      });
    }
  }
  return results;
}

function pickEtymology(entries) {
  for (const entry of entries) {
    if (entry.origin) return entry.origin;
  }
  return '';
}

// ── Datamuse fetch helpers ────────────────────────────────────────────────────

async function datamuseWords(rel, word, n = 8) {
  try {
    const url = `${DATAMUSE_BASE}?${rel}=${encodeURIComponent(word)}&max=${n}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((w) => w.word).filter(Boolean);
  } catch {
    return [];
  }
}

// ── Main fetch function ───────────────────────────────────────────────────────

/**
 * @param {string} term — the raw search term
 * @returns {Promise<DictionaryData>}
 */
async function fetchDictionaryData(term) {
  const trimmed = term.trim().toLowerCase();

  // ── PHRASE: skip word lookups, return scaffold ────────────────────────────
  if (isPhrase(trimmed)) {
    return {
      isPhrase:    true,
      term:        trimmed,
      phonetic:    '',
      audioUrl:    '',
      etymology:   '',
      partsOfSpeech: [],
      meanings:    [],
      allSynonyms: [],
      allAntonyms: [],
      related:     [],
    };
  }

  // ── WORD: Free Dictionary API ─────────────────────────────────────────────
  let entries = null;
  let freeDictError = false;

  try {
    const res = await fetch(
      `${FREE_DICT_BASE}/${encodeURIComponent(trimmed)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (res.ok) {
      entries = await res.json();
    } else {
      freeDictError = true;   // 404 = word not in dictionary (slang, proper noun, etc.)
    }
  } catch {
    freeDictError = true;     // network timeout — degrade gracefully
  }

  // ── Collect structured data from entries ──────────────────────────────────
  const phonetic  = entries ? pickPhonetic(entries) : '';
  const audioUrl  = entries ? pickAudio(entries)    : '';
  const etymology = entries ? pickEtymology(entries): '';
  const meanings  = entries ? collectMeanings(entries) : [];

  // Flatten all synonyms/antonyms found across meanings
  let allSynonyms = [...new Set(meanings.flatMap((m) => [...m.synonyms, ...m.definitions.flatMap((d) => d.synonyms)]))].slice(0, 10);
  let allAntonyms = [...new Set(meanings.flatMap((m) => [...m.antonyms, ...m.definitions.flatMap((d) => d.antonyms)]))].slice(0, 6);

  // ── Supplement with Datamuse if sparse ───────────────────────────────────
  const needsSynonyms = allSynonyms.length < 3;
  const needsAntonyms = allAntonyms.length < 1;
  const needsRelated  = true;

  const [datamuseSyns, datamuseAnts, related] = await Promise.all([
    needsSynonyms ? datamuseWords('rel_syn', trimmed, 8)  : Promise.resolve([]),
    needsAntonyms ? datamuseWords('rel_ant', trimmed, 5)  : Promise.resolve([]),
    needsRelated  ? datamuseWords('rel_trg', trimmed, 5)  : Promise.resolve([]),
  ]);

  if (needsSynonyms) allSynonyms = [...new Set([...allSynonyms, ...datamuseSyns])].slice(0, 8);
  if (needsAntonyms) allAntonyms = [...new Set([...allAntonyms, ...datamuseAnts])].slice(0, 5);

  const partsOfSpeech = [...new Set(meanings.map((m) => m.partOfSpeech))];

  return {
    isPhrase:    false,
    term:        trimmed,
    phonetic,
    audioUrl,
    etymology,
    partsOfSpeech,
    meanings,
    allSynonyms,
    allAntonyms,
    related:     related.slice(0, 5),
    notFound:    freeDictError,
  };
}

module.exports = { fetchDictionaryData, isPhrase };
