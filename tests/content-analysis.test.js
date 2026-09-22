import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateContent} from '../server/content-analysis.js';

test('requires a server-side API key', async () => {
  await assert.rejects(() => evaluateContent({transcript: 'This is a long enough transcript to evaluate.'}), (error) => error.code === 'not_configured');
});

test('requests a strict structured content evaluation', async () => {
  let request;
  const modelOutput = {content_score: 42, clarity_score: 30, organization_score: 45, relevance_score: 60, main_idea: 'The speaker is uncertain.', strengths: [], improvements: [{excerpt: 'about like that', reason: 'The relationship is unclear.', suggestion: 'State the claim directly.'}]};
  const expected = {...modelOutput, content_score: 42};
  const fetchImpl = async (url, options) => { request = {url, options}; return new Response(JSON.stringify({output_text: JSON.stringify(modelOutput)}), {status: 200, headers: {'Content-Type': 'application/json'}}); };
  const result = await evaluateContent({topic: 'Candy', prompt: 'Explain why it matters.', transcript: 'Candy matters to many people, but the rest of this thought does not connect clearly.'}, {apiKey: 'test-key', fetchImpl});
  assert.deepEqual(result, expected);
  const body = JSON.parse(request.options.body);
  assert.equal(request.url, 'https://api.openai.com/v1/responses');
  assert.equal(body.store, false);
  assert.equal(body.max_output_tokens, 4000);
  assert.equal(body.text.format.type, 'json_schema');
  assert.match(body.input[0].content[0].text, /fluent but incoherent/i);
});

test('turns an incomplete model response into a useful retry error', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({status: 'incomplete', incomplete_details: {reason: 'max_output_tokens'}, output: []}), {status: 200, headers: {'Content-Type': 'application/json'}});
  await assert.rejects(
    () => evaluateContent({topic: 'Candy', prompt: 'Explain it.', transcript: 'This transcript has enough words to request a complete structured content evaluation.'}, {apiKey: 'test-key', fetchImpl}),
    (error) => error.code === 'incomplete_response' && /try again/i.test(error.message),
  );
});

test('does not expose a raw JSON parser error to the interface', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({status: 'completed', output_text: '{"clarity_score": 42'}), {status: 200, headers: {'Content-Type': 'application/json'}});
  await assert.rejects(
    () => evaluateContent({topic: 'Candy', prompt: 'Explain it.', transcript: 'This transcript has enough words to request a complete structured content evaluation.'}, {apiKey: 'test-key', fetchImpl}),
    (error) => error.code === 'invalid_response' && !/JSON/.test(error.message),
  );
});
