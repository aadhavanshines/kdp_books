import { conversationTitle, useConversation, useMessages, useSendMessage } from '@pro/api';
import { Avatar, IconButton, PressableScale, Skeleton, Text, useTheme } from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Composer } from '../../components/Composer';
import { VerifiedBadge } from '../../components/PostCard';
import { chatItems } from '../../lib/chat';

const R = 20;
const TUCK = 5;

export default function ChatScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const convo = useConversation(id);
  const messages = useMessages(id);
  const send = useSendMessage(id);
  const items = useMemo(() => chatItems(messages.data ?? []).reverse(), [messages.data]);
  const other = convo.data?.participants[0];
  const title = convo.data ? conversationTitle(convo.data) : '';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.fill, { backgroundColor: colors.surface }]}>
      <View style={[styles.bar, { paddingTop: insets.top, borderBottomColor: colors.divider }]}>
        <IconButton name="chevron-back" label="Back" iconSize={28} onPress={() => router.back()} />
        {other ? (
          <PressableScale onPress={() => router.push(`/user/${other.handle}`)} scaleTo={1} accessibilityLabel={`${title}, open profile`} style={styles.who}>
            <Avatar name={other.name} art={other.avatar} size={34} />
            <View style={styles.fill}>
              <View style={styles.nameRow}>
                <Text variant="subhead" weight={700} numberOfLines={1}>
                  {title}
                </Text>
                {other.isVerified ? <VerifiedBadge size={13} /> : null}
              </View>
              <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
                {other.handle}
              </Text>
            </View>
          </PressableScale>
        ) : (
          <View style={styles.who}>
            <Skeleton circle width={34} height={34} />
          </View>
        )}
        <IconButton name="call-outline" label="Audio call" iconSize={24} />
        <IconButton name="videocam-outline" label="Video call" iconSize={26} />
      </View>
      <FlatList
        inverted
        data={items}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.kind === 'day') {
            return (
              <Text variant="caption" weight={600} color="textMuted" align="center" style={styles.day}>
                {item.label}
              </Text>
            );
          }
          const { message: m, first, last } = item;
          const mine = m.isMine;
          const corners = mine
            ? { borderTopRightRadius: first ? R : TUCK, borderBottomRightRadius: last ? R : TUCK }
            : { borderTopLeftRadius: first ? R : TUCK, borderBottomLeftRadius: last ? R : TUCK };
          return (
            <View style={[styles.msgRow, mine && styles.mine, !last && styles.tight]}>
              {!mine ? <View style={styles.avatarSlot}>{last && other ? <Avatar name={other.name} art={other.avatar} size={28} /> : null}</View> : null}
              <View style={[styles.bubble, corners, { backgroundColor: mine ? colors.accent : colors.surfaceMuted }]}>
                <Text variant="body" color={mine ? 'onAccent' : 'text'}>
                  {m.text}
                </Text>
              </View>
            </View>
          );
        }}
      />
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <Composer placeholder="Message…" sending={send.isPending} onSend={(t) => send.mutate(t)} testID="chat-input" />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  list: { paddingHorizontal: 12, paddingVertical: 12 },
  day: { marginVertical: 14 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 },
  tight: { marginBottom: -6 },
  mine: { justifyContent: 'flex-end' },
  avatarSlot: { width: 28 },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 9, borderRadius: R },
  composer: { paddingHorizontal: 12, paddingTop: 6 },
});
