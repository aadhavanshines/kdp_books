import type { CreatePostInput, PhotoFilter } from '@pro/api';
import { composeScene, type ArtName, type ArtToneName } from '@pro/ui';

export const MAX_PICKED = 3;

export const ART_GROUPS: { title: string; arts: ArtName[] }[] = [
  {
    title: 'Places',
    arts: ['sunset-over-buildings', 'sunrise-over-mountains', 'beach-with-umbrella', 'cityscape', 'bridge-at-night', 'mount-fuji', 'desert-island', 'camping', 'ferris-wheel', 'night-with-stars', 'rainbow', 'european-castle'],
  },
  {
    title: 'Food',
    arts: ['hot-beverage', 'bubble-tea', 'croissant', 'slice-of-pizza', 'sushi', 'shortcake', 'steaming-bowl', 'doughnut', 'pancakes', 'ice-cream', 'tropical-drink', 'mango'],
  },
  {
    title: 'Life',
    arts: ['camera', 'guitar', 'books', 'bicycle', 'potted-plant', 'headphone', 'artist-palette', 'cat-face', 'dog-face', 'sunflower', 'cherry-blossom', 'butterfly'],
  },
  {
    title: 'Accents',
    arts: ['red-heart', 'white-medium-star', 'crescent-moon', 'party-popper', 'maple-leaf', 'tulip', 'sunrise', 'dark-sunglasses', 'teacup-without-handle', 'electric-light-bulb', 'fire', 'rocket'],
  },
];

export const BACKDROP_TONES: ArtToneName[] = ['sunset', 'peach', 'butter', 'mint', 'meadow', 'aqua', 'sky', 'ocean', 'lilac', 'candy', 'rose', 'dusk', 'night', 'aurora', 'ember', 'sand'];

/** Adds or removes an art; the first pick is the hero. Ignores picks past the limit. */
export function toggleArt(picked: readonly ArtName[], art: ArtName, max = MAX_PICKED): ArtName[] {
  if (picked.includes(art)) return picked.filter((a) => a !== art);
  if (picked.length >= max) return [...picked];
  return [...picked, art];
}

export interface Draft {
  picked: ArtName[];
  tone: ArtToneName;
  filter: PhotoFilter;
  caption: string;
  location: string;
  tagged: string[];
  /** Keeps the composition stable while editing; a new seed shuffles it. */
  seed: string;
}

/** The draft as the API's create-post body. */
export function draftToInput(draft: Draft): CreatePostInput {
  const scene = composeScene(draft.picked, draft.seed, draft.tone);
  return {
    scene,
    filter: draft.filter,
    caption: draft.caption.trim(),
    location: draft.location.trim() || null,
    taggedUserIds: draft.tagged.length ? draft.tagged : undefined,
  };
}
