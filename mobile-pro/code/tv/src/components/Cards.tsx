/**
 * Card types for rows. Every card is a Focusable (ring + glow + scale) whose
 * caption below is reserved space, shown when focused, so focus never
 * shifts the layout.
 */
import { StyleSheet, View } from 'react-native';

import {
  episodeCode,
  genreArt,
  remainingLabel,
  type Episode,
  type LiveMatch,
  type ResumePoint,
  type Title,
} from '../data/catalog';
import { s } from '../theme/scale';
import { colors, radii, tones } from '../theme/tokens';
import { Art } from './Art';
import { LiveBadge, Tag } from './Badge';
import { Focusable } from './Focusable';
import { GradientFill } from './GradientFill';
import { KeyArt } from './KeyArt';
import { CARD, GENRE, POSTER, TOP10 } from './layout';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';
import { TitleLogo } from './TitleLogo';

interface CardBase {
  onPress: () => void;
  onFocus: () => void;
  focusKey: string;
  autoFocus?: boolean;
}

const bottomShade = [colors.scrim, colors.scrim] as const;

/** 16:9 card with the title logo bottom-left; optional progress (Continue watching). */
export function LandscapeCard({
  title,
  resume,
  width = CARD.width,
  showCaption = true,
  ...base
}: CardBase & { title: Title; resume?: ResumePoint; width?: number; showCaption?: boolean }) {
  const w = s(width);
  const h = Math.round((w * 9) / 16);
  const sub = resume
    ? `${resume.episode ? `${episodeCode(resume.episode)} · ` : ''}${remainingLabel(resume.positionSec, resume.durationSec)}`
    : `${title.year} · ${title.genres.join(' · ')}`;
  return (
    <View style={{ width: w }}>
      <Focusable
        {...base}
        accessibilityLabel={`${title.name}. ${sub}`}
        style={{ width: w, height: h }}
        surfaceStyle={styles.clip}
      >
        <KeyArt tone={title.tone} art={title.art} accents={title.accents} variant="landscape" width={w} height={h} />
        <View style={styles.shadeBottom}>
          <GradientFill colors={bottomShade} opacities={[0, 0.85]} direction="vertical" />
        </View>
        {title.original ? (
          <View style={styles.cornerTag}>
            <Tag label="ORIGINAL" />
          </View>
        ) : null}
        <View style={[styles.logo, { right: resume || width < 360 ? s(20) : s(width * 0.28) }]}>
          <TitleLogo name={title.name} logo={title.logo} size={width > 360 ? 40 : 28} maxLines={2} />
        </View>
        {resume ? (
          <View style={styles.progress}>
            <ProgressBar value={resume.fraction} height={6} />
          </View>
        ) : null}
      </Focusable>
      {showCaption ? (
        <Text variant="caption" color={resume ? 'textSecondary' : 'textMuted'} numberOfLines={1} style={styles.caption}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

/** Tall 2:3 poster (Originals). */
export function PosterCard({ title, ...base }: CardBase & { title: Title }) {
  const w = s(POSTER.width);
  const h = s(POSTER.height);
  return (
    <Focusable {...base} accessibilityLabel={`${title.name}, ${title.kind}`} style={{ width: w, height: h }} surfaceStyle={styles.clip}>
      <KeyArt tone={title.tone} art={title.art} accents={title.accents} variant="poster" width={w} height={h} />
      <View style={[styles.shadeBottom, { height: '55%' }]}>
        <GradientFill colors={bottomShade} opacities={[0, 0.9]} direction="vertical" />
      </View>
      <View style={styles.posterMark}>
        <Text variant="overline" color="onPrimarySoft" style={{ fontSize: s(16), letterSpacing: s(4) }}>
          REELHOUSE
        </Text>
      </View>
      <View style={styles.posterLogo}>
        <TitleLogo name={title.name} logo={title.logo} size={40} maxLines={3} align="center" />
      </View>
    </Focusable>
  );
}

/** Top 10: a huge outlined numeral with the poster tucked against it. */
export function Top10Card({ title, rank, ...base }: CardBase & { title: Title; rank: number }) {
  const w = s(TOP10.width);
  const h = s(TOP10.height);
  const pw = s(TOP10.posterWidth);
  return (
    <View style={{ width: w, height: h, flexDirection: 'row', alignItems: 'flex-end' }}>
      <View style={styles.numeralBox} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Text
          style={[
            styles.numeral,
            { fontSize: s(rank === 10 ? 230 : 300), lineHeight: s(rank === 10 ? 240 : 300), letterSpacing: s(rank === 10 ? -24 : -8) },
          ]}
        >
          {rank}
        </Text>
      </View>
      <Focusable
        {...base}
        accessibilityLabel={`Number ${rank} today: ${title.name}`}
        style={{ width: pw, height: h, position: 'absolute', right: 0, top: 0 }}
        surfaceStyle={styles.clip}
      >
        <KeyArt tone={title.tone} art={title.art} accents={title.accents} variant="poster" width={pw} height={h} />
        <View style={[styles.shadeBottom, { height: '50%' }]}>
          <GradientFill colors={bottomShade} opacities={[0, 0.9]} direction="vertical" />
        </View>
        <View style={styles.posterLogo}>
          <TitleLogo name={title.name} logo={title.logo} size={34} maxLines={3} align="center" />
        </View>
      </Focusable>
    </View>
  );
}

function TeamBadge({ short, tone }: { short: string; tone: keyof typeof tones }) {
  return (
    <View style={styles.team}>
      <GradientFill colors={tones[tone]} direction="diagonal" />
      <Text variant="label" style={{ fontFamily: 'Inter_900Black', letterSpacing: s(1) }}>
        {short}
      </Text>
    </View>
  );
}

/** Live match: team monograms on a split gradient, LIVE badge and a score strip. */
export function LiveCard({ match, ...base }: CardBase & { match: LiveMatch }) {
  const w = s(CARD.width);
  const h = Math.round((w * 9) / 16);
  return (
    <View style={{ width: w }}>
      <Focusable
        {...base}
        accessibilityLabel={`Live ${match.sport}: ${match.home.name} ${match.homeScore}, ${match.away.name} ${match.awayScore}, ${match.clock}`}
        style={{ width: w, height: h }}
        surfaceStyle={styles.clip}
      >
        <View style={StyleSheet.absoluteFill}>
          <View style={[styles.half, { left: 0 }]}>
            <GradientFill colors={tones[match.home.tone]} direction="diagonal" />
          </View>
          <View style={[styles.half, { right: 0 }]}>
            <GradientFill colors={tones[match.away.tone]} direction="diagonal" />
          </View>
          <View style={styles.artCenter}>
            <Art name={match.art} size={s(110)} decorative />
          </View>
        </View>
        <View style={styles.liveTop}>
          <LiveBadge small />
          <Text variant="caption" color="text" style={{ marginLeft: s(12) }} numberOfLines={1}>
            {match.sport}
          </Text>
        </View>
        <View style={styles.teams}>
          <TeamBadge short={match.home.short} tone={match.home.tone} />
          <TeamBadge short={match.away.short} tone={match.away.tone} />
        </View>
        <View style={styles.scoreStrip}>
          <Text variant="label" style={styles.score} numberOfLines={1}>
            {match.home.short} {match.homeScore}
          </Text>
          <Text variant="caption" color="accent" style={{ fontFamily: 'Inter_700Bold' }}>
            {match.clock}
          </Text>
          <Text variant="label" style={styles.score} numberOfLines={1}>
            {match.awayScore} {match.away.short}
          </Text>
        </View>
      </Focusable>
      <Text variant="caption" color="textMuted" numberOfLines={1} style={styles.caption}>
        {match.league}
      </Text>
    </View>
  );
}

export function GenreCard({ genre, ...base }: CardBase & { genre: string }) {
  const { art, tone } = genreArt(genre);
  const w = s(GENRE.width);
  const h = s(GENRE.height);
  return (
    <Focusable {...base} accessibilityLabel={`${genre} genre`} style={{ width: w, height: h }} surfaceStyle={styles.clip}>
      <GradientFill colors={tones[tone]} direction="diagonal" />
      <View style={styles.genreArt}>
        <Art name={art} size={s(120)} decorative />
      </View>
      <View style={styles.genreLabel}>
        <Text variant="title3" style={{ fontFamily: 'Inter_800ExtraBold' }}>
          {genre}
        </Text>
      </View>
    </Focusable>
  );
}

/** Episode still with number, name, running time and progress. */
export function EpisodeCard({
  title,
  episode,
  fraction,
  ...base
}: CardBase & { title: Title; episode: Episode; fraction: number }) {
  const w = s(CARD.width);
  const h = Math.round((w * 9) / 16);
  const art = episode.number % 3 === 2 && title.accents[0] ? title.accents[0] : title.art;
  const accents = art === title.art ? title.accents : [title.art, ...title.accents.slice(1)];
  return (
    <View style={{ width: w }}>
      <Focusable
        {...base}
        accessibilityLabel={`Episode ${episode.number}: ${episode.name}, ${episode.minutes} minutes`}
        style={{ width: w, height: h }}
        surfaceStyle={styles.clip}
      >
        {({ focused }) => (
          <>
            <KeyArt tone={title.tone} art={art} accents={accents} variant="landscape" width={w} height={h} shift={episode.number} />
            <View style={styles.shadeBottom}>
              <GradientFill colors={bottomShade} opacities={[0, 0.7]} direction="vertical" />
            </View>
            <View style={styles.epNumber}>
              <Text variant="title2" style={{ fontFamily: 'Inter_900Black' }}>
                {episode.number}
              </Text>
            </View>
            {focused ? (
              <View style={styles.playHint}>
                <Text variant="caption" color="onFocusFill" style={{ fontFamily: 'Inter_700Bold' }}>
                  ▶ Play
                </Text>
              </View>
            ) : null}
            {fraction > 0 ? (
              <View style={styles.progress}>
                <ProgressBar value={fraction} height={6} color={fraction >= 1 ? colors.textMuted : colors.primary} />
              </View>
            ) : null}
          </>
        )}
      </Focusable>
      <View style={styles.epText}>
        <Text variant="label" numberOfLines={1} style={{ flex: 1 }}>
          {episode.name}
        </Text>
        <Text variant="caption" color="textMuted">
          {episode.minutes}m
        </Text>
      </View>
      <Text variant="caption" color="textMuted" numberOfLines={2} style={{ marginTop: s(4) }}>
        {episode.synopsis.split(': ').slice(1).join(': ').replace(/ \(.*\)$/, '')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', backgroundColor: colors.surface },
  shadeBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  cornerTag: { position: 'absolute', top: s(14), left: s(14) },
  logo: { position: 'absolute', left: s(20), bottom: s(22) },
  progress: { position: 'absolute', left: s(20), right: s(20), bottom: s(12) },
  caption: { marginTop: s(12), marginLeft: s(4) },
  posterMark: { position: 'absolute', top: s(16), left: 0, right: 0, alignItems: 'center' },
  posterLogo: { position: 'absolute', left: s(14), right: s(14), bottom: s(24), alignItems: 'center' },
  numeralBox: { position: 'absolute', left: 0, bottom: s(-36) },
  numeral: {
    fontFamily: 'Inter_900Black',
    color: colors.numeral,
    textShadowColor: colors.numeralStroke,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(3),
    // A crisp outline on web; native falls back to the soft shadow above.
    WebkitTextStroke: `${s(4)}px ${colors.numeralStroke}`,
  } as object,
  half: { position: 'absolute', top: 0, bottom: 0, width: '50%' },
  artCenter: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', opacity: 0.85 },
  liveTop: { position: 'absolute', top: s(14), left: s(14), right: s(14), flexDirection: 'row', alignItems: 'center' },
  teams: { position: 'absolute', top: s(64), left: s(28), right: s(28), flexDirection: 'row', justifyContent: 'space-between' },
  team: {
    width: s(84),
    height: s(84),
    borderRadius: s(42),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.hairline,
  },
  scoreStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: s(52),
    backgroundColor: colors.glassStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(16),
  },
  score: { fontFamily: 'Inter_800ExtraBold', fontVariant: ['tabular-nums'] },
  genreArt: { position: 'absolute', right: s(-8), bottom: s(-14), transform: [{ rotate: '-8deg' }] },
  genreLabel: { position: 'absolute', left: s(20), top: s(16) },
  epNumber: { position: 'absolute', left: s(18), bottom: s(16) },
  playHint: {
    position: 'absolute',
    right: s(16),
    bottom: s(22),
    backgroundColor: colors.focusFill,
    paddingHorizontal: s(14),
    paddingVertical: s(4),
    borderRadius: radii.pill,
  },
  epText: { flexDirection: 'row', alignItems: 'center', marginTop: s(12), gap: s(12) },
});
