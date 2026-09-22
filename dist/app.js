import {analyzeTranscript} from './analysis.js';
import {createAudioTracker, scoreSpeaking} from './audio-analysis.js';
import {SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL} from './supabase-config.js';

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
let savedRound = -1;
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const time = (number) => `${Math.floor(number / 60)}:${String(number % 60).padStart(2, '0')}`;
const scoreLabel = (score) => score >= 85 ? 'Strong' : score >= 70 ? 'Solid foundation' : score >= 55 ? 'Developing' : 'Needs another pass';
const scoreValue = (id) => {
  const value = Number($(id).textContent);
  return Number.isFinite(value) ? value : null;
};

function updateAccount(user) {
  currentUser = user || null;
  $('account-toggle').textContent = currentUser ? currentUser.email : 'Sign in';
  $('auth-fields').hidden = Boolean(currentUser);
  $('sign-out').hidden = !currentUser;
  $('progress').hidden = !currentUser;
  $('auth-message').textContent = currentUser ? `Signed in as ${currentUser.email}` : 'Sign in to save your practice history.';
  if (currentUser) loadProgress();
}

function setAuthMessage(message) {
  $('auth-message').textContent = message;
}

function renderProgress(attempts) {
  const history = $('progress-history');
  history.replaceChildren();
  if (!attempts.length) {
    $('progress-summary').textContent = 'Your completed practice rounds will appear here.';
    return;
  }
  const speaking = attempts.filter((item) => Number.isFinite(item.speaking_score)).map((item) => item.speaking_score);
  const content = attempts.filter((item) => Number.isFinite(item.content_score)).map((item) => item.content_score);
  const average = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : '—';
  $('progress-summary').textContent = `${attempts.length} saved round${attempts.length === 1 ? '' : 's'} · average speaking ${average(speaking)} · average content ${average(content)}`;
  attempts.forEach((attempt) => {
    const item = document.createElement('div');
    item.className = 'progress-item';
    const title = document.createElement('div');
    const heading = document.createElement('strong');
    heading.textContent = attempt.topic;
    const date = document.createElement('small');
    date.textContent = new Date(attempt.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
    title.append(heading, date);
    const speakingScore = document.createElement('div');
    speakingScore.className = 'progress-score';
    speakingScore.textContent = 'speaking';
    const speakingValue = document.createElement('b');
    speakingValue.textContent = attempt.speaking_score ?? '—';
    speakingScore.append(speakingValue);
    const contentScore = document.createElement('div');
    contentScore.className = 'progress-score';
    contentScore.textContent = 'content';
    const contentValue = document.createElement('b');
    contentValue.textContent = attempt.content_score ?? '—';
    contentScore.append(contentValue);
    item.append(title, speakingScore, contentScore);
    history.append(item);
  });
}

async function loadProgress() {
  if (!authClient || !currentUser) return;
  const {data, error} = await authClient.from('practice_attempts').select('created_at, topic, speaking_score, content_score').order('created_at', {ascending: false}).limit(8);
  if (error) {
    $('progress-summary').textContent = 'Progress storage needs the Supabase table setup described in the README.';
    return;
  }
  renderProgress(data || []);
}

async function savePractice() {
  if (!authClient || !currentUser || savedRound === run || seconds < 5) return;
  savedRound = run;
  const transcript = analyzeTranscript($('transcript').value, seconds);
  const {error} = await authClient.from('practice_attempts').insert({
    user_id: currentUser.id,
    topic: $('topic').textContent,
    prompt: $('prompt').textContent,
    duration_seconds: Math.round(seconds),
    speaking_score: scoreValue('speaking-score'),
    content_score: scoreValue('content-score'),
    organization_score: scoreValue('organization-score'),
    relevance_score: scoreValue('relevance-score'),
    pace_wpm: transcript.valid ? transcript.pace : null,
    filler_count: transcript.fillers,
    repetition_count: transcript.repeats,
  });
  if (error) {
    savedRound = -1;
    $('progress-summary').textContent = 'This round could not be saved. Check the Supabase setup and try again.';
    return;
  }
  loadProgress();
}

async function initializeAuth() {
  try {
    let config = {url: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY};
    if (!config.url || !config.publishableKey) {
      const response = await fetch('/api/auth-config');
      config = response.ok ? await response.json() : config;
    }
    if (!config.url || !config.publishableKey) {
      setAuthMessage('Accounts are not configured yet. Add the Supabase values described in the README.');
      return;
    }
    const {createClient} = await import('https://esm.sh/@supabase/supabase-js@2');
    authClient = createClient(config.url, config.publishableKey);
    const {data: {session}} = await authClient.auth.getSession();
    updateAccount(session?.user);
    authClient.auth.onAuthStateChange((_event, session) => updateAccount(session?.user));
  } catch {
    setAuthMessage('Accounts are unavailable right now. You can still practice without signing in.');
  }
}

async function signIn() {
  if (!authClient) { setAuthMessage('Accounts are not configured yet.'); return; }
  const email = $('auth-email').value.trim();
  const password = $('auth-password').value;
  if (!email || !password) { setAuthMessage('Enter an email address and password.'); return; }
  const {error} = await authClient.auth.signInWithPassword({email, password});
  setAuthMessage(error ? error.message : 'Signed in. Your progress is now saved.');
}

async function signUp() {
  if (!authClient) { setAuthMessage('Accounts are not configured yet.'); return; }
  const email = $('auth-email').value.trim();
  const password = $('auth-password').value;
  if (!email || password.length < 8) { setAuthMessage('Enter an email address and a password with at least 8 characters.'); return; }
  const {data, error} = await authClient.auth.signUp({email, password, options: {emailRedirectTo: `${location.origin}${location.pathname}`}});
  setAuthMessage(error ? error.message : data.session ? 'Account created. Your progress is now saved.' : 'Account created. Check your email to confirm the account, then sign in.');
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

async function renderContent() {
  const requestId = ++contentRequest;
  const transcript = $('transcript').value.trim();
  const contentFeedback = $('content-feedback');
  contentFeedback.replaceChildren();
  $('content-score').textContent = '…';
  $('content-status').textContent = 'Checking organization and relevance…';
  ['organization-score', 'relevance-score'].forEach((id) => { $(id).textContent = '—'; });
  try {
    const response = await fetch('/api/analyze-content', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({topic: $('topic').textContent, prompt: $('prompt').textContent, transcript})});
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Content analysis is unavailable.');
    if (requestId !== contentRequest) return;
    $('content-score').textContent = result.content_score;
    $('content-status').textContent = scoreLabel(result.content_score);
    $('organization-score').textContent = result.organization_score;
    $('relevance-score').textContent = result.relevance_score;
    const heading = document.createElement('h4'); heading.textContent = 'Content review'; contentFeedback.append(heading);
    contentFeedback.append(feedbackItem('Main idea', result.main_idea || 'No clear main idea was found.'));
    (result.strengths || []).forEach((strength) => contentFeedback.append(feedbackItem('What worked', strength)));
    (result.improvements || []).forEach((item) => contentFeedback.append(feedbackItem(item.excerpt ? `Review “${item.excerpt}”` : 'Make the idea clearer', item.reason, item.suggestion)));
  } catch (error) {
    if (requestId !== contentRequest) return;
    $('content-score').textContent = '—';
    $('content-status').textContent = error.message;
    contentFeedback.append(feedbackItem('Content score unavailable', `${error.message} Add OPENAI_API_KEY to .env and run npm start. Your speaking score still works locally.`));
  }
}

function renderFeedback() {
  renderSpeaking();
  renderContent().finally(savePractice);
}

function finishReview() {
  phase = 'review';
  lock(false);
  $('record').disabled = false;
  $('record').innerHTML = '<span>●</span> Practice again';
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
    clock = setInterval(() => { seconds = (performance.now() - started) / 1000; $('timer').textContent = time(Math.max(0, Math.ceil(duration - seconds))); $('progress').value = Math.min(duration, seconds); if (seconds >= duration) stop(); }, 100);
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
$('account-toggle').onclick = () => { $('account-menu').hidden = !$('account-menu').hidden; };
$('sign-in').onclick = signIn;
$('sign-up').onclick = signUp;
$('sign-out').onclick = async () => {
  if (!authClient) return;
  const {error} = await authClient.auth.signOut();
  if (error) setAuthMessage(error.message);
};
document.querySelectorAll('input[name=mode]').forEach((input) => { input.onchange = () => { mode = input.value; document.querySelectorAll('.mode').forEach((element) => element.classList.toggle('selected', element.contains(input))); topicChange(false); if (phase === 'review') { phase = 'idle'; $('review').hidden = true; $('empty').hidden = false; } }; });
document.querySelectorAll('input[name=duration]').forEach((input) => { input.onchange = () => { duration = Number(input.value); $('timer').textContent = time(duration); $('progress').max = duration; $('progress').value = 0; }; });
if (!Recognition) $('message').textContent = 'Live transcription is unavailable in this browser. Recording still works; add a transcript afterward.';
initializeAuth();
window.addEventListener('pagehide', () => { clearInterval(clock); recognition?.abort(); stream?.getTracks().forEach((track) => track.stop()); if (url) URL.revokeObjectURL(url); });
