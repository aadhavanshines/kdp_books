import * as indian from './dishes-indian.mjs';
import * as sweet from './dishes-sweet.mjs';
import * as world from './dishes-world.mjs';

/** Every drawing function, by the `art` name used in src/images.ts. */
export const ART = { ...indian, ...world, ...sweet };
