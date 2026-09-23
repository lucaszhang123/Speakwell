import {getAuthClient} from './auth-client.js';
const $ = (id) => document.getElementById(id);
let client;
let create = new URLSearchParams(location.search).get('mode') === 'signup';
let busy = false;
function setMode(signup) {
  create = signup;
  $('mode-sign-in').setAttribute('aria-pressed', String(!create));
  $('mode-sign-up').setAttribute('aria-pressed', String(create));
  $('auth-title').textContent = create ? 'Your space to grow.' : 'Welcome back.';
  $('auth-description').textContent = create ? 'Start saving your sessions and following your progress.' : 'Make room for your next breakthrough.';
  $('auth-submit').textContent = create ? 'Create account' : 'Sign in';
  $('auth-password').autocomplete = create ? 'new-password' : 'current-password';
  $('auth-password').minLength = create ? 8 : 1;
  $('password-help').hidden = !create;
  document.title = `${create ? 'Create account' : 'Sign in'} — Speakwell`;
  if (client) $('auth-message').textContent = '';
}
function showAccount(user) {
  $('auth-fields').hidden = Boolean(user);
  $('auth-choices').hidden = Boolean(user);
  $('account-details').hidden = !user;
  $('guest-link').textContent = user ? 'Back to the studio ↗' : 'Continue practicing as a guest ↗';
  if (user) {
    $('auth-title').textContent = 'You’re signed in.';
    $('auth-description').textContent = 'Your next great take is waiting.';
    $('account-email').textContent = user.email;
    $('auth-password').value = '';
  } else setMode(create);
}
async function initialize() {
  $('auth-retry').hidden = true;
  $('auth-submit').disabled = true;
  $('auth-message').textContent = 'Connecting to accounts…';
  try {
    client = await getAuthClient();
    const {data, error} = await client.auth.getSession();
    if (error) throw error;
    showAccount(data.session?.user);
    $('auth-message').textContent = '';
    $('auth-submit').disabled = false;
    client.auth.onAuthStateChange((_event, session) => setTimeout(() => showAccount(session?.user), 0));
  } catch (error) {
    client = null;
    $('auth-message').textContent = error.message || 'Unable to connect. Please try again.';
    $('auth-retry').hidden = false;
  }
}
$('mode-sign-in').onclick = () => setMode(false);
$('mode-sign-up').onclick = () => setMode(true);
$('auth-retry').onclick = initialize;
$('auth-fields').onsubmit = async (event) => {
  event.preventDefault();
  if (!client || busy || !$('auth-fields').reportValidity()) return;
  busy = true;
  for (const id of ['auth-submit', 'mode-sign-in', 'mode-sign-up']) $(id).disabled = true;
  $('auth-message').textContent = create ? 'Creating your account…' : 'Signing you in…';
  try {
    const credentials = {email: $('auth-email').value.trim(), password: $('auth-password').value};
    const {data, error} = create
      ? await client.auth.signUp({...credentials, options: {emailRedirectTo: new URL('login.html', location.href).href.split('?')[0]}})
      : await client.auth.signInWithPassword(credentials);
    // Supabase can return an obfuscated user for a registered email.
    const alreadyRegistered = create && (
      ['user_already_exists', 'email_exists'].includes(error?.code) ||
      (!error && !data?.session && Array.isArray(data?.user?.identities) && data.user.identities.length === 0)
    );
    if (alreadyRegistered) {
      setMode(false);
      $('auth-password').value = '';
      $('auth-message').textContent = 'An account with this email already exists. Sign in with your existing password.';
      $('auth-password').focus();
      return;
    }
    if (error) throw error;
    if (data.session) location.assign('./sessions.html');
    else {
      $('auth-password').value = '';
      $('auth-message').textContent = 'Check your email for a confirmation link, then return here to sign in.';
    }
  } catch (error) {
    $('auth-message').textContent = error.message || 'Unable to sign in. Please try again.';
  } finally {
    busy = false;
    for (const id of ['auth-submit', 'mode-sign-in', 'mode-sign-up']) $(id).disabled = false;
  }
};
$('sign-out').onclick = async () => {
  $('sign-out').disabled = true;
  try {
    const {error} = await client.auth.signOut();
    if (error) throw error;
    showAccount(null);
    $('auth-message').textContent = 'You’ve signed out.';
  } catch (error) { $('auth-message').textContent = error.message || 'Unable to sign out. Please try again.'; }
  finally { $('sign-out').disabled = false; }
};
setMode(create);
initialize();
