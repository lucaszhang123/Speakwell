import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchAttempts, summarizeAttempts, practicePayload, persistAttempt, PAGE_SIZE} from '../dist/history.js';

const round = {
  id: 'round-1', ownerId: 'user-a', createdAt: '2026-09-22T12:00:00Z',
  topic: 'Music', prompt: 'Share a memory.', seconds: 60.3,
  metrics: {speaking_score: 78, content_score: null, organization_score: null, relevance_score: null, pace_wpm: 120, filler_count: 2, repetition_count: 0},
  transcript: 'Private transcript', audio: 'Private recording',
};

test('history is scoped to the signed-in user with deterministic, paginated ordering', async () => {
  const calls = [];
  const query = {};
  for (const method of ['select', 'eq', 'order', 'range']) query[method] = (...args) => { calls.push([method, ...args]); return query; };
  await fetchAttempts({from: (table) => { assert.equal(table, 'practice_attempts'); return query; }}, 'user-a', 10);
  assert.deepEqual(calls[1], ['eq', 'user_id', 'user-a']);
  assert.deepEqual(calls[2], ['order', 'created_at', {ascending: false}]);
  assert.deepEqual(calls[3], ['order', 'id', {ascending: false}]);
  assert.deepEqual(calls[4], ['range', 10, 10 + PAGE_SIZE - 1]);
  assert.deepEqual(calls[0][2], {count: 'exact'});
  assert.ok(!calls[0][1].includes('transcript'));
});

test('history cannot be fetched anonymously', async () => {
  await assert.rejects(fetchAttempts({}, null), /Sign in/);
});

test('averages ignore missing scores, preserve zero, and support empty history', () => {
  assert.deepEqual(summarizeAttempts([]), {speaking: null, content: null});
  assert.deepEqual(summarizeAttempts([{speaking_score: 0, content_score: null}, {speaking_score: 80, content_score: 91}]), {speaking: 40, content: 91});
});

test('round snapshots preserve the original prompt and omit private media and transcript', () => {
  const payload = practicePayload(round, 'user-a');
  assert.equal(payload.topic, 'Music');
  assert.equal(payload.duration_seconds, 60);
  assert.equal(payload.client_round_id, round.id);
  assert.equal(payload.created_at, round.createdAt);
  assert.ok(!('transcript' in payload));
  assert.ok(!('audio' in payload));
  assert.equal(payload.content_score, null);
});

test('guest, short, incomplete, and other-account rounds cannot be saved', () => {
  for (const [candidate, user] of [[round, null], [round, 'user-b'], [{...round, ownerId: null}, 'user-a'], [{...round, seconds: 4.9}, 'user-a'], [{...round, metrics: null}, 'user-a']]) {
    assert.equal(practicePayload(candidate, user), null);
  }
});

test('retry and rescore upsert the same round instead of inserting duplicates', async () => {
  const writes = [];
  const client = {from: () => ({upsert: async (payload, options) => { writes.push({payload, options}); return {error: null}; }})};
  await persistAttempt(client, round, 'user-a');
  await persistAttempt(client, {...round, metrics: {...round.metrics, content_score: 90}}, 'user-a');
  assert.equal(writes[0].payload.client_round_id, writes[1].payload.client_round_id);
  assert.equal(writes[1].payload.content_score, 90);
  assert.deepEqual(writes[1].options, {onConflict: 'user_id,client_round_id'});
  assert.deepEqual(await persistAttempt(client, round, 'user-b'), {skipped: true});
  assert.equal(writes.length, 2);
});
