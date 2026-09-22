import {analyzeTranscript} from './analysis.js';
import {createAudioTracker, scoreSpeaking} from './audio-analysis.js';

const $ = (id) => document.getElementById(id);
const topics = {
  everyday: [['Candy', 'What makes a childhood favorite so memorable?'], ['Polar bears', 'What could we learn from life in an extreme environment?'], ['Rainy days', 'Tell a story about finding something good in a gloomy day.'], ['Coffee', 'Explain the ritual behind an everyday drink.'], ['A favorite book', 'Share one idea that stayed with you.'], ['Bicycles', 'Why does a simple invention make such a difference?'], ['Street food', 'Take your audience on a tour of your favorite flavors.'], ['Houseplants', 'What can caring for something small teach us?'], ['Board games', 'What makes a game worth playing again?'], ['Music', 'Describe a song through the memory it brings back.'], ['The ocean', 'Explain what fascinates you about the sea.'], ['A perfect weekend', 'Walk us through your ideal way to recharge.']],
  discovery: [['The Mpemba effect', 'Research when warmer water may freeze sooner than cooler water. Explain the conditions and the uncertainty.', 'Mpemba effect'], ['The doorway effect', 'Research why walking into a new room can affect recall. Explain an experiment and its limits.', 'doorway effect memory'], ['The cocktail party effect', 'How do we attend to one voice in a crowded room? Research a possible explanation.', 'cocktail party effect auditory attention'], ['Slime mold navigation', 'Research how slime molds form networks. Explain what the findings do and do not show.', 'Physarum network formation'], ['The rubber hand illusion', 'Research how a simple illusion changes our sense of body ownership.', 'rubber hand illusion'], ['Sonoluminescence', 'Research how collapsing bubbles can emit light. Explain what remains uncertain.', 'sonoluminescence'], ['The Leidenfrost effect', 'Research why a droplet can glide over a very hot surface.', 'Leidenfrost effect'], ['The missing satellite problem', 'Research the gap between predicted and observed small satellite galaxies.', 'missing satellites problem']],
  argument: [['What is one policy you would enact if you were president?', 'Explain your proposal, acknowledge a tradeoff, and consider an objection.'], ['What makes a good leader?', 'Choose one quality and defend it with a concrete example.'], ['Should schools start later?', 'Make a case, acknowledge a tradeoff, and respond to an objection.'], ['Is talent or practice more important?', 'Choose your position and explain the strongest reason for it.'], ['Should everyone learn a musical instrument?', 'Build an argument with a clear claim, example, and conclusion.'], ['Is competition good for creativity?', 'Defend your view while considering the other side.'], ['Should a four-day workweek be the norm?', 'Explain a benefit, a cost, and how you would weigh them.'], ['Would you rather explore space or the ocean?', 'Choose where to focus and support your argument.']],
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
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const time = (number) => `${Math.floor(number / 60)}:${String(number % 60).padStart(2, '0')}`;
const scoreLabel = (score) => score >= 85 ? 'Strong' : score >= 70 ? 'Solid foundation' : score >= 55 ? 'Developing' : 'Needs another pass';

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
  $('elapsed').textContent = seconds.toFixed(1);
  const tips = [];
  if (!speaking.valid) tips.push('Speak for at least 5 seconds and capture 10 words for a speaking score.');
  else {
    if (speaking.rushing) tips.push('Slow down and leave a brief pause between ideas.');
    if (speaking.monotone) tips.push('Emphasize one key word per sentence and vary your pitch at transitions.');
    if (speaking.components.volumeConsistency < 70) tips.push('Keep a steadier distance from the microphone and aim for a more even volume.');
    if (transcript.vocalizedFillers) tips.push('Replace an “um” or “uh” with a silent pause.');
    if (!tips.length) tips.push('Your pace, volume, and vocal variation are in a useful practice range.');
  }
  $('coach').textContent = tips.join(' ');
  const detected = $('detected');
  detected.replaceChildren();
  const heading = document.createElement('h4');
  heading.textContent = 'Transcript delivery review';
  detected.append(heading);
  if (transcript.fillerDetails.length) transcript.fillerDetails.forEach((item) => detected.append(feedbackItem(`“${item.phrase}” · ${item.confidence} confidence`, item.reason, item.context)));
  else detected.append(feedbackItem('No fillers found', 'No vocalized or contextual filler looked removable based on the recognized transcript.'));
  if (transcript.repeats) detected.append(feedbackItem(`${transcript.repeats} immediate repetition${transcript.repeats === 1 ? '' : 's'}`, `Review: ${transcript.repeated.join(', ')}. Repetition can also be emphasis or a recognition error.`));
}

async function renderContent() {
  const requestId = ++contentRequest;
  const transcript = $('transcript').value.trim();
  const contentFeedback = $('content-feedback');
  contentFeedback.replaceChildren();
  $('content-score').textContent = '…';
  $('content-status').textContent = 'Checking logical clarity…';
  ['clarity-score', 'organization-score', 'relevance-score'].forEach((id) => { $(id).textContent = '—'; });
  try {
    const response = await fetch('/api/analyze-content', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({topic: $('topic').textContent, prompt: $('prompt').textContent, transcript})});
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Content analysis is unavailable.');
    if (requestId !== contentRequest) return;
    $('content-score').textContent = result.content_score;
    $('content-status').textContent = scoreLabel(result.content_score);
    $('clarity-score').textContent = result.clarity_score;
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
  renderContent();
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
document.querySelectorAll('input[name=mode]').forEach((input) => { input.onchange = () => { mode = input.value; document.querySelectorAll('.mode').forEach((element) => element.classList.toggle('selected', element.contains(input))); topicChange(false); if (phase === 'review') { phase = 'idle'; $('review').hidden = true; $('empty').hidden = false; } }; });
document.querySelectorAll('input[name=duration]').forEach((input) => { input.onchange = () => { duration = Number(input.value); $('timer').textContent = time(duration); $('progress').max = duration; $('progress').value = 0; }; });
if (!Recognition) $('message').textContent = 'Live transcription is unavailable in this browser. Recording still works; add a transcript afterward.';
window.addEventListener('pagehide', () => { clearInterval(clock); recognition?.abort(); stream?.getTracks().forEach((track) => track.stop()); if (url) URL.revokeObjectURL(url); });
