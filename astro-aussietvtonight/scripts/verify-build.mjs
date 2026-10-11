import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const REQUIRED_CHANNELS = ['seven', 'channel-9', '10', 'abc-tv', 'sbs', 'sbs-world-movies', '7flix', '9gem'];
const FORBIDDEN_CHANNELS = ['testkanalh01', 'testkanall01', 'bluehustler', 'playboyeurope'];

function verify() {
  console.log('[verify-build] Checking built artifacts in dist/ ...');

  const homeFile = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(homeFile)) {
    console.error('[verify-build] ERROR: dist/index.html is missing!');
    process.exit(1);
  }

  const homeContent = fs.readFileSync(homeFile, 'utf8');
  if (!homeContent.includes('Aussie TV Tonight') || homeContent.length < 5000) {
    console.error('[verify-build] ERROR: dist/index.html looks incomplete or corrupted!');
    process.exit(1);
  }

  // Check forbidden channels
  for (const forbidden of FORBIDDEN_CHANNELS) {
    const forbiddenDir = path.join(DIST_DIR, forbidden);
    if (fs.existsSync(forbiddenDir)) {
      console.error(`[verify-build] ERROR: Forbidden channel page generated: ${forbidden}`);
      process.exit(1);
    }
  }

  let failed = 0;
  for (const slug of REQUIRED_CHANNELS) {
    const chanFile = path.join(DIST_DIR, slug, 'index.html');
    if (!fs.existsSync(chanFile)) {
      console.error(`[verify-build] ERROR: ${slug}/index.html is missing!`);
      failed++;
      continue;
    }

    const content = fs.readFileSync(chanFile, 'utf8');
    if (!content.includes('data-program')) {
      console.error(`[verify-build] ERROR: ${slug}/index.html has NO program listings!`);
      failed++;
    }
  }

  if (failed > 0) {
    console.error(`[verify-build] BUILD VERIFICATION FAILED: ${failed} critical channels are missing programs!`);
    process.exit(1);
  }

  console.log(`[verify-build] SUCCESS: All Australian critical channels verified!`);
}

verify();
