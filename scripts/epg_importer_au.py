#!/usr/bin/env python3
"""
EPG Importer for aussietvtonight.com
Downloads Australian XMLTV feed and populates PostgreSQL (channels_au, programs_au)
Source: https://i.mjh.nz/au/all/epg.xml.gz
Run daily via crontab: 30 4 * * * /usr/bin/python3 /path/to/epg_importer_au.py
"""

import os
import sys
import gzip
import logging
from datetime import datetime, timezone, timedelta
import urllib.request
import xml.etree.ElementTree as ET
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

load_dotenv()

EPG_URL = os.getenv('EPG_XMLTV_URL', 'https://i.mjh.nz/au/all/epg.xml.gz')
DATABASE_URL = os.getenv('DATABASE_URL', '')
RETENTION_DAYS = int(os.getenv('RETENTION_DAYS', '7'))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger('epg_importer_au')

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

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS channels_au (
    id SERIAL PRIMARY KEY,
    channel_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    channel_number INT,
    category VARCHAR(100) DEFAULT 'Generalista',
    stream_url TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programs_au (
    id SERIAL PRIMARY KEY,
    channel_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    sub_title VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    image_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    rating VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_program_au UNIQUE (channel_id, start_time)
);

CREATE INDEX IF NOT EXISTS idx_programs_au_channel_start ON programs_au(channel_id, start_time);
CREATE INDEX IF NOT EXISTS idx_programs_au_start ON programs_au(start_time);
"""

def setup_db(conn):
    with conn.cursor() as cur:
        cur.execute(SCHEMA_SQL)
    conn.commit()
    logger.info("Database schema verified.")

def main():
    if not DATABASE_URL:
        logger.error("DATABASE_URL environment variable is required.")
        return 1

    logger.info(f"Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    setup_db(conn)

    logger.info(f"Downloading Australian XMLTV from {EPG_URL}...")
    req = urllib.request.Request(EPG_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as resp:
        with gzip.GzipFile(fileobj=resp) as gz:
            xml_data = gz.read()

    root = ET.fromstring(xml_data)

    # Upsert Channels
    with conn.cursor() as cur:
        for xml_cid, meta in CANONICAL_CHANNELS.items():
            cur.execute("""
                INSERT INTO channels_au (channel_id, name, logo_url, channel_number)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (channel_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    logo_url = EXCLUDED.logo_url,
                    channel_number = EXCLUDED.channel_number;
            """, (meta['id'], meta['name'], meta['logo'], meta['number']))
    conn.commit()
    logger.info("Channels synced.")

    # Parse programmes
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
        rating_el = p.find('rating/value')

        start_str = p.get('start', '')
        stop_str = p.get('stop', '')

        try:
            dt_start = datetime.strptime(start_str[:14], '%Y%m%d%H%M%S').replace(tzinfo=timezone.utc)
            dt_stop = datetime.strptime(stop_str[:14], '%Y%m%d%H%M%S').replace(tzinfo=timezone.utc)
        except Exception:
            continue

        programmes.append((
            norm_cid,
            title_el.text if title_el is not None else 'Untitled',
            subtitle_el.text if subtitle_el is not None else None,
            desc_el.text if desc_el is not None else '',
            cat_el.text if cat_el is not None else '',
            icon_el.get('src') if icon_el is not None else None,
            dt_start,
            dt_stop,
            rating_el.text if rating_el is not None else None
        ))

    logger.info(f"Upserting {len(programmes)} programs...")
    with conn.cursor() as cur:
        execute_batch(cur, """
            INSERT INTO programs_au (channel_id, title, sub_title, description, category, image_url, start_time, end_time, rating)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (channel_id, start_time) DO UPDATE SET
                title = EXCLUDED.title,
                sub_title = EXCLUDED.sub_title,
                description = EXCLUDED.description,
                category = EXCLUDED.category,
                image_url = EXCLUDED.image_url,
                end_time = EXCLUDED.end_time,
                rating = EXCLUDED.rating;
        """, programmes, page_size=200)

        # Retention cleanup
        cutoff = datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)
        cur.execute("DELETE FROM programs_au WHERE end_time < %s;", (cutoff,))
        deleted = cur.rowcount
        logger.info(f"Retention policy: deleted {deleted} old programs before {cutoff}.")

    conn.commit()
    conn.close()
    logger.info("EPG Australian import completed successfully.")
    return 0

if __name__ == '__main__':
    sys.exit(main())
