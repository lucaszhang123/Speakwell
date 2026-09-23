import {analyzeTranscript} from './analysis.js';
import {createAudioTracker, scoreSpeaking} from './audio-analysis.js';
import {SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL} from './supabase-config.js';

import {fetchAttempts, summarizeAttempts, persistAttempt, PAGE_SIZE} from './history.js';

const $ = (id) => document.getElementById(id);
const topics = {
  everyday: [['Candy', 'What makes a childhood favorite so memorable?'], ['Polar bears', 'What could we learn from life in an extreme environment?'], ['Rainy days', 'Tell a story about finding something good in a gloomy day.'], ['Coffee', 'Explain the ritual behind an everyday drink.'], ['A favorite book', 'Share one idea that stayed with you.'], ['Bicycles', 'Why does a simple invention make such a difference?'], ['Street food', 'Take your audience on a tour of your favorite flavors.'], ['Houseplants', 'What can caring for something small teach us?'], ['Board games', 'What makes a game worth playing again?'], ['Music', 'Describe a song through the memory it brings back.'], ['The ocean', 'Explain what fascinates you about the sea.'], ['A perfect weekend', 'Walk us through your ideal way to recharge.'], ['Your morning routine', 'Describe one part of your routine that sets the tone for your day.'], ['A place you would revisit', 'Take your audience there and explain why you would go back.'], ['The best meal you have had', 'Describe the meal and the memory that makes it stand out.'], ['A small act of kindness', 'Tell a story about a kind gesture and why it mattered.'], ['A useful object', 'Choose an everyday object and explain why it deserves more appreciation.'], ['A family tradition', 'Describe a tradition and what it says about the people involved.'], ['Your ideal classroom', 'Explain what it would feel like to learn there.'], ['A skill everyone should learn', 'Name the skill and give a practical reason it matters.'], ['A memorable celebration', 'Tell the story of a celebration and the moment you remember most.'], ['A piece of advice', 'Share advice that has helped you, and explain when it is useful.']],
  discovery: [['The Mpemba effect', 'Research when warmer water may freeze sooner than cooler water. Explain the conditions and the uncertainty.', 'Mpemba effect'], ['The doorway effect', 'Research why walking into a new room can affect recall. Explain an experiment and its limits.', 'doorway effect memory'], ['The cocktail party effect', 'How do we attend to one voice in a crowded room? Research a possible explanation.', 'cocktail party effect auditory attention'], ['Slime mold navigation', 'Research how slime molds form networks. Explain what the findings do and do not show.', 'Physarum network formation'], ['The rubber hand illusion', 'Research how a simple illusion changes our sense of body ownership.', 'rubber hand illusion'], ['Sonoluminescence', 'Research how collapsing bubbles can emit light. Explain what remains uncertain.', 'sonoluminescence'], ['The Leidenfrost effect', 'Research why a droplet can glide over a very hot surface.', 'Leidenfrost effect'], ['The missing satellite problem', 'Research the gap between predicted and observed small satellite galaxies.', 'missing satellites problem'], ['Tardigrades', 'Research how tardigrades survive harsh environments and separate established evidence from popular claims.', 'tardigrade survival mechanisms'], ['Bioluminescence', 'Explain why some living things produce light and how that ability helps them.', 'bioluminescence function'], ['The placebo effect', 'Explain what researchers mean by the placebo effect and why it matters in clinical studies.', 'placebo effect clinical trials'], ['Ant communication', 'Research how ants communicate and give one example of how a colony uses that information.', 'ant communication pheromones'], ['The Great Red Spot', 'Explain what scientists know about Jupiter’s Great Red Spot and what remains uncertain.', 'Jupiter Great Red Spot research'], ['The science of sleep', 'Describe one important role sleep plays and explain the evidence behind it.', 'sleep function research'], ['CRISPR', 'Explain the basic idea behind CRISPR and one question it raises.', 'CRISPR gene editing overview'], ['The Northern Lights', 'Explain how auroras form and why they appear near the poles.', 'aurora borealis science'], ['The microbiome', 'Explain what the human microbiome is and why scientists study it.', 'human microbiome overview'], ['Black holes', 'Explain one way scientists detect black holes even though light cannot escape them.', 'how scientists detect black holes']],
  argument: [['What is one policy you would enact if you were president?', 'Explain your proposal, acknowledge a tradeoff, and consider an objection.'], ['What makes a good leader?', 'Choose one quality and defend it with a concrete example.'], ['Should schools start later?', 'Make a case, acknowledge a tradeoff, and respond to an objection.'], ['Is talent or practice more important?', 'Choose your position and explain the strongest reason for it.'], ['Should everyone learn a musical instrument?', 'Build an argument with a clear claim, example, and conclusion.'], ['Is competition good for creativity?', 'Defend your view while considering the other side.'], ['Should a four-day workweek be the norm?', 'Explain a benefit, a cost, and how you would weigh them.'], ['Would you rather explore space or the ocean?', 'Choose where to focus and support your argument.'], ['Should homework be limited?', 'Make a clear case and address one concern about your position.'], ['Are phones helpful in class?', 'Choose a position and explain what rule you would adopt.'], ['Should voting be mandatory?', 'Defend your position while considering individual choice.'], ['Is social media good for friendship?', 'Make an argument that includes both a benefit and a drawback.'], ['Should public transit be free?', 'Explain who would benefit, what the cost might be, and your conclusion.'], ['Should cities plant more trees?', 'Make your case with one concrete benefit and one realistic challenge.'], ['Should college be free?', 'Explain your position and respond to one likely objection.'], ['Should athletes be paid in college?', 'State your view and use one reason that matters most.'], ['Is artificial intelligence more helpful or harmful in school?', 'Choose a side, define one limit, and support your argument.'], ['Should schools require community service?', 'Argue for or against the requirement with a clear example.']],
};

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
let historyRows = [];
let historyTotal = 0;
let historyRequest = 0;
let historyLoading = false;
let authBusy = false;
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const time = (number) => `${Math.floor(number / 60)}:${String(number % 60).padStart(2, '0')}`;
const scoreLabel = (score) => score >= 85 ? 'Strong' : score >= 70 ? 'Solid foundation' : score >= 55 ? 'Developing' : 'Needs another pass';
const scoreValue = (id) => {
  const value = Number($(id).textContent);
  return Number.isFinite(value) ? value : null;
};


