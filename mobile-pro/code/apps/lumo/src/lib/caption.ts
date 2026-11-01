export type CaptionPart = { kind: 'text' | 'mention' | 'tag'; text: string };

// Handles may contain dots, but a trailing dot ends the sentence.
const TOKEN = /([@#][A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)/g;

/** Splits a caption into plain text, @mentions and #hashtags. */
export function parseCaption(text: string): CaptionPart[] {
  const parts: CaptionPart[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const at = match.index;
    if (at > last) parts.push({ kind: 'text', text: text.slice(last, at) });
    parts.push({ kind: match[0].startsWith('@') ? 'mention' : 'tag', text: match[0] });
    last = at + match[0].length;
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) });
  return parts;
}

/** Shortens a caption at a word boundary for the feed ("... more"). */
export function truncateCaption(text: string, max = 90): { text: string; truncated: boolean } {
  const firstLine = text.split('\n')[0]!;
  if (text.length <= max && firstLine === text) return { text, truncated: false };
  const cut = firstLine.length <= max ? firstLine : firstLine.slice(0, max);
  const endsOnWord = cut.length === firstLine.length || firstLine[cut.length] === ' ';
  const space = endsOnWord ? -1 : cut.lastIndexOf(' ');
  return { text: (space > max * 0.5 ? cut.slice(0, space) : cut).trimEnd(), truncated: true };
}
