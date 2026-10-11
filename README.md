# Aussie TV Tonight (aussietvtonight.com) 🇦🇺📺

Fastest, modern Freeview TV Guide for the Australian market.
Replicated from the high-performance architecture of `fernsehheute.de` / `123programmitv.it` (Astro 6 SSG + Tailwind CSS + Cloudflare Edge caching).

---

## 1. Value Proposition & Market Fit

- **Prime Time Core Focus**: Australia strictly watches Prime Time from **7:30 PM (19:30)**.
- **Fast 0ms Loading**: Prerendered static pages on Cloudflare edge, outperforming slow legacy competitors (`Freeview.com.au`, `OurGuide`, `eBroadcast`).
- **3 Dynamic Hubs**:
  1. 🌙 **Tonight (Prime Time)**: Instant answer to *"What's on TV tonight?"*
  2. 🔴 **On Now**: Real-time progress bar of live broadcasts.
  3. 🍿 **Movies Tonight**: Direct capture for high-intent cinema searches.
- **Australia 3 Timezone Switcher**: Instant switching between AEDT (Sydney/Melbourne), AEST (Brisbane), ACDT (Adelaide), and AWST (Perth) with zero-cookie `localStorage` persistence.

---

## 2. Channels Covered (The Big 5 + Digital Multi-Channels)

1. **Seven Network**: Seven (7), 7two (72), 7mate (74), 7flix (76)
2. **Nine Network**: Channel 9 (9), 9Gem (92), 9Go! (93), 9Life (94), 9Rush (96)
3. **Network 10**: 10 (10), 10 Drama (12), 10 Comedy (11), Nickelodeon (13)
4. **ABC**: ABC TV (2), ABC Kids (22), ABC Family (22), ABC Entertains (23), ABC NEWS (24)
5. **SBS**: SBS (3), SBS VICELAND (31), SBS World Movies (32), SBS Food (33), NITV (34)

---

## 3. Project Structure

```
aussietvtonight.com/
├── astro-aussietvtonight/      # Astro 6 + Tailwind 4 Static Site Generator
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.html       # Tonight Prime Time
│   │   │   ├── on-now.astro     # Live TV Guide
│   │   │   ├── movies-tonight/  # Movies Guide
│   │   │   ├── tomorrow.astro   # Tomorrow's preview
│   │   │   └── [sender].astro   # Dedicated Channel Hubs
│   │   ├── components/          # Header (with Timezone selector), ChannelCard, etc.
│   │   └── lib/epg.ts           # Build-time EPG provider
│   └── dist/                    # Prerendered static site ready for Cloudflare Pages
├── scripts/
│   ├── epg_importer_au.py       # Production XMLTV → PostgreSQL importer (cron-ready)
│   └── deploy-cloudflare.sh     # Cloudflare Pages deploy script
└── CONTABO-SERVER-RULES.md      # Strict guidelines for Contabo VPS
```

---

## 4. Local Build & Preview

```bash
cd astro-aussietvtonight
npm run build      # Prerenders all 30 routes with Australian EPG
npm run preview    # Runs preview server on port 4321
```
