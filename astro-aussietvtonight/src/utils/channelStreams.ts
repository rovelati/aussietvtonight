/**
 * Official Australian Live Streams and Catch-up Video On Demand (BVOD) Portals.
 *
 * Major Free-To-Air BVOD apps in Australia:
 * - 7plus (Seven Network)
 * - 9Now (Nine Network)
 * - 10 Play (Network 10)
 * - ABC iview (Australian Broadcasting Corporation)
 * - SBS On Demand (Special Broadcasting Service)
 */

export const AU_LIVE_STREAMS: Record<string, string> = {
  // Seven Network (7plus)
  'seven': 'https://7plus.com.au/live-tv',
  '7two': 'https://7plus.com.au/live-tv?channel-id=7Two',
  '7mate': 'https://7plus.com.au/live-tv?channel-id=7mate',
  '7flix': 'https://7plus.com.au/live-tv?channel-id=7flix',

  // Nine Network (9Now)
  'channel-9': 'https://www.9now.com.au/live/channel-9',
  '9gem': 'https://www.9now.com.au/live/9gem',
  '9go': 'https://www.9now.com.au/live/9go',
  '9life': 'https://www.9now.com.au/live/9life',
  '9rush': 'https://www.9now.com.au/live/9rush',

  // Network 10 (10 Play)
  '10': 'https://10play.com.au/live/ten',
  '10-drama': 'https://10play.com.au/live/bold',
  '10-comedy': 'https://10play.com.au/live/peach',
  'nickelodeon': 'https://10play.com.au/live/nickelodeon',

  // ABC (ABC iview)
  'abc-tv': 'https://iview.abc.net.au/channel/abctv',
  'abc-kids': 'https://iview.abc.net.au/channel/abckids',
  'abc-tv-plus': 'https://iview.abc.net.au/channel/abctvplus',
  'abc-entertains': 'https://iview.abc.net.au/channel/abcme',
  'abc-news': 'https://iview.abc.net.au/channel/news24',

  // SBS (SBS On Demand)
  'sbs': 'https://www.sbs.com.au/ondemand/live/sbs',
  'sbs-viceland': 'https://www.sbs.com.au/ondemand/live/sbs-viceland',
  'sbs-world-movies': 'https://www.sbs.com.au/ondemand/live/sbs-world-movies',
  'sbs-food': 'https://www.sbs.com.au/ondemand/live/sbs-food',
  'nitv': 'https://www.sbs.com.au/ondemand/live/nitv',
};

export const AU_CHANNEL_WEBSITES: Record<string, string> = {
  'seven': 'https://7plus.com.au',
  '7two': 'https://7plus.com.au',
  '7mate': 'https://7plus.com.au',
  '7flix': 'https://7plus.com.au',
  'channel-9': 'https://www.9now.com.au',
  '9gem': 'https://www.9now.com.au',
  '9go': 'https://www.9now.com.au',
  '9life': 'https://www.9now.com.au',
  '9rush': 'https://www.9now.com.au',
  '10': 'https://10play.com.au',
  '10-drama': 'https://10play.com.au',
  '10-comedy': 'https://10play.com.au',
  'nickelodeon': 'https://10play.com.au',
  'abc-tv': 'https://iview.abc.net.au',
  'abc-kids': 'https://iview.abc.net.au',
  'abc-tv-plus': 'https://iview.abc.net.au',
  'abc-entertains': 'https://iview.abc.net.au',
  'abc-news': 'https://iview.abc.net.au',
  'sbs': 'https://www.sbs.com.au/ondemand',
  'sbs-viceland': 'https://www.sbs.com.au/ondemand',
  'sbs-world-movies': 'https://www.sbs.com.au/ondemand',
  'sbs-food': 'https://www.sbs.com.au/ondemand',
  'nitv': 'https://www.sbs.com.au/ondemand',
};
