/**
 * ALZ Dictionary — Audio Pronunciation
 *
 * Priority:
 *   1. Real MP3 audio URL from the dictionary API (Free Dictionary API CDN)
 *   2. Browser Web Speech Synthesis API (offline fallback)
 */

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let voicesCache = [];
if (isSpeechSupported()) {
  const load = () => { voicesCache = window.speechSynthesis.getVoices(); };
  load();
  window.speechSynthesis.onvoiceschanged = load;
}

function pickVoice(lang) {
  if (!voicesCache.length) voicesCache = window.speechSynthesis.getVoices();
  return (
    voicesCache.find((v) => v.lang?.toLowerCase() === lang.toLowerCase()) ||
    voicesCache.find((v) => v.lang?.toLowerCase().startsWith(lang.split('-')[0]))
  );
}

// Shared audio element — reuse to avoid overlapping playback
let audioEl = null;

/**
 * Play pronunciation audio.
 * If audioUrl (from dictionary API) is provided, plays the MP3.
 * Falls back to Web Speech Synthesis if no URL.
 *
 * @param {string} text — word or phrase to pronounce
 * @param {string} lang — BCP-47 locale, e.g. "en-US"
 * @param {string|null} audioUrl — direct MP3 URL from dictionary API
 */
export function speak(text, lang = 'en-US', audioUrl = null) {
  if (!text) return false;

  // ── Real audio URL (dictionary API MP3) ──────────────────────────────────
  if (audioUrl) {
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
    }
    audioEl = new Audio(audioUrl);
    audioEl.play().catch(() => {
      // MP3 failed (network, CORS) — fall back to TTS
      synthesize(text, lang);
    });
    return true;
  }

  // ── Browser TTS fallback ──────────────────────────────────────────────────
  return synthesize(text, lang);
}

function synthesize(text, lang) {
  if (!isSpeechSupported()) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.9;
  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
  return true;
}

export function stopSpeaking() {
  if (audioEl) { audioEl.pause(); audioEl.src = ''; audioEl = null; }
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

export const LANG_SPEECH = {
  French:           'fr-FR',
  Spanish:          'es-ES',
  Portuguese:       'pt-PT',
  German:           'de-DE',
  Arabic:           'ar-SA',
  'Chinese (Simplified)': 'zh-CN',
  Yoruba:           'en-US',
  Hausa:            'en-US',
  Igbo:             'en-US',
  'Nigerian Pidgin':'en-US',
};
