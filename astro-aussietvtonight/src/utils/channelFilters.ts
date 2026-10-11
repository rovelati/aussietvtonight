/**
 * Australian TV Channel Mapping & Priority Filters
 *
 * Major Free-To-Air Networks in Australia:
 * 1. Seven Network: Seven (7/71), 7two (72), 7mate (74), 7flix (76), 7Bravo (75)
 * 2. Nine Network: Channel 9 (9/91), 9Gem (92), 9Go! (93), 9Life (94), 9Rush (96)
 * 3. Network 10: 10 (10/1), 10 Bold (12/10 Drama), 10 Peach (11/10 Comedy), Nickelodeon (13)
 * 4. ABC (Australian Broadcasting Corporation): ABC TV (2/21), ABC Kids / Family (22), ABC Entertains (23), ABC NEWS (24)
 * 5. SBS (Special Broadcasting Service): SBS (3/30), SBS VICELAND (31), SBS World Movies (32), SBS Food (33), NITV (34)
 */

export const MAJOR_AU_ORDER = [
  // Flagships (The Big 5)
  'seven',
  'channel-9',
  '10',
  'abc-tv',
  'sbs',

  // Secondary Freeview Channels
  '7two',
  '7mate',
  '7flix',
  '9gem',
  '9go',
  '9life',
  '9rush',
  '10-drama',
  '10-comedy',
  'nickelodeon',
  'abc-kids',
  'abc-tv-plus',
  'abc-entertains',
  'abc-news',
  'sbs-viceland',
  'sbs-world-movies',
  'sbs-food',
  'nitv',
];

export function isAdultChannel(slug: string, name: string): boolean {
  const s = (slug + ' ' + name).toLowerCase();
  return s.includes('adult') || s.includes('erotik') || s.includes('playboy') || s.includes('hustler');
}

export function isTestChannel(slug: string, name: string): boolean {
  const s = (slug + ' ' + name).toLowerCase();
  return s.includes('test') || s.includes('placeholder') || s.includes('feed') || s.includes('stream test');
}

export function filterRealPrograms<T extends { title?: string }>(programs: T[]): T[] {
  return programs.filter(p => {
    const t = (p.title || '').trim().toLowerCase();
    if (!t) return false;
    if (t === 'off air' || t === 'close' || t === 'station close' || t === 'no broadcast' || t === 'test') {
      return false;
    }
    return true;
  });
}
