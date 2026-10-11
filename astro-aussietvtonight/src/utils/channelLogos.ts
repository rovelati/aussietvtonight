/**
 * Australian TV Channel Logos
 */

const LOGO_MAP: Record<string, string> = {
  'seven': 'https://i.mjh.nz/.images/auto-seven-syd-9608a4.png',
  '7two': 'https://i.mjh.nz/.images/auto-7two-syd-701123.png',
  '7mate': 'https://i.mjh.nz/.images/auto-7mate-syd-360d60.png',
  '7flix': 'https://i.mjh.nz/.images/auto-7flix-syd-c6badc.png',
  'channel-9': 'https://imageresizer.static9.net.au/lx1XIWcrYZRtnfJOqvxNn9CshDI=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F09%2F630608%2F9nine-1.png',
  '9gem': 'https://imageresizer.static9.net.au/d00389KKc5T4o5isRaDE9Pl9DWk=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F08%2F620929%2F9gem-1.png',
  '9go': 'https://imageresizer.static9.net.au/fcTwzkAJT4q81emfp2kYkgoxlDA=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574470%2F9go.png',
  '9life': 'https://imageresizer.static9.net.au/wMK3kBDybfEoN2iqyDDflC91D1U=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574472%2F9life.png',
  '9rush': 'https://imageresizer.static9.net.au/5B2ZDlD8Ji6dCecGQEfwy2U2m4Y=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574473%2F9rush.png',
  '10': 'https://10play.com.au/ip/s3/2025/06/25/b18ae76555d114f7bfaf1c3bfa43dd3f-1384577.png',
  '10-drama': 'https://10play.com.au/ip/s3/2025/06/25/66c9f2639a7bca4a6691764a0db801d7-1384581.png',
  '10-comedy': 'https://10play.com.au/ip/s3/2025/06/25/443fa2a5bca1191f12efa002a2a8ef85-1384586.png',
  'nickelodeon': 'https://10play.com.au/ip/s3/2023/07/31/dc4873abc5ba0fde04b59a78c89e0943-1252731.png',
  'abc-tv': 'https://i.mjh.nz/.images/abc-nsw.png',
  'abc-kids': 'https://i.mjh.nz/.images/abc-kids.png',
  'abc-tv-plus': 'https://i.mjh.nz/.images/abc-family.png',
  'abc-entertains': 'https://i.mjh.nz/.images/abc-me.png',
  'abc-news': 'https://i.mjh.nz/.images/abc-news.png',
  'sbs': 'https://image.pr.sbsod.com/b073959a-a63e-5b6a-a05a-157d615a4b8c',
  'sbs-viceland': 'https://image.pr.sbsod.com/e7f27bb4-4672-599e-b9b4-a72cfdd8d3ba',
  'sbs-world-movies': 'https://image.pr.sbsod.com/cc42ae9e-0e64-5bc3-8c71-6f23f42610fb',
  'sbs-food': 'https://image.pr.sbsod.com/336c48bb-129d-5348-9d2f-63ab4fe6d493',
  'nitv': 'https://image.pr.sbsod.com/00ff96cd-68c3-5219-b792-c0c2faec1fe6',
};

export function getChannelLogo(slug: string, remoteLogoUrl: string | null = null, name: string = ''): string {
  if (LOGO_MAP[slug]) {
    return LOGO_MAP[slug];
  }
  if (remoteLogoUrl && remoteLogoUrl.startsWith('http')) {
    return remoteLogoUrl;
  }
  return '/channel-logos/default.svg';
}
