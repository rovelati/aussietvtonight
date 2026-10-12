/**
 * Australian Program Categorization & Genre Identification
 */

const KNOWN_SERIES_TITLES = new Set([
  'sunrise', 'the morning show', 'seven news', 'the chase', 'home and away',
  'my kitchen rules', 'the rookie', 'transplant', 'beat the chasers', 'bridge of lies',
  'channel 9 news', 'a current affair', 'the block', 'today', 'deal or no deal',
  'bull', 'ncis', 'friends', 'two and a half men', 'becker', 'frasier', 'jag',
  'ridiculousness', 'bluey', 'spidey and his amazing friends', 'young sheldon',
  'mr. bean', 'lego ninjago', 'merlin', 'fresh off the boat', 'the powerpuff girls',
  'teen titans go!', 'horrible histories', 'house of games', 'spicks and specks',
  'qi', 'would i lie to you?', 'penn & teller', 'whose line is it anyway?',
  'elementary', 'er', 'not going out', 'spooks', 'abc news', '7.30', 'the business',
  'the world', 'planet america', 'mastermind australia', 'sbs world news', 'the jury',
  '24 hours in emergency', '8 out of 10 cats', 'black sands', 'jeopardy!',
  'the americans', 'brassic', 'rick stein', 'nigella kitchen', 'the cook up',
  'who do you think you are?', 'living black', 'ink master', 'home shopping'
]);

const MOVIE_CHANNELS = new Set([
  'sbs-world-movies', '7flix', '9gem'
]);

export function isMovie(
  category?: string | null,
  title?: string | null,
  desc?: string | null,
  channelId?: string | null,
  durationMinutes: number = 0
): boolean {
  const t = (title || '').trim().toLowerCase();
  const d = (desc || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // If known TV show or news, definitely not a movie
  for (const s of KNOWN_SERIES_TITLES) {
    if (t.includes(s)) return false;
  }

  // Dedicated movie channel (SBS World Movies)
  if (channelId && channelId === 'sbs-world-movies') {
    // Exclude magazine/short shows like "The Movie Show" (30 min)
    if (durationMinutes > 0 && durationMinutes < 60) return false;
    return true;
  }

  // Explicit movie markers in text/category
  if (cat.includes('movie') || cat.includes('film') || cat.includes('cinema')) return true;
  if (d.includes('feature film') || d.includes('starring academy award') || d.includes('oscar-winning film')) return true;

  // Standalone feature films in Australian free-to-air:
  // Duration >= 75 minutes, in Drama/Comedy/Action/Kids, and not a serialized daily show
  if (durationMinutes >= 75 && (cat.includes('action') || cat.includes('drama') || cat.includes('comedy') || cat.includes('kids'))) {
    // Check if description looks like a movie synopsis rather than an episode
    if (!d.includes('in this episode') && !d.includes('season ') && !d.includes('series ')) {
      return true;
    }
  }

  return false;
}

const SPORT_REGEX = /\b(afl|nrl|cricket|rugby|tennis|soccer|a-league|motorsport|supercars|f1|formula 1|basketball|nbl|golf|olympics|footy|horse racing|world cup|nfl)\b/i;

export function isSport(category?: string | null, title?: string | null, desc?: string | null): boolean {
  const cat = (category || '').toLowerCase();
  if (cat.includes('sport') || cat.includes('football')) return true;
  const t = title || '';
  if (SPORT_REGEX.test(t)) return true;
  // If description explicitly discusses a sporting match or league
  const d = (desc || '').toLowerCase();
  if (d.includes('live coverage of') || d.includes('round ') || d.includes('grand final') || d.includes('match') || d.includes('tournament')) {
    if (SPORT_REGEX.test(d)) return true;
  }
  return false;
}

export function isTvShow(
  category?: string | null,
  title?: string | null,
  desc?: string | null,
  durationMinutes: number = 0
): boolean {
  const t = (title || '').trim().toLowerCase();
  const d = (desc || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Exclude infomercials / shopping
  if (t.includes('home shopping') || t.includes('tv shop') || t.includes('shopping program') || d.includes('shopping program')) {
    return false;
  }

  // Exclude standalone daily news bulletins and weather
  if (cat === 'news' && (t.includes('news at') || t.includes('news bulletin') || t.includes('weather') || t.includes('national news') || t.includes('early news'))) {
    return false;
  }

  // Exclude movies
  if (isMovie(category, title, desc, null, durationMinutes)) {
    return false;
  }

  // Exclude sport
  if (isSport(category, title, desc)) {
    return false;
  }

  // Known series titles
  for (const s of KNOWN_SERIES_TITLES) {
    if (t.includes(s)) return true;
  }

  // Drama / Comedy are TV shows
  if (cat.includes('drama') || cat.includes('comedy')) return true;

  // Episodic markers
  if (d.includes('episode') || d.includes('season') || d.includes('series') || d.includes('contestants') || d.includes('hosted by') || d.includes('investigate')) {
    return true;
  }

  // Reality / Entertainment formats under Special Interest
  if (cat.includes('special interest') && (d.includes('compete') || d.includes('challenge') || d.includes('quiz') || d.includes('game') || d.includes('chef') || d.includes('cook') || d.includes('renovat'))) {
    return true;
  }

  return false;
}
