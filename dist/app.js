import {topics} from './prompts.js';
import {analyzeTranscript} from './analysis.js';
import {createAudioTracker, scoreSpeaking} from './audio-analysis.js';
import {getAuthClient} from './auth-client.js';

import {persistAttempt} from './history.js';

const $ = (id) => document.getElementById(id);


let mode = 'everyday';
let duration = 60;
let phase = 'idle';
let topicIndex = 0;
let stream;
let recorder;
let recognition;
let audioTracker;
let audioSummary;
let clock;
let started = 0;
let seconds = 0;
let url;
let finalText = '';
let interim = '';
let chunks = [];
let recognitionFailed = false;
let recognitionRetries = 0;
let run = 0;
let contentRequest = 0;
let authClient;
let currentUser;
let round;
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const time = (number) => `${Math.floor(number / 60)}:${String(number % 60).padStart(2, '0')}`;
const scoreLabel = (score) => score >= 85 ? 'Strong' : score >= 70 ? 'Solid foundation' : score >= 55 ? 'Developing' : 'Needs another pass';
const scoreValue = (id) => {
  const value = Number($(id).textContent);
  return Number.isFinite(value) ? value : null;
};


function updateAccount(user) {
  const changed = currentUser?.id !== user?.id;
  currentUser = user || null;
  $('account-toggle').textContent = currentUser ? 'My account' : 'Sign in';
  if (changed) {
    $('retry-save').hidden = true;
    if (round && round.ownerId !== currentUser?.id) $('save-status').textContent = 'Sign in before your next round to save it to your account.';
  }
}

async function savePractice(target = round) {
  if (!target || target.saving) return;
  if (!authClient || !currentUser || target.ownerId !== currentUser.id) {
    if (target === round) $('save-status').textContent = 'Sign in before your next round to save it to your account.';
    return;
  }
  if (target.seconds < 5) {
    if (target === round) $('save-status').textContent = 'Practice for at least 5 seconds to save a session.';
    return;
  }
  const userId = currentUser.id;
  target.saving = true;
  if (target === round) {
    $('save-status').textContent = 'Saving your session…';
    $('retry-save').hidden = true;
  }
  try {
    const {error, skipped} = await persistAttempt(authClient, target, userId);
    if (error || skipped) throw error || new Error('Session not ready.');
    if (currentUser?.id !== userId) return;
    if (target === round) $('save-status').textContent = 'Saved to My sessions. Nice work showing up.';
  } catch {
    if (target === round && currentUser?.id === userId) {
      $('save-status').textContent = 'Not saved yet. Check your connection and Supabase setup, then retry.';
      $('retry-save').hidden = false;
    }
  } finally {
    target.saving = false;
  }
}

async function initializeAuth() {
  try {
    authClient = await getAuthClient();
    const {data: {session}, error} = await authClient.auth.getSession();
    if (error) throw error;
    updateAccount(session?.user);
    // Defer database requests until Supabase releases its auth-state lock.
    authClient.auth.onAuthStateChange((_event, session) => setTimeout(() => updateAccount(session?.user), 0));
  } catch {
    // Account setup and connection errors are displayed on the account page.
    updateAccount(null);
  }
}

