import { Text, type TextProps } from '@pro/ui';
import { useState } from 'react';

import { parseCaption, truncateCaption } from '../lib/caption';

export interface CaptionProps extends Omit<TextProps, 'children'> {
  handle?: string;
  text: string;
  /** Collapse long captions behind "more". */
  collapsible?: boolean;
  onPressHandle?: () => void;
}

/** A caption or comment: bold handle, then text with @mentions and #tags in the link color. */
export function Caption({ handle, text, collapsible, onPressHandle, ...rest }: CaptionProps) {
  const [expanded, setExpanded] = useState(false);
  const cut = collapsible && !expanded ? truncateCaption(text) : { text, truncated: false };
  return (
    <Text variant="footnote" {...rest}>
      {handle ? (
        <Text variant="footnote" weight={700} onPress={onPressHandle} accessibilityRole={onPressHandle ? 'link' : undefined}>
          {handle}
        </Text>
      ) : null}
      {handle ? ' ' : null}
      {parseCaption(cut.text).map((part, i) =>
        part.kind === 'text' ? (
          part.text
        ) : (
          <Text key={i} variant="footnote" color="onPrimarySoft">
            {part.text}
          </Text>
        ),
      )}
      {cut.truncated ? (
        <Text variant="footnote" color="textMuted" onPress={() => setExpanded(true)} accessibilityRole="button" accessibilityLabel="Show full caption">
          {'… more'}
        </Text>
      ) : null}
    </Text>
  );
}
