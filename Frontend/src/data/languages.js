// Languages offered in the Translation section of a result card.
// Includes major world languages plus Nigerian languages, a nod to ALZ
// Dictionary's roots and a genuinely useful differentiator for its first users.

export const LANGUAGES = [
  { code: 'fr', label: 'French', speechLang: 'fr-FR' },
  { code: 'es', label: 'Spanish', speechLang: 'es-ES' },
  { code: 'pt', label: 'Portuguese', speechLang: 'pt-PT' },
  { code: 'de', label: 'German', speechLang: 'de-DE' },
  { code: 'ar', label: 'Arabic', speechLang: 'ar-SA' },
  { code: 'zh', label: 'Chinese (Simplified)', speechLang: 'zh-CN' },
  { code: 'yo', label: 'Yoruba', speechLang: 'en-US' },
  { code: 'ha', label: 'Hausa', speechLang: 'en-US' },
  { code: 'ig', label: 'Igbo', speechLang: 'en-US' },
  { code: 'pcm', label: 'Nigerian Pidgin', speechLang: 'en-US' },
];

export function findLanguage(code) {
  return LANGUAGES.find((l) => l.code === code);
}
