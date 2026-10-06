/** The email a sign-in link was sent to, so the link can be completed without asking again. */
const KEY = 'quickbite.signInEmail';

export function rememberSignInEmail(email: string) {
  try {
    localStorage.setItem(KEY, email);
  } catch {
    // Blocked storage: the customer is asked for their email when the link opens.
  }
}

export function recallSignInEmail(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function forgetSignInEmail() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore.
  }
}

/** Only same-site paths are allowed as a post-sign-in destination (no open redirects). */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  return next;
}
