import { getTitle } from '../data/catalog';
import { scaleFor } from '../theme/scale';
import { toggleIn, upsertProgress } from './AppState';
import { playLabelFor, playRouteFor } from './playback';

describe('app state helpers', () => {
  it('keeps one progress entry per title, newest first', () => {
    const list = [
      { titleId: 'a', positionSec: 1 },
      { titleId: 'b', positionSec: 2 },
    ];
    expect(upsertProgress(list, { titleId: 'b', positionSec: 9 })).toEqual([
      { titleId: 'b', positionSec: 9 },
      { titleId: 'a', positionSec: 1 },
    ]);
  });

  it('toggles My list', () => {
    expect(toggleIn(['a'], 'b')).toEqual(['b', 'a']);
    expect(toggleIn(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('play button', () => {
  const ghost = getTitle('ghost-lane');

  it('resumes the episode in progress', () => {
    const progress = [{ titleId: 'ghost-lane', episodeId: 'ghost-lane-s1e3', positionSec: 300 }];
    expect(playRouteFor(ghost, progress)).toEqual({ name: 'player', titleId: 'ghost-lane', episodeId: 'ghost-lane-s1e3', startSec: 300 });
    expect(playLabelFor(ghost, progress).label).toBe('Resume S1:E3');
  });

  it('starts from the first episode when nothing is in progress', () => {
    expect(playRouteFor(ghost, [])).toEqual({ name: 'player', titleId: 'ghost-lane', episodeId: 'ghost-lane-s1e1', startSec: 0 });
    expect(playLabelFor(ghost, [])).toEqual({ label: 'Play' });
  });

  it('plays a movie from the start once it has been finished', () => {
    const movie = getTitle('midnight-signal');
    const done = [{ titleId: movie.id, positionSec: movie.minutes * 60 }];
    expect(playRouteFor(movie, done)).toMatchObject({ startSec: 0 });
    expect(playLabelFor(movie, done).label).toBe('Play');
  });
});

describe('canvas scale', () => {
  it('maps the 1920 canvas to the window', () => {
    expect(scaleFor(1920)).toBe(1);
    expect(scaleFor(960)).toBe(0.5); // 1080p Android TV at density 2
    expect(scaleFor(0)).toBe(1);
  });
});
