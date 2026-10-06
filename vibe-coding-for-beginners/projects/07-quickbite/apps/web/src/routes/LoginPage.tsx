import { useMutation } from '@tanstack/react-query';
import { FlaskConical, MailCheck } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';
import { getBackend } from '../backend';
import { Button } from '../components/ui/Button';
import { buttonClass } from '../components/ui/buttonClass';
import { Logo } from '../components/Logo';
import { forgetSignInEmail, rememberSignInEmail, safeNextPath } from '../features/auth/signInEmail';
import { useSession } from '../features/auth/sessionStore';
import { cn } from '../lib/cn';

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');
const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/, 'Enter the code from the email');

/** Passwordless sign-in: we email a one-time link that signs the customer in. */
export function LoginPage() {
  const [params] = useSearchParams();
  const next = safeNextPath(params.get('next'));
  const user = useSession((s) => s.user);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const inputId = useId();
  const codeId = useId();
  const navigate = useNavigate();

  const send = useMutation({
    mutationFn: async (address: string) => {
      const backend = await getBackend();
      const continueUrl = new URL('/login/finish', window.location.origin);
      continueUrl.searchParams.set('next', next);
      rememberSignInEmail(address);
      const { devLink } = await backend.auth.sendSignInLink(address, continueUrl.toString());
      return { devLink, acceptsCode: Boolean(backend.auth.verifyCode) };
    },
  });

  const verify = useMutation({
    mutationFn: async (value: string) => {
      const backend = await getBackend();
      return backend.auth.verifyCode!(send.variables!, value);
    },
    onSuccess: () => {
      forgetSignInEmail();
      navigate(next, { replace: true });
    },
  });

  if (user) return <Navigate to={next} replace />;

  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setCodeError(parsed.error.issues[0]!.message);
      return;
    }
    setCodeError(null);
    verify.mutate(parsed.data);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]!.message);
      return;
    }
    setError(null);
    send.mutate(parsed.data);
  };

  return (
    <div className="bg-sunken px-4 py-10 md:py-16">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-card md:p-8">
        <Logo />
        {send.isSuccess ? (
          <div className="mt-6" role="status">
            <MailCheck className="size-10 text-success" aria-hidden />
            <h1 className="mt-3 text-2xl font-extrabold">Check your email</h1>
            <p className="mt-2 text-[15px] text-ink-soft">
              We sent a sign-in link to <strong>{send.variables}</strong>. Open it on this device to
              continue.
            </p>
            {send.data.devLink && (
              <div className="mt-5 rounded-2xl bg-offer/5 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-offer">
                  <FlaskConical className="size-4" aria-hidden /> Local test mode
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  No email is sent while running locally. Use the link directly:
                </p>
                <a
                  href={send.data.devLink}
                  className={buttonClass({ variant: 'secondary', block: true, className: 'mt-3' })}
                >
                  Open sign-in link
                </a>
              </div>
            )}
            {send.data.acceptsCode && (
              <form onSubmit={submitCode} noValidate className="mt-6">
                <label htmlFor={codeId} className="mb-1 block text-sm font-bold text-ink-soft">
                  Or enter the 6-digit code from the email
                </label>
                <div className="flex gap-2">
                  <input
                    id={codeId}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={10}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ''));
                      setCodeError(null);
                    }}
                    aria-invalid={Boolean(codeError) || verify.isError}
                    aria-describedby={codeError || verify.isError ? `${codeId}-error` : undefined}
                    className={cn(
                      'h-12 min-w-0 flex-1 rounded-xl border bg-white px-3.5 text-lg font-bold tracking-[0.3em] tabular-nums focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none',
                      codeError || verify.isError ? 'border-danger' : 'border-line',
                    )}
                  />
                  <Button type="submit" size="lg" disabled={verify.isPending}>
                    {verify.isPending ? 'Checking…' : 'Sign in'}
                  </Button>
                </div>
                {(codeError || verify.isError) && (
                  <p id={`${codeId}-error`} className="mt-1 text-xs font-semibold text-danger">
                    {codeError ?? 'That code didn’t work. Check it, or request a new email.'}
                  </p>
                )}
              </form>
            )}
            <button
              type="button"
              onClick={() => {
                send.reset();
                verify.reset();
                setCode('');
              }}
              className="mt-5 text-sm font-bold text-brand-600"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6">
            <h1 className="text-2xl font-extrabold">Sign in or create an account</h1>
            <p className="mt-1.5 text-[15px] text-muted">
              No password needed. We’ll email you a one-time link.
            </p>
            <label htmlFor={inputId} className="mt-6 mb-1 block text-sm font-bold text-ink-soft">
              Email address
            </label>
            <input
              id={inputId}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className={cn(
                'h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none',
                error ? 'border-danger' : 'border-line',
              )}
            />
            {error && (
              <p id={`${inputId}-error`} className="mt-1 text-xs font-semibold text-danger">
                {error}
              </p>
            )}
            {send.isError && (
              <p className="mt-3 text-sm font-semibold text-danger" role="alert">
                We couldn’t send the link. Please try again.
              </p>
            )}
            <Button type="submit" block size="lg" className="mt-5" disabled={send.isPending}>
              {send.isPending ? 'Sending…' : 'Email me a sign-in link'}
            </Button>
            <p className="mt-4 text-xs text-muted">
              By continuing you agree to our terms of service and privacy policy.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
