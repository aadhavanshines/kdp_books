/**
 * Home (and the Movies, Series and Sports sections): a full-bleed hero
 * billboard over a stack of rows. While the hero buttons have focus the
 * billboard rotates through featured titles; once focus is in the rows the
 * billboard follows the focused title. Rows scroll vertically so the focused
 * row sits just under the billboard, and horizontally (Shelf) so the focused
 * card sits at the focus line.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent, type ScrollViewInstance } from 'react-native';

import { Backdrop } from '../components/Backdrop';
import { Tag } from '../components/Badge';
import { Button } from '../components/Button';
import { GenreCard, LandscapeCard, LiveCard, PosterCard, Top10Card } from '../components/Cards';
import { CARD, CONTENT_LEFT, GENRE, POSTER, TOP10 } from '../components/layout';
import { Rail } from '../components/Rail';
import { Shelf } from '../components/Shelf';
import { Text } from '../components/Text';
import { TitleLogo } from '../components/TitleLogo';
import { TitleMeta } from '../components/TitleMeta';
import {
  featuredTitles,
  getMatch,
  getTitle,
  progressFor,
  resumePoint,
  rowsFor,
  visibleTitles,
  type HomeRow,
  type Section,
  type Title,
} from '../data/catalog';
import { FocusGroup } from '../focus/FocusGroup';
import { sectionOffset } from '../focus/scroll';
import { useScreenFocus } from '../focus/ScreenFocus';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { useBack } from '../nav/useBack';
import { useApp } from '../state/AppState';
import { playLabelFor, playRouteFor } from '../state/playback';
import { CANVAS_HEIGHT, s } from '../theme/scale';
import { colors, radii } from '../theme/tokens';

/** Rows start low while the billboard has focus, and rise once focus is in them. */
const ROWS_TOP_HERO = 724;
const ROWS_TOP = 540;
const HERO_ROTATE_MS = 8000;

const ROW_HEIGHT: Record<HomeRow['kind'], number> = {
  continue: CARD.height + 40,
  landscape: CARD.height + 40,
  live: CARD.height + 40,
  top10: TOP10.height,
  poster: POSTER.height,
  genres: GENRE.height,
};
const ROW_WIDTH: Record<HomeRow['kind'], number> = {
  continue: CARD.width,
  landscape: CARD.width,
  live: CARD.width,
  top10: TOP10.width,
  poster: POSTER.width,
  genres: GENRE.width,
};

function heroPool(section: Section, kids: boolean): Title[] {
  const profile = { kids };
  if (section === 'home') return featuredTitles(profile);
  const pool = visibleTitles(profile);
  const pick =
    section === 'movies'
      ? pool.filter((t) => t.kind === 'movie')
      : section === 'series'
        ? pool.filter((t) => t.kind === 'series')
        : pool.filter((t) => t.genres.some((g) => g === 'Sports' || g === 'Adventure'));
  return [...pick].sort((a, b) => Number(b.featured) - Number(a.featured) || b.match - a.match).slice(0, 4);
}

