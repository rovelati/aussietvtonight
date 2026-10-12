/**
 * Pings Google Search Console API to submit fresh Australian sitemap & notifies WebSub hubs
 */
import fs from 'fs';
import { google } from 'googleapis';

const SA_PATH = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_FILE || '';
const SITE_URL = 'https://aussietvtonight.com/';

async function notifyGoogle() {
  console.log('[GSC] Submitting fresh sitemaps for aussietvtonight.com...');

  if (!SA_PATH || !fs.existsSync(SA_PATH)) {
    console.warn(`[GSC] No service account key configured. Skipping GSC API ping.`);
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SA_PATH,
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    });

    const client = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: client });

    // Submit primary direct sitemap
    await searchconsole.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: 'https://aussietvtonight.com/sitemap.xml',
    });
    console.log('[GSC] ✓ sitemap.xml submitted successfully to Google Search Console.');

    // WebSub Ping (PubSubHubbub)
    const hubs = ['https://pubsubhubbub.appspot.com/', 'https://push.superfeedr.com/'];
    const feedUrl = 'https://aussietvtonight.com/sitemap.xml';
    for (const hub of hubs) {
      try {
        const body = new URLSearchParams({
          'hub.mode': 'publish',
          'hub.url': feedUrl,
        });
        const res = await fetch(hub, {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        console.log(`[WebSub] Ping ${hub} -> Status ${res.status}`);
      } catch (err) {
        console.warn(`[WebSub] Ping ${hub} error:`, err.message);
      }
    }
  } catch (err) {
    console.error('[GSC] Error notifying Google:', err.message);
  }
}

notifyGoogle();
