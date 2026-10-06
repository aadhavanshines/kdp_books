import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Visually hide the title (it is still read by screen readers). */
  hideTitle?: boolean;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** "bottom" = bottom sheet on phones and a centred dialog on larger screens. "side" = drawer from the left. */
  variant?: 'bottom' | 'side';
  className?: string;
}

/**
 * One component for every overlay: a bottom sheet on phones, a dialog on
 * desktop. Radix handles focus trapping, Escape and screen-reader semantics.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  hideTitle,
  description,
  children,
  footer,
  variant = 'bottom',
  className,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-black/50 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed z-50 flex flex-col bg-white shadow-raised outline-none',
            variant === 'bottom' &&
              'inset-x-0 bottom-0 max-h-[88dvh] animate-sheet-up rounded-t-3xl md:inset-auto md:top-1/2 md:left-1/2 md:max-h-[80vh] md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl',
            variant === 'side' && 'inset-y-0 left-0 w-full max-w-md animate-fade-in',
            className,
          )}
        >
          {variant === 'bottom' && (
            <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line md:hidden" />
          )}
          <div
            className={cn(
              'flex items-start justify-between gap-4 px-5 pt-4 pb-2',
              hideTitle && 'sr-only',
            )}
          >
            <div>
              <Dialog.Title className="text-lg font-extrabold text-ink">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-sm text-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="-mt-1 -mr-2 inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-sunken"
              aria-label="Close"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          {!description && <Dialog.Description className="sr-only">{title}</Dialog.Description>}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
            {children}
          </div>
          {footer && <div className="border-t border-line px-5 py-3 pb-safe">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
