/**
 * Reelhouse's local catalog: every title, season, episode, channel, match
 * and profile is fictional. There is no server; screens read from here.
 */
import type { ArtName } from '../art/registry';
import type { ToneName } from '../theme/tokens';
import type {
  Channel,
  Episode,
  HomeRow,
  LiveMatch,
  LogoStyle,
  Maturity,
  Profile,
  Programme,
  Progress,
  Season,
  Section,
  Title,
} from './types';

export * from './types';

// ---------------------------------------------------------------- builders

interface TitleSeed {
  id: string;
  name: string;
  year: number;
  maturity: Maturity;
  match: number;
  genres: string[];
  synopsis: string;
  cast: string[];
  creator: string;
  tone: ToneName;
  art: ArtName;
  accents: ArtName[];
  logo: LogoStyle;
  original?: boolean;
  isNew?: boolean;
  featured?: boolean;
  rank?: number;
  kids?: boolean;
}

function movie(seed: TitleSeed & { minutes: number }): Title {
  return {
    original: false,
    isNew: false,
    featured: false,
    kids: false,
    ...seed,
    kind: 'movie',
    seasons: [],
  };
}

/** `seasons` lists each season's episode names; running times vary a little by episode. */
function series(seed: TitleSeed & { minutes: number; seasons: string[][] }): Title {
  const { seasons, minutes, ...rest } = seed;
  return {
    original: false,
    isNew: false,
    featured: false,
    kids: false,
    ...rest,
    kind: 'series',
    minutes,
    seasons: seasons.map(
      (names, s): Season => ({
        number: s + 1,
        episodes: names.map(
          (name, e): Episode => ({
            id: `${seed.id}-s${s + 1}e${e + 1}`,
            season: s + 1,
            number: e + 1,
            name,
            minutes: minutes + ((e * 7 + s * 3) % 9) - 4,
            synopsis: episodeSynopsis(seed.name, name, e),
          }),
        ),
      }),
    ),
  };
}

const EPISODE_LINES = [
  'An unexpected arrival forces everyone to choose a side.',
  'Old loyalties are tested when a secret surfaces at the worst possible moment.',
  'A risky plan comes together, and then falls apart in spectacular fashion.',
  'The truth is closer than anyone thought, and it is not what they hoped.',
  'With time running out, an unlikely alliance is the only way forward.',
  'Everything changes in one long night that nobody will forget.',
  'Answers arrive at last, along with a much bigger question.',
  'The past catches up, and the price of the plan becomes clear.',
];

function episodeSynopsis(show: string, episode: string, index: number): string {
  return `${episode}: ${EPISODE_LINES[index % EPISODE_LINES.length]} (${show})`;
}

// ---------------------------------------------------------------- titles

