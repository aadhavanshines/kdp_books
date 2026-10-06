import { TRACKING_STEPS, type Order } from '@quickbite/core';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { STATUS_TEXT } from './statusText';

const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' });

/** The live order timeline: placed → accepted → preparing → out for delivery → delivered. */
export function StatusTimeline({ order }: { order: Order }) {
  const reached = new Map(order.statusHistory.map((s) => [s.status, s.at]));
  const currentIndex = TRACKING_STEPS.indexOf(order.status);

  return (
    <ol aria-label="Order progress" className="space-y-0">
      {TRACKING_STEPS.map((step, i) => {
        const at = reached.get(step);
        const done = currentIndex >= i;
        const current = currentIndex === i;
        const last = i === TRACKING_STEPS.length - 1;
        return (
          <li
            key={step}
            aria-current={current ? 'step' : undefined}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!last && (
              <span
                aria-hidden
                className={cn(
                  'absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5',
                  currentIndex > i ? 'bg-success' : 'bg-line',
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                'relative flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                done ? 'border-success bg-success text-white' : 'border-line bg-white',
                current && step !== 'delivered' && 'ring-4 ring-success/20',
              )}
            >
              {done && <Check className="size-4" strokeWidth={3} />}
            </span>
            <div className="min-w-0 pt-1">
              <p className={cn('font-bold', !done && 'text-muted')}>
                {STATUS_TEXT[step].title}
                <span className="sr-only">{done ? ' (done)' : ' (to do)'}</span>
              </p>
              {at && (
                <p className="text-sm text-muted">
                  <time dateTime={at}>{timeFormat.format(new Date(at))}</time>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
