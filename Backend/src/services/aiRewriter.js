/**
 * ALZ Dictionary — OpenRouter AI Rewriter
 *
 * Receives real dictionary data (from dictionaryFetcher.js) and asks the AI
 * to rewrite it in ALZ's child-friendly format.  Because we supply the facts,
 * the AI cannot hallucinate definitions, phonetics, or synonyms — it only
 * simplifies language and fills the translations section.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are ALZ, the writing voice of ALZ Dictionary — a modern AI dictionary for Nigerian users of all ages.

Your ONLY job is to take the REAL dictionary data I give you and rewrite it in ALZ's friendly style.
DO NOT invent, guess or change facts. DO NOT add definitions that are not in the source data.

STYLE RULES (non-negotiable):
- Short sentences: max 15 words each.
- Simple words. If you must use a complex word, explain it right away.
- Warm, encouraging tone — like an excellent teacher or older sibling.
- Example sentences must feel natural and relatable (Nigerian everyday life is welcome).

OUTPUT FORMAT:
Return ONLY raw JSON — no markdown fences, no commentary before or after.

FOR A SINGLE WORD, return exactly this structure:
{
  "type": "word",
  "term": "<exact term from input>",
  "phonetic": "<exact phonetic from input, or empty string>",
  "audioUrl": "<exact audioUrl from input, or empty string>",
  "audioLang": "en-US",
  "partsOfSpeech": ["<from input>"],
  "definitions": [
    {
      "partOfSpeech": "<from input>",
      "meaning": "<Rewrite the source definition in 1-2 short simple sentences. A 10-year-old must understand it.>",
      "example": "<Write ONE natural, fun example sentence using the word. Nigerian context welcome.>"
    }
  ],
  "vocabulary": {
    "synonyms": ["<use synonyms from input — pick the 3-5 simplest ones>"],
    "antonyms": ["<use antonyms from input — pick 2-3, or empty array>"],
    "related":  ["<use related words from input — 2-3>"],
    "tip": "<One short, fun memory trick or interesting fact about this word. Max 2 sentences.>"
  },
  "etymology": "<If origin is provided in input, summarise it in 1-2 simple sentences. Otherwise empty string.>",
  "translations": {
    "French":          "<translate the core meaning of the word>",
    "Spanish":         "<translate>",
    "Portuguese":      "<translate>",
    "Yoruba":          "<translate or give closest natural equivalent>",
    "Hausa":           "<translate or give closest natural equivalent>",
    "Igbo":            "<translate or give closest natural equivalent>",
    "Nigerian Pidgin": "<give the most natural Pidgin equivalent>"
  }
}

FOR A PHRASE / IDIOM / QUESTION, return exactly:
{
  "type": "phrase",
  "term": "<exact term>",
  "category": "idiom|phrase|sentence|question",
  "meaning": "<Explain simply what it means. Short sentences. 10-year-old level.>",
  "usage": "<When do people say this? Be specific. 1-3 short sentences.>",
  "examples": [
    "<example 1 — natural sentence>",
    "<example 2>",
    "<example 3>"
  ],
  "origin": "<Brief interesting origin if known. Otherwise empty string.>",
  "translations": {
    "French":          "<translate the phrase meaning>",
    "Spanish":         "<translate>",
    "Portuguese":      "<translate>",
    "Yoruba":          "<translate or equivalent>",
    "Hausa":           "<translate or equivalent>",
    "Igbo":            "<translate or equivalent>",
    "Nigerian Pidgin": "<natural pidgin version>"
  }
}

ABSOLUTE RULES:
- Never change the phonetic string. Copy it exactly.
- Never add a definition that was not in the source data.
- Return raw JSON only. No markdown. No extra text.`;

// ── Build the user message injecting real dictionary data ─────────────────────

function buildUserMessage(dictData) {
  if (dictData.isPhrase) {
    return `SEARCH TERM: "${dictData.term}"
TYPE: phrase / idiom / question (multi-word input)
No dictionary API data available for phrases — use your knowledge to fill this in, following all style rules.`;
  }

  const meaningsText = dictData.meanings.length
    ? dictData.meanings.map((m, i) => {
        const defs = m.definitions.map((d, j) =>
          `  Definition ${j + 1}: ${d.definition}${d.example ? `\n  Source example: ${d.example}` : ''}`
        ).join('\n');
        return `Part of speech ${i + 1}: ${m.partOfSpeech}\n${defs}`;
      }).join('\n\n')
    : 'No definitions found in dictionary API. Use your general knowledge but keep it accurate and simple.';

  return `REAL DICTIONARY DATA FOR: "${dictData.term}"

Phonetic: ${dictData.phonetic || '(not available)'}
Audio URL: ${dictData.audioUrl || ''}
Parts of speech: ${dictData.partsOfSpeech.join(', ') || '(not available)'}
Etymology / origin: ${dictData.etymology || '(not available)'}

--- MEANINGS FROM DICTIONARY API ---
${meaningsText}

--- SYNONYMS FROM DICTIONARY + DATAMUSE ---
${dictData.allSynonyms.length ? dictData.allSynonyms.join(', ') : '(none found)'}

--- ANTONYMS ---
${dictData.allAntonyms.length ? dictData.allAntonyms.join(', ') : '(none found)'}

--- RELATED WORDS ---
${dictData.related.length ? dictData.related.join(', ') : '(none found)'}

${dictData.notFound ? 'NOTE: This word was NOT found in the dictionary API (may be slang, a proper noun, or very new). Use your knowledge carefully — do NOT invent phonetics or mark them as verified.' : ''}

Now rewrite this data in ALZ style following the JSON format exactly.`;
}

function buildFallbackResult(dictData) {
  if (dictData.isPhrase) {
    return {
      type: 'phrase',
      term: dictData.term,
      category: 'phrase',
      meaning: 'The phrase meaning is being prepared. Please try again in a moment for a fuller answer.',
      usage: '',
      examples: [],
      origin: '',
      translations: {},
    };
  }

  return {
    type: 'word',
    term: dictData.term,
    phonetic: dictData.phonetic || '',
    audioUrl: dictData.audioUrl || '',
    audioLang: 'en-US',
    partsOfSpeech: dictData.partsOfSpeech || [],
    definitions: (dictData.meanings || []).slice(0, 2).map((m) => ({
      partOfSpeech: m.partOfSpeech || '',
      meaning: m.definitions?.[0]?.definition || 'Meaning is being prepared right now.',
      example: m.definitions?.[0]?.example || '',
    })),
    vocabulary: {
      synonyms: (dictData.allSynonyms || []).slice(0, 5),
      antonyms: (dictData.allAntonyms || []).slice(0, 3),
      related: (dictData.related || []).slice(0, 3),
      tip: 'The full AI rewrite is temporarily unavailable. Please try again in a moment.',
    },
    etymology: dictData.etymology || '',
    translations: {
      French: '',
      Spanish: '',
      Portuguese: '',
      Yoruba: '',
      Hausa: '',
      Igbo: '',
      'Nigerian Pidgin': '',
    },
  };
}

// ── Call OpenRouter ───────────────────────────────────────────────────────────

async function rewriteWithAI(dictData) {
  const model  = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
  const apiKey = process.env.OPENROUTER_API_KEY;

  const userMessage = buildUserMessage(dictData);

  let res;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer':  'https://alz-dictionary.app',
        'X-Title':       'ALZ Dictionary',
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,   // low = more faithful to source data
        max_tokens:  2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage },
        ],
      }),
      signal: AbortSignal.timeout(60000),
    });
  } catch (fetchErr) {
    const timedOut = fetchErr?.name === 'AbortError' || /timeout/i.test(fetchErr.message || '');
    if (timedOut) return buildFallbackResult(dictData);
    return buildFallbackResult(dictData);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = (body?.error?.message || '').toLowerCase();

    if (res.status === 402 || msg.includes('credit') || msg.includes('balance')) {
      return buildFallbackResult(dictData);
    }
    if (res.status === 429 || msg.includes('rate limit')) {
      return buildFallbackResult(dictData);
    }
    if (res.status === 401) {
      return buildFallbackResult(dictData);
    }
    return buildFallbackResult(dictData);
  }

  const data = await res.json();

  if (data?.choices?.[0]?.finish_reason === 'length') {
    throw Object.assign(new Error('That search was too long. Try a shorter word.'), { code: 'TOKEN_LIMIT' });
  }

  const raw     = data?.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').replace(/<pad>/gi, '').trim();

  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}');
    if (s !== -1 && e > s) {
      try { parsed = JSON.parse(cleaned.slice(s, e + 1)); } catch { /* fall through */ }
    }
  }

  if (!parsed?.type) {
    // Graceful fallback — something came back but wasn't valid JSON
    const fallbackText = raw.replace(/<pad>/gi, '').trim();
    parsed = {
      type:     'phrase',
      term:     dictData.term,
      category: 'phrase',
      meaning:  fallbackText || 'No answer received. Please try again.',
      usage:    '',
      examples: [],
      origin:   '',
      translations: {},
    };
  }

  // Always inject the real audioUrl from the dictionary API so pronunciation works
  if (!dictData.isPhrase && dictData.audioUrl && parsed.type === 'word') {
    parsed.audioUrl = dictData.audioUrl;
  }

  return parsed;
}

module.exports = { rewriteWithAI, buildUserMessage, buildFallbackResult };
