import { Link } from 'react-router';
import { Img } from '../../components/ui/Img';
import { HorizontalScroller } from '../../components/ui/HorizontalScroller';
import { OFFER_BANNERS } from './offers';

export function OfferBanners() {
  return (
    <HorizontalScroller title="Best offers for you" titleId="offers-heading">
      {OFFER_BANNERS.map((offer, i) => (
        <Link
          key={offer.code}
          to="/offers"
          className={`relative flex h-36 w-[288px] shrink-0 snap-start overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-card transition-transform active:scale-[0.98] md:h-40 md:w-[380px] ${offer.className}`}
        >
          <div className="relative z-10 flex max-w-[58%] flex-col">
            <span className="text-xs font-bold tracking-wider uppercase opacity-90">
              {offer.eyebrow}
            </span>
            <span className="mt-1 text-[26px] leading-none md:text-[28px] font-extrabold tracking-[-0.01em]">
              {offer.headline}
            </span>
            <span className="mt-1.5 text-sm leading-snug font-medium opacity-95">
              {offer.detail}
            </span>
            <span className="mt-auto inline-flex w-fit rounded-lg border border-dashed border-white/70 bg-white/15 px-2 py-0.5 text-xs font-extrabold tracking-wider">
              {offer.code}
            </span>
          </div>
          <div className="absolute top-1/2 -right-10 size-40 -translate-y-1/2 md:-right-8 md:size-44 overflow-hidden rounded-full shadow-raised ring-4 ring-white/25">
            <Img
              src={offer.image}
              kind="dish"
              alt=""
              priority={i < 2}
              sizes="176px"
              className="size-full"
            />
          </div>
        </Link>
      ))}
    </HorizontalScroller>
  );
}
