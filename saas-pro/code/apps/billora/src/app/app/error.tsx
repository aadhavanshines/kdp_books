"use client";
import { Button, Card, EmptyState } from "@saas/ui";
import { TriangleAlert } from "lucide-react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <EmptyState
        icon={<span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger"><TriangleAlert className="size-6" aria-hidden /></span>}
        title="Something went wrong"
        description={<>We couldn&apos;t load this page. Try again, and if it keeps happening, contact support{error.digest ? <> with code <code className="font-mono">{error.digest}</code></> : null}.</>}
        action={<Button onClick={reset}>Try again</Button>}
      />
    </Card>
  );
}
