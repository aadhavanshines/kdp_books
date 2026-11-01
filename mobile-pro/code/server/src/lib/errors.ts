import type { ContentfulStatusCode } from 'hono/utils/http-status';

/** Thrown from routes; app.onError turns it into { error: { code, message } }. */
export class HttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFound = (what: string) => new HttpError(404, 'NOT_FOUND', `${what} not found`);
export const badRequest = (message: string, details?: unknown) => new HttpError(400, 'BAD_REQUEST', message, details);
export const unauthorized = (message = 'Sign in to continue') => new HttpError(401, 'UNAUTHORIZED', message);
export const conflict = (code: string, message: string, details?: unknown) => new HttpError(409, code, message, details);
