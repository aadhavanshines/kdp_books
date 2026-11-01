/**
 * Full-screen player with mock playback. Controls fade out after a few
 * seconds of playing without input and come back on any key (that first
 * press only reveals them). Left/Right on the focused seek bar scrub by 10 s.
 * Near the end of an episode a Next episode card takes focus and counts
 * down. Live channels show the match score bug instead of a seek bar.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { LiveBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { Focusable } from '../components/Focusable';
import { GradientFill } from '../components/GradientFill';
import { Icon } from '../components/Icon';
import { KeyArt } from '../components/KeyArt';
import { Text } from '../components/Text';
import { TitleLogo } from '../components/TitleLogo';
import {
  episodeCode,
  findEpisode,
  formatClock,
  formatTimeOfDay,
  getChannel,
  getMatch,
  getTitle,
  GUIDE_NOW,
  nextEpisode,
  programmeAt,
  runtimeSec,
  type Episode,
  type Title,
} from '../data/catalog';
import { FocusGroup, FocusTrap } from '../focus/FocusGroup';
import { useRemoteKeys } from '../focus/remote';
import { useScreenFocus } from '../focus/ScreenFocus';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { useBack } from '../nav/useBack';
import { useApp } from '../state/AppState';
import { CANVAS_HEIGHT, CANVAS_WIDTH, s } from '../theme/scale';
import { colors, radii, tones } from '../theme/tokens';
import { NEXT_CARD_SEC, controlsShouldHide, seekBy, TRAILER_SEC } from './playerLogic';

const HIDE_AFTER_MS = 5000;
const AUDIO = ['English (Original) 5.1', 'Hindi', 'Tamil', 'Spanish'];
const SUBTITLES = ['Off', 'English', 'English (CC)', 'Hindi'];

export interface PlayerScreenProps {
  titleId?: string;
  episodeId?: string;
  startSec?: number;
  trailer?: boolean;
  channelId?: string;
}

export function PlayerScreen({ titleId, episodeId, startSec = 0, trailer, channelId }: PlayerScreenProps) {
  const { navigate, saveProgress, autoplayNext } = useApp();
  const screen = useScreenFocus();
  const reduceMotion = useReduceMotion();

  const channel = channelId ? getChannel(channelId) : undefined;
  const programme = channel ? programmeAt(channel, GUIDE_NOW) : undefined;
  const match = programme?.matchId ? getMatch(programme.matchId) : undefined;
  const title: Title | undefined = titleId ? getTitle(titleId) : undefined;
  const episode: Episode | undefined = title ? findEpisode(title, episodeId) : undefined;
  const live = !!channel;
  const duration = trailer ? TRAILER_SEC : title ? runtimeSec(title, episode) : 1;
  const next = title && episode && !trailer ? nextEpisode(title, episode.id) : null;

  const [position, setPosition] = useState(trailer ? 0 : startSec);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const [menu, setMenu] = useState(false);
  const [audio, setAudio] = useState(AUDIO[0]!);
  const [subs, setSubs] = useState(SUBTITLES[0]!);
  const [nextDismissed, setNextDismissed] = useState(false);
  const [seekFocused, setSeekFocused] = useState(false);
  const lastInput = useRef(0);
  useEffect(() => {
    lastInput.current = Date.now();
  }, []);
  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Mock playback clock.
  useEffect(() => {
    if (!screen.active || !playing || live) return;
    const id = setInterval(() => setPosition((p) => Math.min(duration, p + 1)), 1000);
    return () => clearInterval(id);
  }, [screen.active, playing, live, duration]);

  // Auto-hide controls.
  useEffect(() => {
    if (!screen.active) return;
    const id = setInterval(() => {
      if (controlsShouldHide({ playing, menuOpen: menu, idleMs: Date.now() - lastInput.current, hideAfterMs: HIDE_AFTER_MS })) setVisible(false);
    }, 500);
    return () => clearInterval(id);
  }, [screen.active, playing, menu]);

  const remaining = duration - position;
  const showNext = !!next && !nextDismissed && remaining <= NEXT_CARD_SEC;

  const playNext = useCallback(() => {
    if (!title || !next) return;
    navigate({ type: 'replace', route: { name: 'player', titleId: title.id, episodeId: next.id, startSec: 0 } });
  }, [navigate, title, next]);

  // End of playback: roll into the next episode, or go back.
  useEffect(() => {
    if (!screen.active || live || position < duration) return;
    if (next && autoplayNext && !nextDismissed) playNext();
    else navigate({ type: 'back' });
  }, [screen.active, live, position, duration, next, autoplayNext, nextDismissed, playNext, navigate]);

  // Save progress on the way out (not for trailers or live).
  const posRef = useRef(position);
  useEffect(() => {
    posRef.current = position;
  }, [position]);
  useEffect(
    () => () => {
      if (title && !trailer) saveProgress({ titleId: title.id, episodeId: episode?.id, positionSec: posRef.current });
    },
    [title, episode, trailer, saveProgress],
  );

  useRemoteKeys((key) => {
    lastInput.current = Date.now();
    if (!visibleRef.current) setVisible(true);
    if (seekFocused && !live && (key === 'left' || key === 'right')) {
      setPosition((p) => seekBy(p, key === 'left' ? -10 : 10, duration));
    }
    if (key === 'playPause') setPlaying((p) => !p);
    if (key === 'rewind') setPosition((p) => seekBy(p, -10, duration));
    if (key === 'fastForward') setPosition((p) => seekBy(p, 10, duration));
  }, screen.active);

  // A press while the controls are hidden only reveals them.
  const guard = (fn: () => void) => () => {
    if (!visibleRef.current) return;
    lastInput.current = Date.now();
    fn();
  };

  useBack(() => {
    if (!menu) return false;
    setMenu(false);
    screen.focus('ctrl:audio');
    return true;
  }, screen.active && menu);

  // Controls fade.
  const [fade] = useState(() => new Animated.Value(1));
  useEffect(() => {
    Animated.timing(fade, {
      toValue: visible || menu ? 1 : 0,
      duration: reduceMotion ? 0 : 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [visible, menu, fade, reduceMotion]);

  // Slow drift over the "picture".
  const [drift] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion || !playing) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 14000, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(drift, { toValue: 0, duration: 14000, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, reduceMotion, playing]);
  const pictureScale = drift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  const w = s(CANVAS_WIDTH);
  const h = s(CANVAS_HEIGHT);
  const pictureTone = title?.tone ?? channel?.tone ?? 'violet';
  const pictureArt = title?.art ?? match?.art ?? channel?.art ?? 'television';
  const pictureAccents = title?.accents ?? [];
  const heading = title?.name ?? programme?.name ?? channel?.name ?? '';
  const subheading = trailer
    ? 'Official trailer'
    : episode
      ? `${episodeCode(episode)}  ·  ${episode.name}`
      : live && channel
        ? `${channel.number}  ${channel.name}${programme ? `  ·  until ${formatTimeOfDay(programme.start + programme.minutes)}` : ''}`
        : `${title?.year ?? ''}`;

  return (
    <View style={styles.screen}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: pictureScale }] }]}>
        <KeyArt tone={pictureTone} art={pictureArt} accents={pictureAccents} variant="backdrop" width={w} height={h} shift={episode?.number ?? 0} />
      </Animated.View>
      {live && match ? (
        <View style={styles.scoreBug} accessible accessibilityLabel={`${match.home.name} ${match.homeScore}, ${match.away.name} ${match.awayScore}, ${match.clock}`}>
          <View style={[styles.bugTeam, { backgroundColor: tones[match.home.tone][0] }]}>
            <Text variant="label" style={styles.bold}>
              {match.home.short}
            </Text>
          </View>
          <Text variant="headline" style={[styles.bold, styles.bugScore]}>
            {match.homeScore}  –  {match.awayScore}
          </Text>
          <View style={[styles.bugTeam, { backgroundColor: tones[match.away.tone][0] }]}>
            <Text variant="label" style={styles.bold}>
              {match.away.short}
            </Text>
          </View>
          <Text variant="label" color="accent" style={[styles.bold, { marginHorizontal: s(20) }]}>
            {match.clock}
          </Text>
        </View>
      ) : null}

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]} pointerEvents="box-none">
        <View style={styles.topShade} pointerEvents="none">
          <GradientFill colors={[colors.scrim, colors.scrim]} opacities={[0.85, 0]} direction="vertical" />
        </View>
        <View style={styles.bottomShade} pointerEvents="none">
          <GradientFill colors={[colors.scrim, colors.scrim]} opacities={[0, 0.92]} direction="vertical" />
        </View>
        <View style={styles.top}>
          <View style={styles.backHint}>
            <Icon name="arrow-back" size={30} color="textSecondary" />
            <Text variant="caption" color="textSecondary" style={{ marginLeft: s(10) }}>
              Back
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(20), marginTop: s(16) }}>
            {title ? <TitleLogo name={heading} logo={title.logo} size={52} maxLines={1} /> : <Text variant="title2">{heading}</Text>}
            {live ? <LiveBadge /> : null}
          </View>
          <Text variant="bodyStrong" color="textSecondary" style={{ marginTop: s(8) }}>
            {subheading}
          </Text>
        </View>

        <View style={styles.bottom}>
          {live ? (
            <View style={styles.liveBar}>
              <View style={styles.liveTrack} />
              <Text variant="label" color="text" style={styles.bold}>
                LIVE
              </Text>
            </View>
          ) : (
            <View>
              <View style={styles.times}>
                <Text variant="label" style={styles.time}>
                  {formatClock(position)}
                </Text>
                <Text variant="label" color="textSecondary" style={styles.time}>
                  -{formatClock(remaining)}
                </Text>
              </View>
              <FocusGroup id="seek" trap={['left', 'right']}>
                <Focusable
                  accessibilityLabel={`Seek bar, ${formatClock(position)} of ${formatClock(duration)}`}
                  accessibilityRole="adjustable"
                  accessibilityHint="Press left or right to skip 10 seconds"
                  focusKey="ctrl:seek"
                  indicator="none"
                  focusScale={1}
                  style={styles.seek}
                  onFocus={() => setSeekFocused(true)}
                  onBlur={() => setSeekFocused(false)}
                >
                  {({ focused }) => {
                    const pct = `${(position / duration) * 100}%` as const;
                    return (
                      <View style={styles.seekInner}>
                        <View style={[styles.seekTrack, focused && styles.seekTrackFocused]}>
                          <View style={[styles.seekFill, { width: pct }]} />
                        </View>
                        <View style={[styles.thumb, focused && styles.thumbFocused, { left: pct }]} />
                        {focused ? (
                          <View style={[styles.seekTip, { left: pct }]}>
                            <Text variant="caption" color="onFocusFill" style={styles.bold}>
                              ◀ 10s · 10s ▶
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  }}
                </Focusable>
              </FocusGroup>
            </View>
          )}

          <FocusGroup id="controls" style={styles.controls}>
            <View style={styles.side} />
            <View style={styles.center}>
              {!live ? (
                <Button
                  label="Back 10 seconds"
                  icon="play-back"
                  iconOnly
                  size="lg"
                  focusKey="ctrl:back10"
                  onPress={guard(() => setPosition((p) => seekBy(p, -10, duration)))}
                />
              ) : null}
              <Button
                label={playing ? 'Pause' : 'Play'}
                icon={playing ? 'pause' : 'play'}
                iconOnly
                size="lg"
                autoFocus
                focusKey="ctrl:play"
                style={{ transform: [{ scale: 1.2 }], marginHorizontal: s(12) }}
                onPress={guard(() => setPlaying((p) => !p))}
              />
              {!live ? (
                <Button
                  label="Forward 10 seconds"
                  icon="play-forward"
                  iconOnly
                  size="lg"
                  focusKey="ctrl:fwd10"
                  onPress={guard(() => setPosition((p) => seekBy(p, 10, duration)))}
                />
              ) : null}
            </View>
            <View style={[styles.side, styles.sideRight]}>
              <Button label="Audio & subtitles" icon="chatbox-ellipses-outline" focusKey="ctrl:audio" onPress={guard(() => setMenu(true))} />
              {next ? <Button label="Next episode" icon="play-skip-forward" focusKey="ctrl:next" onPress={guard(playNext)} /> : null}
            </View>
          </FocusGroup>
        </View>
      </Animated.View>

      {showNext && next && title ? (
        <NextEpisodeCard
          title={title}
          episode={next}
          secondsLeft={Math.max(0, Math.ceil(remaining))}
          autoplay={autoplayNext}
          onPlay={playNext}
          onDismiss={() => {
            setNextDismissed(true);
            screen.focus('ctrl:play');
          }}
        />
      ) : null}

      {menu ? (
        <View style={styles.menuWrap}>
          <View style={styles.menuScrim} />
          <FocusTrap style={styles.menu}>
            <Text variant="title3" accessibilityRole="header">
              Audio & subtitles
            </Text>
            <View style={styles.menuCols}>
              <OptionList title="Audio" options={AUDIO} value={audio} onChange={setAudio} keyPrefix="audio" autoFocus />
              <OptionList title="Subtitles" options={SUBTITLES} value={subs} onChange={setSubs} keyPrefix="subs" />
            </View>
            <Text variant="caption" color="textMuted" style={{ marginTop: s(24) }}>
              Press Back to close
            </Text>
          </FocusTrap>
        </View>
      ) : null}
    </View>
  );
}

function OptionList({
  title,
  options,
  value,
  onChange,
  keyPrefix,
  autoFocus,
}: {
  title: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  keyPrefix: string;
  autoFocus?: boolean;
}) {
  return (
    <FocusGroup id={keyPrefix} style={styles.optionCol}>
      <Text variant="overline" color="textMuted" style={{ marginBottom: s(12) }}>
        {title.toUpperCase()}
      </Text>
      {options.map((o) => {
        const selected = o === value;
        return (
          <Focusable
            key={o}
            accessibilityLabel={`${title}: ${o}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            focusKey={`${keyPrefix}:${o}`}
            autoFocus={autoFocus && selected}
            isGroupDefault={selected}
            indicator="none"
            focusScale={1}
            style={styles.option}
            onPress={() => onChange(o)}
          >
            {({ focused }) => (
              <View style={[styles.optionBody, focused && styles.optionFocused]}>
                <View style={styles.check}>{selected ? <Icon name="checkmark" size={30} color={focused ? 'onFocusFill' : 'accent'} /> : null}</View>
                <Text variant="label" color={focused ? 'onFocusFill' : selected ? 'text' : 'textSecondary'} numberOfLines={1}>
                  {o}
                </Text>
              </View>
            )}
          </Focusable>
        );
      })}
    </FocusGroup>
  );
}

function NextEpisodeCard({
  title,
  episode,
  secondsLeft,
  autoplay,
  onPlay,
  onDismiss,
}: {
  title: Title;
  episode: Episode;
  secondsLeft: number;
  autoplay: boolean;
  onPlay: () => void;
  onDismiss: () => void;
}) {
  const tw = s(300);
  const th = Math.round((tw * 9) / 16);
  return (
    <View style={styles.nextCard} accessibilityLiveRegion="polite">
      <View style={styles.nextTop}>
        <View style={{ width: tw, height: th, borderRadius: radii.md, overflow: 'hidden' }}>
          <KeyArt tone={title.tone} art={title.accents[0] ?? title.art} accents={[title.art]} variant="landscape" width={tw} height={th} shift={episode.number} />
        </View>
        <View style={{ flex: 1, marginLeft: s(24) }}>
          <Text variant="overline" color="accent">
            NEXT EPISODE
          </Text>
          <Text variant="headline" numberOfLines={2} style={{ marginTop: s(6) }}>
            {episodeCode(episode)} · {episode.name}
          </Text>
          <Text variant="caption" color="textSecondary" style={{ marginTop: s(6) }}>
            {autoplay ? `Starts in ${secondsLeft}s` : `${episode.minutes}m`}
          </Text>
        </View>
      </View>
      {autoplay ? (
        <View style={styles.countdownTrack}>
          <View style={[styles.countdownFill, { width: `${(1 - secondsLeft / NEXT_CARD_SEC) * 100}%` }]} />
        </View>
      ) : null}
      <FocusGroup id="next" style={styles.nextActions}>
        <Button label="Play now" icon="play" variant="primary" autoFocus focusKey="next:play" onPress={onPlay} />
        <Button label="Watch credits" focusKey="next:dismiss" onPress={onDismiss} />
      </FocusGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.shadow, overflow: 'hidden' },
  bold: { fontFamily: 'Inter_800ExtraBold' },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: s(320) },
  bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: s(480) },
  top: { position: 'absolute', top: s(64), left: s(96), right: s(96) },
  backHint: { flexDirection: 'row', alignItems: 'center' },
  bottom: { position: 'absolute', left: s(96), right: s(96), bottom: s(64) },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: s(4) },
  time: { fontVariant: ['tabular-nums'] },
  seek: { height: s(56), alignSelf: 'stretch' },
  seekInner: { flex: 1, justifyContent: 'center' },
  seekTrack: { height: s(8), borderRadius: radii.pill, backgroundColor: colors.track, overflow: 'hidden' },
  seekTrackFocused: { height: s(14) },
  seekFill: { height: '100%', backgroundColor: colors.primary },
  thumb: {
    position: 'absolute',
    width: s(20),
    height: s(20),
    marginLeft: s(-10),
    borderRadius: s(10),
    backgroundColor: colors.text,
  },
  thumbFocused: {
    width: s(36),
    height: s(36),
    marginLeft: s(-18),
    borderRadius: s(18),
    boxShadow: `0px 0px ${s(24)}px ${s(6)}px ${colors.focusGlow}`,
  },
  seekTip: {
    position: 'absolute',
    top: s(-48),
    marginLeft: s(-90),
    width: s(180),
    alignItems: 'center',
    backgroundColor: colors.focusFill,
    borderRadius: radii.pill,
    paddingVertical: s(4),
  },
  liveBar: { flexDirection: 'row', alignItems: 'center', gap: s(24) },
  liveTrack: { flex: 1, height: s(8), borderRadius: radii.pill, backgroundColor: colors.live },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: s(36) },
  side: { flex: 1, flexDirection: 'row', gap: s(20) },
  sideRight: { justifyContent: 'flex-end' },
  center: { flexDirection: 'row', alignItems: 'center', gap: s(28) },
  scoreBug: {
    position: 'absolute',
    top: s(64),
    right: s(96),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassStrong,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  bugTeam: { paddingHorizontal: s(18), paddingVertical: s(10) },
  bugScore: { marginHorizontal: s(24), fontVariant: ['tabular-nums'] },
  menuWrap: { ...StyleSheet.absoluteFill, flexDirection: 'row', justifyContent: 'flex-end' },
  menuScrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  menu: {
    width: s(860),
    height: '100%',
    backgroundColor: colors.glassStrong,
    paddingHorizontal: s(64),
    paddingTop: s(96),
    borderLeftWidth: 2,
    borderLeftColor: colors.hairline,
  },
  menuCols: { flexDirection: 'row', gap: s(32), marginTop: s(40) },
  optionCol: { flex: 1 },
  option: { height: s(68), marginBottom: s(8) },
  optionBody: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: radii.md, paddingHorizontal: s(16) },
  optionFocused: { backgroundColor: colors.focusFill, boxShadow: `0px 0px ${s(28)}px ${s(4)}px ${colors.focusGlow}` },
  check: { width: s(44) },
  nextCard: {
    position: 'absolute',
    right: s(96),
    bottom: s(296),
    width: s(720),
    padding: s(28),
    borderRadius: radii.xl,
    backgroundColor: colors.glassStrong,
    borderWidth: 2,
    borderColor: colors.hairline,
  },
  nextTop: { flexDirection: 'row', alignItems: 'center' },
  countdownTrack: { height: s(6), borderRadius: radii.pill, backgroundColor: colors.track, marginTop: s(20), overflow: 'hidden' },
  countdownFill: { height: '100%', backgroundColor: colors.accent },
  nextActions: { flexDirection: 'row', gap: s(16), marginTop: s(24) },
});
