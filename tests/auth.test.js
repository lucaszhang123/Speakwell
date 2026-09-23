import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source = (await readFile(new URL('../dist/auth.js', import.meta.url), 'utf8')).replace(/^import .*\n/, '');
async function submitSignup(response) {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {value: '', textContent: '', hidden: false, disabled: false,
      setAttribute() {}, reportValidity: () => true, focus() { this.focused = true; }});
    return elements.get(id);
  };
  let redirect;
  const client = {auth: {
    getSession: async () => ({data: {session: null}}),
    onAuthStateChange() {},
    signUp: async () => response,
  }};
  const context = vm.createContext({document: {getElementById: element}, URL, URLSearchParams, setTimeout,
    location: {search: '?mode=signup', href: 'https://example.com/login.html', assign: (url) => { redirect = url; }},
    getAuthClient: async () => client,
  });
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  element('auth-email').value = 'member@example.com';
  element('auth-password').value = 'example-password';
  await element('auth-fields').onsubmit({preventDefault() {}});
  return {element, redirect};
}

test('duplicate signup with an obfuscated user switches to sign-in instead of promising email', async () => {
  const {element, redirect} = await submitSignup({data: {user: {identities: []}, session: null}, error: null});
  assert.match(element('auth-message').textContent, /already exists/);
  assert.equal(element('auth-submit').textContent, 'Sign in');
  assert.equal(element('auth-email').value, 'member@example.com');
  assert.equal(element('auth-password').value, '');
  assert.equal(element('auth-password').focused, true);
  assert.equal(element('auth-submit').disabled, false);
  assert.equal(redirect, undefined);
});
for (const code of ['user_already_exists', 'email_exists']) {
  test(`duplicate signup error ${code} offers sign-in`, async () => {
    const {element} = await submitSignup({data: null, error: {code, message: 'User already registered'}});
    assert.match(element('auth-message').textContent, /already exists/);
    assert.equal(element('auth-submit').textContent, 'Sign in');
  });
}
test('new signup awaiting confirmation still shows email instructions', async () => {
  const {element} = await submitSignup({data: {user: {identities: [{provider: 'email'}]}, session: null}, error: null});
  assert.match(element('auth-message').textContent, /Check your email/);
  assert.equal(element('auth-submit').textContent, 'Create account');
});
test('signup with a session navigates to sessions', async () => {
  const {redirect} = await submitSignup({data: {session: {user: {id: 'new-user'}}}, error: null});
  assert.equal(redirect, './sessions.html');
});
test('unrelated signup failures retain their error and signup mode', async () => {
  const {element} = await submitSignup({data: null, error: {code: 'over_email_send_rate_limit', message: 'Please try again later.'}});
  assert.equal(element('auth-message').textContent, 'Please try again later.');
  assert.equal(element('auth-submit').textContent, 'Create account');
});
