/**
 * Australian Program Categorization & Genre Identification
 */

const MOVIE_KEYWORDS = [
  'movie', 'feature film', 'cinema', 'thriller', 'comedy film', 'action film', 'drama film'
];

const SPORT_KEYWORDS = [
  'sport', 'football', 'afl', 'nrl', 'cricket', 'rugby', 'tennis', 'soccer', 'a-league',
  'motorsport', 'supercars', 'f1', 'formula 1', 'basketball', 'nbl', 'golf', 'olympics'
];

const SHOW_KEYWORDS = [
  'series', 'drama', 'comedy', 'sitcom', 'reality', 'documentary', 'animation', 'soap', 'entertainment'
];

export function isMovie(category?: string | null, title?: string | null, desc?: string | null): boolean {
  const text = `${category || ''} ${title || ''} ${desc || ''}`.toLowerCase();
  if (category && category.toLowerCase().includes('movie')) return true;
  return MOVIE_KEYWORDS.some(k => text.includes(k));
}

export function isSport(category?: string | null, title?: string | null, desc?: string | null): boolean {
  const text = `${category || ''} ${title || ''} ${desc || ''}`.toLowerCase();
  if (category && category.toLowerCase().includes('sport')) return true;
  return SPORT_KEYWORDS.some(k => text.includes(k));
}

export function isSeriesOrShow(category?: string | null, title?: string | null, desc?: string | null): boolean {
  const text = `${category || ''} ${title || ''} ${desc || ''}`.toLowerCase();
  if (isMovie(category, title, desc) || isSport(category, title, desc)) return false;
  return SHOW_KEYWORDS.some(k => text.includes(k));
}
