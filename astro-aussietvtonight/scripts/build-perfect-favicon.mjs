import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Clean, iconic, high-impact SVG for Aussie TV Tonight:
// 1. Sleek Squircle with dark navy / obsidian depth
// 2. Australian Gold (#fbbf24 / #f59e0b) border
// 3. Retro TV Antenna on top
// 4. OLED TV Screen
// 5. Stylized Kangaroo Silhouette leaping forward in Aussie Gold (unmistakable Australian identity)
// 6. Live broadcast beacon (ruby red / emerald pulse)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient: Deep Oceanic Slate / Midnight -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Aussie Gold / Sunburst Gradient -->
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#fbbf24"/>
      <stop offset="85%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <!-- TV Screen Gradient -->
    <linearGradient id="screen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0b1120"/>
    </linearGradient>

    <!-- Screen Glass Sheen -->
    <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <!-- TV Shadow & Glow -->
    <filter id="drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <filter id="live-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 1. Outer Rounded App Squircle -->
  <rect width="512" height="512" rx="116" fill="url(#bg)"/>
  <rect x="8" y="8" width="496" height="496" rx="110" fill="none" stroke="url(#gold)" stroke-width="10" stroke-opacity="0.85"/>

  <!-- Subtle Top Corner Sheen -->
  <circle cx="100" cy="100" r="130" fill="url(#sheen)"/>

  <!-- 2. TV Antenna (Freeview Broadcast V-Antenna) -->
  <g filter="url(#drop-shadow)">
    <path d="M 195 86 L 256 138 L 317 86" fill="none" stroke="url(#gold)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="195" cy="86" r="16" fill="url(#gold)"/>
    <circle cx="317" cy="86" r="16" fill="url(#gold)"/>
  </g>

  <!-- 3. TV Chassis & Screen -->
  <g filter="url(#drop-shadow)">
    <!-- Stand -->
    <rect x="236" y="420" width="40" height="34" rx="4" fill="url(#gold)"/>
    <rect x="180" y="446" width="152" height="18" rx="9" fill="url(#gold)"/>

    <!-- Screen Bezel -->
    <rect x="52" y="132" width="408" height="290" rx="36" fill="#090d16" stroke="url(#gold)" stroke-width="12"/>

    <!-- Inner Screen Display -->
    <rect x="68" y="148" width="376" height="258" rx="24" fill="url(#screen)"/>

    <!-- Glass Reflection -->
    <path d="M 68 148 L 260 148 L 68 340 Z" fill="url(#sheen)"/>

    <!-- 4. Kangaroo Silhouette Leaping Through TV Screen -->
    <!-- Crisp, bold, instantly recognizable Australian emblem -->
    <path d="M 125 365 
             C 145 358, 175 345, 195 325 
             C 210 310, 222 285, 226 265 
             C 230 245, 235 220, 245 200 
             C 255 180, 268 165, 282 150 
             C 288 144, 298 135, 310 132 
             C 314 131, 318 122, 321 112 
             C 323 105, 328 105, 331 110 
             C 335 118, 334 128, 330 136 
             C 338 132, 346 130, 354 133 
             C 362 136, 366 142, 362 148 
             C 356 156, 345 160, 336 162 
             C 330 174, 322 188, 322 204 
             C 322 216, 328 226, 338 234 
             C 355 248, 378 256, 400 258 
             C 406 258, 409 263, 404 267 
             C 378 280, 342 272, 320 258 
             C 302 247, 294 238, 284 235 
             C 275 248, 260 270, 238 285 
             C 214 300, 185 295, 168 292 
             C 152 289, 138 296, 128 308 
             C 118 320, 115 345, 125 365 Z" 
          fill="url(#gold)"/>

    <!-- Dynamic Motion Star / Southern Cross Accents inside TV -->
    <polygon points="120,185 124,196 135,198 127,205 129,216 120,210 111,216 113,205 105,198 116,196" fill="#fef08a" opacity="0.9"/>
    
    <!-- 5. LIVE Broadcast Indicator -->
    <circle cx="410" cy="180" r="14" fill="#ef4444" filter="url(#live-glow)"/>
    <circle cx="410" cy="180" r="7" fill="#ffffff"/>
  </g>
</svg>`;

const PUBLIC_DIR = path.resolve('public');
fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), svg.trim());
console.log('[build-perfect-favicon] Written updated favicon.svg');

// Now generate all sizes with sharp
async function buildAll() {
  const svgBuffer = Buffer.from(svg);
  const sizes = [
    { name: 'favicon-16.png', size: 16 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'favicon-48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ];

  const pngBuffers = {};
  for (const { name, size } of sizes) {
    const outPath = path.join(PUBLIC_DIR, name);
    const buf = await sharp(svgBuffer)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(outPath, buf);
    pngBuffers[size] = buf;
    console.log(`[build-perfect-favicon] Created ${name} (${size}x${size})`);
  }

  // Multi-resolution ICO (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const count = icoSizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];
  const imageDatas = [];

  for (const size of icoSizes) {
    const imgBuf = pngBuffers[size];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(imgBuf.length, 8);
    entry.writeUInt32LE(offset, 12);

    entries.push(entry);
    imageDatas.push(imgBuf);
    offset += imgBuf.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...imageDatas]);
  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`[build-perfect-favicon] Created multi-resolution favicon.ico (${icoBuffer.length} bytes)`);
}

buildAll().catch(console.error);
