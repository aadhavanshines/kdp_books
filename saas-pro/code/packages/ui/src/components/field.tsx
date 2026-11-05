import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn";

const control =
  "block w-full rounded-control border border-input bg-surface px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/80 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/30";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-9", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-2", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "h-9 appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

export function Checkbox({ className, label, description, id, ...props }: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex items-start gap-3">
      <input
        id={inputId}
        type="checkbox"
        className={cn("mt-0.5 size-4 shrink-0 rounded border-input accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", className)}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        {...props}
      />
      <div className="grid gap-0.5">
        <label htmlFor={inputId} className="text-sm font-medium leading-tight text-foreground">{label}</label>
        {description && <p id={`${inputId}-desc`} className="text-[13px] text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

type FieldProps = {
  label: ReactNode;
  /** Shown under the control; replaced by `error` when there is one. */
  help?: ReactNode;
  error?: string | string[] | undefined;
  optional?: boolean;
  className?: string;
  /** Render the control; receives the ids and aria props to spread on it. */
  children: (props: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
  /** Something to show at the right of the label (e.g. a "Forgot?" link). */
  labelAside?: ReactNode;
};

/** Label + control + help or error text, wired up for screen readers. */
export function Field({ label, help, error, optional, className, children, labelAside }: FieldProps) {
  const id = useId();
  const message = Array.isArray(error) ? error[0] : error;
  const describedBy = message ? `${id}-error` : help ? `${id}-help` : undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
        </Label>
        {labelAside}
      </div>
      {children({ id, ...(message ? { "aria-invalid": true as const } : {}), ...(describedBy ? { "aria-describedby": describedBy } : {}) })}
      {message ? (
        <p id={`${id}-error`} className="text-[13px] text-danger" role="alert">{message}</p>
      ) : help ? (
        <p id={`${id}-help`} className="text-[13px] text-muted-foreground">{help}</p>
      ) : null}
    </div>
  );
}
