import { serve } from '@hono/node-server';

import { createApp } from './app';
import { loadConfig } from './config';
import { isSeeded, openDb, refreshTimestamps } from './db';
import { createBus, type Deps } from './deps';
import { systemClock } from './lib/time';
import { seedDatabase } from './seed';
import { OrderSimulator } from './sim/simulator';

const config = loadConfig();
const db = openDb(config.dbPath);
const now = systemClock();

if (!isSeeded(db)) {
  const summary = seedDatabase(db, { now });
  console.info('Seeded a fresh database:', summary);
} else {
  const shift = refreshTimestamps(db, now);
  if (shift > 0) console.info(`Moved demo timestamps forward by ${Math.round(shift / 3_600_000)} h`);
}

const deps: Deps = { db, config, clock: systemClock, bus: createBus() };
const simulator = new OrderSimulator(deps);
simulator.start();

const server = serve({ fetch: createApp(deps).fetch, port: config.port }, (info) => {
  console.info(`Pro Apps API on http://localhost:${info.port}  (demo login: 9876543210 / OTP ${config.otpCode})`);
});

const shutdown = () => {
  simulator.stop();
  server.close();
  db.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
