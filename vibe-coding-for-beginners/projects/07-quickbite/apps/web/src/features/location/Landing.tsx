import { Bike, Clock3, ShieldCheck } from 'lucide-react';
import { Img } from '../../components/ui/Img';
import { AreaPicker } from './LocationSheet';
import { useLocationStore } from './locationStore';

const HERO_DISHES = [
  {
    src: '/images/seed/dishes/biryani-chicken',
    className: 'top-1/2 right-[5%] size-[280px] -translate-y-1/2 xl:right-[9%] xl:size-[400px]',
  },
  { src: '/images/seed/dishes/masala-dosa', className: '-top-16 -right-20 size-64' },
  { src: '/images/seed/dishes/pizza-pepperoni', className: '-bottom-14 right-[36%] size-56' },
  { src: '/images/seed/dishes/momos-steamed', className: 'bottom-[6%] -right-14 size-48' },
];

/** First screen for new visitors: pick an area to see restaurants. */
export function Landing() {
  const setArea = useLocationStore((s) => s.setArea);
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-[#fff7f2] to-[#ffe9dc]">
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {HERO_DISHES.map((d) => (
            <div
              key={d.src}
              className={`absolute overflow-hidden rounded-full shadow-raised ring-8 ring-white/60 ${d.className}`}
            >
              <Img
                src={d.src}
                kind="dish"
                alt=""
                priority
                sizes="256px"
                className="size-full scale-110"
              />
            </div>
          ))}
        </div>
        <div className="container-page relative py-10 md:py-16 lg:py-20">
          <div className="max-w-xl">
            <div aria-hidden className="mb-5 flex -space-x-4 lg:hidden">
              {HERO_DISHES.map((d) => (
                <div
                  key={d.src}
                  className="size-20 overflow-hidden rounded-full shadow-card ring-4 ring-white"
                >
                  <Img
                    src={d.src}
                    kind="dish"
                    alt=""
                    priority
                    sizes="80px"
                    className="size-full scale-110"
                  />
                </div>
              ))}
            </div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-brand-700 shadow-sm">
              <Bike className="size-4" aria-hidden /> Delivering in Bengaluru, Mumbai, Delhi &
              Gurugram
            </p>
            <h1 className="mt-4 text-[34px] leading-[1.1] font-extrabold tracking-[-0.01em] text-ink md:text-5xl">
              Hungry? Great food is <span className="text-brand-600">minutes away.</span>
            </h1>
            <p className="mt-3 text-lg text-ink-soft">
              Order from the best restaurants near you, with live tracking and great offers.
            </p>
            <div className="mt-6 rounded-3xl bg-white p-4 shadow-raised md:p-5">
              <h2 className="mb-3 text-[15px] font-extrabold">Where should we deliver?</h2>
              <div className="max-h-[52vh] overflow-y-auto pr-1">
                <AreaPicker onPick={(a) => setArea(a.id)} autoFocus={false} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container-page grid gap-6 py-12 sm:grid-cols-3">
        {[
          { icon: Clock3, title: 'Fast delivery', text: 'Most orders arrive in under 30 minutes.' },
          {
            icon: ShieldCheck,
            title: 'Safe payments',
            text: 'UPI and cards, verified on our servers.',
          },
          { icon: Bike, title: 'Live tracking', text: 'Follow your order from kitchen to door.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-line p-5">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-extrabold">{title}</h3>
              <p className="mt-0.5 text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
