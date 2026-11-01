/**
 * Live TV guide: a preview of the focused programme on top, a half-hour
 * time ruler with a "now" line, and one row per channel with programmes
 * laid out on the timeline. On-now programmes open the live player; later
 * ones toggle a reminder.
 */
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';

import { Art } from '../components/Art';
import { LiveBadge } from '../components/Badge';
import { Focusable } from '../components/Focusable';
import { GradientFill } from '../components/GradientFill';
import { Icon } from '../components/Icon';
import { KeyArt } from '../components/KeyArt';
import { CONTENT_LEFT } from '../components/layout';
import { ProgressBar } from '../components/ProgressBar';
import { Rail } from '../components/Rail';
import { Text } from '../components/Text';
import {
  CHANNELS,
  formatTimeOfDay,
  getMatch,
  GUIDE_HOURS,
  GUIDE_NOW,
  GUIDE_START,
  isOnNow,
  programmesInWindow,
  timeSlots,
  type Channel,
  type Programme,
} from '../data/catalog';
import { FocusGroup } from '../focus/FocusGroup';
import { revealOffset } from '../focus/scroll';
import { useApp } from '../state/AppState';
import { s } from '../theme/scale';
import { colors, radii, tones } from '../theme/tokens';
import { cellFrame, timeX, type GuideGeometry } from './guideLayout';

const CHANNEL_COL = 300;
const GRID_LEFT = CONTENT_LEFT - 40;
const TIMELINE_LEFT = GRID_LEFT + CHANNEL_COL + 12;
const ROW_H = 96;
const ROW_GAP = 10;
const GRID_TOP = 470;
const GRID_HEIGHT = 1080 - GRID_TOP - 24;
const GEO: GuideGeometry = { start: GUIDE_START, span: GUIDE_HOURS * 60, width: 1920 - TIMELINE_LEFT - 64, gap: 8 };

