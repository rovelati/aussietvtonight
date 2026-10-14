/**
 * Australian TV Guide — HD Posters & Fallback Image Resolver
 *
 * Provides high-availability fallback posters for Australian TV programs.
 * Resolves images when FetchTV CDN links return 403 Access Denied.
 */
import deadImages from '../data/dead-images.json';

// Local, zero-latency category fallbacks (immune to CDN 404s/403s)
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'News': '/images/fallbacks/news.jpg',
  'Sports': '/images/fallbacks/sports.jpg',
  'Sport': '/images/fallbacks/sports.jpg',
  'Drama': '/images/fallbacks/shows.jpg',
  'Comedy': '/images/fallbacks/comedy.jpg',
  'Kids & Family': '/images/fallbacks/kids.jpg',
  'Kids': '/images/fallbacks/kids.jpg',
  'Action & Adventure': '/images/fallbacks/movies.jpg',
  'Special Interest': '/images/fallbacks/default.jpg',
  'Music': '/images/fallbacks/shows.jpg',
  'Movie': '/images/fallbacks/movies.jpg',
  'Movies': '/images/fallbacks/movies.jpg',
  'Default': '/images/fallbacks/default.jpg',
};

export const POPULAR_AU_PROGRAM_POSTERS: Record<string, string> = {
  // Flagship news & breakfast
  'sunrise': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  'today': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  'the morning show': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  'seven news': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  'nine news': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  '10 news first': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  'abc news': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  'sbs world news': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  '7.30': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  'a current affair': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',

  // Top Australian Shows & Reality
  'home and away': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'the block': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  'my kitchen rules': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  'masterchef australia': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  'bluey': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  'the chase australia': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  'deal or no deal': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  'the project': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
  // Popular Movies & Classics
  'kong: skull island': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
  'foyle\'s war': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
};

export const KNOWN_CHANNEL_PLACEHOLDERS = new Set([
  'https://www.fetchtv.com.au/v2/epg/program/2a664e885371d10cd12e/image', // Network 10 / Seven generic
  'https://www.fetchtv.com.au/v2/epg/program/c31d850c0d1008a48572/image', // Nine generic
  'https://www.fetchtv.com.au/v2/epg/program/00825824b3830a55d463/image', // 7mate / 9rush
  'https://www.fetchtv.com.au/v2/epg/program/3e88f892dcb487e757da/image', // 9Go generic
  'https://www.fetchtv.com.au/v2/epg/program/b4818f877b0b874a24b6/image', // 9Go logo
  'https://www.fetchtv.com.au/v2/epg/program/f62466aca1e8f067d6e1/image', // 7two generic
  'https://www.fetchtv.com.au/v2/epg/program/eaf865401a3272ce98b4/image', // 7two generic 2
  'https://www.fetchtv.com.au/v2/epg/program/f566f2c9393e82a8191a/image', // 7two logo
  'https://www.fetchtv.com.au/v2/epg/program/e1000e430a754c421a25/image', // Nickelodeon generic
  'https://www.fetchtv.com.au/v2/epg/program/691fdc606417325e0bb1/image', // 9Life generic
  'https://www.fetchtv.com.au/v2/epg/program/e9cf1f34e4d6b008fc8c/image', // 9Rush generic
  'https://www.fetchtv.com.au/v2/epg/program/8f4b0d99cf47756b7473/image', // DW News generic
  'https://www.fetchtv.com.au/v2/epg/program/5885f23d8fba75fda017/image', // ABC Kids generic
  'https://www.fetchtv.com.au/v2/epg/program/d3beff34b53d4e4095ff/image', // 10 Comedy generic
  'https://www.fetchtv.com.au/v2/epg/program/3da590233f34b8a1d60a/image', // 10 Drama generic
  'https://www.fetchtv.com.au/v2/epg/program/78b7ce882d8ef2cc4fbc/image', // NITV generic
  'https://www.fetchtv.com.au/v2/epg/program/d757d0d325fa1d6add5d/image', // SBS Food generic
  'https://www.fetchtv.com.au/v2/epg/program/6bc80051a491be1c6955/image', // SBS Viceland generic
  'https://www.fetchtv.com.au/v2/epg/program/f8caa797f6d0a6a28694/image', // SBS generic
  'https://www.fetchtv.com.au/v2/epg/program/27e592fb4dd34c8efaf7/image', // 7flix generic
  'https://www.fetchtv.com.au/v2/epg/program/2088f9907e6160690c52/image', // ABC Entertains generic
  'https://www.fetchtv.com.au/v2/epg/program/daec9646f1ae3440105b/image', // ABC TV Plus generic
]);

// Set of 290+ broken FetchTV image URLs that return 403 Access Denied from CloudFront
export const KNOWN_DEAD_IMAGES = new Set<string>(
  (deadImages as Array<{ url: string }>).map((item) => item.url)
);

export function getFallbackImageForProgram(title: string = '', category: string = ''): string {
  const t = title.toLowerCase().trim();
  for (const [key, url] of Object.entries(POPULAR_AU_PROGRAM_POSTERS)) {
    if (t.includes(key)) return url;
  }

  if (category && CATEGORY_FALLBACK_IMAGES[category]) {
    return CATEGORY_FALLBACK_IMAGES[category];
  }

  if (category) {
    const catLower = category.toLowerCase().trim();
    for (const [catKey, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
      if (catLower.includes(catKey.toLowerCase())) return url;
    }
  }

  return CATEGORY_FALLBACK_IMAGES['Default'];
}

export function getCleanProgramImage(rawImageUrl: string | undefined, title: string = '', category: string = ''): string {
  if (rawImageUrl && !KNOWN_CHANNEL_PLACEHOLDERS.has(rawImageUrl) && !KNOWN_DEAD_IMAGES.has(rawImageUrl)) {
    return rawImageUrl;
  }
  return getFallbackImageForProgram(title, category);
}
