/** Parse JSON stored in a TEXT column; the shape is trusted (we wrote it). */
export function parseJson<T>(text: string | null | undefined, fallback: T): T {
  if (text == null || text === '') return fallback;
  return JSON.parse(text) as T;
}

export const bool = (n: number | null | undefined) => n === 1;
