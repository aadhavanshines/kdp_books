import type { ArtName } from '../art/registry';
import type { ToneName } from '../theme/tokens';

export type Kind = 'movie' | 'series';
export type Maturity = 'U' | 'U/A 7+' | 'U/A 13+' | 'U/A 16+' | 'A';

/** How a title's "logo" is set in display type. */
export type LogoStyle = 'block' | 'wide' | 'italic' | 'stack';

export interface Episode {
  id: string;
  season: number;
  number: number;
  name: string;
  minutes: number;
  synopsis: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Title {
  id: string;
  name: string;
  kind: Kind;
  year: number;
  maturity: Maturity;
  /** Predicted match for the profile, percent. */
  match: number;
  genres: string[];
  synopsis: string;
  cast: string[];
  /** Director (movies) or creator (series). */
  creator: string;
  /** Running time of a movie; ignored for series. */
  minutes: number;
  tone: ToneName;
  art: ArtName;
  accents: ArtName[];
  logo: LogoStyle;
  original: boolean;
  isNew: boolean;
  featured: boolean;
  /** 1 to 10 in today's Top 10. */
  rank?: number;
  kids: boolean;
  seasons: Season[];
}

export interface Progress {
  titleId: string;
  episodeId?: string;
  positionSec: number;
}

export interface Profile {
  id: string;
  name: string;
  art: ArtName;
  tone: ToneName;
  kids: boolean;
}

export interface Team {
  name: string;
  short: string;
  tone: ToneName;
}

export interface LiveMatch {
  id: string;
  sport: string;
  league: string;
  home: Team;
  away: Team;
  /** Scores as shown on the strip ("2", "184/5"). */
  homeScore: string;
  awayScore: string;
  /** Match clock or state ("67'", "18.2 ov", "Q4 3:12"). */
  clock: string;
  channelId: string;
  art: ArtName;
}

export interface Programme {
  id: string;
  name: string;
  /** Minutes after midnight. */
  start: number;
  minutes: number;
  genre: string;
  synopsis: string;
  live?: boolean;
  matchId?: string;
}

export interface Channel {
  id: string;
  number: number;
  name: string;
  short: string;
  tone: ToneName;
  art: ArtName;
  programmes: Programme[];
}

export type Section = 'home' | 'movies' | 'series' | 'sports' | 'mylist';

export type RowKind = 'continue' | 'top10' | 'landscape' | 'live' | 'poster' | 'genres';

export interface HomeRow {
  id: string;
  title: string;
  kind: RowKind;
  /** Title ids, match ids (live) or genre names (genres). */
  items: string[];
}