function topicChange(random = true) {
  if (['recording', 'starting', 'stopping'].includes(phase)) return;
  const list = topics[mode];
  topicIndex = random ? (topicIndex + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length : 0;
  const [title, prompt, query] = list[topicIndex];
  $('topic').textContent = title;
  $('prompt').textContent = prompt;
  $('topic-category').textContent = {everyday: 'EVERYDAY THINGS', discovery: 'CURIOUS DISCOVERIES', argument: 'MAKE YOUR CASE'}[mode];
  $('research').hidden = mode !== 'discovery';
  $('notes').value = '';
  if (query) $('research-link').href = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
}

function lock(on) {
  document.querySelectorAll('fieldset input').forEach((element) => { element.disabled = on; });
  $('shuffle').disabled = on;
  $('rescore').disabled = on;
}

function feedbackItem(title, body, meta = '') {
  const item = document.createElement('div');
  item.className = 'feedback-item';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const text = document.createElement('p');
  text.textContent = body;
  item.append(heading, text);
  if (meta) { const detail = document.createElement('small'); detail.textContent = meta; item.append(detail); }
  return item;
}

function renderSpeaking() {
  const transcript = analyzeTranscript($('transcript').value, seconds);
  const speaking = scoreSpeaking(audioSummary, transcript);
  $('speaking-score').textContent = speaking.score ?? '—';
  $('speaking-status').textContent = speaking.valid ? scoreLabel(speaking.score) : 'Record at least 10 words and 5 seconds';
  $('volume-score').textContent = speaking.components.volumeConsistency ?? '—';
  $('variation-score').textContent = speaking.components.vocalVariation ?? '—';
  $('pause-score').textContent = speaking.components.pauseControl ?? '—';
  $('pace').textContent = transcript.valid ? transcript.pace : '—';
  $('monotone').textContent = speaking.monotone === null ? '—' : speaking.monotone ? 'Detected' : 'No';
  $('rushing').textContent = speaking.rushing === null ? '—' : speaking.rushing ? 'Detected' : 'No';
  $('vocal-fillers').textContent = transcript.vocalizedFillers;
  $('context-fillers').textContent = transcript.contextualFillers;
  $('repetitions').textContent = transcript.repeats;
  $('incomplete-phrases').textContent = transcript.incompletePhrases;
  $('elapsed').textContent = seconds.toFixed(1);
  const tips = [];
  if (!speaking.valid) tips.push('Speak for at least 5 seconds and capture 10 words for a speaking score.');
  else {
    if (speaking.rushing) tips.push('Slow down and leave a brief pause between ideas.');
    if (speaking.monotone) tips.push('Emphasize one key word per sentence and vary your pitch at transitions.');
    if (speaking.components.volumeConsistency < 70) tips.push('Keep a steadier distance from the microphone and aim for a more even volume.');
    if (transcript.vocalizedFillers) tips.push('Replace an “um” or “uh” with a silent pause.');
    if (transcript.repeats) tips.push('When you restart a word, pause briefly and begin the thought again once.');
    if (transcript.incompletePhrases) tips.push('End the response with a complete thought rather than a connector.');
    if (!tips.length) tips.push('Your pace, volume, and vocal variation are in a useful practice range.');
  }
  $('coach').textContent = tips.join(' ');
  const detected = $('detected');
  detected.replaceChildren();
  const heading = document.createElement('h4');
  heading.textContent = 'Transcript delivery review';
  detected.append(heading);
  if (transcript.deliveryDetails.length) transcript.deliveryDetails.forEach((item) => detected.append(feedbackItem(`“${item.phrase}” · ${item.confidence} confidence`, item.reason, item.context)));
  else detected.append(feedbackItem('No delivery issues found', 'No removable fillers, immediate restarts, or incomplete endings were found in the recognized transcript.'));
}

async function renderContent(target) {
  const requestId = ++contentRequest;
  const transcript = $('transcript').value.trim();
  const contentFeedback = $('content-feedback');
  contentFeedback.replaceChildren();
  $('content-score').textContent = '…';
  $('content-status').textContent = 'Checking organization and relevance…';
  ['organization-score', 'relevance-score'].forEach((id) => { $(id).textContent = '—'; });
  try {
    const response = await fetch('/api/analyze-content', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({topic: target.topic, prompt: target.prompt, transcript})});
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Content analysis is unavailable.');
    if (requestId !== contentRequest || target !== round) return result;
    $('content-score').textContent = result.content_score;
    $('content-status').textContent = scoreLabel(result.content_score);
    $('organization-score').textContent = result.organization_score;
    $('relevance-score').textContent = result.relevance_score;
    const heading = document.createElement('h4'); heading.textContent = 'Content review'; contentFeedback.append(heading);
    contentFeedback.append(feedbackItem('Main idea', result.main_idea || 'No clear main idea was found.'));
    (result.strengths || []).forEach((strength) => contentFeedback.append(feedbackItem('What worked', strength)));
    (result.improvements || []).forEach((item) => contentFeedback.append(feedbackItem(item.excerpt ? `Review “${item.excerpt}”` : 'Make the idea clearer', item.reason, item.suggestion)));
    return result;
  } catch (error) {
    if (requestId !== contentRequest || target !== round) return null;
    $('content-score').textContent = '—';
    $('content-status').textContent = error.message;
    contentFeedback.append(feedbackItem('Content score unavailable', `${error.message} Add OPENAI_API_KEY to .env and run npm start. Your speaking score still works locally.`));
    return null;
  }
}

