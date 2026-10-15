# 🇬🇧 UK TV Guide Expansion Strategy — Blueprint & Roadmap

> **Obiettivo:** Conquistare la prima pagina di Google UK nel mercato delle guide televisive digitali attraverso un'applicazione web PWA ultra-veloce (Astro + Cloudflare Edge), abbattendo i giganti editoriali obsoleti (*Radio Times*, *TVGuide.co.uk*, *What's on TV*) su Core Web Vitals, usabilità mobile e feature intelligenti.

---

## 👑 1. I Domini Killer Suggeriti

Nel Regno Unito, i suffissi **`.co.uk`** e **`.com`** godono di massima fiducia e CTR nelle SERP locali. Il termine "Freeview" è un marchio registrato ma l'uso descrittivo o combinato è diffusissimo.

| Ranking | Dominio Suggerito | Punti di Forza SEO & Branding | Stima Valore / Disponibilità |
| :--- | :--- | :--- | :--- |
| 🥇 **Top Pick** | **`uktvtonight.co.uk`** (o `.com`) | **Massima sinergia:** Perfetta continuità di brand con `aussietvtonight.com`. Keyword esatta ad altissimo intento: *"UK TV tonight"*. | Eccellente, facile da registrare/acquisire, suono autorevole. |
| 🥈 **Alternativa 1** | **`freeviewtonight.co.uk`** | **Psicologia locale:** L'85% delle case UK guarda la TV tramite Freeview. CTR altissimo per query come *"Freeview TV guide tonight"*. | Fortissimo impatto visivo e memorabilità. |
| 🥉 **Alternativa 2** | **`whatsonfreeview.co.uk`** | Match esatto per le query colloquiali: *"What's on Freeview tonight UK"*. | Perfetto per intercettare ricerca vocale e mobile search. |
| 🏅 **Brand Corto** | **`britishtvtonight.com`** | Copre sia il mercato domestico UK sia gli espatriati/turisti che cercano la programmazione britannica. | Internazionalizzabile. |

> 💡 **Verdetto:** **`uktvtonight.co.uk`** (registrando anche il `.com` come redirect protettivo) è la scelta perfetta per creare un network scalabile insieme a `aussietvtonight.com` e `teleestanoche.es`.

---

## 📡 2. Il Panorama TV UK (I Canali Fondamentali)

A differenza di altri paesi, nel Regno Unito il pubblico conosce i canali **per numero esatto di telecomando Freeview**:

