import { ART_NAMES } from '../art/registry';
import { TONE_NAMES } from '../theme/tokens';
import {
  allEpisodes,
  CHANNELS,
  episodeCode,
  episodeFraction,
  featuredTitles,
  formatClock,
  formatMinutes,
  formatTimeOfDay,
  getTitle,
  GUIDE_NOW,
  INITIAL_PROGRESS,
  isOnNow,
  lengthLabel,
  LIVE_MATCHES,
  moreLikeThis,
  nextEpisode,
  PROFILES,
  programmeAt,
  progressFraction,
  remainingLabel,
  resumePoint,
  rowsFor,
  searchTitles,
  trendingSearches,
  TITLES,
  top10,
  timeSlots,
  visibleTitles,
} from './catalog';

const kids = PROFILES.find((p) => p.kids)!;
const adult = PROFILES.find((p) => !p.kids)!;

describe('catalog data', () => {
  it('has unique ids and only real art and tones', () => {
    const ids = TITLES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    TITLES.forEach((t) => {
      expect(ART_NAMES).toContain(t.art);
      t.accents.forEach((a) => expect(ART_NAMES).toContain(a));
      expect(TONE_NAMES).toContain(t.tone);
    });
  });

  it('gives every series seasons with unique episode ids', () => {
    TITLES.filter((t) => t.kind === 'series').forEach((t) => {
      expect(t.seasons.length).toBeGreaterThan(0);
      const eps = allEpisodes(t).map((e) => e.id);
      expect(new Set(eps).size).toBe(eps.length);
    });
  });

  it('has a full Top 10 with unique ranks', () => {
    const ranks = top10().map((t) => t.rank);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('links every live match to a channel that is showing it now', () => {
    LIVE_MATCHES.forEach((m) => {
      const channel = CHANNELS.find((c) => c.id === m.channelId)!;
      expect(channel).toBeDefined();
      expect(channel.programmes.some((p) => p.matchId === m.id)).toBe(true);
    });
  });
});

describe('episodes', () => {
  const ghost = getTitle('ghost-lane');

  it('finds the next episode, across seasons, and none after the finale', () => {
    expect(nextEpisode(ghost, 'ghost-lane-s1e2')?.id).toBe('ghost-lane-s1e3');
    expect(nextEpisode(ghost, 'ghost-lane-s1e6')?.id).toBe('ghost-lane-s2e1');
    const last = allEpisodes(ghost).at(-1)!;
    expect(nextEpisode(ghost, last.id)).toBeNull();
    expect(nextEpisode(ghost, 'nope')).toBeNull();
  });

  it('formats episode codes', () => {
    expect(episodeCode({ season: 2, number: 7 })).toBe('S2:E7');
  });

  it('marks earlier episodes watched and the current one partly watched', () => {
    const progress = [{ titleId: 'ghost-lane', episodeId: 'ghost-lane-s2e1', positionSec: 0 }];
    const [s1e1] = allEpisodes(ghost);
    const s2e1 = allEpisodes(ghost).find((e) => e.id === 'ghost-lane-s2e1')!;
    const s2e2 = allEpisodes(ghost).find((e) => e.id === 'ghost-lane-s2e2')!;
    expect(episodeFraction(progress, ghost, s1e1!)).toBe(1);
    expect(episodeFraction(progress, ghost, s2e1)).toBe(0);
    expect(episodeFraction(progress, ghost, s2e2)).toBe(0);
  });
});

describe('formatting', () => {
  it('formats running times', () => {
    expect(formatMinutes(112)).toBe('1h 52m');
    expect(formatMinutes(48)).toBe('48m');
    expect(formatMinutes(60)).toBe('1h');
  });

  it('formats the player clock', () => {
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatClock(-3)).toBe('0:00');
  });

  it('formats guide times', () => {
    expect(formatTimeOfDay(20 * 60 + 30)).toBe('8:30 PM');
    expect(formatTimeOfDay(0)).toBe('12:00 AM');
    expect(formatTimeOfDay(12 * 60 + 5)).toBe('12:05 PM');
  });

  it('summarises length', () => {
    expect(lengthLabel(getTitle('midnight-signal'))).toBe('1h 52m');
    expect(lengthLabel(getTitle('ghost-lane'))).toBe('2 seasons');
    expect(lengthLabel(getTitle('deep-reef'))).toBe('6 episodes');
  });
});

describe('progress', () => {
  it('clamps the fraction and labels what is left', () => {
    expect(progressFraction(30, 60)).toBe(0.5);
    expect(progressFraction(90, 60)).toBe(1);
    expect(progressFraction(10, 0)).toBe(0);
    expect(remainingLabel(60 * 30, 60 * 48)).toBe('18m left');
    expect(remainingLabel(60 * 47 + 35, 60 * 48)).toBe('1m left');
  });

  it('resolves resume points for the demo history', () => {
    INITIAL_PROGRESS.forEach((p) => expect(resumePoint(p)).not.toBeNull());
    const ghost = resumePoint(INITIAL_PROGRESS.find((p) => p.titleId === 'ghost-lane')!)!;
    // Left near the end so the player shows the Next episode card.
    expect(ghost.durationSec - ghost.positionSec).toBe(25);
  });

  it('rejects a series without a valid episode', () => {
    expect(resumePoint({ titleId: 'ghost-lane', episodeId: 'missing', positionSec: 10 })).toBeNull();
    expect(resumePoint({ titleId: 'nope', positionSec: 10 })).toBeNull();
  });
});

describe('browsing', () => {
  it('only shows kids titles to the Kids profile', () => {
    expect(visibleTitles(kids).every((t) => t.kids)).toBe(true);
    expect(visibleTitles(adult).length).toBe(TITLES.length);
    expect(featuredTitles(kids).every((t) => t.kids)).toBe(true);
  });

  it('builds Home rows in order, dropping empty ones', () => {
    const rows = rowsFor('home', adult, INITIAL_PROGRESS);
    expect(rows.map((r) => r.id)).toEqual(['continue', 'top10', 'live', 'new', 'because', 'originals', 'genres']);
    expect(rows.find((r) => r.id === 'because')!.title).toBe('Because you watched Starfall Protocol');
    const kidRows = rowsFor('home', kids, INITIAL_PROGRESS);
    expect(kidRows.some((r) => r.kind === 'live')).toBe(false);
    kidRows.filter((r) => r.kind !== 'genres').forEach((r) => r.items.forEach((id) => expect(getTitle(id).kids).toBe(true)));
  });

  it('builds Movies and Series rows of the right kind', () => {
    rowsFor('movies', adult, []).forEach((r) => r.items.forEach((id) => expect(getTitle(id).kind).toBe('movie')));
    rowsFor('series', adult, []).forEach((r) => r.items.forEach((id) => expect(getTitle(id).kind).toBe('series')));
  });

  it('suggests similar titles by shared genre, never the title itself', () => {
    const starfall = getTitle('starfall');
    const similar = moreLikeThis(starfall, 5);
    expect(similar).toHaveLength(5);
    expect(similar.map((t) => t.id)).not.toContain('starfall');
    expect(similar[0]!.genres.some((g) => starfall.genres.includes(g))).toBe(true);
  });
});

describe('trending searches', () => {
  it('shows a Kids profile only searches that find titles it may watch', () => {
    const chips = trendingSearches(kids);
    expect(chips.length).toBeGreaterThan(2);
    for (const chip of chips) expect(searchTitles(chip, kids).length).toBeGreaterThan(0);
    expect(chips).not.toContain('Ember Crown');
    expect(chips).not.toContain('Thriller');
  });

  it('shows everyone else the full list', () => {
    expect(trendingSearches(PROFILES.find((p) => !p.kids))).toContain('Ember Crown');
  });
});

describe('search', () => {
  it('matches word starts in names first, then genres and people', () => {
    const results = searchTitles('st');
    expect(results[0]!.id).toBe('starfall');
    expect(searchTitles('signal').map((t) => t.id)).toEqual(['midnight-signal']);
    expect(searchTitles('THRILLER').length).toBeGreaterThan(2);
    expect(searchTitles('ira').map((t) => t.id)).toContain('starfall');
  });

  it('returns nothing for an empty or unmatched query', () => {
    expect(searchTitles('  ')).toEqual([]);
    expect(searchTitles('zzzz')).toEqual([]);
  });

  it('respects the Kids profile', () => {
    expect(searchTitles('ghost', kids)).toEqual([]);
  });
});

describe('live guide', () => {
  it('knows what is on now', () => {
    const arena = CHANNELS.find((c) => c.id === 'arena-1')!;
    expect(programmeAt(arena, GUIDE_NOW)?.matchId).toBe('m-football');
    expect(isOnNow({ start: GUIDE_NOW - 10, minutes: 30 })).toBe(true);
    expect(isOnNow({ start: GUIDE_NOW + 10, minutes: 30 })).toBe(false);
  });

  it('gives every programme its own one-line synopsis', () => {
    CHANNELS.forEach((c) => {
      c.programmes.forEach((p) => {
        expect(p.synopsis.trim()).not.toBe('');
        // Not a placeholder like "Island Time on Reel One." or a repeat of the name.
        expect(p.synopsis).not.toContain(`${p.name} on ${c.name}`);
        expect(p.synopsis).not.toBe(p.name);
        // One line: short enough to fit the preview panel on a single line, ending like a sentence.
        expect(p.synopsis.length).toBeLessThanOrEqual(72);
        expect(p.synopsis).toMatch(/[.!?]$/);
      });
      // Repeat airings (two episodes of Ghost Lane) get different lines.
      const lines = c.programmes.map((p) => p.synopsis);
      expect(new Set(lines).size).toBe(lines.length);
    });
  });

  it('labels half-hour slots', () => {
    expect(timeSlots().map(formatTimeOfDay)).toEqual(['8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM']);
  });
});
