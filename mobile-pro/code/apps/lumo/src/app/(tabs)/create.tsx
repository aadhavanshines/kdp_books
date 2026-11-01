import { PHOTO_FILTERS, useCreatePost, useStories, type PhotoFilter } from '@pro/api';
import {
  Art,
  Avatar,
  GradientFill,
  Icon,
  IconButton,
  PhotoScene,
  PressableScale,
  SegmentedControl,
  Text,
  artTones,
  composeScene,
  fontFamilies,
  photoFilters,
  useTheme,
  useToast,
  type ArtName,
} from '@pro/ui';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ART_GROUPS, BACKDROP_TONES, MAX_PICKED, draftToInput, toggleArt, type Draft } from '../../lib/create';

type Panel = 'art' | 'backdrop' | 'filter';
const PANELS = [
  { key: 'art', label: 'Art' },
  { key: 'backdrop', label: 'Backdrop' },
  { key: 'filter', label: 'Filter' },
] as const;

const freshDraft = (): Draft => ({
  picked: ['sunset-over-buildings', 'hot-beverage'],
  tone: 'sunset',
  filter: 'normal',
  caption: '',
  location: '',
  tagged: [],
  seed: `draft-${Date.now().toString(36)}`,
});

export default function CreateScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const create = useCreatePost();
  // People you follow (from the story tray) are the ones you can tag.
  const stories = useStories().data;
  const people = useMemo(() => (stories ?? []).filter((g) => !g.isMe).map((g) => g.user), [stories]);
  const [draft, setDraft] = useState<Draft>(freshDraft);
  const [step, setStep] = useState<'compose' | 'details'>('compose');
  const [panel, setPanel] = useState<Panel>('art');
  const scene = useMemo(() => composeScene(draft.picked, draft.seed, draft.tone), [draft.picked, draft.seed, draft.tone]);
  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const share = () =>
    create.mutate(draftToInput(draft), {
      onSuccess: () => {
        toast.show({ message: 'Shared to your feed', icon: { name: 'checkmark-circle' } });
        setDraft(freshDraft());
        setStep('compose');
        router.navigate('/');
      },
      onError: () => toast.show({ message: 'Could not share. Try again.', tone: 'danger' }),
    });

  const header = (
    <View style={styles.bar}>
      {step === 'details' ? (
        <IconButton name="chevron-back" label="Back to editing" iconSize={28} onPress={() => setStep('compose')} />
      ) : (
        <IconButton name="close" label="Discard" iconSize={28} onPress={() => setDraft(freshDraft())} />
      )}
      <Text variant="headline" weight={700} align="center" style={styles.fill} accessibilityRole="header">
        New post
      </Text>
      {step === 'compose' ? (
        <PressableScale onPress={() => setStep('details')} disabled={!draft.picked.length} accessibilityLabel="Next" style={styles.textBtn}>
          <Text variant="headline" weight={700} color={draft.picked.length ? 'accent' : 'textMuted'}>
            Next
          </Text>
        </PressableScale>
      ) : (
        <PressableScale onPress={share} disabled={create.isPending} accessibilityLabel="Share" style={styles.textBtn}>
          <Text variant="headline" weight={700} color={create.isPending ? 'textMuted' : 'accent'}>
            {create.isPending ? 'Sharing…' : 'Share'}
          </Text>
        </PressableScale>
      )}
    </View>
  );

  if (step === 'details') {
    return (
      <View style={[styles.fill, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        {header}
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={[styles.captionRow, { borderBottomColor: colors.divider }]}>
            <View style={styles.thumb}>
              <PhotoScene scene={scene} seed={draft.seed} filter={draft.filter} radius={6} compact />
            </View>
            <TextInput
              value={draft.caption}
              onChangeText={(caption) => update({ caption })}
              placeholder="Write a caption…"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={2200}
              accessibilityLabel="Caption"
              style={[styles.captionInput, { color: colors.text, fontFamily: fontFamilies[400] }]}
              testID="caption-input"
            />
          </View>
          <View style={[styles.field, { borderBottomColor: colors.divider }]}>
            <Icon name="location-outline" size={22} />
            <TextInput
              value={draft.location}
              onChangeText={(location) => update({ location })}
              placeholder="Add location"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Location"
              style={[styles.fieldInput, { color: colors.text, fontFamily: fontFamilies[400] }]}
            />
          </View>
          <View style={styles.tagHead}>
            <Icon name="person-outline" size={22} />
            <Text variant="body" style={styles.fill}>
              Tag people
            </Text>
            {draft.tagged.length ? (
              <Text variant="footnote" color="textMuted">
                {`${draft.tagged.length} tagged`}
              </Text>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.people}>
            {people.slice(0, 10).map((u) => {
              const on = draft.tagged.includes(u.id);
              return (
                <PressableScale
                  key={u.id}
                  onPress={() => update({ tagged: on ? draft.tagged.filter((x) => x !== u.id) : [...draft.tagged, u.id] })}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Tag ${u.handle}`}
                  accessibilityState={{ checked: on }}
                  style={styles.person}
                >
                  <View>
                    <Avatar name={u.name} art={u.avatar} size={54} />
                    {on ? (
                      <View style={[styles.check, { backgroundColor: colors.accent, borderColor: colors.surface }]}>
                        <Icon name="checkmark" size={12} color="onAccent" />
                      </View>
                    ) : null}
                  </View>
                  <Text variant="caption" weight={on ? 700 : 400} numberOfLines={1} style={styles.personName}>
                    {u.handle}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      {header}
      <PhotoScene scene={scene} seed={draft.seed} filter={draft.filter} accessibilityLabel="Preview">
        <View style={styles.shuffle}>
          <IconButton name="shuffle" label="Shuffle layout" variant="surface" size={36} iconSize={18} onPress={() => update({ seed: `draft-${Math.random().toString(36).slice(2, 8)}` })} />
        </View>
      </PhotoScene>
      <SegmentedControl options={PANELS} value={panel} onChange={setPanel} style={styles.segments} />
      <ScrollView style={styles.fill} contentContainerStyle={styles.panel} showsVerticalScrollIndicator={false}>
        {panel === 'art' ? (
          <>
            <Text variant="caption" color="textMuted">
              {`Pick up to ${MAX_PICKED}. The first is the star of the photo.`}
            </Text>
            {ART_GROUPS.map((g) => (
              <View key={g.title} style={styles.group}>
                <Text variant="subhead" weight={700}>
                  {g.title}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.arts}>
                  {g.arts.map((art: ArtName) => {
                    const at = draft.picked.indexOf(art);
                    return (
                      <PressableScale
                        key={art}
                        onPress={() => update({ picked: toggleArt(draft.picked, art) })}
                        accessibilityRole="checkbox"
                        accessibilityLabel={art.replace(/-/g, ' ')}
                        accessibilityState={{ checked: at >= 0 }}
                        style={[styles.artCell, { backgroundColor: colors.surfaceMuted, borderColor: at >= 0 ? colors.accent : 'transparent' }]}
                      >
                        <Art name={art} size={44} decorative />
                        {at >= 0 ? (
                          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                            <Text variant="caption" weight={800} color="onAccent">
                              {at + 1}
                            </Text>
                          </View>
                        ) : null}
                      </PressableScale>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
          </>
        ) : panel === 'backdrop' ? (
          <View style={styles.tones}>
            {BACKDROP_TONES.map((t) => (
              <PressableScale
                key={t}
                onPress={() => update({ tone: t })}
                accessibilityRole="radio"
                accessibilityLabel={`${t} backdrop`}
                accessibilityState={{ selected: draft.tone === t }}
                style={[styles.toneRing, { borderColor: draft.tone === t ? colors.text : 'transparent' }]}
              >
                <View style={styles.toneDot}>
                  <GradientFill colors={artTones[t].light} />
                </View>
              </PressableScale>
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {PHOTO_FILTERS.map((f: PhotoFilter) => (
              <PressableScale key={f} onPress={() => update({ filter: f })} accessibilityRole="radio" accessibilityLabel={`${photoFilters[f].label} filter`} accessibilityState={{ selected: draft.filter === f }} style={styles.filter}>
                <Text variant="caption" weight={draft.filter === f ? 700 : 500} color={draft.filter === f ? 'text' : 'textMuted'}>
                  {photoFilters[f].label}
                </Text>
                <View style={[styles.filterThumb, { borderColor: draft.filter === f ? colors.text : 'transparent' }]}>
                  <PhotoScene scene={scene} seed={draft.seed} filter={f} compact radius={4} accessibilityLabel={photoFilters[f].label} />
                </View>
              </PressableScale>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  textBtn: { minWidth: 64, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  shuffle: { position: 'absolute', right: 10, bottom: 10 },
  segments: { marginHorizontal: 16, marginTop: 12 },
  panel: { padding: 16, gap: 14 },
  group: { gap: 8 },
  arts: { gap: 8 },
  artCell: { width: 60, height: 60, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tones: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  toneRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, padding: 3 },
  toneDot: { flex: 1, borderRadius: 22, overflow: 'hidden' },
  filters: { gap: 12 },
  filter: { alignItems: 'center', gap: 6 },
  filterThumb: { width: 84, height: 84, borderWidth: 2, borderRadius: 7, padding: 1 },
  captionRow: { flexDirection: 'row', gap: 12, padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb: { width: 72, height: 72 },
  captionInput: { flex: 1, minHeight: 72, fontSize: 16, textAlignVertical: 'top', outlineWidth: 0 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth },
  fieldInput: { flex: 1, fontSize: 16, minHeight: 44, outlineWidth: 0 },
  tagHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 16 },
  people: { paddingHorizontal: 12, paddingVertical: 12, gap: 6 },
  person: { alignItems: 'center', width: 72, gap: 4 },
  personName: { maxWidth: 70 },
  check: { position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