export function GuideScreen() {
  const { navigate, profile } = useApp();
  const channels = useMemo(() => (profile?.kids ? CHANNELS.filter((c) => c.id === 'little-lanterns' || c.id === 'wildline') : CHANNELS), [profile]);
  const first = channels[0]!;
  const firstNow = first.programmes.find((p) => isOnNow(p))!;
  const [focused, setFocused] = useState<{ channel: Channel; programme: Programme }>({ channel: first, programme: firstNow });
  const [reminders, setReminders] = useState<string[]>([]);
  const scroller = useRef<ScrollViewInstance>(null);
  const offset = useRef(0);

  const onFocusCell = (rowIndex: number, channel: Channel, programme: Programme) => {
    setFocused({ channel, programme });
    const next = revealOffset(offset.current, rowIndex * (ROW_H + ROW_GAP), ROW_H, GRID_HEIGHT, ROW_GAP + 16);
    offset.current = next;
    scroller.current?.scrollTo({ y: s(next), animated: true });
  };

  const p = focused.programme;
  const onNow = isOnNow(p);
  const match = p.matchId ? getMatch(p.matchId) : undefined;
  const nowX = timeX(GEO, GUIDE_NOW);

  return (
    <View style={styles.screen}>
      {/* Preview of the focused programme */}
      <View style={styles.preview}>
        <View style={{ flex: 1 }}>
          <View style={styles.previewChannel}>
            <Text variant="overline" color="textMuted">
              {focused.channel.number}  ·  {focused.channel.name.toUpperCase()}
            </Text>
          </View>
          <Text variant="title1" numberOfLines={1} style={{ marginTop: s(12) }}>
            {p.name}
          </Text>
          <View style={styles.previewMeta}>
            {onNow && p.live ? <LiveBadge /> : null}
            <Text variant="bodyStrong" color={onNow ? 'accent' : 'textSecondary'}>
              {onNow ? 'On now' : 'Later'}  ·  {formatTimeOfDay(p.start)} – {formatTimeOfDay(p.start + p.minutes)}
            </Text>
            <Text variant="body" color="textMuted">
              {p.genre}
            </Text>
          </View>
          <Text variant="body" color="textSecondary" numberOfLines={2} style={{ marginTop: s(12), maxWidth: s(1000) }}>
            {match ? `${match.home.name} ${match.homeScore} – ${match.awayScore} ${match.away.name} (${match.clock}). ${p.synopsis}` : p.synopsis}
          </Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: s(12) }}>
            {onNow ? 'Press select to watch live' : reminders.includes(p.id) ? 'Reminder set. Press select to cancel' : 'Press select to set a reminder'}
          </Text>
        </View>
        <View style={styles.previewArt}>
          <KeyArt tone={focused.channel.tone} art={match?.art ?? focused.channel.art} variant="landscape" width={s(560)} height={s(315)} />
          {onNow && p.live ? (
            <View style={{ position: 'absolute', top: s(16), left: s(16) }}>
              <LiveBadge small />
            </View>
          ) : null}
        </View>
      </View>

      {/* Time ruler */}
      <View style={styles.ruler}>
        <View style={{ width: s(CHANNEL_COL + 12), paddingLeft: s(8) }}>
          <Text variant="label" color="text">
            Today
          </Text>
        </View>
        <View style={{ width: s(GEO.width) }}>
          {timeSlots()
            .filter((t) => Math.abs(t - GUIDE_NOW) >= 20)
            .map((t) => (
            <Text key={t} variant="caption" color="textSecondary" style={[styles.slot, { left: s(timeX(GEO, t)) }]}>
              {formatTimeOfDay(t)}
            </Text>
          ))}
          <View style={[styles.nowTag, { left: s(nowX) - s(60) }]}>
            <Text variant="caption" color="onAccent" style={{ fontFamily: 'Inter_800ExtraBold' }}>
              {formatTimeOfDay(GUIDE_NOW)}
            </Text>
          </View>
        </View>
      </View>

      {/* Channels x programmes */}
      <View style={styles.gridWrap}>
        <ScrollView ref={scroller} scrollEnabled={false} showsVerticalScrollIndicator={false}>
          <View style={{ paddingVertical: s(8) }}>
            {channels.map((c, rowIndex) => (
              <View key={c.id} style={styles.row}>
                <View style={styles.channel} accessible accessibilityLabel={`Channel ${c.number}, ${c.name}`}>
                  <View style={styles.channelLogo}>
                    <GradientFill colors={tones[c.tone]} direction="diagonal" />
                    <Art name={c.art} size={s(48)} decorative />
                  </View>
                  <View style={{ marginLeft: s(16), flex: 1 }}>
                    <Text variant="caption" color="textMuted">
                      {c.number}
                    </Text>
                    <Text variant="label" numberOfLines={1}>
                      {c.name}
                    </Text>
                  </View>
                </View>
                <FocusGroup id={`ch-${c.id}`} style={{ width: s(GEO.width), height: s(ROW_H) }}>
                  {programmesInWindow(c, GEO.start, GEO.start + GEO.span).map((prog) => {
                    const frame = cellFrame(GEO, prog.start, prog.start + prog.minutes);
                    const now = isOnNow(prog);
                    const reminded = reminders.includes(prog.id);
                    return (
                      <Focusable
                        key={prog.id}
                        accessibilityLabel={`${prog.name}, ${formatTimeOfDay(prog.start)} to ${formatTimeOfDay(prog.start + prog.minutes)}${now ? ', on now' : ''}${reminded ? ', reminder set' : ''}`}
                        focusKey={`p:${prog.id}`}
                        autoFocus={c.id === first.id && prog.id === firstNow.id}
                        indicator="glow"
                        focusScale={1}
                        radius={radii.md}
                        style={[styles.cell, { left: s(frame.x), width: s(frame.width) }]}
                        onFocus={() => onFocusCell(rowIndex, c, prog)}
                        onPress={() => {
                          if (now) navigate({ type: 'push', route: { name: 'live', channelId: c.id } });
                          else setReminders((r) => (r.includes(prog.id) ? r.filter((x) => x !== prog.id) : [...r, prog.id]));
                        }}
                      >
                        {({ focused: f }) => (
                          <View style={[styles.cellBody, now && styles.cellNow, f && styles.cellFocused]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
                              {reminded ? <Icon name="notifications" size={22} color={f ? 'onFocusFill' : 'accent'} /> : null}
                              <Text variant="label" color={f ? 'onFocusFill' : 'text'} numberOfLines={1} style={{ flexShrink: 1 }}>
                                {prog.name}
                              </Text>
                            </View>
                            <Text variant="caption" color={f ? 'onFocusFill' : 'textMuted'} numberOfLines={1}>
                              {formatTimeOfDay(prog.start)} – {formatTimeOfDay(prog.start + prog.minutes)}
                            </Text>
                            {now ? (
                              <ProgressBar
                                value={(GUIDE_NOW - prog.start) / prog.minutes}
                                height={4}
                                color={f ? colors.primary : colors.accent}
                                style={styles.cellProgress}
                              />
                            ) : null}
                          </View>
                        )}
                      </Focusable>
                    );
                  })}
                </FocusGroup>
              </View>
            ))}
          </View>
        </ScrollView>
        <View pointerEvents="none" style={[styles.nowLine, { left: s(TIMELINE_LEFT - GRID_LEFT + nowX) }]} />
      </View>
      <Rail active="guide" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  preview: { position: 'absolute', top: s(64), left: s(GRID_LEFT), right: s(64), height: s(330), flexDirection: 'row', gap: s(48) },
  previewChannel: { flexDirection: 'row', alignItems: 'center' },
  previewMeta: { flexDirection: 'row', alignItems: 'center', gap: s(20), marginTop: s(12) },
  previewArt: { width: s(560), height: s(315), borderRadius: radii.lg, overflow: 'hidden' },
  ruler: { position: 'absolute', top: s(GRID_TOP - 60), left: s(GRID_LEFT), right: 0, height: s(48), flexDirection: 'row', alignItems: 'center' },
  slot: { position: 'absolute', top: s(-14), marginLeft: s(4) },
  nowTag: {
    position: 'absolute',
    top: s(-18),
    width: s(120),
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: s(2),
  },
  gridWrap: { position: 'absolute', top: s(GRID_TOP), left: s(GRID_LEFT), right: 0, height: s(GRID_HEIGHT), overflow: 'hidden' },
  row: { flexDirection: 'row', height: s(ROW_H), marginBottom: s(ROW_GAP) },
  channel: {
    width: s(CHANNEL_COL),
    marginRight: s(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  channelLogo: { width: s(64), height: s(64), borderRadius: radii.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  cell: { position: 'absolute', top: 0, height: s(ROW_H) },
  cellBody: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: s(18),
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  cellNow: { backgroundColor: colors.surfaceRaised, borderWidth: 2, borderColor: colors.primarySoft },
  cellFocused: { backgroundColor: colors.focusFill, borderColor: colors.focusFill },
  cellProgress: { position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: 0 },
  nowLine: { position: 'absolute', top: 0, bottom: 0, width: s(3), backgroundColor: colors.accent, opacity: 0.9 },
});
