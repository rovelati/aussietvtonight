import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://aussietvtonight.com',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const url = page.toLowerCase();
        // Exclude utility / legal / error pages
        if (url.includes('/404') || url.includes('/privacy') || url.includes('/terms') || url.includes('/admin-seo')) {
          return false;
        }
        // Exclude test / redirect alias pages
        if (url.endsWith('/movies/') || url.endsWith('/shows/') || url.endsWith('/sport/')) {
          return false;
        }
        if (url.includes('%20') || url.includes('+') || url.includes(' ') || url.includes('/program/')) {
          return false;
        }
        return true;
      },
      serialize(item) {
        const now = new Date();
        const url = item.url.replace(/\/$/, '') + '/';

        // Homepage
        if (url === 'https://aussietvtonight.com/' || item.url === 'https://aussietvtonight.com') {
          return {
            ...item,
            lastmod: now,
            priority: 1.0,
            changefreq: 'hourly',
          };
        }

        // Top Category Hubs
        if (/\/(movies-tonight|shows-tonight|sport-tonight|tomorrow)\/?$/.test(item.url)) {
          return {
            ...item,
            lastmod: now,
            priority: 0.9,
            changefreq: 'daily',
          };
        }

        // Major Freeview Channels
        if (/\/(seven|channel-9|10|abc-tv|sbs|7two|7mate|7flix|9gem|9go|9life|9rush|10-drama|10-comedy|abc-kids|abc-news|sbs-world-movies|sbs-viceland|nitv)\/?$/.test(item.url)) {
          return {
            ...item,
            lastmod: now,
            priority: 0.85,
            changefreq: 'daily',
          };
        }

        return {
          ...item,
          lastmod: now,
          priority: 0.7,
          changefreq: 'daily',
        };
      },
    }),
  ],
})
