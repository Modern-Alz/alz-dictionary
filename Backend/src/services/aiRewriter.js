async function rewriteWithAI(dictData) {
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
  const apiKey = process.env.OPENROUTER_API_KEY;

  // Debug logs
  console.log('========== OPENROUTER DEBUG ==========');
  console.log('Model:', model);
  console.log('API Key exists:', !!apiKey);
  console.log('API Key prefix:', apiKey ? apiKey.substring(0, 12) + '...' : 'MISSING');
  console.log('======================================');

  const userMessage = buildUserMessage(dictData);

  let res;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://alz-dictionary-mqy6.vercel.app',
        'X-Title': 'ALZ Dictionary',
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        max_tokens: 1400,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (fetchErr) {
    console.error('NETWORK ERROR:', fetchErr);

    throw Object.assign(
      new Error("Can't reach ALZ AI. Check your internet connection."),
      {
        code: 'NETWORK_ERROR',
      }
    );
  }

  if (!res.ok) {
    let body = {};

    try {
      body = await res.json();
    } catch {
      body = {};
    }

    console.error('========== OPENROUTER ERROR ==========');
    console.error('Status:', res.status);
    console.error('Response:', JSON.stringify(body, null, 2));
    console.error('======================================');

    const msg = (body?.error?.message || '').toLowerCase();

    if (res.status === 402 || msg.includes('credit') || msg.includes('balance')) {
      throw Object.assign(new Error('SERVICE_QUOTA'), {
        code: 'SERVICE_QUOTA',
      });
    }

    if (res.status === 429 || msg.includes('rate limit')) {
      throw Object.assign(
        new Error('Too many requests. Please wait a moment.'),
        {
          code: 'RATE_LIMIT',
        }
      );
    }

    if (res.status === 401) {
      throw Object.assign(
        new Error('Service configuration error.'),
        {
          code: 'SERVICE_ERROR',
        }
      );
    }

    throw Object.assign(
      new Error('AI service unavailable. Please try again.'),
      {
        code: 'SERVICE_ERROR',
      }
    );
  }

  const data = await res.json();

  console.log('========== OPENROUTER SUCCESS ==========');
  console.log('Finish reason:', data?.choices?.[0]?.finish_reason);
  console.log('========================================');

  if (data?.choices?.[0]?.finish_reason === 'length') {
    throw Object.assign(
      new Error('That search was too long. Try a shorter word.'),
      {
        code: 'TOKEN_LIMIT',
      }
    );
  }

  const raw = data?.choices?.[0]?.message?.content || '';

  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  let parsed = null;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const s = cleaned.indexOf('{');
    const e = cleaned.lastIndexOf('}');

    if (s !== -1 && e > s) {
      try {
        parsed = JSON.parse(cleaned.slice(s, e + 1));
      } catch {}
    }
  }

  if (!parsed?.type) {
    parsed = {
      type: 'phrase',
      term: dictData.term,
      category: 'phrase',
      meaning: raw || 'No answer received. Please try again.',
      usage: '',
      examples: [],
      origin: '',
      translations: {},
    };
  }

  if (!dictData.isPhrase && dictData.audioUrl && parsed.type === 'word') {
    parsed.audioUrl = dictData.audioUrl;
  }

  return parsed;
}