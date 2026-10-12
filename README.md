# Aussie TV Tonight (aussietvtonight.com) 🇦🇺📺

[![Live Website](https://img.shields.io/badge/Website-aussietvtonight.com-amber?style=for-the-badge&logo=googlechrome&logoColor=white)](https://aussietvtonight.com/)
[![Deployed with Cloudflare Pages](https://img.shields.io/badge/Deployed%20with-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://aussietvtonight.com/)
[![Astro](https://img.shields.io/badge/Built%20with-Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **[Aussie TV Tonight](https://aussietvtonight.com/)** is the fastest, modern, real-time Freeview TV Guide tailored for Australian television viewers across Sydney, Melbourne, Brisbane, Adelaide, and Perth.

Prerendered at the edge via Astro Static Site Generation and Cloudflare Pages for instant 0ms load times and seamless navigation.

---

## 🌐 Official Website & Hubs

Discover live schedules, prime-time guides, and channel listings on our official portal:

- 🌙 **[Australian TV Guide Tonight (7:30 PM Prime Time)](https://aussietvtonight.com/)** — Discover what is playing across all major Australian networks tonight at peak viewing hours.
- 🔴 **[What's On TV Now (Live TV Guide)](https://aussietvtonight.com/on-now/)** — Real-time progress bars and live schedules for Australian free-to-air television.
- 🍿 **[Movies on TV Tonight Australia](https://aussietvtonight.com/movies-tonight/)** — Complete schedule of feature films and blockbusters airing on Australian TV tonight.
- 🏆 **[Live Sport on TV Tonight](https://aussietvtonight.com/sport-tonight/)** — AFL, NRL, cricket, football, tennis, and live sports broadcasting tonight.
- 📺 **[TV Shows & Series Tonight](https://aussietvtonight.com/shows-tonight/)** — Drama, comedy, reality TV, documentaries, and news series tonight.
- 📅 **[Tomorrow's Australian TV Guide](https://aussietvtonight.com/tomorrow/)** — Plan ahead with complete schedules and prime time previews for tomorrow.

---

## 📡 Freeview Australia Channels Covered

Direct guide pages for Australian national and digital multi-channels:

| Commercial Networks | Public Broadcasters & Digital Channels |
| :--- | :--- |
| • [Channel 7](https://aussietvtonight.com/seven/) (Seven Network)<br>• [7two](https://aussietvtonight.com/7two/)<br>• [7mate](https://aussietvtonight.com/7mate/)<br>• [7flix](https://aussietvtonight.com/7flix/) | • [ABC TV](https://aussietvtonight.com/abc-tv/) (Australian Broadcasting Corp)<br>• [ABC Kids](https://aussietvtonight.com/abc-kids/)<br>• [ABC Entertains](https://aussietvtonight.com/abc-entertains/)<br>• [ABC News](https://aussietvtonight.com/abc-news/) |
| • [Channel 9](https://aussietvtonight.com/channel-9/) (Nine Network)<br>• [9Gem](https://aussietvtonight.com/9gem/)<br>• [9Go!](https://aussietvtonight.com/9go/)<br>• [9Life](https://aussietvtonight.com/9life/)<br>• [9Rush](https://aussietvtonight.com/9rush/) | • [SBS](https://aussietvtonight.com/sbs/) (Special Broadcasting Service)<br>• [SBS VICELAND](https://aussietvtonight.com/sbs-viceland/)<br>• [SBS World Movies](https://aussietvtonight.com/sbs-world-movies/)<br>• [SBS Food](https://aussietvtonight.com/sbs-food/)<br>• [NITV](https://aussietvtonight.com/nitv/) |
| • [Network 10](https://aussietvtonight.com/10/)<br>• [10 Drama](https://aussietvtonight.com/10-drama/)<br>• [10 Comedy](https://aussietvtonight.com/10-comedy/)<br>• [Nickelodeon](https://aussietvtonight.com/nickelodeon/) | |

---

## ⚡ Core Features

- **7:30 PM Australian Prime Time Focus**: Optimized for the Australian television tradition where prime-time flagship shows, reality series, and films air strictly starting at 7:30 PM.
- **Instant City / Timezone Switching**: Real-time client-side conversion for:
  - **AEDT / AEST**: Sydney, Melbourne, Canberra, Brisbane, Hobart
  - **ACDT / ACST**: Adelaide, Darwin
  - **AWST**: Perth
- **100% Valid Schema.org Structured Data**: Integrated `TVGuide`, `ItemList`, `BroadcastService`, and `WebPage` JSON-LD schemas on all routes for Google & Bing Rich Results.
- **IndexNow & Bing Webmaster Verification**: Real-time push indexing for instant crawler updates across Microsoft Bing, Copilot, Yahoo, and partners.
- **Privacy First & Lightweight**: Zero invasive third-party trackers, fully responsive dark-mode UI with Tailwind CSS.

---

## 🛠️ Project Structure

```
aussietvtonight.com/
├── astro-aussietvtonight/      # Astro Static Site Generator
│   ├── src/
│   │   ├── pages/              # Static & dynamic SSG routes
│   │   ├── components/         # Header, ChannelCard, TimezoneSelector
│   │   ├── layouts/            # BaseLayout with SEO, OpenGraph & Favicons
│   │   └── utils/              # Timezone calculations & XMLTV parsing
│   ├── public/                 # Favicons, sitemap.xml, robots.txt, IndexNow key
│   └── dist/                   # Static build bundle for Cloudflare Pages
└── scripts/                    # Automated EPG sync and IndexNow ping scripts
```

---

## 🚀 Development & Build

```bash
cd astro-aussietvtonight

# Install dependencies
npm install

# Start development server
npm run dev

# Prerender full static site
npm run build

# Verify build output
npm run test
```

---

## 📄 License & Credits

Distributed under the **MIT License**.

- Official Portal: [https://aussietvtonight.com](https://aussietvtonight.com/)
- Contact: `tv@aussietvtonight.com`
