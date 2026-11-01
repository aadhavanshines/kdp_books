/** Shared layout numbers, in 1920 x 1080 canvas units (pass through s()). */
export const RAIL_COLLAPSED = 112;
export const RAIL_EXPANDED = 400;
/** Overscan-safe left edge for content beside the collapsed rail. */
export const CONTENT_LEFT = RAIL_COLLAPSED + 64;
/**
 * The collapsed rail's soft fade into the content. It ends where the
 * leftmost content starts (the guide and details at CONTENT_LEFT - 40), so it
 * only ever softens cards scrolled past the focus line, never text.
 */
export const RAIL_FADE = CONTENT_LEFT - 40 - RAIL_COLLAPSED;
export const SAFE_RIGHT = 96;

export const CARD = { width: 400, height: 225 } as const;
export const POSTER = { width: 232, height: 348 } as const;
export const TOP10 = { width: 380, posterWidth: 216, height: 324 } as const;
export const GENRE = { width: 300, height: 169 } as const;
export const GAP = 28;