1. **I "Big 5" terrestri (70%+ dell'ascolto serale):**
   * **BBC One** (Canale 1) — Flagship dramas, telegiornali, show del sabato sera, *Match of the Day*.
   * **BBC Two** (Canale 2) — Documentari, satira, approfondimenti culturali.
   * **ITV1** (Canale 3) — Soap opere (*Coronation Street*, *Emmerdale*), grandi reality, intrattenimento.
   * **Channel 4** (Canale 4) — Cinema d'autore, commedie cult, serie internazionali, format provocatori.
   * **Channel 5** (Canale 5) — Documentari popolari, drama britannici, factual show.

2. **I canali verticali più cercati:**
   * **Film4** (Canale 14) — Il canale cinema gratuito più visto del Regno Unito (query: *"Films on Film4 tonight"*).
   * **Dave / U&Dave** (Canale 19) — Stand-up comedy, *Taskmaster*, panel shows.
   * **ITV2** (Canale 6) — *Love Island*, show giovanili.
   * **E4** (Canale 13) — Sitcom americane, reality.
   * **Sky Arts** (Canale 11, Free-to-Air) — Concerti, teatro, documentari d'arte.
   * **BBC Four** — Archivio musicale, cinema europeo sottotitolato.
   * **ITV4** — Sport d'annata, film d'azione, ciclismo e freccette.

3. **Orari Chiave del Prime Time Britannico:**
   * **19:00 - 20:00:** L'ora delle Soap (*Emmerdale*, *Corrie*, *EastEnders*).
   * **20:00 (8:00 PM):** Prima serata familiare.
   * **21:00 (9:00 PM - The Watershed):** Lo spartiacque legale della TV UK: iniziano i film non censurati, thriller vietati ai minori, serie crime e commedie mature. Altissimo intento di ricerca: *"What's on TV after 9pm"*.

---

## 🚀 3. Killer Features per Sbaragliare la Concorrenza UK

I competitor attuali (*Radio Times*, *TV Guide UK*) sono pesantissimi (LCP > 4.5s) e imbottiti di annunci ad alta densità che fanno rimbalzare l'utente su smartphone. Ecco le armi di differenziazione:

### A. Film Score Badge & Filtro IMDb / Rotten Tomatoes
* **La Feature:** Ogni film in onda (specialmente su Film4, BBC Two, ITV e Channel 4) mostra il badge con il voto IMDb (es. `⭐ 7.9 IMDb`).
* **Il Tasto Magico:** Switch rapido in alto: *"Only movies > 7.0 IMDb"*.
* **Impatto SEO:** Pagine automatiche generate come:
  * `/films-on-tv-tonight-uk/`
  * `/best-movies-on-freeview/`
  * `/film4-schedule-tonight/`

### B. "Watch on Catch-Up" (Il Ponte Diretto verso BVOD)
* Gli utenti UK vivono di piattaforme on-demand gratuite. In ogni scheda programma inseriremo il link diretto all'app di streaming ufficiale:
  * **BBC iPlayer** (BBC One/Two)
  * **ITVX** (ITV1/2/4)
  * **Channel 4 Streaming** (ex All4)
  * **My5** (Channel 5)
  * **U** (ex UKTV Play per Dave/Yesterday/Drama)
* *Valore per l'utente:* "Ti sei perso i primi 20 minuti? Clicca qui e guardalo dall'inizio su BBC iPlayer".

### C. Live Progress Bar ("On Now" con Timer Watershed)
* Nella tab `/on-now/`, ogni programma in corso mostra:
  * Una barra di avanzamento dinamica (es. *"Started 20m ago • 45m remaining"*).
  * Badge visuale per i programmi **"Post-Watershed"** (dopo le 21:00) per gli appassionati di crime e film serali.

### D. "Smart Match & Sport Alert" (Calcio, Rugby & Cricket)
* Gli inglesi cercano ossessivamente gli orari esatti delle partite in chiaro:
  * *FA Cup in chiaro su BBC/ITV*
  * *Six Nations Rugby*
  * *Match of the Day (BBC One alle 22:30)*
  * *Wimbledon*
* Scheda dedicata `/sport-tonight/` con orario di kickoff preciso convertito nel fuso orario dell'utente e bottone *"Add to Calendar / Set Push Alert"*.

### E. Tasto "Cosa guardo stasera?" (The 5-Second Decision Maker)
* Un drawer rapido che risolve la paralisi da scelta con 3 domande rapide:
  1. *Genere desiderato (British Drama | Crime Thriller | Comedy | Hollywood Movie)*
  2. *Orario (Now | Prime Time 8pm | Late Night)*
* Risultato immediato con trailer e link, senza dover scorrere 80 canali.

---

## 📈 4. Piano di Monetizzazione e ROI

Il mercato UK ha uno dei **Cost Per Mille (CPM)** pubblicitari più elevati in Europa:
1. **AdSense / Google Ad Exchange:** CPM attesi tra **£8.00 e £18.00** per traffico mobile UK in target intrattenimento.
2. **PWA Native Banners:** 2 soli slot premium (uno sticky footer non invasivo e uno interstitial tra i canali) per mantenere il punteggio Core Web Vitals a 100/100.
3. **Affiliazione Streaming:** Link per l'abbonamento o prova gratuita a canali pay correlati (Sky Stream, NOW TV, Amazon Prime Video Channels UK, Paramount+ UK).

---

## 🛠️ 5. Piano Tecnico di Rilascio (Next Steps)

1. **Registrazione Dominio:** Acquisire `uktvtonight.co.uk` (o equivalente selezionato).
2. **Setup Dati EPG:** Integrare il feed XMLTV UK già predisposto (mjh.nz o IPTV-org UK Freeview standard, ~60 canali digitali).
3. **Clonazione dell'Engine Astro:** Replicare la struttura ultra-ottimizzata di `aussietvtonight.com` adattando:
   * Canali e loghi Freeview ufficiali.
   * Fuso orario (`Europe/London` con gestione automatica GMT/BST).
   * Schema.org `BroadcastEvent` localizzato in `en-GB`.
4. **Deploy su Cloudflare Pages:** CDN globale con latenza <15ms su nodo di Londra.
