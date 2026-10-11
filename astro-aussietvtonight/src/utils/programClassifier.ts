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

export function isSport(category?: string | null, title?: string | null, desc?: string | null): boolean {
  const text = `${category || ''} ${title || ''} ${desc || ''}`.toLowerCase();
  if (category && category.toLowerCase().includes('sport')) return true;
  const keywords = ['afl', 'nrl', 'cricket', 'rugby', 'tennis', 'soccer', 'a-league', 'motorsport', 'supercars', 'f1', 'formula 1', 'basketball', 'nbl', 'golf', 'olympics'];
  return keywords.some(k => text.includes(k));
}
