"use client";
import { Toaster as Sonner, toast } from "sonner";

export { toast };

/** Mount once in the root layout. Styled from theme roles. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "!rounded-card !border !border-border !bg-surface !text-foreground !shadow-pop !font-sans",
          description: "!text-muted-foreground",
          success: "[&_[data-icon]]:!text-success",
          error: "[&_[data-icon]]:!text-danger",
        },
      }}
    />
  );
}