function setAccountMenu(open) {
  $('account-menu').hidden = !open;
  $('account-toggle').setAttribute('aria-expanded', String(open));
  if (open && !currentUser) $('auth-email').focus();
}

function updateAccount(user) {
  const changed = currentUser?.id !== user?.id;
  currentUser = user || null;
  $('account-toggle').textContent = currentUser ? 'My account' : 'Sign in';
  $('auth-fields').hidden = Boolean(currentUser);
  $('sign-out').hidden = !currentUser;
  $('history-guest').hidden = Boolean(currentUser);
  $('history-member').hidden = !currentUser;
  $('refresh-history').hidden = !currentUser;
  $('auth-message').textContent = currentUser ? `Signed in as ${currentUser.email}` : 'Sign in to save your practice history.';
  if (changed) {
    historyRequest += 1;
    historyLoading = false;
    historyRows = [];
    historyTotal = 0;
    $('progress-history').replaceChildren();
    $('history-stats').hidden = true;
    $('load-more').hidden = true;
    $('retry-save').hidden = true;
    if (round && round.ownerId !== currentUser?.id) $('save-status').textContent = 'Sign in before your next round to save it to your account.';
    if (currentUser) {
      $('auth-password').value = '';
      loadProgress();
    }
  }
}

function setAuthMessage(message) {
  $('auth-message').textContent = message;
}

