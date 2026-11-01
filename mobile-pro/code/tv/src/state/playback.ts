import { allEpisodes, progressFor, resumePoint, type Progress, type Title } from '../data/catalog';
import type { Route } from '../nav/stack';

/**
 * Where Play goes for a title: resume the episode or movie in progress, or
 * start from the beginning (first episode). Finished items (under 30 s left)
 * restart.
 */
export function playRouteFor(title: Title, progress: readonly Progress[]): Route {
  const p = progressFor(progress, title.id);
  const resume = p ? resumePoint(p) : null;
  if (resume && resume.durationSec - resume.positionSec > 5) {
    return { name: 'player', titleId: title.id, episodeId: resume.episode?.id, startSec: resume.positionSec };
  }
  const first = allEpisodes(title)[0];
  return { name: 'player', titleId: title.id, episodeId: first?.id, startSec: 0 };
}

/** "Resume S1:E4" / "Resume" / "Play" for the main button. */
export function playLabelFor(title: Title, progress: readonly Progress[]): { label: string; fraction?: number } {
  const p = progressFor(progress, title.id);
  const resume = p ? resumePoint(p) : null;
  if (!resume || resume.durationSec - resume.positionSec <= 5) return { label: 'Play' };
  const code = resume.episode ? ` S${resume.episode.season}:E${resume.episode.number}` : '';
  return { label: `Resume${code}`, fraction: resume.fraction };
}
