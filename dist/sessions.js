import {getAuthClient} from './auth-client.js';
import {fetchAttempts, summarizeAttempts, PAGE_SIZE} from './history.js';
const $ = (id) => document.getElementById(id);
let authClient, currentUser;
let historyRows = [], historyTotal = 0, historyRequest = 0, historyLoading = false;
function updateAccount(user) {
  const changed = currentUser?.id !== user?.id;
  currentUser = user || null;
  $('account-toggle').textContent = currentUser ? 'My account' : 'Sign in';
  $('history-guest').hidden = Boolean(currentUser);
  $('history-member').hidden = !currentUser;
  $('refresh-history').hidden = !currentUser;
  if (changed || !currentUser) {
    historyRequest++;
    historyLoading = false;
    historyRows = [];
    historyTotal = 0;
    $('progress-history').replaceChildren();
    $('history-stats').hidden = true;
    $('load-more').hidden = true;
    if (currentUser) loadProgress();
  }
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


$('refresh-history').onclick = () => loadProgress();
$('load-more').onclick = () => loadProgress(true);
async function initialize() {
  try {
    authClient = await getAuthClient();
    const {data, error} = await authClient.auth.getSession();
    if (error) throw error;
    updateAccount(data.session?.user);
    authClient.auth.onAuthStateChange((_event, session) => setTimeout(() => updateAccount(session?.user), 0));
  } catch (error) {
    $('sessions-status').textContent = error.message || 'Unable to connect. Reload this page to try again.';
    updateAccount(null);
  }
}
initialize();
