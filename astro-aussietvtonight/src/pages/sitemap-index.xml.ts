import type { APIRoute } from 'astro';
import { MAJOR_AU_ORDER } from '../utils/channelFilters';

export const GET: APIRoute = async () => {
  const baseUrl = 'https://aussietvtonight.com';
  const now = new Date().toISOString();

  const items = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'hourly' },
    { loc: `${baseUrl}/tomorrow/`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/movies-tonight/`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/sport-tonight/`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/shows-tonight/`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/on-now/`, priority: '0.8', changefreq: 'hourly' },
    ...MAJOR_AU_ORDER.map(slug => ({
      loc: `${baseUrl}/${slug}/`,
      priority: '0.85',
      changefreq: 'daily',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items
  .map(
    item => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
