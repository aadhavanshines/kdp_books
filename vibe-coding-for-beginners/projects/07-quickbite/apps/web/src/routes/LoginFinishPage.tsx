import { useMutation } from '@tanstack/react-query';
import { CircleAlert } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { getBackend } from '../backend';
import { Button } from '../components/ui/Button';
import { buttonClass } from '../components/ui/buttonClass';
import { PageSpinner } from '../components/ui/PageSpinner';
import { forgetSignInEmail, recallSignInEmail, safeNextPath } from '../features/auth/signInEmail';

/** Where the emailed sign-in link lands. Completes the sign-in and goes back to where the customer was. */
export function LoginFinishPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNextPath(params.get('next'));
  const [email, setEmail] = useState(() => recallSignInEmail() ?? '');
  const [needsEmail, setNeedsEmail] = useState(() => !recallSignInEmail());
  const inputId = useId();
  const started = useRef(false);

  const finish = useMutation({
    mutationFn: async (address: string) => {
      const backend = await getBackend();
      const link = window.location.href;
      if (!backend.auth.isSignInLink(link)) throw new Error('INVALID_LINK');
      return backend.auth.completeSignIn(address, link);
    },
    onSuccess: () => {
      forgetSignInEmail();
      navigate(next, { replace: true });
    },
  });

  useEffect(() => {
    if (started.current || needsEmail) return;
    started.current = true;
    finish.mutate(email);
  }, [email, finish, needsEmail]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setNeedsEmail(false);
    started.current = true;
    finish.mutate(email.trim().toLowerCase());
  };

  if (finish.isError) {
    return (
      <div className="container-page max-w-md py-14 text-center">
        <CircleAlert className="mx-auto size-10 text-danger" aria-hidden />
        <h1 className="mt-3 text-2xl font-extrabold">This link didn’t work</h1>
        <p className="mt-2 text-[15px] text-muted">
          Sign-in links work once and expire after a while. Request a fresh one.
        </p>
        <Link
          to={`/login?next=${encodeURIComponent(next)}`}
          className={buttonClass({ className: 'mt-6' })}
        >
          Send a new link
        </Link>
      </div>
    );
  }

  if (needsEmail) {
    return (
      <form onSubmit={submit} className="container-page max-w-md py-14">
        <h1 className="text-2xl font-extrabold">Confirm your email</h1>
        <p className="mt-2 text-[15px] text-muted">
          You opened the link on a different device or browser. Enter the email you used.
        </p>
        <label htmlFor={inputId} className="mt-6 mb-1 block text-sm font-bold text-ink-soft">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
        <Button type="submit" block size="lg" className="mt-5">
          Continue
        </Button>
      </form>
    );
  }

  return <PageSpinner />;
}
