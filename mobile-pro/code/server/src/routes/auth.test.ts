import { beforeAll, describe, expect, it } from 'vitest';
import type { Address, ApiErrorBody, AppNotification, AuthResponse, CouponOffer, User } from '@pro/api/types';

import { createHarness, type Harness } from '../test/harness';

let h: Harness;
beforeAll(() => {
  h = createHarness();
});

describe('auth', () => {
  it('requests an OTP and returns the demo hint', async () => {
    const body = await h.json<{ phone: string; devHint: string }>('POST', '/auth/otp/request', { body: { phone: '+91 98765 43210' } });
    expect(body.phone).toBe('9876543210');
    expect(body.devHint).toContain('123456');
  });

  it('normalises +91, 91 and 0 prefixes but keeps numbers that start with 91', async () => {
    for (const [input, expected] of [
      ['+91 98765-43210', '9876543210'],
      ['919876543210', '9876543210'],
      ['09876543210', '9876543210'],
      ['9123456780', '9123456780'],
    ]) {
      const body = await h.json<{ phone: string }>('POST', '/auth/otp/request', { body: { phone: input } });
      expect(body.phone).toBe(expected);
    }
  });

  it('rejects an invalid phone number', async () => {
    const err = await h.json<ApiErrorBody>('POST', '/auth/otp/request', { body: { phone: '12345' }, status: 400 });
    expect(err.error.code).toBe('VALIDATION');
  });

  it('rejects a wrong code', async () => {
    const err = await h.json<ApiErrorBody>('POST', '/auth/otp/verify', { body: { phone: '9876543210', code: '000000' }, status: 401 });
    expect(err.error.code).toBe('INVALID_OTP');
  });

  it('signs in the demo customer with 123456', async () => {
    const res = await h.json<AuthResponse>('POST', '/auth/otp/verify', { body: { phone: '9876543210', code: '123456' } });
    expect(res.token).toMatch(/^ey/);
    expect(res.isNewUser).toBe(false);
    expect(res.user).toMatchObject({ name: 'Riya Kapoor', handle: 'riya.kapoor' });
  });

  it('creates a new customer for an unknown number', async () => {
    const res = await h.json<AuthResponse>('POST', '/auth/otp/verify', { body: { phone: '9123456780', code: '123456' } });
    expect(res.isNewUser).toBe(true);
    expect(res.user.email).toMatch(/\.example$/);
  });

  it('protects /me', async () => {
    expect((await h.request('GET', '/me')).status).toBe(401);
    expect((await h.request('GET', '/me', { token: 'not-a-jwt' })).status).toBe(401);
  });
});

describe('account', () => {
  it('reads and updates the profile', async () => {
    const token = await h.login();
    const me = await h.json<User>('GET', '/me', { token });
    expect(me.phone).toBe('9876543210');
    const updated = await h.json<User>('PATCH', '/me', { token, body: { name: 'Riya K.' } });
    expect(updated.name).toBe('Riya K.');
  });

  it('manages addresses and keeps exactly one default', async () => {
    const token = await h.login();
    const list = await h.json<Address[]>('GET', '/me/addresses', { token });
    expect(list[0]).toMatchObject({ label: 'Home', isDefault: true });
    const created = await h.json<Address>('POST', '/me/addresses', {
      token,
      body: { label: 'Gym', line1: '3 Pier Street', locality: 'Harbour Side', pincode: '560102', isDefault: true },
      status: 201,
    });
    expect(created.location).toEqual({ x: 200, y: 200 });
    const after = await h.json<Address[]>('GET', '/me/addresses', { token });
    expect(after.filter((a) => a.isDefault).map((a) => a.id)).toEqual([created.id]);
    expect((await h.request('DELETE', `/me/addresses/${created.id}`, { token })).status).toBe(204);
    const final = await h.json<Address[]>('GET', '/me/addresses', { token });
    expect(final.filter((a) => a.isDefault)).toHaveLength(1);
  });

  it('refuses addresses outside Northbay', async () => {
    const token = await h.login();
    await h.json('POST', '/me/addresses', { token, body: { label: 'X', line1: 'Y', locality: 'Atlantis', pincode: '999999' }, status: 400 });
  });

  it('lists and clears notifications per app', async () => {
    const token = await h.login();
    const notes = await h.json<AppNotification[]>('GET', '/notifications?app=cartly', { token });
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.every((n) => n.app === 'cartly')).toBe(true);
    await h.request('POST', '/notifications/read', { token, body: { app: 'cartly' } });
    const read = await h.json<AppNotification[]>('GET', '/notifications?app=cartly', { token });
    expect(read.every((n) => n.isRead)).toBe(true);
  });

  it('lists coupons for an app', async () => {
    const coupons = await h.json<CouponOffer[]>('GET', '/coupons?app=minutely');
    expect(coupons.map((c) => c.code)).toContain('FRESH50');
  });

  it('answers unknown routes with a JSON 404', async () => {
    const err = await h.json<ApiErrorBody>('GET', '/nope', { status: 404 });
    expect(err.error.code).toBe('NOT_FOUND');
  });

  it('allows cross-origin requests from the web apps', async () => {
    const res = await h.app.request('/health', { headers: { origin: 'http://localhost:8081' } });
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});