async function renderFeedback() {
  const target = round;
  if (!target || phase !== 'review' || target.evaluating || target.saving) return;
  target.evaluating = true;
  $('rescore').disabled = true;
  $('retry-save').hidden = true;
  renderSpeaking();
  const transcript = analyzeTranscript($('transcript').value, seconds);
  target.seconds = seconds;
  const speaking = scoreValue('speaking-score');
  const content = await renderContent(target);
  target.metrics = {
      speaking_score: speaking, content_score: content?.content_score ?? null,
      organization_score: content?.organization_score ?? null, relevance_score: content?.relevance_score ?? null,
      pace_wpm: transcript.valid ? transcript.pace : null,
      filler_count: transcript.fillers, repetition_count: transcript.repeats,
  };
  await savePractice(target);
  target.evaluating = false;
  if (target === round && phase === 'review') $('rescore').disabled = false;
}

function finishReview() {
  phase = 'review';
  lock(false);
  $('record').disabled = false;
  $('record').innerHTML = '<svg class="icon" aria-hidden="true"><use href="#mic-icon"/></svg> Another take';
  $('status').textContent = 'Round complete';
  $('empty').hidden = true;
  $('review').hidden = false;
  $('transcript').value = `${finalText} ${interim}`.trim();
  renderFeedback();
  $('message').textContent = recognitionFailed ? 'Live transcription was unavailable or interrupted. Replay your recording and correct or enter the transcript below.' : 'Your round is ready. Listen back and review your transcript.';
}

function startRecognition(token) {
  if (!Recognition) { recognitionFailed = true; return; }
  const current = new Recognition();
  recognition = current;
  current.lang = 'en-US';
  current.continuous = true;
  current.interimResults = true;
  current.onresult = (event) => {
    if (token !== run) return;
    interim = '';
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      if (event.results[index].isFinal) finalText += `${event.results[index][0].transcript} `;
      else interim += event.results[index][0].transcript;
    }
  };
  current.onerror = (event) => {
    if (token !== run) return;
    if (!['no-speech', 'aborted'].includes(event.error)) { recognitionFailed = true; $('message').textContent = 'Transcription interrupted. Audio analysis continues; you can enter a transcript afterward.'; }
  };
  current.onend = () => { if (token === run && phase === 'recording' && !recognitionFailed && recognitionRetries++ < 8) { interim = ''; startRecognition(token); } };
  try { current.start(); } catch { recognitionFailed = true; }
}

