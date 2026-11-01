import { Avatar, Text, fontFamilies, useTheme, type ArtName } from '@pro/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export interface ComposerProps {
  placeholder: string;
  onSend: (text: string) => void;
  sending?: boolean;
  avatar?: { name: string; art: ArtName | null };
  /** Quick replies shown above the input (emoji). */
  quick?: readonly string[];
  /** Light-on-dark, for the story viewer. */
  dark?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  testID?: string;
}

/** A pill input with a "Post" / "Send" action, used for comments and chat. */
export function Composer({ placeholder, onSend, sending, avatar, quick, dark, onFocus, onBlur, testID }: ComposerProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const ready = text.trim().length > 0 && !sending;
  const send = () => {
    if (!ready) return;
    onSend(text.trim());
    setText('');
  };
  return (
    <View style={styles.wrap}>
      {quick ? (
        <View style={styles.quick}>
          {quick.map((q) => (
            <Pressable key={q} onPress={() => setText((t) => `${t}${q}`)} accessibilityRole="button" accessibilityLabel={`Add ${q}`} style={styles.quickItem}>
              <Text variant="title3">{q}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.row}>
        {avatar ? <Avatar name={avatar.name} art={avatar.art} size={36} /> : null}
        <View style={[styles.pill, dark ? { borderColor: colors.textMuted } : { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={dark ? colors.ringSeen : colors.textMuted}
            onSubmitEditing={send}
            onFocus={onFocus}
            onBlur={onBlur}
            returnKeyType="send"
            accessibilityLabel={placeholder}
            style={[styles.input, { color: dark ? colors.textInverse : colors.text, fontFamily: fontFamilies[400] }]}
            testID={testID}
          />
          {dark && !ready ? null : (
          <Pressable onPress={send} disabled={!ready} accessibilityRole="button" accessibilityLabel={placeholder.startsWith('Message') ? 'Send' : 'Post'} accessibilityState={{ disabled: !ready }} style={styles.send}>
            <Text variant="subhead" weight={700} color={ready ? (dark ? 'textInverse' : 'accent') : 'textMuted'}>
              {placeholder.startsWith('Message') ? 'Send' : 'Post'}
            </Text>
          </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  quick: { flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { minWidth: 40, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 22, minHeight: 44, paddingLeft: 16 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10, outlineWidth: 0 },
  send: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
});
