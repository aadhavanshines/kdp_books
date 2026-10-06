import { couponCodeSchema, evaluateCoupon, type Coupon } from '@quickbite/core';
import { BadgePercent } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { cn } from '../../lib/cn';
import { useCoupons } from '../catalog/queries';
import { couponRejectionMessage } from './couponMessages';

interface CouponSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  itemTotal: number;
  regionId: string;
  onApply: (code: string) => void;
}

/**
 * Lists coupons with a hint of whether they apply. The hint is a preview only:
 * the backend checks the coupon again when it prices the order.
 */
export function CouponSheet({
  open,
  onOpenChange,
  brandId,
  itemTotal,
  regionId,
  onApply,
}: CouponSheetProps) {
  const { data: coupons = [] } = useCoupons(brandId);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const apply = (value: string) => {
    onApply(value);
    setCode('');
    onOpenChange(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = couponCodeSchema.safeParse(code);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Invalid code');
    apply(parsed.data);
  };

  const now = new Date();
  const rows = coupons
    .map((c) => ({
      coupon: c,
      result: evaluateCoupon(c, { itemTotal, brandId, regionId, now, userRedemptions: 0 }),
    }))
    .sort((a, b) => Number(b.result.ok) - Number(a.result.ok));

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Apply coupon">
      <form onSubmit={submit} className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Coupon code</span>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter coupon code"
            autoCapitalize="characters"
            className="h-12 w-full rounded-xl border border-line px-4 font-bold tracking-wider uppercase placeholder:font-medium placeholder:tracking-normal placeholder:normal-case focus:border-brand-500 focus:outline-none"
          />
        </label>
        <Button type="submit" variant="subtle" size="md" className="h-12" disabled={!code}>
          Apply
        </Button>
      </form>
      {error && <p className="mt-2 text-sm font-semibold text-danger">{error}</p>}

      <h3 className="mt-6 text-sm font-bold tracking-wide text-muted uppercase">
        Available coupons
      </h3>
      <ul className="mt-3 space-y-3">
        {rows.map(({ coupon, result }) => (
          <CouponRow
            key={coupon.code}
            coupon={coupon}
            message={result.ok ? null : couponRejectionMessage(result)}
            onApply={() => apply(coupon.code)}
          />
        ))}
      </ul>
    </Sheet>
  );
}

function CouponRow({
  coupon,
  message,
  onApply,
}: {
  coupon: Coupon;
  message: string | null;
  onApply: () => void;
}) {
  const usable = message === null;
  return (
    <li
      className={cn('rounded-2xl border p-4', usable ? 'border-line' : 'border-line bg-sunken/60')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BadgePercent
            className={cn('size-5', usable ? 'text-brand-600' : 'text-muted')}
            aria-hidden
          />
          <span className="rounded-md border border-dashed border-brand-300 bg-brand-50 px-2 py-0.5 text-sm font-extrabold tracking-wider text-brand-700">
            {coupon.code}
          </span>
        </div>
        <button
          type="button"
          onClick={onApply}
          disabled={!usable}
          aria-label={`Apply ${coupon.code}`}
          className="text-sm font-extrabold text-brand-600 disabled:text-muted"
        >
          APPLY
        </button>
      </div>
      <p className="mt-2 font-bold">{coupon.title}</p>
      <p className="text-sm text-muted">{coupon.description}</p>
      {message && <p className="mt-2 text-sm font-semibold text-warning-strong">{message}</p>}
    </li>
  );
}