export function BrowseScreen({ section }: { section: Section }) {
  const { profile, progress, navigate, myList, toggleMyList } = useApp();
  const screen = useScreenFocus();
  const reduceMotion = useReduceMotion();
  const kids = !!profile?.kids;
  const rows = useMemo(() => rowsFor(section, profile, progress), [section, profile, progress]);
  const featured = useMemo(() => heroPool(section, kids), [section, kids]);

  const [heroIndex, setHeroIndex] = useState(0);
  const [followId, setFollowId] = useState<string | null>(null);
  const [inRows, setInRows] = useState(false);
  const hero = followId ? getTitle(followId) : featured[heroIndex % Math.max(1, featured.length)]!;

  // Rotate the billboard while the hero buttons have focus.
  useEffect(() => {
    if (!screen.active || inRows || reduceMotion || featured.length < 2) return;
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % featured.length), HERO_ROTATE_MS);
    return () => clearInterval(id);
  }, [screen.active, inRows, reduceMotion, featured.length]);

  const scroller = useRef<ScrollViewInstance>(null);
  const tops = useRef<number[]>([]);
  const contentHeight = useRef(0);
  const rowsViewport = CANVAS_HEIGHT - ROWS_TOP;

  const focusRow = useCallback(
    (index: number) => {
      setInRows(true);
      const y = sectionOffset(tops.current, index, contentHeight.current, s(rowsViewport));
      scroller.current?.scrollTo({ y, animated: true });
    },
    [rowsViewport],
  );

  const focusHero = useCallback(() => {
    setInRows(false);
    setFollowId(null);
    scroller.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Back from the rows returns to the billboard; from the billboard, the stack pops.
  useBack(() => {
    if (!inRows) return false;
    focusHero();
    screen.focus('hero:play');
    return true;
  }, screen.active);

  const open = (t: Title) => navigate({ type: 'push', route: { name: 'details', titleId: t.id } });
  const play = playLabelFor(hero, progress);
  const inList = myList.includes(hero.id);

  const renderRow = (row: HomeRow, rowIndex: number) => {
    const common = (key: string) => ({ focusKey: `row:${row.id}:${key}` });
    return (
      <Shelf
        key={row.id}
        id={row.id}
        title={row.title}
        data={row.items}
        keyOf={(id) => id}
        itemWidth={ROW_WIDTH[row.kind]}
        height={ROW_HEIGHT[row.kind]}
        onFocusRow={() => focusRow(rowIndex)}
        renderItem={(id, i, onFocus) => {
          if (row.kind === 'live') {
            const match = getMatch(id)!;
            return (
              <LiveCard
                match={match}
                {...common(id)}
                onFocus={onFocus}
                onPress={() => navigate({ type: 'push', route: { name: 'live', channelId: match.channelId } })}
              />
            );
          }
          if (row.kind === 'genres') {
            return <GenreCard genre={id} {...common(id)} onFocus={onFocus} onPress={() => navigate({ type: 'push', route: { name: 'search', query: id } })} />;
          }
          const title = getTitle(id);
          const follow = () => {
            setFollowId(title.id);
            onFocus();
          };
          if (row.kind === 'top10') return <Top10Card title={title} rank={i + 1} {...common(id)} onFocus={follow} onPress={() => open(title)} />;
          if (row.kind === 'poster') return <PosterCard title={title} {...common(id)} onFocus={follow} onPress={() => open(title)} />;
          if (row.kind === 'continue') {
            const p = progressFor(progress, title.id);
            const resume = p ? (resumePoint(p) ?? undefined) : undefined;
            return (
              <LandscapeCard
                title={title}
                resume={resume}
                {...common(id)}
                onFocus={follow}
                onPress={() => navigate({ type: 'push', route: playRouteFor(title, progress) })}
              />
            );
          }
          return <LandscapeCard title={title} {...common(id)} onFocus={follow} onPress={() => open(title)} />;
        }}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <Backdrop title={hero} height={860} />
      <View style={styles.hero} accessibilityLiveRegion="polite">
        {hero.original ? (
          <View style={styles.kicker}>
            <View style={styles.kickerMark}>
              <Text variant="overline" color="onPrimary" style={{ fontFamily: 'Inter_900Black' }}>
                R
              </Text>
            </View>
            <Text variant="overline" color="onPrimarySoft" style={{ letterSpacing: s(5) }}>
              {hero.kind === 'series' ? 'ORIGINAL SERIES' : 'ORIGINAL FILM'}
            </Text>
          </View>
        ) : hero.isNew ? (
          <View style={styles.kicker}>
            <Tag label="NEW" tone="accent" />
          </View>
        ) : (
          <View style={styles.kicker} />
        )}
        <TitleLogo name={hero.name} logo={hero.logo} size={inRows ? 72 : 96} maxLines={inRows ? 1 : 2} />
        <TitleMeta title={hero} />
        <Text variant="body" color="textSecondary" numberOfLines={inRows ? 2 : 3} style={styles.synopsis}>
          {hero.synopsis}
        </Text>
        <FocusGroup id="hero" trap={['up']} style={[styles.actions, inRows && styles.actionsResting]}>
          <Button
            label={play.label}
            icon="play"
            variant="primary"
            size="lg"
            progress={play.fraction}
            autoFocus
            focusKey="hero:play"
            onFocus={focusHero}
            onPress={() => navigate({ type: 'push', route: playRouteFor(hero, progress) })}
          />
          <Button label="More info" icon="information-circle-outline" size="lg" focusKey="hero:info" onFocus={focusHero} onPress={() => open(hero)} />
          <Button
            label={inList ? 'In My list' : 'Add to My list'}
            icon={inList ? 'checkmark' : 'add'}
            iconOnly
            size="lg"
            focusKey="hero:list"
            onFocus={focusHero}
            onPress={() => toggleMyList(hero.id)}
          />
          {!inRows && featured.length > 1 && !followId ? (
            <View style={styles.dots} accessibilityLabel={`Featured ${heroIndex + 1} of ${featured.length}`}>
              {featured.map((t, i) => (
                <View key={t.id} style={[styles.dot, i === heroIndex % featured.length && styles.dotActive]} />
              ))}
            </View>
          ) : null}
        </FocusGroup>
      </View>
      <ScrollView
        ref={scroller}
        style={[styles.rows, { top: s(inRows ? ROWS_TOP : ROWS_TOP_HERO) }]}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(_, h) => {
          contentHeight.current = h;
        }}
      >
        {rows.map((row, i) => (
          <View
            key={row.id}
            onLayout={(e: LayoutChangeEvent) => {
              tops.current[i] = e.nativeEvent.layout.y;
            }}
          >
            {renderRow(row, i)}
          </View>
        ))}
        <View style={{ height: s(CANVAS_HEIGHT - ROWS_TOP - 420) }} />
      </ScrollView>
      <Rail active={section} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: { position: 'absolute', top: s(72), left: s(CONTENT_LEFT), width: s(1100) },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: s(12), height: s(40), marginBottom: s(12) },
  kickerMark: {
    width: s(32),
    height: s(32),
    borderRadius: s(8),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  synopsis: { marginTop: s(16), maxWidth: s(880) },
  actions: { flexDirection: 'row', alignItems: 'center', gap: s(20), marginTop: s(28) },
  actionsResting: { opacity: 0 },
  dots: { flexDirection: 'row', gap: s(10), marginLeft: s(24) },
  dot: { width: s(12), height: s(12), borderRadius: radii.pill, backgroundColor: colors.track },
  dotActive: { width: s(36), backgroundColor: colors.text },
  rows: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
