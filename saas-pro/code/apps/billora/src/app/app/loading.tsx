import { Card, Skeleton } from "@saas/ui";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="px-5 py-4"><Skeleton className="h-4 w-24" /><Skeleton className="mt-3 h-7 w-32" /><Skeleton className="mt-2 h-3 w-28" /></Card>
        ))}
      </div>
      <Card className="mt-6 p-6"><Skeleton className="h-4 w-40" /><Skeleton className="mt-6 h-32 w-full" /></Card>
    </div>
  );
}