function renderProgress() {
  const history = $('progress-history');
  history.replaceChildren();
  const averages = summarizeAttempts(historyRows);
  $('history-stats').hidden = !historyRows.length;
  $('history-count').textContent = historyTotal;
  $('history-speaking').textContent = averages.speaking ?? '—';
  $('history-content').textContent = averages.content ?? '—';
  $('progress-summary').textContent = historyRows.length
    ? `Showing ${historyRows.length} of ${historyTotal} saved sessions. Select a session to see its details.`
    : 'Your first take is waiting. Record a round of at least 5 seconds while signed in, and it will appear here.';
  $('load-more').hidden = historyRows.length >= historyTotal;
  historyRows.forEach((attempt) => {
    const item = document.createElement('details');
    item.className = 'history-item';
    const summary = document.createElement('summary');
    const title = document.createElement('div');
    title.className = 'history-title';
    const heading = document.createElement('strong');
    heading.textContent = attempt.topic;
    const date = document.createElement('small');
    date.textContent = new Date(attempt.created_at).toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'});
    title.append(heading, date);
    summary.append(title);
    ['speaking', 'content'].forEach((type) => {
      const score = document.createElement('div');
      score.className = 'history-score';
      score.textContent = type;
      const value = document.createElement('b');
      value.textContent = attempt[`${type}_score`] ?? '—';
      score.append(value);
      summary.append(score);
    });
    const detail = document.createElement('div');
    detail.className = 'history-detail';
    const prompt = document.createElement('p');
    prompt.textContent = attempt.prompt;
    detail.append(prompt);
    const metrics = document.createElement('dl');
    [['Duration', attempt.duration_seconds == null ? '—' : `${attempt.duration_seconds}s`], ['Organization', attempt.organization_score], ['Relevance', attempt.relevance_score], ['Words / minute', attempt.pace_wpm], ['Fillers', attempt.filler_count], ['Restarts', attempt.repetition_count]].forEach(([label, value]) => {
      const group = document.createElement('div');
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      description.textContent = value ?? '—';
      group.append(term, description);
      metrics.append(group);
    });
    detail.append(metrics);
    item.append(summary, detail);
    history.append(item);
  });
}

async function loadProgress(append = false) {
  if (!authClient || !currentUser || (append && historyLoading)) return;
  const userId = currentUser.id;
  const requestId = ++historyRequest;
  const offset = append ? historyRows.length : 0;
  historyLoading = true;
  $('load-more').disabled = true;
  $('refresh-history').disabled = true;
  $('progress-summary').textContent = append ? 'Loading older sessions…' : 'Loading your sessions…';
  try {
    const {data, count, error} = await fetchAttempts(authClient, userId, offset);
    if (error) throw error;
    if (requestId !== historyRequest || currentUser?.id !== userId) return;
    const combined = append ? [...historyRows, ...(data || [])] : data || [];
    historyRows = [...new Map(combined.map((item) => [item.id, item])).values()];
    historyTotal = count ?? (offset + (data || []).length + ((data || []).length === PAGE_SIZE ? 1 : 0));
    renderProgress();
  } catch {
    if (requestId !== historyRequest || currentUser?.id !== userId) return;
    $('progress-summary').textContent = 'We couldn’t load your sessions. Check your connection, then select Refresh. If this is a new setup, run the Supabase schema in the README.';
  } finally {
    if (requestId === historyRequest) {
      historyLoading = false;
      $('load-more').disabled = false;
      $('refresh-history').disabled = false;
    }
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
    await loadProgress();
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
    let config = {url: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY};
    if (!config.url || !config.publishableKey) {
      const response = await fetch('/api/auth-config');
      config = response.ok ? await response.json() : config;
    }
    if (!config.url || !config.publishableKey) {
      setAuthMessage('Accounts are not configured yet. Add the Supabase values described in the README. You can still practice without an account.');
      return;
    }
    const {createClient} = await import('https://esm.sh/@supabase/supabase-js@2');
    authClient = createClient(config.url, config.publishableKey);
    const {data: {session}, error} = await authClient.auth.getSession();
    if (error) throw error;
    updateAccount(session?.user);
    // Defer database requests until Supabase releases its auth-state lock.
    authClient.auth.onAuthStateChange((_event, session) => setTimeout(() => updateAccount(session?.user), 0));
  } catch {
    setAuthMessage('Accounts are unavailable right now. You can still practice without signing in. Try reloading the page.');
  }
}

