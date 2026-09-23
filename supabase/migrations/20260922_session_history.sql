-- Existing installations: run once in the Supabase SQL Editor.
-- Old attempts are preserved; NULL round IDs do not conflict with new rounds.
alter table public.practice_attempts add column if not exists client_round_id uuid;
create unique index if not exists practice_attempts_user_round_idx
  on public.practice_attempts (user_id, client_round_id);
create index if not exists practice_attempts_user_date_idx
  on public.practice_attempts (user_id, created_at desc, id desc);
grant update (topic, prompt, duration_seconds, speaking_score, content_score,
  organization_score, relevance_score, pace_wpm, filler_count, repetition_count,
  client_round_id, created_at, user_id) on public.practice_attempts to authenticated;
drop policy if exists "Users can update their own practice attempts" on public.practice_attempts;
create policy "Users can update their own practice attempts"
  on public.practice_attempts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
