"use client";
import { Field, Input, cn } from "@saas/ui";
import Link from "next/link";
import { useActionState, useState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { initialFormState } from "@/lib/forms";
import { magicLinkAction, signInAction } from "../actions";
import { DevMailHint } from "../auth-card";

export function SignInForm({ next, defaultEmail }: { next?: string | undefined; defaultEmail?: string | undefined }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [pw, pwAction] = useActionState(signInAction, initialFormState);
  const [link, linkAction] = useActionState(magicLinkAction, initialFormState);
  // One email value shared by both methods, so switching tabs keeps it.
  const [email, setEmail] = useState(defaultEmail ?? "");

  return (
    <div className="grid gap-5">
      <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-2 gap-1 rounded-control bg-muted p-1">
        {(["password", "link"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", mode === m ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {m === "password" ? "Password" : "Email link"}
          </button>
        ))}
      </div>

      {mode === "password" ? (
        <form action={pwAction} className="grid gap-4" noValidate>
          {next && <input type="hidden" name="next" value={next} />}
          <FormMessage state={pw} />
          <Field label="Email" error={pw.errors?.email}>
            {(p) => <Input {...p} name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />}
          </Field>
          <Field
            label="Password"
            error={pw.errors?.password}
            labelAside={<Link href="/forgot-password" className="rounded text-[13px] font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">Forgot password?</Link>}
          >
            {(p) => <Input {...p} name="password" type="password" autoComplete="current-password" required />}
          </Field>
          <SubmitButton className="mt-1 w-full" pendingLabel="Signing in…">Sign in</SubmitButton>
        </form>
      ) : (
        <form action={linkAction} className="grid gap-4" noValidate>
          {next && <input type="hidden" name="next" value={next} />}
          <FormMessage state={link} />
          <Field label="Email" error={link.errors?.email} help="We'll email you a link that signs you in. No password needed.">
            {(p) => <Input {...p} name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />}
          </Field>
          <SubmitButton className="mt-1 w-full" pendingLabel="Sending…">Email me a sign-in link</SubmitButton>
          {link.ok && <DevMailHint />}
        </form>
      )}
    </div>
  );
}
