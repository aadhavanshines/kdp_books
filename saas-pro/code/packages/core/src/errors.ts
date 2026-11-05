/** Errors that are safe to show to the user. Anything else is a bug. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "forbidden" | "invalid" | "conflict" | "unauthenticated",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what = "Not found") => new AppError(what, "not_found");
export const forbidden = (why = "You don't have permission to do that.") =>
  new AppError(why, "forbidden");
export const invalid = (why: string) => new AppError(why, "invalid");
export const conflict = (why: string) => new AppError(why, "conflict");
export const unauthenticated = () => new AppError("Please sign in.", "unauthenticated");

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
