#!/usr/bin/env node
// Run by scripts/hosting-check.mjs inside the emulators, against the REAL
// firebase.json: checks that the routes, rewrites, headers and caching do what
// the file claims. Prints one line per check and exits 1 if any failed.
import { readdirSync, readFileSync } from 'node:fs';

const BASE = process.env.HOSTING_URL ?? 'http://127.0.0.1:5000';
const config = JSON.parse(readFileSync('firebase.json', 'utf8')).hosting;
const headerRules = config.headers;
const configured = Object.fromEntries(
  headerRules.find((r) => r.source === '**').headers.map((h) => [h.key.toLowerCase(), h.value]),
);

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `\n       ${detail}`}`);
};
const get = (path, init) => fetch(BASE + path, { redirect: 'manual', ...init });

// ---- Routes ---------------------------------------------------------------
const assets = readdirSync('apps/web/dist/assets');
const hashed = assets.find((f) => /^index-.*\.js$/.test(f));
const map = assets.find((f) => f.endsWith('.js.map'));
const spaPaths = [
  '/',
  '/search',
  '/restaurant/tandoor-tales-koramangala',
  '/orders/abc123',
  '/login/finish',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/refunds',
  '/shipping',
  '/some/unknown/page',
];
for (const path of spaPaths) {
  const res = await get(path);
  const body = await res.text();
  check(
    `SPA route ${path} serves the app shell`,
    res.status === 200 &&
      res.headers.get('content-type')?.includes('text/html') &&
      body.includes('<div id="root">'),
    `${res.status} ${res.headers.get('content-type')}`,
  );
}
const robots = await get('/robots.txt');
check(
  'robots.txt is a real file, not the app shell',
  (await robots.text()).startsWith('User-agent'),
);
// The emulator serves every file in dist; `ignore` is applied when deploying.
check('source maps are excluded from the deploy', config.ignore.includes('**/*.map') && !!map);

// Functions
const callable = await get('/api/quoteOrder', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ data: {} }),
});
const callableBody = await callable.json().catch(() => null);
check(
  'POST /api/quoteOrder reaches the quoteOrder function (signed-out → UNAUTHENTICATED)',
  callable.status === 401 && callableBody?.error?.status === 'UNAUTHENTICATED',
  `${callable.status} ${JSON.stringify(callableBody)}`,
);
for (const name of ['createOrder', 'startPayment', 'verifyRazorpayPayment', 'fakePay']) {
  const res = await get(`/api/${name}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: {} }),
  });
  const body = await res.json().catch(() => null);
  check(
    `POST /api/${name} reaches its function`,
    res.status === 401 && body?.error?.status === 'UNAUTHENTICATED',
    `${res.status}`,
  );
}
for (const provider of ['razorpay', 'stripe', 'fake']) {
  const res = await get(`/webhooks/${provider}`, { method: 'POST', body: '{"unsigned":true}' });
  const body = await res.json().catch(() => null);
  check(
    `POST /webhooks/${provider} reaches paymentWebhook and an unsigned body is rejected`,
    res.status >= 400 && res.status < 500 && body?.received === false,
    `${res.status} ${JSON.stringify(body)}`,
  );
}
const getWebhook = await get('/webhooks/razorpay');
check(
  'GET /webhooks/razorpay → 405 from the function',
  getWebhook.status === 405,
  `${getWebhook.status}`,
);

// ---- Headers --------------------------------------------------------------
for (const path of ['/', '/orders/abc123', '/terms', `/assets/${hashed}`]) {
  const res = await get(path);
  for (const [name, value] of Object.entries(configured)) {
    if (name === 'cache-control') continue;
    check(`${name} on ${path}`, res.headers.get(name) === value, `got ${res.headers.get(name)}`);
  }
}

// ---- Caching --------------------------------------------------------------
const cache = async (path) => (await get(path)).headers.get('cache-control');
check(
  'hashed asset: 1 year, immutable',
  (await cache(`/assets/${hashed}`)) === 'public, max-age=31536000, immutable',
);
check('index.html (/) is revalidated every time', (await cache('/')) === 'no-cache');
check(
  'deep link (SPA fallback) is revalidated every time',
  (await cache('/orders/abc123')) === 'no-cache',
);
const image = readdirSync('apps/web/dist/images/seed/restaurants')[0];
check(
  'seed image: 1 day',
  (await cache(`/images/seed/restaurants/${image}`)) === 'public, max-age=86400',
);
check(
  'every hashed file in dist/assets is long-cached',
  (
    await Promise.all(assets.filter((f) => !f.endsWith('.map')).map((f) => cache(`/assets/${f}`)))
  ).every((c) => c === 'public, max-age=31536000, immutable'),
);

// ---- CSP content ------------------------------------------------------------
const csp = Object.fromEntries(
  configured['content-security-policy'].split(';').map((d) => {
    const [name, ...values] = d.trim().split(/\s+/);
    return [name, values];
  }),
);
const hostsOf = (d) => (csp[d] ?? csp['default-src'] ?? []).filter((v) => v.startsWith('http'));
check("no 'unsafe-eval' anywhere", !JSON.stringify(csp).includes('unsafe-eval'));
check(
  "script-src has no 'unsafe-inline' and no wildcards",
  !csp['script-src'].some((v) => v === "'unsafe-inline'" || v.includes('*')),
);
check(
  'every listed host is https',
  Object.values(csp)
    .flat()
    .filter((v) => v.includes('.'))
    .every((v) => v.startsWith('https://')),
);
check(
  "object-src 'none', frame-ancestors 'none', base-uri 'self'",
  csp['object-src']?.[0] === "'none'" &&
    csp['frame-ancestors']?.[0] === "'none'" &&
    csp['base-uri']?.[0] === "'self'",
);
check(
  'providers are allowed exactly where they need to be',
  hostsOf('script-src').join() === 'https://checkout.razorpay.com,https://js.stripe.com' &&
    hostsOf('frame-src').includes('https://api.razorpay.com') &&
    hostsOf('frame-src').includes('https://js.stripe.com') &&
    hostsOf('connect-src').includes('https://api.razorpay.com') &&
    hostsOf('connect-src').includes('https://api.stripe.com'),
);

// Every https:// address the app's own source code talks to must be in the policy.
const used = new Map([
  ['razorpay checkout.js', ['script-src', 'https://checkout.razorpay.com']],
  ['stripe.js', ['script-src', 'https://js.stripe.com']],
]);
const sources =
  readFileSync('apps/web/src/features/payments/razorpay.ts', 'utf8') +
  readFileSync('apps/web/src/features/payments/stripe.ts', 'utf8');
for (const [what, [directive, origin]] of used) {
  check(
    `${what} (${origin}) is in ${directive}`,
    hostsOf(directive).includes(origin) && sources.includes(origin),
  );
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll hosting checks passed');
process.exit(failures ? 1 : 0);
