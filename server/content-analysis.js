const SCORE = {type: 'integer', minimum: 0, maximum: 100};
const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['content_score', 'clarity_score', 'organization_score', 'relevance_score', 'main_idea', 'strengths', 'improvements'],
  properties: {
    content_score: SCORE,
    clarity_score: SCORE,
    organization_score: SCORE,
    relevance_score: SCORE,
    main_idea: {type: 'string'},
    strengths: {type: 'array', maxItems: 3, items: {type: 'string'}},
    improvements: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['excerpt', 'reason', 'suggestion'],
        properties: {excerpt: {type: 'string'}, reason: {type: 'string'}, suggestion: {type: 'string'}},
      },
    },
  },
};

const instructions = `You are a public-speaking content coach. Evaluate whether the transcript communicates a logically understandable message in response to the assigned topic and prompt.

Score four dimensions from 0 to 100:
- clarity: claims and sentences have understandable meaning and do not contradict or collapse into unrelated fragments
- organization: ideas follow a discernible progression with useful connections
- relevance: the speech answers the assigned prompt
- content: the overall judgment, weighting clarity 45%, organization 30%, and relevance 25%

Treat this as spoken language. Ignore harmless fragments, informal grammar, missing punctuation, and likely speech-recognition mistakes unless they prevent understanding. Do not judge the speaker's opinion, accent, identity, vocabulary sophistication, or factual accuracy. Identify the intended main idea. Quote only short excerpts from the supplied transcript. Give concrete revision advice. A fluent but incoherent sequence must receive a low clarity score.`;

function extractText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text;
  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) if (typeof content.text === 'string') parts.push(content.text);
  }
  return parts.join('');
}

function parseEvaluation(payload) {
  if (payload.status === 'incomplete') {
    const reason = payload.incomplete_details?.reason;
    const message = reason === 'max_output_tokens'
      ? 'Content analysis ran out of response space. Please try again.'
      : 'Content analysis was incomplete. Please try again.';
    throw Object.assign(new Error(message), {status: 502, code: 'incomplete_response'});
  }
  const text = extractText(payload);
  if (!text) throw Object.assign(new Error('OpenAI returned no content evaluation. Please try again.'), {status: 502, code: 'empty_response'});
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('OpenAI returned an incomplete content evaluation. Please try again.'), {status: 502, code: 'invalid_response'});
  }
}

export async function evaluateContent({topic, prompt, transcript}, {apiKey, model = 'gpt-5-mini', fetchImpl = fetch} = {}) {
  if (!apiKey) throw Object.assign(new Error('OpenAI content analysis is not configured.'), {status: 503, code: 'not_configured'});
  if (typeof transcript !== 'string' || transcript.trim().length < 20) throw Object.assign(new Error('Add a longer transcript before requesting content feedback.'), {status: 400, code: 'transcript_too_short'});
  if (transcript.length > 12000) throw Object.assign(new Error('Transcript is too long.'), {status: 400, code: 'transcript_too_long'});
  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`},
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 4000,
      input: [
        {role: 'developer', content: [{type: 'input_text', text: instructions}]},
        {role: 'user', content: [{type: 'input_text', text: JSON.stringify({topic: String(topic || ''), prompt: String(prompt || ''), transcript: transcript.trim()})}]},
      ],
      text: {format: {type: 'json_schema', name: 'speech_content_evaluation', strict: true, schema}},
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || 'The content analysis service returned an error.';
    throw Object.assign(new Error(message), {status: response.status >= 500 ? 502 : response.status, code: 'openai_error'});
  }
  const result = parseEvaluation(payload);
  result.content_score = Math.round(result.clarity_score * 0.45 + result.organization_score * 0.3 + result.relevance_score * 0.25);
  return result;
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}});
}
