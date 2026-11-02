import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { ApiErrorBody, HealthResponse } from '@pro/api/types';

import type { Deps } from './deps';
import { optionalAuth, type AppEnv } from './lib/auth';
import { HttpError } from './lib/errors';
import { redactTokens } from './lib/redact';
import { iso } from './lib/time';
import { cartlyRoutes } from './routes/cartly';
import { authRoutes, couponRoutes, meRoutes, notificationRoutes } from './routes/common';
import { cartRoutes, orderRoutes } from './routes/commerce';
import { lumoRoutes } from './routes/lumo';
import { minutelyRoutes } from './routes/minutely';
import { platterRoutes } from './routes/platter';

export function createApp(deps: Deps) {
  const app = new Hono<AppEnv>();

  if (deps.config.logRequests) app.use('*', logger((line, ...rest) => console.log(redactTokens(line), ...rest)));
  // The apps run on other origins in the browser (Expo web), so allow any.
  app.use('*', cors({ origin: '*', allowHeaders: ['Authorization', 'Content-Type', 'Last-Event-ID'], maxAge: 600 }));
  app.use('*', optionalAuth(deps.config.jwtSecret));

  app.get('/', (c) => c.redirect('/health'));
  app.get('/health', (c) => c.json<HealthResponse>({ ok: true, name: 'pro-apps-api', version: '1.0.0', time: iso(deps.clock()) }));

  app.route('/auth', authRoutes(deps));
  app.route('/me', meRoutes(deps));
  app.route('/notifications', notificationRoutes(deps));
  app.route('/coupons', couponRoutes(deps));
  app.route('/platter', platterRoutes(deps));
  app.route('/cartly', cartlyRoutes(deps));
  app.route('/lumo', lumoRoutes(deps));
  app.route('/minutely', minutelyRoutes(deps));
  app.route('/cart', cartRoutes(deps));
  app.route('/orders', orderRoutes(deps));

  app.notFound((c) => c.json<ApiErrorBody>({ error: { code: 'NOT_FOUND', message: `No route for ${c.req.method} ${c.req.path}` } }, 404));
  app.onError((err, c) => {
    if (err instanceof HttpError) {
      return c.json<ApiErrorBody>({ error: { code: err.code, message: err.message, details: err.details } }, err.status);
    }
    console.error(err);
    return c.json<ApiErrorBody>({ error: { code: 'INTERNAL', message: 'Something went wrong on our side' } }, 500);
  });
  return app;
}

export type App = ReturnType<typeof createApp>;
