#!/usr/bin/env python3
import gzip
import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

EPG_URL = os.getenv('EPG_XMLTV_URL', 'https://i.mjh.nz/au/all/epg.xml.gz')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'epg-cache.json')

# Major Sydney / NSW channels canonical list for national TV Guide
CANONICAL_CHANNELS = {
    'mjh-seven-syd': {'id': 'seven', 'name': 'Seven', 'number': 7, 'logo': 'https://i.mjh.nz/.images/auto-seven-syd-9608a4.png'},
    'mjh-7two-syd': {'id': '7two', 'name': '7two', 'number': 72, 'logo': 'https://i.mjh.nz/.images/auto-7two-syd-701123.png'},
    'mjh-7mate-syd': {'id': '7mate', 'name': '7mate', 'number': 74, 'logo': 'https://i.mjh.nz/.images/auto-7mate-syd-360d60.png'},
    'mjh-7flix-syd': {'id': '7flix', 'name': '7flix', 'number': 76, 'logo': 'https://i.mjh.nz/.images/auto-7flix-syd-c6badc.png'},

    'mjh-channel-9-nsw': {'id': 'channel-9', 'name': 'Channel 9', 'number': 9, 'logo': 'https://imageresizer.static9.net.au/lx1XIWcrYZRtnfJOqvxNn9CshDI=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F09%2F630608%2F9nine-1.png'},
    'mjh-gem-nsw': {'id': '9gem', 'name': '9Gem', 'number': 92, 'logo': 'https://imageresizer.static9.net.au/d00389KKc5T4o5isRaDE9Pl9DWk=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F08%2F620929%2F9gem-1.png'},
    'mjh-go-nsw': {'id': '9go', 'name': '9Go!', 'number': 93, 'logo': 'https://imageresizer.static9.net.au/fcTwzkAJT4q81emfp2kYkgoxlDA=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574470%2F9go.png'},
    'mjh-life-nsw': {'id': '9life', 'name': '9Life', 'number': 94, 'logo': 'https://imageresizer.static9.net.au/wMK3kBDybfEoN2iqyDDflC91D1U=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574472%2F9life.png'},
    'mjh-rush-nsw': {'id': '9rush', 'name': '9Rush', 'number': 96, 'logo': 'https://imageresizer.static9.net.au/5B2ZDlD8Ji6dCecGQEfwy2U2m4Y=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574473%2F9rush.png'},

    'mjh-10-nsw': {'id': '10', 'name': '10', 'number': 10, 'logo': 'https://10play.com.au/ip/s3/2025/06/25/b18ae76555d114f7bfaf1c3bfa43dd3f-1384577.png'},
    'mjh-10bold-nsw': {'id': '10-drama', 'name': '10 Drama', 'number': 12, 'logo': 'https://10play.com.au/ip/s3/2025/06/25/66c9f2639a7bca4a6691764a0db801d7-1384581.png'},
    'mjh-10peach-nsw': {'id': '10-comedy', 'name': '10 Comedy', 'number': 11, 'logo': 'https://10play.com.au/ip/s3/2025/06/25/443fa2a5bca1191f12efa002a2a8ef85-1384586.png'},
    'mjh-10shake-nsw': {'id': 'nickelodeon', 'name': 'Nickelodeon', 'number': 13, 'logo': 'https://10play.com.au/ip/s3/2023/07/31/dc4873abc5ba0fde04b59a78c89e0943-1252731.png'},

    'mjh-abc-nsw': {'id': 'abc-tv', 'name': 'ABC TV', 'number': 2, 'logo': 'https://i.mjh.nz/.images/abc-nsw.png'},
    'mjh-abc-kids': {'id': 'abc-kids', 'name': 'ABC Kids', 'number': 22, 'logo': 'https://i.mjh.nz/.images/abc-kids.png'},
    'mjh-abc-tv-plus': {'id': 'abc-tv-plus', 'name': 'ABC Family', 'number': 22, 'logo': 'https://i.mjh.nz/.images/abc-family.png'},
    'mjh-abc-me': {'id': 'abc-entertains', 'name': 'ABC Entertains', 'number': 23, 'logo': 'https://i.mjh.nz/.images/abc-me.png'},
    'mjh-abc-news': {'id': 'abc-news', 'name': 'ABC NEWS', 'number': 24, 'logo': 'https://i.mjh.nz/.images/abc-news.png'},

    'mjh-sbs-sbst': {'id': 'sbs', 'name': 'SBS', 'number': 3, 'logo': 'https://image.pr.sbsod.com/b073959a-a63e-5b6a-a05a-157d615a4b8c'},
    'mjh-sbs-2syd': {'id': 'sbs-viceland', 'name': 'SBS VICELAND', 'number': 31, 'logo': 'https://image.pr.sbsod.com/e7f27bb4-4672-599e-b9b4-a72cfdd8d3ba'},
    'mjh-sbs-4syd': {'id': 'sbs-world-movies', 'name': 'SBS World Movies', 'number': 32, 'logo': 'https://image.pr.sbsod.com/cc42ae9e-0e64-5bc3-8c71-6f23f42610fb'},
    'mjh-sbs-3syd': {'id': 'sbs-food', 'name': 'SBS Food', 'number': 33, 'logo': 'https://image.pr.sbsod.com/336c48bb-129d-5348-9d2f-63ab4fe6d493'},
    'mjh-sbs-5nsw': {'id': 'nitv', 'name': 'NITV', 'number': 34, 'logo': 'https://image.pr.sbsod.com/00ff96cd-68c3-5219-b792-c0c2faec1fe6'},
}

