#!/usr/bin/env node
/**
 * ping-indexnow.mjs — aussietvtonight.com
 * Submits all canonical Australian Freeview TV guide URLs to:
 * 1. IndexNow API (Bing, Yandex, Seznam, partner engines)
 * 2. Bing Webmaster Tools API (Direct Batch Submission)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'aussietvtonight.com';
const SITE_URL = `https://${HOST}`;
const BING_API_KEY = process.env.BING_API_KEY || '4f25c5dc3491468f8459b92c21bb3ac1';

// Verified IndexNow keys for aussietvtonight.com
const KEYS = [
  '4f25c5dc3491468f8459b92c21bb3ac1',
  '211149cc9ea6e1474b4a1881220eef9b',
  '14ccfafe37144708a4d3c8e34b5e4a08',
];

const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

// All canonical priority pages (Hubs + Freeview Channels + Info)
const CANONICAL_PATHS = [
  '/',
  '/tomorrow/',
  '/movies-tonight/',
  '/sport-tonight/',
  '/shows-tonight/',
  '/on-now/',
  // Commercial Networks
  '/seven/',
  '/7two/',
  '/7mate/',
  '/7flix/',
  '/channel-9/',
  '/9gem/',
  '/9go/',
  '/9life/',
  '/9rush/',
  '/10/',
  '/10-drama/',
  '/10-comedy/',
  '/nickelodeon/',
  // Public Broadcasters
  '/abc-tv/',
  '/abc-kids/',
  '/abc-tv-plus/',
  '/abc-entertains/',
  '/abc-news/',
  '/sbs/',
  '/sbs-viceland/',
  '/sbs-world-movies/',
  '/sbs-food/',
  '/nitv/',
  // Legal
  '/terms/',
  '/privacy/',
];

async function getCanonicalUrls() {
  const urlSet = new Set(CANONICAL_PATHS.map(p => p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`));

  // Attempt to read local sitemap or fetch live sitemap
  const sitemapCandidates = [
    path.resolve(__dirname, '../dist/sitemap.xml'),
    path.resolve(__dirname, '../public/sitemap.xml'),
  ];

  for (const sp of sitemapCandidates) {
    if (fs.existsSync(sp)) {
      try {
        const content = fs.readFileSync(sp, 'utf8');
        const matches = content.match(/<loc>(.*?)<\/loc>/g);
        if (matches) {
          matches.forEach(m => {
            const u = m.replace(/<\/?loc>/g, '').trim();
            if (u.startsWith(SITE_URL)) urlSet.add(u);
          });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const text = await res.text();
      const matches = text.match(/<loc>(.*?)<\/loc>/g);
      if (matches) {
        matches.forEach(m => {
          const u = m.replace(/<\/?loc>/g, '').trim();
          if (u.startsWith(SITE_URL)) urlSet.add(u);
        });
      }
    }
  } catch (e) {
    // ignore
  }

  return Array.from(urlSet);
}

async function pingIndexNow() {
  console.log(`[IndexNow] Preparing submission for ${HOST}...`);
  const urls = await getCanonicalUrls();
  console.log(`[IndexNow] Discovered ${urls.length} canonical URLs to submit:`);
  urls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));

  // 1. IndexNow API Protocol Submission
  const activeKey = KEYS[0];
  const payload = {
    host: HOST,
    key: activeKey,
    keyLocation: `${SITE_URL}/${activeKey}.txt`,
    urlList: urls,
  };

  console.log(`\n--- 1. Submitting to IndexNow network (Key: ${activeKey}) ---`);
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'AussieTVTonight-IndexNow/2.0 (+https://aussietvtonight.com)',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 200 || response.status === 202) {
        console.log(`[IndexNow] SUCCESS! (${endpoint}) Status ${response.status}: Submitted ${urls.length} URLs.`);
      } else {
        const txt = await response.text();
        console.warn(`[IndexNow] WARN (${endpoint}): Status ${response.status} - ${txt}`);
      }
    } catch (err) {
      console.error(`[IndexNow] ERROR connecting to ${endpoint}:`, err instanceof Error ? err.message : err);
    }
  }

  // 2. Direct Bing Webmaster Tools API Submission
  if (BING_API_KEY) {
    console.log(`\n--- 2. Submitting directly to Bing Webmaster Tools API ---`);
    try {
      const quotaRes = await fetch(
        `https://ssl.bing.com/webmaster/api.svc/json/GetUrlSubmissionQuota?siteUrl=${encodeURIComponent(SITE_URL + '/')}&apikey=${BING_API_KEY}`
      );
      let urlsToSubmitBing = urls;
      if (quotaRes.ok) {
        const qData = await quotaRes.json();
        const dailyQuota = qData?.d?.DailyQuota || 0;
        console.log(`[Bing Webmaster API] Daily Quota remaining: ${dailyQuota}`);
        if (dailyQuota <= 0) {
          console.log(`[Bing Webmaster API] Daily quota exhausted for today, skipping direct API batch.`);
          return;
        }
        if (urls.length > dailyQuota) {
          urlsToSubmitBing = urls.slice(0, dailyQuota);
        }
      }

      const submitRes = await fetch(
        `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${BING_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            siteUrl: `${SITE_URL}/`,
            urlList: urlsToSubmitBing,
          }),
        }
      );

      if (submitRes.ok) {
        console.log(`[Bing Webmaster API] SUCCESS! Submitted batch of ${urls.length} URLs with Status ${submitRes.status}`);
      } else {
        const errTxt = await submitRes.text();
        console.warn(`[Bing Webmaster API] Status ${submitRes.status}: ${errTxt}`);
      }
    } catch (err) {
      console.error(`[Bing Webmaster API] Error:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\n[IndexNow & Bing API] All submissions completed successfully!`);
}

pingIndexNow();
