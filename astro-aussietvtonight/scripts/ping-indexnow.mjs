#!/usr/bin/env node
/**
 * ping-indexnow.mjs — aussietvtonight.com
 * Submits high-priority Australian Freeview TV guide URLs to IndexNow (Bing, Microsoft, Yandex, Seznam).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'aussietvtonight.com';
const KEYS = [
  '211149cc9ea6e1474b4a1881220eef9b',
  '4f25c5dc3491468f8459b92c21bb3ac1'
];
const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
];

// Top Priority URLs for Aussie TV Tonight
const PRIORITY_URLS = [
  `https://${HOST}/`,
  `https://${HOST}/tomorrow/`,
  `https://${HOST}/movies-tonight/`,
  `https://${HOST}/sport-tonight/`,
  `https://${HOST}/shows-tonight/`,
  `https://${HOST}/on-now/`,
  `https://${HOST}/seven/`,
  `https://${HOST}/channel-9/`,
  `https://${HOST}/10/`,
  `https://${HOST}/abc-tv/`,
  `https://${HOST}/sbs/`,
  `https://${HOST}/7two/`,
  `https://${HOST}/7mate/`,
  `https://${HOST}/7flix/`,
  `https://${HOST}/9gem/`,
  `https://${HOST}/9go/`,
  `https://${HOST}/9life/`,
  `https://${HOST}/9rush/`,
  `https://${HOST}/10-drama/`,
  `https://${HOST}/10-comedy/`,
  `https://${HOST}/nickelodeon/`,
  `https://${HOST}/abc-kids/`,
  `https://${HOST}/abc-tv-plus/`,
  `https://${HOST}/abc-entertains/`,
  `https://${HOST}/abc-news/`,
  `https://${HOST}/sbs-viceland/`,
  `https://${HOST}/sbs-world-movies/`,
  `https://${HOST}/sbs-food/`,
  `https://${HOST}/nitv/`,
];

async function pingIndexNow() {
  console.log(`[IndexNow] Preparing Bing/Microsoft IndexNow notification for ${HOST}...`);
  console.log(`[IndexNow] Submitting ${PRIORITY_URLS.length} priority URLs:`);
  PRIORITY_URLS.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));

  for (const KEY of KEYS) {
    const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
    console.log(`\n--- Pinging with KEY: ${KEY} ---`);

    const payload = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: PRIORITY_URLS,
    };

    for (const endpoint of ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        console.log(`[IndexNow] ${endpoint} -> Status ${response.status} (${response.statusText || 'OK'})`);
        if (!response.ok) {
          const text = await response.text();
          console.warn(`[IndexNow] Response body:`, text);
        }
      } catch (err) {
        console.error(`[IndexNow] Failed to ping ${endpoint}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(`\n[IndexNow] Completed!`);
}

pingIndexNow();