def main():
    print(f'[fetch-epg-json] Downloading Australian XMLTV from {EPG_URL}...')
    try:
        req = urllib.request.Request(EPG_URL, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            with gzip.GzipFile(fileobj=resp) as gz:
                xml_data = gz.read()
    except Exception as e:
        print(f'[fetch-epg-json] Download failed: {e}', file=sys.stderr)
        if os.path.exists(OUTPUT_FILE):
            print('[fetch-epg-json] Using existing epg-cache.json fallback.')
            return 0
        return 1

    print(f'[fetch-epg-json] Parsing {len(xml_data)} bytes of XMLTV...')
    try:
        root = ET.fromstring(xml_data)
    except Exception as e:
        print(f'[fetch-epg-json] XML parse failed: {e}', file=sys.stderr)
        return 1

    # Channels list
    channels = []
    seen_ids = set()
    for xml_cid, meta in CANONICAL_CHANNELS.items():
        if meta['id'] not in seen_ids:
            channels.append({
                'id': meta['id'],
                'name': meta['name'],
                'number': meta['number'],
                'logo': meta['logo'],
                'xml_id': xml_cid
            })
            seen_ids.add(meta['id'])

    # Build programmes map
    programmes = []
    for p in root.findall('programme'):
        chid = p.get('channel', '')
        if chid not in CANONICAL_CHANNELS:
            continue

        target_ch = CANONICAL_CHANNELS[chid]
        norm_cid = target_ch['id']

        title_el = p.find('title')
        subtitle_el = p.find('sub-title')
        desc_el = p.find('desc')
        cat_el = p.find('category')
        icon_el = p.find('icon')

        start_str = p.get('start', '')
        stop_str = p.get('stop', '')

        try:
            # MJH EPG XMLTV start string format: "20261011183000 +0000"
            dt_start = datetime.strptime(start_str[:14], '%Y%m%d%H%M%S').replace(tzinfo=timezone.utc)
            dt_stop = datetime.strptime(stop_str[:14], '%Y%m%d%H%M%S').replace(tzinfo=timezone.utc)
            iso_start = dt_start.isoformat()
            iso_stop = dt_stop.isoformat()
        except Exception:
            continue

        rating_el = p.find('rating/value')
        rating = rating_el.text if rating_el is not None else None

        programmes.append({
            'channel_id': norm_cid,
            'title': title_el.text if title_el is not None else 'Untitled',
            'sub_title': subtitle_el.text if subtitle_el is not None else None,
            'description': desc_el.text if desc_el is not None else '',
            'category': cat_el.text if cat_el is not None else '',
            'image_url': icon_el.get('src') if icon_el is not None else None,
            'start_time': iso_start,
            'end_time': iso_stop,
            'rating': rating,
        })

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    payload = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'channels': channels,
        'programs': programmes,
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False)

    print(f'[fetch-epg-json] Saved {len(channels)} channels and {len(programmes)} programs to {OUTPUT_FILE}')
    return 0

if __name__ == '__main__':
    sys.exit(main())
