import { cn } from "../cn";

/** An original, simple product mark: a rounded tile with the initial. */
export function BrandMark({ product, className }: { product: string; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground shadow-sm", className)}>
      <svg viewBox="0 0 32 32" className="size-full">
        <text x="16" y="21.5" textAnchor="middle" fontSize="17" fontWeight="700" fill="currentColor" fontFamily="inherit">{product.charAt(0).toUpperCase()}</text>
        <circle cx="25" cy="7" r="3" className="fill-accent" />
      </svg>
    </span>
  );
}

export function BrandLogo({ product, className }: { product: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark product={product} />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">{product}</span>
    </span>
  );
}
