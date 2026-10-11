/**
 * Normalizes channel IDs from XMLTV to clean URL slugs.
 * e.g. "mjh-seven-syd" -> "seven"
 *      "mjh-channel-9-nsw" -> "channel-9"
 *      "mjh-10-nsw" -> "10"
 *      "mjh-abc-nsw" -> "abc-tv"
 *      "mjh-sbs-sbst" -> "sbs"
 *      "mjh-sbs-2syd" -> "sbs-viceland"
 *      "mjh-sbs-4syd" -> "sbs-world-movies"
 *      "mjh-sbs-3syd" -> "sbs-food"
 *      "mjh-sbs-5nsw" -> "nitv"
 */

const CANONICAL_MAP: Record<string, string> = {
  // Seven
  'mjh-seven-syd': 'seven',
  'mjh-seven-mel': 'seven',
  'mjh-seven-bne': 'seven',
  'mjh-seven-ade': 'seven',
  'mjh-seven-per': 'seven',
  'mjh-7two-syd': '7two',
  'mjh-7two-mel': '7two',
  'mjh-7mate-syd': '7mate',
  'mjh-7mate-mel': '7mate',
  'mjh-7flix-syd': '7flix',
  'mjh-7flix-mel': '7flix',

  // Nine
  'mjh-channel-9-nsw': 'channel-9',
  'mjh-channel-9-vic': 'channel-9',
  'mjh-channel-9-qld': 'channel-9',
  'mjh-channel-9-sa': 'channel-9',
  'mjh-channel-9-wa': 'channel-9',
  'mjh-gem-nsw': '9gem',
  'mjh-gem-vic': '9gem',
  'mjh-go-nsw': '9go',
  'mjh-go-vic': '9go',
  'mjh-life-nsw': '9life',
  'mjh-life-vic': '9life',
  'mjh-rush-nsw': '9rush',
  'mjh-rush-vic': '9rush',

  // Ten
  'mjh-10-nsw': '10',
  'mjh-10-vic': '10',
  'mjh-10-qld': '10',
  'mjh-10-sa': '10',
  'mjh-10-wa': '10',
  'mjh-10bold-nsw': '10-drama',
  'mjh-10bold-vic': '10-drama',
  'mjh-10peach-nsw': '10-comedy',
  'mjh-10peach-vic': '10-comedy',
  'mjh-10shake-nsw': 'nickelodeon',

  // ABC
  'mjh-abc-nsw': 'abc-tv',
  'mjh-abc-vic': 'abc-tv',
  'mjh-abc-qld': 'abc-tv',
  'mjh-abc-sa': 'abc-tv',
  'mjh-abc-wa': 'abc-tv',
  'mjh-abc-kids': 'abc-kids',
  'mjh-abc-tv-plus': 'abc-tv-plus',
  'mjh-abc-me': 'abc-entertains',
  'mjh-abc-news': 'abc-news',

  // SBS
  'mjh-sbs-sbst': 'sbs',
  'mjh-sbs-2syd': 'sbs-viceland',
  'mjh-sbs-3syd': 'sbs-food',
  'mjh-sbs-4syd': 'sbs-world-movies',
  'mjh-sbs-5nsw': 'nitv',
};

export function normCid(channelId: string): string {
  if (!channelId) return '';
  const lower = channelId.trim().toLowerCase();
  if (CANONICAL_MAP[lower]) {
    return CANONICAL_MAP[lower];
  }
  return lower
    .replace(/^mjh-/, '')
    .replace(/-nsw$/, '')
    .replace(/-syd$/, '')
    .replace(/-vic$/, '')
    .replace(/-mel$/, '')
    .replace(/-qld$/, '')
    .replace(/-bne$/, '')
    .replace(/-sa$/, '')
    .replace(/-ade$/, '')
    .replace(/-wa$/, '')
    .replace(/-per$/, '');
}
