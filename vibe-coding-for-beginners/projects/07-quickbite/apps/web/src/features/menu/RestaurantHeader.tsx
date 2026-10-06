import type { Coupon, Restaurant } from '@quickbite/core';
import { BadgePercent, Clock3, MapPin } from 'lucide-react';
import { Img } from '../../components/ui/Img';
import { RatingPill } from '../../components/ui/RatingPill';
import { formatEta, formatPrice } from '../../lib/format';

export function RestaurantHeader({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <section className="rounded-[28px] bg-gradient-to-b from-white to-sunken p-1 shadow-card md:p-1.5">
      <div className="flex gap-5 rounded-3xl border border-line bg-white p-4 md:p-5">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]">
            <RatingPill rating={r.rating} count={r.ratingCount} />
            <span aria-hidden className="text-muted">
              •
            </span>
            <span className="font-bold">{formatPrice(r.costForTwo)} for two</span>
          </p>
          <p className="mt-1.5 text-[15px] font-bold text-brand-600">{r.cuisines.join(', ')}</p>
          <div className="mt-3 flex gap-3">
            <div className="flex flex-col items-center pt-1.5" aria-hidden>
              <span className="size-2 rounded-full bg-line" />
              <span className="h-6 w-px bg-line" />
              <span className="size-2 rounded-full bg-line" />
            </div>
            <div className="space-y-2.5 text-[15px]">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-muted" aria-hidden />
                <span className="font-bold">Outlet</span>
                <span className="text-muted">{r.locality}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="size-4 text-muted" aria-hidden />
                <span className="font-bold">{formatEta(r.deliveryTimeMin, r.deliveryTimeMax)}</span>
              </p>
            </div>
          </div>
          {!r.isOpen && (
            <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              This restaurant is closed right now. You can browse the menu, but ordering is paused.
            </p>
          )}
        </div>
        <Img
          src={r.imageUrl}
          kind="cover"
          alt=""
          sizes="240px"
          priority
          className="hidden aspect-[16/10] w-56 shrink-0 self-center rounded-2xl md:block"
        />
      </div>
    </section>
  );
}

/** Short, scannable deal text like the big apps use: "50% OFF UPTO ₹100". */
function couponHeadline(c: Coupon) {
  if (c.type === 'free_delivery') return 'FREE DELIVERY';
  if (c.type === 'flat') return `FLAT ${formatPrice(c.value)} OFF`;
  const pct = `${c.value / 100}% OFF`;
  return c.maxDiscount ? `${pct} UPTO ${formatPrice(c.maxDiscount)}` : pct;
}

export function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <div
      title={coupon.description}
      className="flex w-[270px] shrink-0 snap-start items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-sm"
    >
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
        <BadgePercent className="size-6" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate font-extrabold">{couponHeadline(coupon)}</p>
        <p className="truncate text-sm font-semibold text-muted">
          USE {coupon.code} · ABOVE {formatPrice(coupon.minOrder)}
        </p>
      </div>
    </div>
  );
}
