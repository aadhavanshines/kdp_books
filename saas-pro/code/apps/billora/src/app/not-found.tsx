import { BrandLogo, Button } from "@saas/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center">
      <BrandLogo product="Billora" />
      <p className="mt-10 text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">The link may be old, or the page may have moved.</p>
      <Button asChild className="mt-6"><Link href="/">Back to Billora</Link></Button>
    </div>
  );
}