async function start() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { $('message').textContent = 'Recording is not supported here. Open this page over HTTPS or localhost in a browser with microphone support.'; return; }
  phase = 'starting'; lock(true); $('record').disabled = true; $('message').textContent = 'Allow microphone access to begin your round.';
  let localStream;
  try {
    localStream = await navigator.mediaDevices.getUserMedia({audio: true});
    stream = localStream;
    audioTracker = await createAudioTracker(stream);
    const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type));
    recorder = new MediaRecorder(stream, mime ? {mimeType: mime} : undefined);
    run += 1;
    contentRequest += 1;
    round = {id: crypto.randomUUID(), ownerId: currentUser?.id || null, topic: $('topic').textContent, prompt: $('prompt').textContent, createdAt: new Date().toISOString(), seconds: 0};
    $('save-status').textContent = '';
    $('retry-save').hidden = true;
    const token = run;
    chunks = []; finalText = ''; interim = ''; seconds = 0; audioSummary = null; recognitionFailed = false; recognitionRetries = 0;
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      audioSummary = await audioTracker?.stop();
      stream?.getTracks().forEach((track) => track.stop());
      if (url) URL.revokeObjectURL(url);
      const blob = new Blob(chunks, {type: recorder.mimeType});
      url = URL.createObjectURL(blob); $('audio').src = url; $('download').href = url; $('download').download = `speakwell-${new Date().toISOString().slice(0, 10)}.${blob.type.includes('mp4') ? 'm4a' : 'webm'}`; $('audio-wrap').hidden = !blob.size;
      setTimeout(() => { if (token !== run) return; recognition?.abort(); finishReview(); }, 500);
    };
    recorder.onerror = () => { recognitionFailed = true; stop(); };
    stream.getAudioTracks()[0].onended = () => { if (phase === 'recording') stop(); };
    recorder.start(200); started = performance.now(); phase = 'recording'; $('review').hidden = true; $('empty').hidden = false; $('audio').pause(); $('record').disabled = false; $('record').textContent = '■  Finish recording'; $('status').textContent = 'Recording your voice'; $('wave').classList.add('active'); $('message').textContent = 'Take your time. The recording stops automatically.'; startRecognition(token);
    clock = setInterval(() => { seconds = (performance.now() - started) / 1000; $('timer').textContent = time(Math.max(0, Math.ceil(duration - seconds))); $('recording-progress').value = Math.min(duration, seconds); if (seconds >= duration) stop(); }, 100);
  } catch (error) {
    localStream?.getTracks().forEach((track) => track.stop()); phase = 'idle'; lock(false); $('record').disabled = false;
    $('message').textContent = error.name === 'NotAllowedError' ? 'Microphone access was denied. Allow it in your browser settings, then try again.' : error.name === 'NotFoundError' ? 'No microphone was found. Connect one and try again.' : 'Could not start recording. Check your microphone and try again.';
  }
}

function stop() {
  if (phase !== 'recording') return;
  phase = 'stopping'; clearInterval(clock); seconds = (performance.now() - started) / 1000; $('record').disabled = true; $('status').textContent = 'Preparing your feedback'; $('wave').classList.remove('active');
  try { recognition?.stop(); } catch {}
  if (recorder?.state !== 'inactive') recorder.stop(); else finishReview();
}

$('record').onclick = () => phase === 'recording' ? stop() : start();
$('shuffle').onclick = () => topicChange();
$('rescore').onclick = renderFeedback;
$('retry-save').onclick = async () => {
  $('rescore').disabled = true;
  await savePractice();
  $('rescore').disabled = phase !== 'review';
};
document.querySelectorAll('input[name=mode]').forEach((input) => { input.onchange = () => { mode = input.value; document.querySelectorAll('.mode').forEach((element) => element.classList.toggle('selected', element.contains(input))); topicChange(false); if (phase === 'review') { phase = 'idle'; $('review').hidden = true; $('empty').hidden = false; } }; });
document.querySelectorAll('input[name=duration]').forEach((input) => { input.onchange = () => { duration = Number(input.value); $('timer').textContent = time(duration); $('recording-progress').max = duration; $('recording-progress').value = 0; }; });
if (!Recognition) $('message').textContent = 'Live transcription is unavailable in this browser. Recording still works; add a transcript afterward.';
initializeAuth();
window.addEventListener('pagehide', () => { clearInterval(clock); recognition?.abort(); stream?.getTracks().forEach((track) => track.stop()); if (url) URL.revokeObjectURL(url); });
