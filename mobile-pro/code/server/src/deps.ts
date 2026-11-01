import { EventEmitter } from 'node:events';

import type { Config } from './config';
import type { DB } from './db';
import type { Clock } from './lib/time';

/** Everything a route needs; tests build one with an in-memory DB and a fake clock. */
export interface Deps {
  db: DB;
  config: Config;
  clock: Clock;
  /** Order events, keyed by order id (see sim/simulator.ts). */
  bus: EventEmitter;
}

export function createBus(): EventEmitter {
  const bus = new EventEmitter();
  // One listener per open SSE connection.
  bus.setMaxListeners(0);
  return bus;
}
