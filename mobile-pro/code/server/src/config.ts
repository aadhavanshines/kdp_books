import { fileURLToPath } from 'node:url';

const serverRoot = fileURLToPath(new URL('..', import.meta.url));

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) ? value : fallback;
}

export interface Config {
  port: number;
  /** SQLite file, or ":memory:". */
  dbPath: string;
  jwtSecret: string;
  /** Token lifetime in seconds. */
  jwtTtl: number;
  /** The only accepted OTP (demo). */
  otpCode: string;
  /** Speeds up (>1) or slows down (<1) the order status simulation. */
  simSpeed: number;
  logRequests: boolean;
}

export function loadConfig(): Config {
  return {
    port: num('PORT', 4000),
    dbPath: process.env.DB_PATH ?? `${serverRoot}data/pro.db`,
    jwtSecret: process.env.JWT_SECRET ?? 'pro-apps-local-dev-secret-change-me',
    jwtTtl: num('JWT_TTL_SECONDS', 60 * 60 * 24 * 30),
    otpCode: '123456',
    simSpeed: num('SIM_SPEED', 1),
    logRequests: process.env.LOG_REQUESTS !== '0',
  };
}

export const testConfig: Config = {
  port: 0,
  dbPath: ':memory:',
  jwtSecret: 'test-secret',
  // Tokens are issued on the fake test clock but verified on the real one.
  jwtTtl: 60 * 60 * 24 * 365,
  otpCode: '123456',
  simSpeed: 1,
  logRequests: false,
};
