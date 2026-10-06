import { UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { imageSources, type ImageKind } from '../../lib/images';

interface ImgProps {
  src: string | null;
  kind: ImageKind;
  alt: string;
  /** Browser hint for which width to pick, e.g. "(min-width: 1024px) 25vw, 100vw". */
  sizes?: string;
  /** Load immediately (for images visible on first paint). */
  priority?: boolean;
  className?: string;
}

/** Responsive, lazy image that fades in and falls back to a soft placeholder. */
export function Img({ src, kind, alt, sizes, priority, className }: ImgProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  if (!src || state === 'error') {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-brand-50 to-sunken',
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <UtensilsCrossed className="size-1/4 max-h-10 max-w-10 text-brand-200" aria-hidden />
      </div>
    );
  }
  const sources = imageSources(src, kind);
  return (
    <img
      {...sources}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onLoad={() => setState('loaded')}
      onError={() => setState('error')}
      className={cn(
        'bg-sunken object-cover transition-opacity duration-300',
        state === 'loaded' ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
