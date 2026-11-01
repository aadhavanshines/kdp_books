import { useOrder, useRateOrder } from '@pro/api';
import { ArtTile, BottomBar, Button, Chip, ErrorState, ScreenHeader, Skeleton, StarRatingInput, Text, TextField, useTheme, useToast } from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ratingTags } from '../../lib/rating';

export default function RateScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrder(id);
  const rate = useRateOrder();
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const close = () => (router.canGoBack() ? router.back() : router.replace('/orders'));
  const o = order.data;
  const existing = o?.rating;

  const submit = () =>
    rate.mutate(
      { id: id!, input: { stars, tags, comment: comment.trim() || undefined } },
      {
        onSuccess: () => {
          toast.show({ message: 'Thanks for rating! It helps everyone eat better.', tone: 'success', icon: { name: 'heart' } });
          close();
        },
        onError: (e) => toast.show({ message: e.message, tone: 'danger' }),
      },
    );

  return (
    <KeyboardAvoidingView style={[styles.fill, { backgroundColor: colors.surface }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Rate your order" onBack={close} backLabel="Close" />
      {order.isError ? (
        <ErrorState art="cooking" error={order.error} onRetry={() => void order.refetch()} />
      ) : !o ? (
        <View style={styles.content}>
          <Skeleton circle height={96} style={styles.center} />
          <Skeleton width="60%" height={22} style={styles.center} />
          <Skeleton height={48} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.head}>
              <ArtTile art={o.restaurant?.art ?? o.items[0]?.art ?? 'curry-and-rice'} size={96} shape="circle" decorative />
              <Text variant="title3" align="center">
                {o.restaurant?.name ?? 'Your order'}
              </Text>
              <Text variant="footnote" color="textMuted" align="center" numberOfLines={2}>
                {o.items.map((i) => `${i.quantity} x ${i.name}`).join(', ')}
              </Text>
            </View>
            <View style={[styles.box, { backgroundColor: colors.background }]}>
              <Text variant="headline" weight={700} align="center">
                {existing ? 'You rated this order' : 'How was your food?'}
              </Text>
              <StarRatingInput value={existing?.stars ?? stars} onChange={existing ? () => undefined : (n) => {
                setStars(n);
                setTags([]);
              }} />
            </View>
            {existing ? (
              existing.comment ? (
                <Text variant="footnote" color="textSecondary" align="center">{`"${existing.comment}"`}</Text>
              ) : null
            ) : stars > 0 ? (
              <>
                <Text variant="subhead" weight={700}>
                  {stars >= 4 ? 'What did you love?' : 'What went wrong?'}
                </Text>
                <View style={styles.tags}>
                  {ratingTags(stars).map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      selected={tags.includes(t)}
                      onPress={() => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))}
                    />
                  ))}
                </View>
                <TextField
                  label="Tell us more (optional)"
                  placeholder="The biryani was perfectly spiced..."
                  multiline
                  maxLength={300}
                  value={comment}
                  onChangeText={setComment}
                />
              </>
            ) : null}
          </ScrollView>
          {existing ? null : (
            <BottomBar>
              <Button title="Submit rating" size="lg" style={styles.flex} disabled={stars === 0} loading={rate.isPending} onPress={submit} />
            </BottomBar>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, gap: 16 },
  center: { alignSelf: 'center' },
  head: { alignItems: 'center', gap: 6 },
  box: { borderRadius: 20, padding: 16, gap: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
});
