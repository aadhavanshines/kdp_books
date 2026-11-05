import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../cn";

const tones = {
  info: { cls: "border-primary/20 bg-primary-soft text-primary-soft-foreground", Icon: Info },
  success: { cls: "border-success/20 bg-success-soft text-success-soft-foreground", Icon: CircleCheck },
  warning: { cls: "border-warning/25 bg-warning-soft text-warning-soft-foreground", Icon: TriangleAlert },
  danger: { cls: "border-danger/20 bg-danger-soft text-danger-soft-foreground", Icon: CircleAlert },
} as const;

export function Alert({ tone = "info", title, children, className, action }: { tone?: keyof typeof tones; title?: ReactNode; children?: ReactNode; className?: string; action?: ReactNode }) {
  const { cls, Icon } = tones[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-control border px-3.5 py-3 text-sm", cls, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="grid min-w-0 flex-1 gap-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="opacity-90 [overflow-wrap:anywhere]">{children}</div>}
      </div>
      {action}
    </div>
  );
}
