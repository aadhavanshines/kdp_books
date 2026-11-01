/**
 * Title details: backdrop, logo, synopsis, cast, Play / Resume, Trailer,
 * My list; for series a Seasons selector over an episode row; More like
 * this. The page scrolls section by section as focus moves down.
 */
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent, type ScrollViewInstance } from 'react-native';

import { Backdrop } from '../components/Backdrop';
import { Button } from '../components/Button';
import { EpisodeCard, LandscapeCard } from '../components/Cards';
import { Focusable } from '../components/Focusable';
import { CARD, CONTENT_LEFT } from '../components/layout';
import { Shelf } from '../components/Shelf';
import { Text } from '../components/Text';
import { TitleLogo } from '../components/TitleLogo';
import { TitleMeta } from '../components/TitleMeta';
import { episodeFraction, getTitle, moreLikeThis, progressFor } from '../data/catalog';
import { FocusGroup } from '../focus/FocusGroup';
import { sectionOffset } from '../focus/scroll';
import { useApp } from '../state/AppState';
import { playLabelFor, playRouteFor } from '../state/playback';
import { CANVAS_HEIGHT, s } from '../theme/scale';
import { colors, radii } from '../theme/tokens';

/** Rows line their first card up with the text above. */
const SHELF_INSET = CONTENT_LEFT - 40;

