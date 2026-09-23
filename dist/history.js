// History records deliberately exclude transcript text and audio.
export const PAGE_SIZE = 10;
export const HISTORY_FIELDS = 'id,created_at,topic,prompt,duration_seconds,speaking_score,content_score,organization_score,relevance_score,pace_wpm,filler_count,repetition_count';

export async function fetchAttempts(client, userId, offset = 0) {
  if (!userId) throw new Error('Sign in to view your sessions.');
  return client.from('practice_attempts')
    .select(HISTORY_FIELDS, {count: 'exact'})
    .eq('user_id', userId)
    .order('created_at', {ascending: false})
    .order('id', {ascending: false})
    .range(offset, offset + PAGE_SIZE - 1);
}

export function summarizeAttempts(attempts) {
  const average = (key) => {
    const scores = attempts.map((item) => item[key]).filter(Number.isFinite);
    return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  };
  return {speaking: average('speaking_score'), content: average('content_score')};
}

export function practicePayload(round, userId) {
  // Never transfer a round to another account, including after sign-out/sign-in.
  if (!userId || !round?.ownerId || userId !== round.ownerId || round.seconds < 5 || !round.metrics) return null;
  return {
    user_id: userId, client_round_id: round.id, created_at: round.createdAt,
    topic: round.topic, prompt: round.prompt, duration_seconds: Math.round(round.seconds),
    ...round.metrics,
  };
}

export async function persistAttempt(client, round, userId) {
  const payload = practicePayload(round, userId);
  if (!payload) return {skipped: true};
  // A stable round ID makes retries and feedback edits update the same session.
  return client.from('practice_attempts').upsert(payload, {onConflict: 'user_id,client_round_id'});
}