export const TITLES: readonly Title[] = [
  series({
    id: 'starfall',
    name: 'Starfall Protocol',
    year: 2026,
    maturity: 'U/A 13+',
    match: 98,
    genres: ['Sci-fi', 'Thriller'],
    synopsis:
      'When a deep-space beacon starts answering back, a burned-out flight engineer and her estranged crew race to decode it before the agency that sent them decides they know too much.',
    cast: ['Ira Kaveri', 'Dominic Vale', 'Tanvi Rao', 'Jonah Brightwater'],
    creator: 'Esha Malhotra',
    tone: 'violet',
    art: 'astronaut',
    accents: ['rocket', 'night-with-stars'],
    logo: 'wide',
    original: true,
    isNew: true,
    featured: true,
    rank: 1,
    minutes: 48,
    seasons: [
      ['Ignition', 'Dead Air', 'The Long Dark', 'Signal Lost', 'Gravity Well', 'Burn', 'Free Fall', 'Starfall'],
      ['Reentry', 'Static', 'Second Sun', 'Orbit', 'Eclipse', 'Homecoming'],
    ],
  }),
  series({
    id: 'ember-crown',
    name: 'Ember Crown',
    year: 2025,
    maturity: 'U/A 16+',
    match: 95,
    genres: ['Fantasy', 'Drama'],
    synopsis:
      'Three rival heirs, one dragon that answers to none of them, and a throne that burns whoever sits on it. A kingdom-sized fantasy about the cost of wanting more.',
    cast: ['Arjun Sethi', 'Mira Holloway', 'Kaia Nwosu', 'Bram Ellery'],
    creator: 'Lior Castellan',
    tone: 'crimson',
    art: 'dragon',
    accents: ['crown', 'fire'],
    logo: 'block',
    original: true,
    featured: true,
    rank: 2,
    minutes: 56,
    seasons: [
      ['The Ash Throne', 'Kindling', 'Wildfire', 'The Smoke Court', 'Cinders', 'Crowned in Flame', 'Ember'],
      ['After the Fire', 'The Grey Banner', 'Scorched', 'Dragonfall', 'A Crown of Ash', 'Embers Rising', 'The Last Flame'],
    ],
  }),
  series({
    id: 'ghost-lane',
    name: 'Ghost Lane',
    year: 2024,
    maturity: 'U/A 13+',
    match: 91,
    genres: ['Comedy', 'Horror'],
    synopsis:
      'Two flatmates discover their bargain rental comes with seven very opinionated ghosts, a cursed doorbell and a landlord who will not stop smiling.',
    cast: ['Neha Iyer', 'Sam Okoro', 'Pip Langford'],
    creator: 'Ravi Deshpande',
    tone: 'orchid',
    art: 'ghost',
    accents: ['crescent-moon', 'european-castle'],
    logo: 'italic',
    original: true,
    rank: 4,
    minutes: 28,
    seasons: [
      ['Move-in Day', 'The Doorbell', 'House Rules', 'Séance Night', 'The Landlord', 'Boo Year'],
      ['Haunted Housewarming', 'Thin Walls', 'The Attic', 'Lights Out', 'Spirit Week', 'The Visitor', 'Moving Out', 'Last Call'],
    ],
  }),
  movie({
    id: 'midnight-signal',
    name: 'Midnight Signal',
    year: 2025,
    maturity: 'U/A 16+',
    match: 93,
    genres: ['Thriller', 'Mystery'],
    synopsis:
      'A late-night radio host takes a call from a listener who describes a crime that has not happened yet. By sunrise, she has one more call to take.',
    cast: ['Zara Quint', 'Hari Menon', 'Oskar Lind'],
    creator: 'Priya Natarajan',
    tone: 'steel',
    art: 'mobile-phone',
    accents: ['cityscape', 'crescent-moon'],
    logo: 'wide',
    rank: 3,
    minutes: 112,
  }),
  movie({
    id: 'ashfall',
    name: 'Ashfall',
    year: 2026,
    maturity: 'U/A 13+',
    match: 89,
    genres: ['Action', 'Adventure'],
    synopsis:
      'A cargo pilot has six hours to fly a town out from under a waking volcano, with a broken radio, a stowaway and a storm closing in.',
    cast: ['Leo Marchetti', 'Ayesha Khan', 'Daniel Osei'],
    creator: 'Viktor Hale',
    tone: 'ember',
    art: 'volcano',
    accents: ['airplane', 'fire'],
    logo: 'block',
    isNew: true,
    featured: true,
    rank: 5,
    minutes: 118,
  }),
  series({
    id: 'deep-reef',
    name: 'Deep Reef',
    year: 2025,
    maturity: 'U',
    match: 90,
    genres: ['Documentary', 'Nature'],
    synopsis:
      'Dive into the hidden cities of the coral reef, where every crack hides a neighbour and every night brings a new kind of light.',
    cast: ['Narrated by Asha Pillai'],
    creator: 'Blue Hour Films',
    tone: 'ocean',
    art: 'tropical-fish',
    accents: ['water-wave', 'tropical-fish'],
    logo: 'stack',
    original: true,
    kids: true,
    minutes: 44,
    seasons: [['The Reef Wakes', 'Night Shift', 'Cleaner Stations', 'The Open Blue', 'Coral Nursery', 'Turtle Road']],
  }),
  series({
    id: 'root-access',
    name: 'Root Access',
    year: 2026,
    maturity: 'U/A 16+',
    match: 94,
    genres: ['Thriller', 'Drama'],
    synopsis:
      'A security researcher finds a backdoor in the software that runs half the city, and the people who put it there find her first.',
    cast: ['Karan Bhatia', 'Elise Moreau', 'Tomi Adeyemi-Clark'],
    creator: 'Anika Rao',
    tone: 'teal',
    art: 'technologist',
    accents: ['desktop-computer', 'keyboard'],
    logo: 'wide',
    original: true,
    isNew: true,
    rank: 6,
    minutes: 46,
    seasons: [['Handshake', 'Zero Day', 'Privilege', 'Sandbox', 'Kernel Panic', 'Exploit', 'Patch Tuesday', 'Reboot']],
  }),
  movie({
    id: 'loop-the-loop',
    name: 'Loop the Loop',
    year: 2024,
    maturity: 'U/A 7+',
    match: 87,
    genres: ['Comedy', 'Family'],
    synopsis:
      'Three cousins have one summer to save their grandmother’s seaside fairground, armed with a rusty roller coaster and absolutely no plan.',
    cast: ['Ria Sharma', 'Ollie Banks', 'Meenakshi Rao'],
    creator: 'Tess Calloway',
    tone: 'sunset',
    art: 'roller-coaster',
    accents: ['ferris-wheel', 'party-popper'],
    logo: 'italic',
    kids: true,
    minutes: 97,
  }),
  series({
    id: 'byte-bolt',
    name: 'Byte & Bolt',
    year: 2025,
    maturity: 'U',
    match: 92,
    genres: ['Animation', 'Family'],
    synopsis:
      'A tiny repair robot and a very big-hearted spark plug fix anything in Gadget Town, except, somehow, their own mistakes.',
    cast: ['Voices of Aarav Jain', 'Lucy Fenwick'],
    creator: 'Studio Pinwheel',
    tone: 'cyan',
    art: 'robot-face',
    accents: ['red-heart', 'electric-light-bulb'],
    logo: 'stack',
    original: true,
    kids: true,
    rank: 8,
    minutes: 22,
    seasons: [
      ['Spare Parts', 'The Big Fix', 'Bolt’s Birthday', 'Power Cut', 'Rainy Day Robots', 'Gadget Fair'],
      ['New Neighbours', 'Rust Bucket', 'Spark of Genius', 'The Lost Screw', 'Byte Goes Big'],
    ],
  }),
  movie({
    id: 'moonmeadow',
    name: 'Moonmeadow',
    year: 2023,
    maturity: 'U',
    match: 88,
    genres: ['Animation', 'Fantasy'],
    synopsis:
      'A shy unicorn who cannot make rainbows sets off across the Moonmeadow to find the colour she lost, with a butterfly who talks far too much.',
    cast: ['Voices of Diya Kapoor', 'Felix Adair'],
    creator: 'Studio Pinwheel',
    tone: 'candy',
    art: 'unicorn-face',
    accents: ['rainbow', 'butterfly'],
    logo: 'italic',
    kids: true,
    minutes: 88,
  }),
  movie({
    id: 'long-climb',
    name: 'The Long Climb',
    year: 2024,
    maturity: 'U',
    match: 86,
    genres: ['Documentary', 'Adventure'],
    synopsis:
      'Four friends, one unclimbed face and forty days on the ice. A documentary about the summit you choose and the one that chooses you.',
    cast: ['Tenzin Norbu', 'Ana Ruiz', 'Kiran Bedi-Shah'],
    creator: 'Mallory North',
    tone: 'aurora',
    art: 'snow-capped-mountain',
    accents: ['tent', 'compass'],
    logo: 'wide',
    rank: 9,
    minutes: 102,
  }),
  series({
    id: 'redline',
    name: 'Redline',
    year: 2026,
    maturity: 'U/A 13+',
    match: 90,
    genres: ['Sports', 'Drama'],
    synopsis:
      'A rookie rider from a small-town workshop gets one season on the world’s fastest circuit, and a team that wants her to lose.',
    cast: ['Sana Mirza', 'Luca Benedetti', 'Grace Ohana'],
    creator: 'Dev Kulkarni',
    tone: 'gold',
    art: 'racing-motorcycle',
    accents: ['fire', 'automobile'],
    logo: 'block',
    original: true,
    isNew: true,
    featured: true,
    rank: 7,
    minutes: 50,
    seasons: [['Green Light', 'Qualifying', 'Slipstream', 'Pit Wall', 'Rain Race', 'Podium', 'Black Flag']],
  }),
  movie({
    id: 'encore',
    name: 'Encore',
    year: 2025,
    maturity: 'U/A 13+',
    match: 85,
    genres: ['Music', 'Drama'],
    synopsis:
      'A wedding singer gets one night on the biggest stage in the country, and has to decide whose song she is going to sing.',
    cast: ['Ananya Bose', 'Marco Sterling', 'Ishaan Verma'],
    creator: 'Celeste Moreno',
    tone: 'orchid',
    art: 'singer',
    accents: ['guitar', 'headphone'],
    logo: 'italic',
    isNew: true,
    minutes: 121,
  }),
  movie({
    id: 'island-time',
    name: 'Island Time',
    year: 2023,
    maturity: 'U/A 7+',
    match: 84,
    genres: ['Comedy', 'Romance'],
    synopsis:
      'Stranded on a tiny island with her ex and a very confident parrot, a travel blogger learns that some trips do not go to plan for a reason.',
    cast: ['Kavya Reddy', 'Noah Whitfield'],
    creator: 'Juno Patel',
    tone: 'ocean',
    art: 'desert-island',
    accents: ['beach-with-umbrella', 'tropical-drink'],
    logo: 'stack',
    minutes: 99,
  }),
  series({
    id: 'ninth-mage',
    name: 'The Ninth Mage',
    year: 2024,
    maturity: 'U/A 13+',
    match: 92,
    genres: ['Fantasy', 'Adventure'],
    synopsis:
      'Eight mages guard the city of Lanternfall. Nobody told the ninth one, a librarian who just discovered she can rewrite spells.',
    cast: ['Isla Fern', 'Rohan Mehra', 'Odile Grant'],
    creator: 'Lior Castellan',
    tone: 'dusk',
    art: 'mage',
    accents: ['books', 'crescent-moon'],
    logo: 'wide',
    original: true,
    minutes: 52,
    seasons: [['The Ninth Seat', 'Ink and Ash', 'Lanternfall', 'The Unwritten', 'Spellbound', 'The Last Page']],
  }),
  movie({
    id: 'blossom',
    name: 'Blossom Season',
    year: 2025,
    maturity: 'U/A 7+',
    match: 83,
    genres: ['Romance', 'Drama'],
    synopsis:
      'Every spring for ten years, two strangers meet under the same cherry tree by accident. This year, one of them is not leaving it to chance.',
    cast: ['Mei Tanaka', 'Aditya Rao'],
    creator: 'Hana Okuda',
    tone: 'candy',
    art: 'cherry-blossom',
    accents: ['red-heart', 'ring'],
    logo: 'italic',
    minutes: 104,
  }),
  series({
    id: 'paws-claws',
    name: 'Paws & Claws',
    year: 2024,
    maturity: 'U',
    match: 89,
    genres: ['Animation', 'Comedy'],
    synopsis:
      'A dog who thinks he is a detective and a cat who actually is one solve the smallest mysteries in the neighbourhood, loudly.',
    cast: ['Voices of Kabir Anand', 'Maya Lowell'],
    creator: 'Studio Pinwheel',
    tone: 'meadow',
    art: 'dog-face',
    accents: ['cat-face', 'teddy-bear'],
    logo: 'stack',
    kids: true,
    rank: 10,
    minutes: 24,
    seasons: [['The Missing Bone', 'Who Ate the Cake?', 'Bear Necessities', 'The Squeaky Clue', 'Night Watch']],
  }),
  series({
    id: 'quiet-detective',
    name: 'The Quiet Detective',
    year: 2023,
    maturity: 'U/A 16+',
    match: 91,
    genres: ['Crime', 'Mystery'],
    synopsis:
      'She never raises her voice, never carries a notebook and never misses a lie. Northbay’s calmest detective takes the cases nobody else can close.',
    cast: ['Rekha Iyer', 'Gideon Marsh', 'Faisal Qureshi'],
    creator: 'Priya Natarajan',
    tone: 'night',
    art: 'dark-sunglasses',
    accents: ['coat', 'eyeglasses'],
    logo: 'wide',
    minutes: 54,
    seasons: [
      ['The Silent Witness', 'Cold Tea', 'The Glass House', 'Second Opinion', 'Low Tide', 'Closing Time'],
      ['The Harbour Job', 'Overheard', 'Paper Trail', 'Whisper Network', 'Calm Before'],
    ],
  }),
  movie({
    id: 'jetstream',
    name: 'Jetstream',
    year: 2026,
    maturity: 'U/A 13+',
    match: 88,
    genres: ['Action', 'Thriller'],
    synopsis:
      'An air-traffic controller talks a hijacked jet across three countries and one very long night, without ever leaving her chair.',
    cast: ['Simran Gill', 'Theo Navarro', 'Abe Mensah'],
    creator: 'Viktor Hale',
    tone: 'cyan',
    art: 'airplane',
    accents: ['world-map', 'compass'],
    logo: 'block',
    isNew: true,
    minutes: 109,
  }),
  movie({
    id: 'colour-theory',
    name: 'Colour Theory',
    year: 2024,
    maturity: 'U/A 13+',
    match: 82,
    genres: ['Drama'],
    synopsis:
      'A colour-blind painter forges a lost masterpiece to save her studio, and paints herself into a very expensive corner.',
    cast: ['Lena Kaur', 'Bastien Roux'],
    creator: 'Celeste Moreno',
    tone: 'sunset',
    art: 'artist-palette',
    accents: ['artist'],
    logo: 'italic',
    minutes: 107,
  }),
  movie({
    id: 'quiet-mountain',
    name: 'Quiet Mountain',
    year: 2025,
    maturity: 'U',
    match: 86,
    genres: ['Documentary', 'Nature'],
    synopsis:
      'One year on a sleeping mountain, from the first frost to the last bloom, filmed by a crew that barely spoke a word.',
    cast: ['Narrated by Omar Siddiqui'],
    creator: 'Blue Hour Films',
    tone: 'dusk',
    art: 'mount-fuji',
    accents: ['sunrise-over-mountains', 'cherry-blossom'],
    logo: 'wide',
    original: true,
    minutes: 92,
  }),
  series({
    id: 'player-two',
    name: 'Player Two',
    year: 2025,
    maturity: 'U/A 13+',
    match: 87,
    genres: ['Comedy', 'Drama'],
    synopsis:
      'A washed-up game designer and her teenage tester build one last game in a garage, and accidentally build a family instead.',
    cast: ['Pooja Hegde-Lam', 'Ezra Cole', 'Nia Park'],
    creator: 'Ravi Deshpande',
    tone: 'violet',
    art: 'video-game',
    accents: ['keyboard', 'party-popper'],
    logo: 'block',
    original: true,
    minutes: 30,
    seasons: [['Press Start', 'Tutorial', 'Boss Fight', 'Save Point', 'Glitch', 'Co-op', 'Game Over?']],
  }),
];

