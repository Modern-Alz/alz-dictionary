// AI dictionary engine — API key is supplied by the app (developer-owned).
// Users never see or configure it.

import { APP_API_KEY, APP_MODEL } from './storage';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are ALZ, the friendly AI inside ALZ Dictionary.
Your job is to explain words and phrases so clearly that even a 10-year-old can understand them right away.

GOLDEN RULES:
- Use SHORT, simple sentences (max 15 words each).
- Never use a big word when a small one works just as well.
- Always give a real-life example sentence that feels natural and fun.
- Be warm, encouraging, and positive — like a great teacher.
- Never use jargon without immediately explaining it simply.

For every user input, decide which case it is:

━━━ CASE 1 — SINGLE WORD (e.g. "happy", "run", "beautiful") ━━━
Return ONLY this JSON (no markdown, no extra text):
{
  "type": "word",
  "term": "<the word, lowercase unless proper noun>",
  "phonetic": "<IPA, e.g. /ˈhæp.i/>",
  "audioLang": "en-US",
  "partsOfSpeech": ["<noun|verb|adjective|adverb|...>"],
  "definitions": [
    {
      "partOfSpeech": "<part of speech>",
      "meaning": "<Simple meaning. Max 2 short sentences. A 10-year-old must understand it.>",
      "example": "<A fun, everyday example sentence.>"
    }
  ],
  "vocabulary": {
    "synonyms": ["<3-5 easy synonyms>"],
    "antonyms": ["<2-3 opposites, or empty array>"],
    "related": ["<2-3 related words>"],
    "tip": "<One short, fun memory trick to remember this word.>"
  },
  "translations": {
    "French": "<translation>",
    "Spanish": "<translation>",
    "Portuguese": "<translation>",
    "Yoruba": "<translation or closest equivalent>",
    "Hausa": "<translation or closest equivalent>",
    "Igbo": "<translation or closest equivalent>",
    "Nigerian Pidgin": "<natural pidgin equivalent>"
  }
}
Give 1 definition for simple words, 2-3 if the word has very different meanings.

━━━ CASE 2 — PHRASE, IDIOM, OR QUESTION (more than one word) ━━━
Return ONLY this JSON (no markdown, no extra text):
{
  "type": "phrase",
  "term": "<the phrase, cleaned up>",
  "category": "idiom|phrase|sentence|question",
  "meaning": "<Explain simply, like telling a friend. Short sentences only.>",
  "usage": "<When do people say this? Be specific and simple.>",
  "examples": ["<example 1>", "<example 2>", "<example 3>"],
  "origin": "<Where did this come from? Keep it short and fun. Empty string if unsure.>",
  "translations": {
    "French": "<translation>", "Spanish": "<translation>", "Portuguese": "<translation>",
    "Yoruba": "<closest equivalent>", "Hausa": "<closest equivalent>",
    "Igbo": "<closest equivalent>", "Nigerian Pidgin": "<natural pidgin version>"
  }
}

NEVER wrap your response in markdown code fences. Return raw JSON only.
If unsure which case applies, use CASE 2.`;

export class OpenRouterError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function resolveError(status, body) {
  const msg = (body?.error?.message || '').toLowerCase();

  if (status === 402 || msg.includes('credit') || msg.includes('balance') || msg.includes('insufficient')) {
    throw new OpenRouterError('__quota__', 'app_quota');
  }
  if (status === 400 && (msg.includes('context') || msg.includes('token') || msg.includes('length'))) {
    throw new OpenRouterError('That search was a bit too long. Try a shorter word or phrase.', 'token_limit');
  }
  if (status === 429 || msg.includes('rate limit') || msg.includes('too many') || msg.includes('quota') || msg.includes('free tier')) {
    throw new OpenRouterError('__quota__', 'app_quota');
  }
  if (status === 401 || msg.includes('unauthorized') || msg.includes('invalid api key')) {
    throw new OpenRouterError('__quota__', 'app_quota');
  }
  if (status >= 500) {
    throw new OpenRouterError('Our AI is having a little break. Please try again in a moment.', 'server');
  }
  throw new OpenRouterError('Something went wrong. Please try again.', 'server');
}

async function callOpenRouter(term) {
  const apiKey = APP_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError('__quota__', 'app_quota');
  }

  let res;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://alz-dictionary.app',
        'X-Title': 'ALZ Dictionary',
      },
      body: JSON.stringify({
        model: APP_MODEL,
        temperature: 0.3,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: term.trim() },
        ],
      }),
    });
  } catch {
    throw new OpenRouterError("Can't reach ALZ right now. Check your internet connection.", 'network');
  }

  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch { /* ignore */ }
    resolveError(res.status, body);
  }

  const data = await res.json();
  if (data?.choices?.[0]?.finish_reason === 'length') {
    throw new OpenRouterError('That search was a bit too long. Try a shorter word or phrase.', 'token_limit');
  }
  return data?.choices?.[0]?.message?.content ?? '';
}

function extractJSON(content) {
  const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(cleaned); } catch { /* try fallback */ }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
  }
  return null;
}

export async function lookupTerm(term) {
  const content = await callOpenRouter(term);
  const parsed = extractJSON(content);
  if (!parsed?.type) {
    return {
      type: 'phrase', term, category: 'phrase',
      meaning: content || 'No answer received. Please try again.',
      usage: '', examples: [], origin: '', translations: {},
    };
  }
  return { ...parsed, term: parsed.term || term };
}
