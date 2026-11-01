import { Hono } from 'hono';
import { z } from 'zod';
import {
  APP_NAMES,
  COMMERCE_APPS,
  type AppNotification,
  type ArtName,
  type AuthResponse,
  type CommerceApp,
  type OtpRequestResponse,
  type User,
} from '@pro/api/types';

import type { Deps } from '../deps';
import { issueToken, requireAuth, currentUser, type AppEnv } from '../lib/auth';
import { HttpError } from '../lib/errors';
import { iso } from '../lib/time';
import { validate } from '../lib/validate';
import { couponOffers } from '../services/cart';
import { deleteAddress, findOrCreateByPhone, getUserRow, listAddresses, saveAddress, toUser } from '../services/users';

export const phoneSchema = z
  .string()
  .transform((v) => {
    const digits = v.replace(/[\s()-]/g, '');
    // Drop a country code (+91 / 91) or trunk 0 only when present: a bare
    // 10-digit number may itself start with 91.
    if (/^\+91\d{10}$/.test(digits) || /^91\d{10}$/.test(digits)) return digits.slice(-10);
    if (/^0\d{10}$/.test(digits)) return digits.slice(1);
    return digits;
  })
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'));

export const commerceApp = z.enum(COMMERCE_APPS);
export const anyApp = z.enum(APP_NAMES);

/** "true" / "1" -> true. */
export const queryBool = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1')
  .optional();

const addressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  recipient: z.string().trim().min(1).max(80).optional(),
  line1: z.string().trim().min(1).max(120),
  line2: z.string().trim().max(120).optional(),
  landmark: z.string().trim().max(120).nullable().optional(),
  locality: z.string().trim().min(1),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  isDefault: z.boolean().optional(),
});

export function authRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  app.post('/otp/request', validate('json', z.object({ phone: phoneSchema })), (c) => {
    const { phone } = c.req.valid('json');
    // Demo: no SMS is sent. The only code is 123456; log it like a real dev server would.
    console.info(`[otp] code for +91 ${phone}: ${deps.config.otpCode}`);
    const body: OtpRequestResponse = { phone, expiresInSeconds: 300, devHint: `Use ${deps.config.otpCode} (demo code)` };
    return c.json(body);
  });
  app.post('/otp/verify', validate('json', z.object({ phone: phoneSchema, code: z.string().trim() })), async (c) => {
    const { phone, code } = c.req.valid('json');
    if (code !== deps.config.otpCode) throw new HttpError(401, 'INVALID_OTP', 'That code is not right. Try 123456.');
    const now = deps.clock();
    const { user, isNew } = findOrCreateByPhone(deps.db, phone, now);
    const token = await issueToken(user.id, deps.config.jwtSecret, deps.config.jwtTtl, now);
    const body: AuthResponse = { token, user: toUser(user), isNewUser: isNew };
    return c.json(body);
  });
  return app;
}

export function meRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  app.use('*', requireAuth(deps.config.jwtSecret));
  app.get('/', (c) => c.json<User>(toUser(getUserRow(deps.db, currentUser(c)))));
  app.patch(
    '/',
    validate(
      'json',
      z.object({
        name: z.string().trim().min(1).max(80).optional(),
        email: z.email().optional(),
        avatar: z.string().nullable().optional(),
      }),
    ),
    (c) => {
      const id = currentUser(c);
      const input = c.req.valid('json');
      const row = getUserRow(deps.db, id);
      deps.db
        .prepare('UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?')
        .run(input.name ?? row.name, input.email ?? row.email, input.avatar === undefined ? row.avatar : (input.avatar as ArtName | null), id);
      return c.json<User>(toUser(getUserRow(deps.db, id)));
    },
  );
  app.get('/addresses', (c) => c.json(listAddresses(deps.db, currentUser(c))));
  app.post('/addresses', validate('json', addressSchema), (c) =>
    c.json(saveAddress(deps.db, currentUser(c), c.req.valid('json'), deps.clock()), 201),
  );
  app.put('/addresses/:id', validate('json', addressSchema), (c) =>
    c.json(saveAddress(deps.db, currentUser(c), c.req.valid('json'), deps.clock(), c.req.param('id'))),
  );
  app.delete('/addresses/:id', (c) => {
    deleteAddress(deps.db, currentUser(c), c.req.param('id'));
    return c.body(null, 204);
  });
  return app;
}

export function notificationRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  app.use('*', requireAuth(deps.config.jwtSecret));
  app.get('/', validate('query', z.object({ app: commerceApp.optional() })), (c) => {
    const { app: which } = c.req.valid('query');
    const rows = (
      which
        ? deps.db.prepare('SELECT * FROM notifications WHERE user_id = ? AND app = ? ORDER BY created_at DESC LIMIT 100').all(currentUser(c), which)
        : deps.db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(currentUser(c))
    ) as { id: string; app: CommerceApp; kind: AppNotification['kind']; title: string; body: string; art: string; link: string | null; created_at: number; read: number }[];
    return c.json<AppNotification[]>(
      rows.map((n) => ({
        id: n.id,
        app: n.app,
        kind: n.kind,
        title: n.title,
        body: n.body,
        art: n.art as ArtName,
        link: n.link,
        createdAt: iso(n.created_at),
        isRead: n.read === 1,
      })),
    );
  });
  app.post('/read', validate('json', z.object({ app: commerceApp.optional(), ids: z.array(z.string()).optional() })), (c) => {
    const { app: which, ids } = c.req.valid('json');
    const userId = currentUser(c);
    if (ids?.length) {
      const stmt = deps.db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND id = ?');
      for (const id of ids) stmt.run(userId, id);
    } else if (which) deps.db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND app = ?').run(userId, which);
    else deps.db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
    return c.body(null, 204);
  });
  return app;
}

export function couponRoutes(deps: Deps) {
  const app = new Hono<AppEnv>();
  app.get('/', validate('query', z.object({ app: commerceApp })), (c) =>
    c.json(couponOffers(deps.db, c.get('userId'), c.req.valid('query').app, deps.clock())),
  );
  return app;
}