const titleById = new Map(TITLES.map((t) => [t.id, t]));

export function getTitle(id: string): Title {
  const title = titleById.get(id);
  if (!title) throw new Error(`Unknown title "${id}"`);
  return title;
}

export function findTitle(id: string): Title | undefined {
  return titleById.get(id);
}

// ---------------------------------------------------------------- episodes

export function allEpisodes(title: Title): Episode[] {
  return title.seasons.flatMap((s) => s.episodes);
}

export function findEpisode(title: Title, episodeId: string | undefined): Episode | undefined {
  if (!episodeId) return undefined;
  return allEpisodes(title).find((e) => e.id === episodeId);
}

/** The episode after `episodeId`, crossing into the next season; null after the finale. */
export function nextEpisode(title: Title, episodeId: string): Episode | null {
  const episodes = allEpisodes(title);
  const i = episodes.findIndex((e) => e.id === episodeId);
  if (i < 0) return null;
  return episodes[i + 1] ?? null;
}

/** "S2:E7" */
export function episodeCode(episode: Pick<Episode, 'season' | 'number'>): string {
  return `S${episode.season}:E${episode.number}`;
}

/** Running time in seconds of a movie or an episode. */
export function runtimeSec(title: Title, episode?: Episode): number {
  return (episode?.minutes ?? title.minutes) * 60;
}

