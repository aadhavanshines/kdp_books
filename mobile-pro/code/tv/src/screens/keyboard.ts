/** The on-screen keyboard: layout and what each key does to the query. */

export const LETTER_ROWS: readonly string[][] = [
  ['a', 'b', 'c', 'd', 'e', 'f'],
  ['g', 'h', 'i', 'j', 'k', 'l'],
  ['m', 'n', 'o', 'p', 'q', 'r'],
  ['s', 't', 'u', 'v', 'w', 'x'],
  ['y', 'z', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9', '0'],
];

export type KeyAction = { type: 'char'; char: string } | { type: 'space' } | { type: 'delete' } | { type: 'clear' };

export const MAX_QUERY = 40;

export function applyKey(query: string, action: KeyAction): string {
  switch (action.type) {
    case 'char':
      return query.length >= MAX_QUERY ? query : query + action.char;
    case 'space':
      // No leading or double spaces.
      return query.length === 0 || query.endsWith(' ') || query.length >= MAX_QUERY ? query : `${query} `;
    case 'delete':
      return query.slice(0, -1);
    case 'clear':
      return '';
  }
}