async function authenticate(create = false) {
  if (authBusy) return;
  if (!authClient) { setAuthMessage('Accounts are not connected. Follow the Supabase setup in the README; practice still works without signing in.'); return; }
  if (!$('auth-fields').reportValidity()) return;
  const email = $('auth-email').value.trim();
  const password = $('auth-password').value;
  if (create && password.length < 8) { setAuthMessage('Use a password with at least 8 characters.'); return; }
  authBusy = true;
  $('sign-in').disabled = true;
  $('sign-up').disabled = true;
  setAuthMessage(create ? 'Creating your account…' : 'Signing you in…');
  try {
    const {data, error} = create
      ? await authClient.auth.signUp({email, password, options: {emailRedirectTo: `${location.origin}${location.pathname}`}})
      : await authClient.auth.signInWithPassword({email, password});
    if (error) throw error;
    if (data.session?.user) {
      updateAccount(data.session.user);
      setAccountMenu(false);
      $('practice-history').scrollIntoView({behavior: 'smooth', block: 'start'});
    } else {
      setAuthMessage('Check your email to confirm your account, then sign in.');
    }
  } catch (error) {
    setAuthMessage(error.message || 'Unable to sign in. Check your connection and try again.');
  } finally {
    authBusy = false;
    $('sign-in').disabled = false;
    $('sign-up').disabled = false;
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
$('account-toggle').onclick = () => setAccountMenu($('account-menu').hidden);
$('account-close').onclick = () => { setAccountMenu(false); $('account-toggle').focus(); };
$('history-sign-in').onclick = () => { window.scrollTo({top: 0, behavior: 'smooth'}); setAccountMenu(true); };
$('auth-fields').onsubmit = (event) => { event.preventDefault(); authenticate(); };
$('sign-up').onclick = () => authenticate(true);
$('refresh-history').onclick = () => loadProgress();
$('load-more').onclick = () => loadProgress(true);
$('retry-save').onclick = async () => {
  $('rescore').disabled = true;
  await savePractice();
  $('rescore').disabled = phase !== 'review';
};
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !$('account-menu').hidden) { setAccountMenu(false); $('account-toggle').focus(); }
});
document.addEventListener('click', (event) => { if (!event.target.closest('.account') && !event.target.closest('#history-sign-in')) setAccountMenu(false); });
$('sign-out').onclick = async () => {
  if (!authClient) return;
  try {
    const {error} = await authClient.auth.signOut();
    if (error) throw error;
    updateAccount(null);
    setAccountMenu(false);
  } catch (error) { setAuthMessage(error.message || 'Could not sign out. Try again.'); }
};
document.querySelectorAll('input[name=mode]').forEach((input) => { input.onchange = () => { mode = input.value; document.querySelectorAll('.mode').forEach((element) => element.classList.toggle('selected', element.contains(input))); topicChange(false); if (phase === 'review') { phase = 'idle'; $('review').hidden = true; $('empty').hidden = false; } }; });
document.querySelectorAll('input[name=duration]').forEach((input) => { input.onchange = () => { duration = Number(input.value); $('timer').textContent = time(duration); $('recording-progress').max = duration; $('recording-progress').value = 0; }; });
if (!Recognition) $('message').textContent = 'Live transcription is unavailable in this browser. Recording still works; add a transcript afterward.';
initializeAuth();
window.addEventListener('pagehide', () => { clearInterval(clock); recognition?.abort(); stream?.getTracks().forEach((track) => track.stop()); if (url) URL.revokeObjectURL(url); });