export function DetailsScreen({ titleId }: { titleId: string }) {
  const { navigate, progress, myList, toggleMyList, profile } = useApp();
  const title = getTitle(titleId);
  const current = progressFor(progress, title.id);
  const currentSeason = title.seasons.find((se) => se.episodes.some((e) => e.id === current?.episodeId))?.number ?? 1;
  const [season, setSeason] = useState(currentSeason);
  const play = playLabelFor(title, progress);
  const inList = myList.includes(title.id);
  const similar = moreLikeThis(title, 8, profile);
  const episodes = title.seasons.find((se) => se.number === season)?.episodes ?? [];

  const [section, setSection] = useState(0);
  const scroller = useRef<ScrollViewInstance>(null);
  const tops = useRef<number[]>([]);
  const contentHeight = useRef(0);
  const focusSection = useCallback((i: number) => {
    setSection(i);
    const y = sectionOffset(tops.current, i, contentHeight.current, s(CANVAS_HEIGHT));
    scroller.current?.scrollTo({ y: i === 0 ? 0 : Math.max(0, y - s(80)), animated: true });
  }, []);

  return (
    <View style={styles.screen}>
      <Backdrop title={title} dim={section > 0 ? 0.72 : 0} />
      <ScrollView
        ref={scroller}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(_, h) => {
          contentHeight.current = h;
        }}
      >
        <View style={styles.info} onLayout={(e: LayoutChangeEvent) => {
            tops.current[0] = e.nativeEvent.layout.y;
          }}>
          <TitleLogo name={title.name} logo={title.logo} size={104} maxLines={2} />
          <TitleMeta title={title} />
          <Text variant="body" color="textSecondary" style={styles.synopsis} numberOfLines={4}>
            {title.synopsis}
          </Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: s(16), maxWidth: s(900) }} numberOfLines={1}>
            <Text variant="caption" color="textSecondary">
              Starring{' '}
            </Text>
            {title.cast.join(', ')}
          </Text>
          <Text variant="caption" color="textMuted" style={{ marginTop: s(6) }}>
            <Text variant="caption" color="textSecondary">
              {title.kind === 'series' ? 'Created by ' : 'Directed by '}
            </Text>
            {title.creator}
          </Text>
          <FocusGroup id="actions" style={styles.actions}>
            <Button
              label={play.label}
              icon="play"
              variant="primary"
              size="lg"
              progress={play.fraction}
              autoFocus
              focusKey="details:play"
              onFocus={() => focusSection(0)}
              onPress={() => navigate({ type: 'push', route: playRouteFor(title, progress) })}
            />
            <Button
              label="Trailer"
              icon="film-outline"
              size="lg"
              focusKey="details:trailer"
              onFocus={() => focusSection(0)}
              onPress={() => navigate({ type: 'push', route: { name: 'player', titleId: title.id, trailer: true } })}
            />
            <Button
              label={inList ? 'In My list' : 'My list'}
              icon={inList ? 'checkmark' : 'add'}
              size="lg"
              focusKey="details:list"
              accessibilityState={{ selected: inList }}
              onFocus={() => focusSection(0)}
              onPress={() => toggleMyList(title.id)}
            />
          </FocusGroup>
        </View>

        {title.kind === 'series' ? (
          <View onLayout={(e: LayoutChangeEvent) => {
            tops.current[1] = e.nativeEvent.layout.y;
          }} style={styles.section}>
            <View style={styles.sectionHead}>
              <Text variant="title3" accessibilityRole="header">
                Episodes
              </Text>
              <FocusGroup id="seasons" style={styles.seasons}>
                {title.seasons.map((se) => {
                  const selected = se.number === season;
                  return (
                    <Focusable
                      key={se.number}
                      accessibilityLabel={`Season ${se.number}, ${se.episodes.length} episodes`}
                      accessibilityRole="tab"
                      accessibilityState={{ selected }}
                      focusKey={`season:${se.number}`}
                      isGroupDefault={selected}
                      indicator="glow"
                      focusScale={1.06}
                      radius={s(28)}
                      onFocus={() => {
                        setSeason(se.number);
                        focusSection(1);
                      }}
                      onPress={() => setSeason(se.number)}
                    >
                      {({ focused }) => (
                        <View style={[styles.chip, selected && styles.chipSelected, focused && styles.chipFocused]}>
                          <Text variant="label" color={focused ? 'onFocusFill' : selected ? 'text' : 'textSecondary'}>
                            Season {se.number}
                          </Text>
                        </View>
                      )}
                    </Focusable>
                  );
                })}
              </FocusGroup>
              <Text variant="caption" color="textMuted">
                {episodes.length} episodes
              </Text>
            </View>
            <Shelf
              key={`season-${season}`}
              id={`episodes-${season}`}
              inset={SHELF_INSET}
              clipLeft={0}
              data={episodes}
              keyOf={(e) => e.id}
              itemWidth={CARD.width}
              height={CARD.height + 120}
              onFocusRow={() => focusSection(1)}
              renderItem={(ep, _i, onFocus) => (
                <EpisodeCard
                  title={title}
                  episode={ep}
                  fraction={episodeFraction(progress, title, ep)}
                  focusKey={`ep:${ep.id}`}
                  onFocus={onFocus}
                  onPress={() => {
                    const p = progressFor(progress, title.id);
                    const startSec = p?.episodeId === ep.id ? p.positionSec : 0;
                    navigate({ type: 'push', route: { name: 'player', titleId: title.id, episodeId: ep.id, startSec } });
                  }}
                />
              )}
            />
          </View>
        ) : null}

        <View onLayout={(e: LayoutChangeEvent) => {
            tops.current[title.kind === 'series' ? 2 : 1] = e.nativeEvent.layout.y;
          }} style={styles.section}>
          <Shelf
            id="similar"
            inset={SHELF_INSET}
            clipLeft={0}
            title="More like this"
            data={similar}
            keyOf={(t) => t.id}
            itemWidth={CARD.width}
            height={CARD.height + 40}
            onFocusRow={() => focusSection(title.kind === 'series' ? 2 : 1)}
            renderItem={(t, _i, onFocus) => (
              <LandscapeCard
                title={t}
                focusKey={`similar:${t.id}`}
                onFocus={onFocus}
                onPress={() => navigate({ type: 'push', route: { name: 'details', titleId: t.id } })}
              />
            )}
          />
        </View>
        <View style={{ height: s(320) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  info: { paddingTop: s(150), paddingLeft: s(CONTENT_LEFT - 40), width: s(1180), minHeight: s(880) },
  synopsis: { marginTop: s(20), maxWidth: s(940) },
  actions: { flexDirection: 'row', gap: s(20), marginTop: s(40), marginBottom: s(56) },
  section: { marginBottom: s(12) },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: s(32), marginLeft: s(CONTENT_LEFT - 40), marginBottom: s(-8) },
  seasons: { flexDirection: 'row', gap: s(16) },
  chip: {
    height: s(56),
    paddingHorizontal: s(28),
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 2,
    borderColor: colors.hairline,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipFocused: { backgroundColor: colors.focusFill, borderColor: colors.focusFill },
});