// ---------------------------------------------------------------- formatting

/** 112 -> "1h 52m", 48 -> "48m", 60 -> "1h". */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest}m`;
  return rest === 0 ? `${h}h` : `${h}h ${rest}m`;
}

/** Player clock: 75 -> "1:15", 3725 -> "1:02:05". */
export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Guide times: 1230 -> "8:30 PM". */
export function formatTimeOfDay(minutesAfterMidnight: number): string {
  const total = ((Math.round(minutesAfterMidnight) % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

/** "Series · 2 seasons", "Movie · 1h 52m" style summary. */
export function lengthLabel(title: Title): string {
  if (title.kind === 'movie') return formatMinutes(title.minutes);
  const n = title.seasons.length;
  if (n > 1) return `${n} seasons`;
  return `${title.seasons[0]?.episodes.length ?? 0} episodes`;
}

// ---------------------------------------------------------------- progress

/** Fraction watched, clamped to 0..1. */
export function progressFraction(positionSec: number, durationSec: number): number {
  if (durationSec <= 0) return 0;
  return Math.max(0, Math.min(1, positionSec / durationSec));
}

/** What is left, rounded up to a minute: "18m left". */
export function remainingLabel(positionSec: number, durationSec: number): string {
  const left = Math.max(0, durationSec - positionSec);
  return `${formatMinutes(Math.ceil(left / 60))} left`;
}

/** The demo profile's viewing history (also seeds Continue watching). */
export const INITIAL_PROGRESS: readonly Progress[] = [
  { titleId: 'starfall', episodeId: 'starfall-s1e4', positionSec: 29 * 60 + 40 },
  { titleId: 'ghost-lane', episodeId: 'ghost-lane-s2e6', positionSec: 0 },
  { titleId: 'midnight-signal', positionSec: 39 * 60 },
  { titleId: 'root-access', episodeId: 'root-access-s1e2', positionSec: 36 * 60 },
  { titleId: 'deep-reef', episodeId: 'deep-reef-s1e2', positionSec: 9 * 60 },
  { titleId: 'byte-bolt', episodeId: 'byte-bolt-s1e3', positionSec: 11 * 60 },
].map((p) => {
  // Ghost Lane S2:E6 is left 25 seconds from the end, so resuming it shows the Next episode card.
  if (p.titleId !== 'ghost-lane') return p;
  const ep = findEpisode(getTitle(p.titleId), p.episodeId)!;
  return { ...p, positionSec: ep.minutes * 60 - 25 };
});

export interface ResumePoint {
  title: Title;
  episode?: Episode;
  positionSec: number;
  durationSec: number;
  fraction: number;
}

export function resumePoint(progress: Progress): ResumePoint | null {
  const title = findTitle(progress.titleId);
  if (!title) return null;
  const episode = findEpisode(title, progress.episodeId);
  if (title.kind === 'series' && !episode) return null;
  const durationSec = runtimeSec(title, episode);
  return {
    title,
    episode,
    positionSec: progress.positionSec,
    durationSec,
    fraction: progressFraction(progress.positionSec, durationSec),
  };
}

/** Progress for one title, if the profile has started it. */
export function progressFor(progress: readonly Progress[], titleId: string): Progress | undefined {
  return progress.find((p) => p.titleId === titleId);
}

/** Watched position of a single episode: only the episode in progress has one in this demo. */
export function episodeFraction(progress: readonly Progress[], title: Title, episode: Episode): number {
  const p = progressFor(progress, title.id);
  if (!p?.episodeId) return 0;
  const current = allEpisodes(title).findIndex((e) => e.id === p.episodeId);
  const index = allEpisodes(title).findIndex((e) => e.id === episode.id);
  if (index < current) return 1;
  if (index === current) return progressFraction(p.positionSec, episode.minutes * 60);
  return 0;
}

// ---------------------------------------------------------------- browsing

/** Titles a profile may see: Kids profiles only get kids titles. */
export function visibleTitles(profile: Pick<Profile, 'kids'> | null | undefined): Title[] {
  return TITLES.filter((t) => !profile?.kids || t.kids);
}

export function top10(profile?: Pick<Profile, 'kids'> | null): Title[] {
  const ranked = visibleTitles(profile).filter((t) => t.rank !== undefined);
  return ranked.sort((a, b) => a.rank! - b.rank!).slice(0, 10);
}

export function featuredTitles(profile?: Pick<Profile, 'kids'> | null): Title[] {
  const pool = visibleTitles(profile);
  const featured = pool.filter((t) => t.featured);
  return featured.length > 0 ? featured : pool.slice(0, 4);
}

/** Titles that share the most genres with `title` (then by match), excluding itself. */
export function moreLikeThis(title: Title, limit = 8, profile?: Pick<Profile, 'kids'> | null): Title[] {
  const shared = (t: Title) => t.genres.filter((g) => title.genres.includes(g)).length;
  return visibleTitles(profile)
    .filter((t) => t.id !== title.id)
    .map((t) => ({ t, score: shared(t) * 100 + t.match }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.t);
}

export function genresOf(titles: readonly Title[]): string[] {
  const seen = new Map<string, number>();
  titles.forEach((t) => t.genres.forEach((g) => seen.set(g, (seen.get(g) ?? 0) + 1)));
  return [...seen.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([g]) => g);
}

/** Art and tone for a genre tile. */
export const GENRE_ART: Readonly<Record<string, { art: ArtName; tone: ToneName }>> = {
  'Sci-fi': { art: 'rocket', tone: 'violet' },
  Thriller: { art: 'dark-sunglasses', tone: 'steel' },
  Fantasy: { art: 'dragon', tone: 'crimson' },
  Drama: { art: 'clapper-board', tone: 'dusk' },
  Comedy: { art: 'party-popper', tone: 'sunset' },
  Horror: { art: 'ghost', tone: 'orchid' },
  Mystery: { art: 'compass', tone: 'night' },
  Action: { art: 'fire', tone: 'ember' },
  Adventure: { art: 'camping', tone: 'aurora' },
  Documentary: { art: 'movie-camera', tone: 'teal' },
  Nature: { art: 'snow-capped-mountain', tone: 'forest' },
  Family: { art: 'teddy-bear', tone: 'candy' },
  Animation: { art: 'unicorn-face', tone: 'cyan' },
  Sports: { art: 'racing-motorcycle', tone: 'gold' },
  Music: { art: 'guitar', tone: 'orchid' },
  Romance: { art: 'red-heart', tone: 'crimson' },
  Crime: { art: 'eyeglasses', tone: 'steel' },
};

export function genreArt(genre: string): { art: ArtName; tone: ToneName } {
  return GENRE_ART[genre] ?? { art: 'clapper-board', tone: 'steel' };
}

/** The rows of a browse page, for a section and profile. */
export function rowsFor(
  section: Section,
  profile: Pick<Profile, 'kids'> | null | undefined,
  progress: readonly Progress[],
): HomeRow[] {
  const pool = visibleTitles(profile);
  const ids = (ts: readonly Title[]) => ts.map((t) => t.id);
  const allowed = new Set(ids(pool));
  const continueIds = progress.filter((p) => allowed.has(p.titleId) && resumePoint(p)).map((p) => p.titleId);
  const live = profile?.kids ? [] : LIVE_MATCHES.map((m) => m.id);
  const rows: HomeRow[] = [];
  const push = (row: HomeRow) => {
    if (row.items.length > 0) rows.push(row);
  };

  if (section === 'home') {
    push({ id: 'continue', title: 'Continue watching', kind: 'continue', items: continueIds });
    push({ id: 'top10', title: 'Top 10 in Northbay today', kind: 'top10', items: ids(top10(profile)) });
    push({ id: 'live', title: 'Live sports', kind: 'live', items: live });
    push({ id: 'new', title: 'New releases', kind: 'landscape', items: ids(pool.filter((t) => t.isNew)) });
    const anchor = continueIds[0] ? getTitle(continueIds[0]) : pool[0];
    if (anchor) {
      push({
        id: 'because',
        title: `Because you watched ${anchor.name}`,
        kind: 'landscape',
        items: ids(moreLikeThis(anchor, 8, profile)),
      });
    }
    push({ id: 'originals', title: 'Reelhouse Originals', kind: 'poster', items: ids(pool.filter((t) => t.original)) });
    push({ id: 'genres', title: 'Genres', kind: 'genres', items: genresOf(pool) });
    return rows;
  }
  if (section === 'sports') {
    push({ id: 'live', title: 'Live now', kind: 'live', items: live });
    const sporty = pool.filter((t) => t.genres.some((g) => ['Sports', 'Adventure', 'Action'].includes(g)));
    push({ id: 'sports-stories', title: 'Sports stories', kind: 'poster', items: ids(sporty) });
    push({ id: 'docs', title: 'Documentaries', kind: 'landscape', items: ids(pool.filter((t) => t.genres.includes('Documentary'))) });
    return rows;
  }
  const kind = section === 'movies' ? 'movie' : 'series';
  const ofKind = pool.filter((t) => t.kind === kind);
  push({ id: 'popular', title: section === 'movies' ? 'Popular movies' : 'Popular series', kind: 'poster', items: ids([...ofKind].sort((a, b) => b.match - a.match)) });
  push({ id: 'new', title: 'New this month', kind: 'landscape', items: ids(ofKind.filter((t) => t.isNew)) });
  genresOf(ofKind)
    .slice(0, 4)
    .forEach((g) => push({ id: `genre-${g}`, title: g, kind: 'landscape', items: ids(ofKind.filter((t) => t.genres.includes(g))) }));
  return rows;
}

// ---------------------------------------------------------------- search

/** Titles whose name, genre or cast has a word starting with the query (case-insensitive), names first. */
export function searchTitles(query: string, profile?: Pick<Profile, 'kids'> | null): Title[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const startsWord = (s: string) => s.toLowerCase().startsWith(q) || words(s).some((w) => w.startsWith(q));
  const scored = visibleTitles(profile)
    .map((t) => {
      if (startsWord(t.name)) return { t, rank: t.name.toLowerCase().startsWith(q) ? 0 : 1 };
      if (t.genres.some(startsWord)) return { t, rank: 2 };
      if (t.cast.some(startsWord) || startsWord(t.creator)) return { t, rank: 3 };
      return null;
    })
    .filter((x): x is { t: Title; rank: number } => x !== null);
  return scored.sort((a, b) => a.rank - b.rank || b.t.match - a.t.match).map((x) => x.t);
}

export const TRENDING_SEARCHES: readonly string[] = ['Starfall', 'Ember Crown', 'Thriller', 'Ghost Lane', 'Documentary', 'Redline'];

// ---------------------------------------------------------------- profiles

export const PROFILES: readonly Profile[] = [
  { id: 'meera', name: 'Meera', art: 'woman-curly-hair', tone: 'violet', kids: false },
  { id: 'kabir', name: 'Kabir', art: 'man-curly-hair', tone: 'cyan', kids: false },
  { id: 'nani', name: 'Nani', art: 'woman-red-hair', tone: 'sunset', kids: false },
  { id: 'kids', name: 'Kids', art: 'teddy-bear', tone: 'candy', kids: true },
];

// ---------------------------------------------------------------- live sports

export const LIVE_MATCHES: readonly LiveMatch[] = [
  {
    id: 'm-football',
    sport: 'Football',
    league: 'Coastal League',
    home: { name: 'Northbay Mariners', short: 'NBM', tone: 'ocean' },
    away: { name: 'Harbour City FC', short: 'HCF', tone: 'crimson' },
    homeScore: '2',
    awayScore: '1',
    clock: "67'",
    channelId: 'arena-1',
    art: 'admission-tickets',
  },
  {
    id: 'm-cricket',
    sport: 'Cricket',
    league: 'Northbay T20 Cup',
    home: { name: 'Northbay Strikers', short: 'NBS', tone: 'violet' },
    away: { name: 'Eastport Kings', short: 'EPK', tone: 'gold' },
    homeScore: '184/5',
    awayScore: '176/8',
    clock: '18.2 ov',
    channelId: 'arena-2',
    art: 'crown',
  },
  {
    id: 'm-basketball',
    sport: 'Basketball',
    league: 'Valley Hoops',
    home: { name: 'Valley Hawks', short: 'VHK', tone: 'forest' },
    away: { name: 'Riverside Comets', short: 'RSC', tone: 'orchid' },
    homeScore: '88',
    awayScore: '84',
    clock: 'Q4 3:12',
    channelId: 'arena-1',
    art: 'fire',
  },
  {
    id: 'm-tennis',
    sport: 'Tennis',
    league: 'Lakeside Open · Final',
    home: { name: 'R. Mehta', short: 'MEH', tone: 'teal' },
    away: { name: 'L. Okafor', short: 'OKA', tone: 'ember' },
    homeScore: '6-4 3',
    awayScore: '4-6 5',
    clock: 'Set 3',
    channelId: 'arena-2',
    art: 'party-popper',
  },
];

export function getMatch(id: string): LiveMatch | undefined {
  return LIVE_MATCHES.find((m) => m.id === id);
}

// ---------------------------------------------------------------- live TV guide

/** The guide's clock is fixed at 8:40 PM so the demo (and its screenshots) are repeatable. */
export const GUIDE_NOW = 20 * 60 + 40;
export const GUIDE_START = 20 * 60;
export const GUIDE_HOURS = 3;

interface ChannelSeed {
  id: string;
  number: number;
  name: string;
  short: string;
  tone: ToneName;
  art: ArtName;
  genre: string;
  /** [name, minutes, one-line synopsis, matchId?] from 7:30 PM onwards. */
  shows: [string, number, string, string?][];
}

const CHANNEL_SEEDS: ChannelSeed[] = [
  {
    id: 'reel-one', number: 101, name: 'Reel One', short: 'R1', tone: 'violet', art: 'clapper-board', genre: 'Movies',
    shows: [
      ['Island Time', 100, 'A travel blogger is stuck on an island with her ex and a bossy parrot.'],
      ['Ashfall', 120, 'A cargo pilot has six hours to fly a town away from a waking volcano.'],
      ['Midnight Signal', 115, 'A radio host takes a late call about a crime that has not happened yet.'],
    ],
  },
  {
    id: 'northbay-news', number: 102, name: 'Northbay News 24', short: 'N24', tone: 'steel', art: 'television', genre: 'News',
    shows: [
      ['Evening Bulletin', 60, 'The day’s headlines from Northbay and beyond, with sport and weather.'],
      ['City Desk', 30, 'Council votes, new ferry routes and the stories on your street.'],
      ['The Big Question', 60, 'Four guests and a studio audience ask: should Northbay go car-free?'],
      ['Business Tonight', 30, 'Markets, start-ups and the harbour’s busiest shipping week in years.'],
      ['Night Edition', 60, 'Late headlines, tomorrow’s front pages and the overnight weather.'],
    ],
  },
  {
    id: 'arena-1', number: 201, name: 'Arena Sports 1', short: 'AS1', tone: 'ocean', art: 'admission-tickets', genre: 'Sports',
    shows: [
      ['Matchday Live: Mariners v Harbour City', 120, 'Second half under way at the Lakefront Stadium.', 'm-football'],
      ['Valley Hoops: Hawks v Comets', 90, 'Fourth quarter, four points in it.', 'm-basketball'],
      ['Full Time Talk', 60, 'Former players pick apart the night’s football, goal by goal.'],
    ],
  },
  {
    id: 'arena-2', number: 202, name: 'Arena Sports 2', short: 'AS2', tone: 'gold', art: 'crown', genre: 'Sports',
    shows: [
      ['T20 Cup: Strikers v Kings', 210, 'The chase is on: 9 needed from 10 balls.', 'm-cricket'],
      ['Lakeside Open: Final', 120, 'Third set decider.', 'm-tennis'],
    ],
  },
  {
    id: 'little-lanterns', number: 301, name: 'Little Lanterns', short: 'LL', tone: 'candy', art: 'teddy-bear', genre: 'Kids',
    shows: [
      ['Byte & Bolt', 30, 'Byte and Bolt fix Gadget Town’s clock tower, and every day is Tuesday.'],
      ['Paws & Claws', 30, 'A would-be detective dog and a real detective cat hunt for a lost sock.'],
      ['Moonmeadow', 90, 'A shy unicorn sets off across the meadow to find the colour she lost.'],
      ['Bedtime Stories', 30, 'Gentle stories read aloud by lantern light, to help little ones sleep.'],
      ['Byte & Bolt', 30, 'Bolt builds a robot dog that will not stop fetching everything in town.'],
    ],
  },
  {
    id: 'tasty', number: 401, name: 'Tasty Northbay', short: 'TN', tone: 'ember', art: 'cooking', genre: 'Food',
    shows: [
      ['Street Food Sundays', 60, 'The best night-market stalls in the old harbour, and their cooks.'],
      ['Northbay Kitchen', 60, 'Home cooks turn family recipes into a three-course studio challenge.'],
      ['Spice Route', 30, 'One spice, one city: this week, cardamom in the northern hill markets.'],
      ['Midnight Snacks', 30, 'Ten-minute dishes for when it is late and the shops are shut.'],
      ['Bake Off Club', 60, 'Six amateur bakers, one tent and a showstopper that must stand up.'],
    ],
  },
  {
    id: 'wildline', number: 501, name: 'Wildline', short: 'WL', tone: 'forest', art: 'tropical-fish', genre: 'Documentary',
    shows: [
      ['Deep Reef', 45, 'Dive into the reef’s hidden cities, where every crack has a tenant.'],
      ['Quiet Mountain', 95, 'One year on a sleeping mountain, from the first frost to the last bloom.'],
      ['The Long Climb', 105, 'Four friends, one unclimbed face and forty days on the ice.'],
      ['Night Shift', 45, 'Owls, foxes and fireflies: the creatures who rule the forest by night.'],
    ],
  },
  {
    id: 'loop', number: 601, name: 'Loop Comedy', short: 'LC', tone: 'sunset', art: 'party-popper', genre: 'Comedy',
    shows: [
      ['Ghost Lane', 30, 'The flatmates throw a house-warming, and all seven ghosts turn up.'],
      ['Player Two', 30, 'A washed-up game designer and her teenage tester build one last game.'],
      ['Stand-up Northbay', 60, 'Five new comics, five minutes each, live from the Lantern Club.'],
      ['Ghost Lane', 30, 'The landlord finally explains the cursed doorbell. It does not help.'],
      ['Loop the Loop', 100, 'Three cousins have one summer to save their gran’s seaside fairground.'],
    ],
  },
];

const SHOWS_START = 19 * 60 + 30;

function buildChannel(seed: ChannelSeed): Channel {
  let start = SHOWS_START;
  const programmes = seed.shows.map(([name, minutes, synopsis, matchId], i): Programme => {
    const p: Programme = {
      id: `${seed.id}-${i}`,
      name,
      start,
      minutes,
      genre: seed.genre,
      synopsis,
      live: matchId !== undefined || seed.genre === 'News' ? true : undefined,
      matchId,
    };
    start += minutes;
    return p;
  });
  const { shows: _shows, genre: _genre, ...rest } = seed;
  return { ...rest, programmes };
}

export const CHANNELS: readonly Channel[] = CHANNEL_SEEDS.map(buildChannel);

export function getChannel(id: string): Channel | undefined {
  return CHANNELS.find((c) => c.id === id);
}

/** Programmes that overlap [from, to), clipped to that window (minutes after midnight). */
export function programmesInWindow(channel: Channel, from: number, to: number): (Programme & { visibleStart: number; visibleEnd: number })[] {
  return channel.programmes
    .filter((p) => p.start < to && p.start + p.minutes > from)
    .map((p) => ({ ...p, visibleStart: Math.max(from, p.start), visibleEnd: Math.min(to, p.start + p.minutes) }));
}

export function programmeAt(channel: Channel, minute: number): Programme | undefined {
  return channel.programmes.find((p) => p.start <= minute && minute < p.start + p.minutes);
}

export function isOnNow(p: Pick<Programme, 'start' | 'minutes'>, now: number = GUIDE_NOW): boolean {
  return p.start <= now && now < p.start + p.minutes;
}

/** Half-hour labels for the guide's time ruler. */
export function timeSlots(start: number = GUIDE_START, hours: number = GUIDE_HOURS): number[] {
  return Array.from({ length: hours * 2 }, (_, i) => start + i * 30);
}
