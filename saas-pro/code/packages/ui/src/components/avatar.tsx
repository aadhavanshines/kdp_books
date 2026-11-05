import { cn } from "../cn";
import { initials } from "../format";

const sizes = { sm: "size-7 text-[11px]", md: "size-9 text-xs", lg: "size-12 text-base" } as const;

export function Avatar({ name, src, size = "md", className }: { name: string; src?: string | null | undefined; size?: keyof typeof sizes; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary-soft-foreground", sizes[size], className)} aria-hidden>
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
