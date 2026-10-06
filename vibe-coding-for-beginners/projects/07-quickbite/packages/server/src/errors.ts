/**
 * Errors the server reports to callers. The codes match Firebase callable
 * error codes, so the Cloud Functions layer can pass them straight through.
 */
export type ServerErrorCode =
  | 'invalid-argument'
  | 'unauthenticated'
  | 'permission-denied'
  | 'not-found'
  | 'failed-precondition'
  | 'resource-exhausted'
  | 'unavailable';

export class ServerError extends Error {
  constructor(
    readonly code: ServerErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

/** A webhook whose signature is missing, wrong or too old. Nothing is recorded for it. */
export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
  }
}

/**
 * A payment provider's API refused a request or couldn't be reached. `status`
 * is the HTTP status (0 when there was no response at all).
 */
export class ProviderApiError extends Error {
  constructor(
    readonly provider: string,
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(`${provider} API error (${status} ${code}): ${message}`);
    this.name = 'ProviderApiError';
  }
}

/** A payment the browser reported that doesn't check out (bad signature, another order's payment…). */
export class PaymentVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentVerificationError';
  }
}
