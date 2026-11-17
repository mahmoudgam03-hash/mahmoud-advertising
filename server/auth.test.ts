import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  parseCookieHeader,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from './auth';

test('hashPassword and verifyPassword validate matching passwords and reject wrong ones', () => {
  const hash = hashPassword('Admin@2026');
  assert.ok(hash.includes(':'));
  assert.equal(verifyPassword('Admin@2026', hash), true);
  assert.equal(verifyPassword('wrong-password', hash), false);
  assert.equal(verifyPassword('Admin@2026', 'malformed-hash'), false);
});

test('signSessionToken and verifySessionToken reject tampered and expired tokens', () => {
  const token = signSessionToken({ id: 1, email: 'admin@mahmoudshaaban.com', name: 'محمود شعبان' }, 3600);
  const verified = verifySessionToken(token);
  assert.deepEqual(verified, { id: 1, email: 'admin@mahmoudshaaban.com', name: 'محمود شعبان' });

  const tampered = `${token.slice(0, -4)}xxxx`;
  assert.equal(verifySessionToken(tampered), null);

  const expired = signSessionToken({ id: 1, email: 'admin@mahmoudshaaban.com', name: 'محمود شعبان' }, -10);
  assert.equal(verifySessionToken(expired), null);
});

test('parseCookieHeader extracts named cookies safely', () => {
  const parsed = parseCookieHeader('msa_session=abc.123; theme=dark');
  assert.equal(parsed.msa_session, 'abc.123');
  assert.equal(parsed.theme, 'dark');
  assert.deepEqual(parseCookieHeader(undefined), {});
});
