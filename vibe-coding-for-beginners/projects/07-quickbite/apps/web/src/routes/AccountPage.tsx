import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, LogOut, MapPin, ReceiptText } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { getBackend } from '../backend';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { AddressIcon } from '../features/addresses/AddressPicker';
import { formatAddress } from '../features/addresses/formatAddress';
import { useAddresses, useRemoveAddress } from '../features/addresses/queries';
import { profileSchema, type ProfileInput } from '../features/account/profileSchema';
import { useProfile, useSaveProfile } from '../features/account/queries';
import { RequireSignIn } from '../features/auth/RequireSignIn';
import { useSession } from '../features/auth/sessionStore';
import { cn } from '../lib/cn';

export function AccountPage() {
  return (
    <RequireSignIn
      title="Sign in to see your account"
      description="Your profile, saved addresses and past orders live here."
    >
      <Account />
    </RequireSignIn>
  );
}

function Account() {
  const user = useSession((s) => s.user)!;
  const navigate = useNavigate();
  const client = useQueryClient();
  const signOut = useMutation({
    mutationFn: async () => (await getBackend()).auth.signOut(),
    onSuccess: () => {
      client.removeQueries({ queryKey: ['addresses'] });
      navigate('/');
    },
  });

  return (
    <div className="bg-sunken pb-16">
      <div className="container-page max-w-3xl pt-6 md:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">My account</h1>
            <p className="mt-1 text-sm text-muted">{user.email}</p>
          </div>
          <Button variant="outline" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
            <LogOut className="size-4" aria-hidden /> Sign out
          </Button>
        </div>
        <div className="mt-6 space-y-4">
          <Link
            to="/orders"
            className="flex items-center gap-3 rounded-3xl bg-white p-5 shadow-sm hover:shadow-card"
          >
            <ReceiptText className="size-6 text-brand-600" aria-hidden />
            <span className="flex-1 font-extrabold">Your orders</span>
            <ChevronRight className="size-5 text-muted" aria-hidden />
          </Link>
          <ProfileCard />
          <AddressesCard />
        </div>
      </div>
    </div>
  );
}

function ProfileCard() {
  const { data: profile, isLoading } = useProfile();
  return (
    <section aria-labelledby="profile-heading" className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 id="profile-heading" className="font-extrabold">
        Profile
      </h2>
      {isLoading ? (
        <Skeleton className="mt-4 h-28 w-full" />
      ) : (
        <ProfileForm initial={profile ?? { name: '', phone: '' }} />
      )}
    </section>
  );
}

function ProfileForm({ initial }: { initial: ProfileInput }) {
  const save = useSaveProfile();
  const [values, setValues] = useState<ProfileInput>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileInput, string>>>({});
  const nameId = useId();
  const phoneId = useId();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues)
        next[issue.path[0] as keyof ProfileInput] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    save.mutate(parsed.data, { onSuccess: (saved) => setValues(saved) });
  };

  const field = (key: keyof ProfileInput, id: string) => ({
    id,
    value: values[key],
    onChange: (e: { target: { value: string } }) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: undefined }));
      save.reset();
    },
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `${id}-error` : undefined,
    className: cn(
      'h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none',
      errors[key] ? 'border-danger' : 'border-line',
    ),
  });

  return (
    <form onSubmit={submit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={nameId} className="mb-1 block text-sm font-bold text-ink-soft">
          Name
        </label>
        <input {...field('name', nameId)} autoComplete="name" />
        {errors.name && (
          <p id={`${nameId}-error`} className="mt-1 text-xs font-semibold text-danger">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={phoneId} className="mb-1 block text-sm font-bold text-ink-soft">
          Mobile number (optional)
        </label>
        <input {...field('phone', phoneId)} type="tel" inputMode="tel" autoComplete="tel" />
        {errors.phone && (
          <p id={`${phoneId}-error`} className="mt-1 text-xs font-semibold text-danger">
            {errors.phone}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save profile'}
        </Button>
        <span role="status" className="text-sm font-semibold">
          {save.isSuccess && <span className="text-success-strong">Saved</span>}
          {save.isError && <span className="text-danger">Couldn’t save. Try again.</span>}
        </span>
      </div>
    </form>
  );
}

function AddressesCard() {
  const { data: addresses, isLoading } = useAddresses();
  const remove = useRemoveAddress();
  return (
    <section aria-labelledby="addresses-heading" className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 id="addresses-heading" className="font-extrabold">
        Saved addresses
      </h2>
      {isLoading ? (
        <Skeleton className="mt-4 h-16 w-full" />
      ) : !addresses?.length ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <MapPin className="size-4" aria-hidden /> You’ll add an address at checkout.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {addresses.map((a) => (
            <li key={a.id} className="flex gap-3 py-3">
              <AddressIcon label={a.label} className="mt-0.5 size-5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{a.label}</p>
                <p className="text-sm text-muted">{formatAddress(a)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove.mutate(a.id)}
                disabled={remove.isPending}
                aria-label={`Delete ${a.label} address`}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
