import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { business } from '../../config/business';

/** A plain, readable document page. Each policy is a route of its own so it has its own URL. */
export function LegalPage({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · ${business.tradeName}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return (
    <article className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-2 text-muted">{summary}</p>
      <p className="mt-1 text-xs text-muted">Last updated {business.policiesUpdated}</p>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-extrabold [&_li]:ml-5 [&_li]:list-disc [&_a]:font-semibold [&_a]:underline">
        {children}
      </div>
    </article>
  );
}

export function Operator() {
  return (
    <p>
      {business.tradeName} is operated by <strong>{business.legalName}</strong>, {business.address}.
    </p>
  );
}
