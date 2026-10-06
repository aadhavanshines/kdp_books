/**
 * The little SQL interface the server code needs, so the store doesn't depend
 * on one driver. `postgresJs()` adapts postgres.js, which runs on Node (tests,
 * seed, simulator) and Deno (Edge Functions, via `npm:postgres`).
 */
import type { Sql as PostgresJs } from 'postgres';

export type Row = Record<string, unknown>;

export interface Sql {
  /**
   * Runs one statement with $1, $2… parameters and returns its rows. Pass
   * JSON values as objects (not strings) for jsonb parameters.
   */
  query<T = Row>(text: string, params?: readonly unknown[]): Promise<T[]>;
  /** Runs `work` in one SERIALIZABLE transaction on a single connection. */
  transaction<T>(work: (sql: Sql) => Promise<T>): Promise<T>;
}

/** Postgres error codes worth retrying a whole transaction for. */
const RETRYABLE = new Set([
  '40001', // serialization_failure
  '40P01', // deadlock_detected
  // A concurrent transaction inserted the same unique key first. Running the
  // work again reads that row and takes the "already exists" path.
  '23505',
]);

export const isRetryable = (error: unknown) =>
  RETRYABLE.has((error as { code?: string } | null)?.code ?? '');

type Unsafe = Pick<PostgresJs, 'unsafe'>;

function wrap(client: Unsafe, transaction: Sql['transaction']): Sql {
  return {
    query: async <T>(text: string, params: readonly unknown[] = []) =>
      // postgres.js types parameters as its own value union; ours are plain JSON-able values.
      [...(await client.unsafe(text, params as never[]))] as T[],
    transaction,
  };
}

export function postgresJs(sql: PostgresJs, { maxAttempts = 6 } = {}): Sql {
  const transaction: Sql['transaction'] = async (work) => {
    for (let attempt = 1; ; attempt++) {
      try {
        const result = await sql.begin('isolation level serializable', (tx) =>
          work(
            wrap(tx, () => {
              throw new Error('Nested transactions are not supported');
            }),
          ),
        );
        return result as Awaited<ReturnType<typeof work>>;
      } catch (error) {
        if (!isRetryable(error) || attempt >= maxAttempts) throw error;
        // Back off a little (with jitter) before trying again.
        await new Promise((r) => setTimeout(r, Math.random() * 20 * attempt));
      }
    }
  };
  return wrap(sql, transaction);
}
