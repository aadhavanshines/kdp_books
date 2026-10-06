import type { Bill } from '@quickbite/core';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '../../lib/format';

/** The clear, itemised bill customers expect: nothing hidden, every fee explained. */
export function BillDetails({ bill, distanceKm }: { bill: Bill; distanceKm: number }) {
  const [showTaxes, setShowTaxes] = useState(false);
  const freeDelivery = bill.deliveryFee === 0 && bill.deliveryFeeBeforeDiscount > 0;

  return (
    <section aria-labelledby="bill-heading" className="rounded-3xl border border-line bg-white p-5">
      <h2 id="bill-heading" className="font-extrabold">
        Bill details
      </h2>
      <dl className="tabular mt-4 space-y-3 text-[15px]">
        <Row label="Item total" value={formatPrice(bill.itemTotal)} />
        <Row
          label={`Delivery fee | ${distanceKm.toFixed(1)} km`}
          value={
            freeDelivery ? (
              <span>
                <s className="mr-1.5 text-muted">{formatPrice(bill.deliveryFeeBeforeDiscount)}</s>
                <span className="font-bold text-success">FREE</span>
              </span>
            ) : (
              formatPrice(bill.deliveryFee)
            )
          }
        />
        {bill.discount > 0 && (
          <Row
            label={`Coupon discount (${bill.appliedCouponCode})`}
            value={<span className="font-bold text-success">−{formatPrice(bill.discount)}</span>}
          />
        )}
        <Row label="Platform fee" value={formatPrice(bill.platformFee)} />
        <Row
          label={
            <button
              type="button"
              onClick={() => setShowTaxes((v) => !v)}
              aria-expanded={showTaxes}
              className="inline-flex items-center gap-1.5 underline decoration-dotted underline-offset-4"
            >
              GST and restaurant charges <Info className="size-4 text-muted" aria-hidden />
            </button>
          }
          value={formatPrice(bill.taxes)}
        />
      </dl>
      {showTaxes && (
        <dl
          aria-label="Tax breakdown"
          className="tabular mt-2 space-y-1.5 rounded-xl bg-sunken p-3 text-sm text-ink-soft"
        >
          <Row label="GST on food (5%)" value={formatPrice(bill.foodTax)} />
          <Row label="GST on delivery and platform fee (18%)" value={formatPrice(bill.feeTax)} />
        </dl>
      )}
      <div className="mt-4 flex items-baseline justify-between border-t-2 border-ink pt-4">
        <span className="text-[17px] font-extrabold">To pay</span>
        <span className="tabular text-[17px] font-extrabold" data-testid="to-pay">
          {formatPrice(bill.grandTotal)}
        </span>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
