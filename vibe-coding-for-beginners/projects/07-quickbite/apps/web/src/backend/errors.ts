/** Thrown by any backend call that needs a signed-in customer when nobody is signed in. */
export class SignInRequiredError extends Error {
  constructor() {
    super('Please sign in to continue.');
    this.name = 'SignInRequiredError';
  }
}

export const isSignInRequired = (error: unknown) =>
  error instanceof SignInRequiredError ||
  (error instanceof Error && error.name === 'SignInRequiredError');
