/**
 * The one place the gateways talk HTTP. `fetch` is injected, so tests (and
 * the offline provider simulators) replace the network entirely.
 */
import { ProviderApiError } from '../errors';

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/** How long a provider call may take before it counts as unreachable. */
export const PROVIDER_TIMEOUT_MS = 15_000;

/**
 * Sends one request and returns the parsed JSON body of a 2xx response.
 * Anything else becomes a ProviderApiError carrying the provider's own error
 * code and description when it sent one.
 */
export async function requestJson<T>(
  provider: string,
  fetchFn: FetchLike,
  url: string,
  init: RequestInit,
  readError: (body: unknown) => { code?: string; message?: string } | undefined,
): Promise<T> {
  let response: Response;
  try {
    response = await fetchFn(url, { ...init, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  } catch (error) {
    throw new ProviderApiError(provider, 0, 'network_error', (error as Error).message);
  }
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Not JSON (an HTML error page from a proxy, say): reported below.
  }
  if (!response.ok) {
    const detail = readError(body);
    throw new ProviderApiError(
      provider,
      response.status,
      detail?.code ?? 'http_error',
      detail?.message ?? (text.slice(0, 200) || response.statusText),
    );
  }
  if (body === null || typeof body !== 'object') {
    throw new ProviderApiError(provider, response.status, 'bad_response', 'Response is not JSON');
  }
  return body as T;
}

/** `Authorization: Basic …` for a user name and password (Razorpay's key id and secret). */
export function basicAuth(user: string, password: string): string {
  const bytes = new TextEncoder().encode(`${user}:${password}`);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return `Basic ${btoa(binary)}`;
}
