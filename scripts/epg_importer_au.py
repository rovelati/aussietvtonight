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
    'mjh-seven-syd': {"id": "seven", "name": "Seven", "number": 7, "logo": "https://i.mjh.nz/.images/auto-seven-syd-9608a4.png"},
    'mjh-channel-9-nsw': {"id": "channel-9", "name": "Channel 9", "number": 9, "logo": "https://imageresizer.static9.net.au/lx1XIWcrYZRtnfJOqvxNn9CshDI=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F09%2F630608%2F9nine-1.png"},
    'mjh-10-nsw': {"id": "10", "name": "10", "number": 10, "logo": "https://10play.com.au/ip/s3/2025/06/25/b18ae76555d114f7bfaf1c3bfa43dd3f-1384577.png"},
    'mjh-abc-nsw': {"id": "abc-tv", "name": "ABC TV", "number": 2, "logo": "https://i.mjh.nz/.images/abc-nsw.png"},
    'mjh-sbs-sbst': {"id": "sbs", "name": "SBS", "number": 3, "logo": "https://image.pr.sbsod.com/b073959a-a63e-5b6a-a05a-157d615a4b8c"},
    'mjh-7two-syd': {"id": "7two", "name": "7two", "number": 72, "logo": "https://i.mjh.nz/.images/auto-7two-syd-701123.png"},
    'mjh-7mate-syd': {"id": "7mate", "name": "7mate", "number": 74, "logo": "https://i.mjh.nz/.images/auto-7mate-syd-360d60.png"},
    'mjh-7flix-syd': {"id": "7flix", "name": "7flix", "number": 76, "logo": "https://i.mjh.nz/.images/auto-7flix-syd-c6badc.png"},
    'mjh-7bravo-fast': {"id": "7bravo", "name": "7Bravo", "number": 75, "logo": "https://i.mjh.nz/.images/auto-7bravo-fast-04647e.png"},
    'mjh-gem-nsw': {"id": "9gem", "name": "9Gem", "number": 92, "logo": "https://imageresizer.static9.net.au/d00389KKc5T4o5isRaDE9Pl9DWk=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F08%2F620929%2F9gem-1.png"},
    'mjh-go-nsw': {"id": "9go", "name": "9Go!", "number": 93, "logo": "https://imageresizer.static9.net.au/fcTwzkAJT4q81emfp2kYkgoxlDA=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574470%2F9go.png"},
    'mjh-life-nsw': {"id": "9life", "name": "9Life", "number": 94, "logo": "https://imageresizer.static9.net.au/wMK3kBDybfEoN2iqyDDflC91D1U=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574472%2F9life.png"},
    'mjh-rush-nsw': {"id": "9rush", "name": "9Rush", "number": 96, "logo": "https://imageresizer.static9.net.au/5B2ZDlD8Ji6dCecGQEfwy2U2m4Y=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F03%2F574473%2F9rush.png"},
    'mjh-10bold-nsw': {"id": "10-drama", "name": "10 Drama", "number": 12, "logo": "https://10play.com.au/ip/s3/2025/06/25/66c9f2639a7bca4a6691764a0db801d7-1384581.png"},
    'mjh-10peach-nsw': {"id": "10-comedy", "name": "10 Comedy", "number": 11, "logo": "https://10play.com.au/ip/s3/2025/06/25/443fa2a5bca1191f12efa002a2a8ef85-1384586.png"},
    'mjh-10shake-nsw': {"id": "nickelodeon", "name": "Nickelodeon", "number": 13, "logo": "https://10play.com.au/ip/s3/2023/07/31/dc4873abc5ba0fde04b59a78c89e0943-1252731.png"},
    'mjh-abc-kids': {"id": "abc-kids", "name": "ABC Kids", "number": 22, "logo": "https://i.mjh.nz/.images/abc-kids.png"},
    'mjh-abc-tv-plus': {"id": "abc-tv-plus", "name": "ABC Family", "number": 22, "logo": "https://cdn.iview.abc.net.au/thumbs/256/7_Family_C-1053_iview_LivestreamOff_2000x2000_new.png"},
    'mjh-abc-me': {"id": "abc-entertains", "name": "ABC Entertains", "number": 23, "logo": "https://cdn.iview.abc.net.au/thumbs/256/6_Entertains_C-1054_iview_LivestreamOn_2000x2000_new.png"},
    'mjh-abc-news': {"id": "abc-news", "name": "ABC NEWS", "number": 24, "logo": "https://i.mjh.nz/.images/abc-news.png"},
    'mjh-sbs-2syd': {"id": "sbs-viceland", "name": "SBS2", "number": 31, "logo": "https://image.pr.sbsod.com/e7f27bb4-4672-599e-b9b4-a72cfdd8d3ba"},
    'mjh-sbs-4syd': {"id": "sbs-world-movies", "name": "SBS World Movies", "number": 32, "logo": "https://image.pr.sbsod.com/cc42ae9e-0e64-5bc3-8c71-6f23f42610fb"},
    'mjh-sbs-3syd': {"id": "sbs-food", "name": "SBS Food", "number": 33, "logo": "https://image.pr.sbsod.com/336c48bb-129d-5348-9d2f-63ab4fe6d493"},
    'mjh-sbs-5nsw': {"id": "nitv", "name": "NITV", "number": 34, "logo": "https://image.pr.sbsod.com/00ff96cd-68c3-5219-b792-c0c2faec1fe6"},
    'mjh-7afl-fast': {"id": "7afl", "name": "7AFL", "number": 125, "logo": "https://i.mjh.nz/.images/auto-7afl-fast-e8fdb6.png"},
    'mjh-racing-fast': {"id": "racing-com", "name": "Racing.com", "number": 126, "logo": "https://i.mjh.nz/.images/auto-racing-fast-de6aee.png"},
    'mjh-sky-racing-1': {"id": "sky-racing-1", "name": "Sky Racing #1", "number": 127, "logo": "https://i.mjh.nz/.images/sky-racing-1.png"},
    'mjh-sky-racing-2': {"id": "sky-racing-2", "name": "Sky Racing #2", "number": 128, "logo": "https://i.mjh.nz/.images/sky-racing-2.png"},
    'mjh-sky-racing-thoroughbred': {"id": "sky-racing-thoroughbred", "name": "Sky Racing - Thoroughbred Central", "number": 129, "logo": "https://i.mjh.nz/.images/sky-racing-thoroughbred.png"},
    'mjh-cricketgold-fast': {"id": "cricket-gold", "name": "Cricket Gold", "number": 130, "logo": "https://i.mjh.nz/.images/auto-cricketgold-fast-906f03.png"},
    'mjh-redbull-tv': {"id": "redbull-tv", "name": "Redbull TV", "number": 131, "logo": "https://i.mjh.nz/.images/redbull-tv.png"},
    'mjh-livgolfreplays-fast': {"id": "liv-golf", "name": "LIV Golf Replays", "number": 132, "logo": "https://i.mjh.nz/.images/auto-livgolfreplays-fast-471f30.png"},
    'mjh-sbs-sysdata_s_p_a_fifa_6': {"id": "fifa-plus", "name": "FIFA+", "number": 133, "logo": "https://image.pr.sbsod.com/82e2f8e9-238d-599f-84e7-891a54026c9f"},
    'mjh-wnbl-202627-fast': {"id": "wnbl", "name": "WNBL 2026/27", "number": 134, "logo": "https://imageresizer.static9.net.au/SBz7DKoMTTXJvmj-XGrjU093es0=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2026%2F10%2F800206%2Fwnbl_squircle.png"},
    'mjh-sky-news-now': {"id": "sky-news-now", "name": "Sky News Now", "number": 135, "logo": "https://i.mjh.nz/.images/sky-news-now.png"},
    'mjh-cas32-fast': {"id": "7news-spotlight", "name": "7NEWS Spotlight", "number": 136, "logo": "https://i.mjh.nz/.images/auto-cas32-fast-2bc14f.png"},
    'mjh-60-minutes-australia-fast': {"id": "60-minutes-australia", "name": "60 Minutes Australia", "number": 137, "logo": "https://imageresizer.static9.net.au/kufGcZyXI7lNm32WrMV86xPNAnk=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F04%2F585173%2Fsquircle_60mins.png"},
    'mjh-bbc-news': {"id": "bbc-news", "name": "BBC News", "number": 138, "logo": "https://i.mjh.nz/.images/bbc-news.png"},
    'mjh-bloomberg-tv': {"id": "bloomberg-tv", "name": "Bloomberg TV", "number": 139, "logo": "https://i.mjh.nz/.images/bloomberg-tv.png"},
    'mjh-al-jazeera': {"id": "al-jazeera", "name": "Al Jazeera", "number": 140, "logo": "https://i.mjh.nz/.images/al-jazeera.png"},
    'mjh-channel-news-asia': {"id": "channel-news-asia", "name": "Channel News Asia (CNA)", "number": 141, "logo": "https://i.mjh.nz/.images/channel-news-asia.png"},
    'mjh-sbs-euronews': {"id": "euronews", "name": "euronews", "number": 142, "logo": "https://image.pr.sbsod.com/60e599d9-82ed-5eac-b51c-7c23a9bb0c55"},
    'mjh-sbs-france24': {"id": "france24", "name": "France 24", "number": 143, "logo": "https://image.pr.sbsod.com/940bda61-531e-5e30-bb1e-69db1cdbb077"},
    'mjh-dw-news': {"id": "dw-english", "name": "DW English", "number": 144, "logo": "https://www.dw.com/images/icons/favicon-540x540.png"},
    'mjh-ausbiz-fast': {"id": "ausbiz", "name": "ausbiz", "number": 145, "logo": "https://i.mjh.nz/.images/auto-ausbiz-fast-b12203.png"},
    'mjh-abc-90-seconds-business': {"id": "abc-business", "name": "ABC Business in 90 Seconds", "number": 146, "logo": "https://live-production.wcms.abc-cdn.net.au/ae76d32898cca0be596b7f23c1bd41f2?impolicy=wcms_crop_resize&cropH=630&cropW=1119&xPos=10&yPos=0&width=862&height=485"},
    'mjh-abc-90-seconds-weather': {"id": "abc-weather", "name": "ABC Weather in 90 Seconds", "number": 147, "logo": "https://live-production.wcms.abc-cdn.net.au/d376e49724862f104d044ff6467f85d8?impolicy=wcms_crop_resize&cropH=630&cropW=1119&xPos=10&yPos=0&width=862&height=485"},
    'mjh-csicrimesceneinvestigation-fast': {"id": "csi", "name": "CSI Crime Scene Investigation", "number": 148, "logo": "https://i.mjh.nz/.images/auto-csicrimesceneinvestigation-fast-87549e.png"},
    'mjh-ncis-fast': {"id": "ncis", "name": "NCIS", "number": 149, "logo": "https://i.mjh.nz/.images/auto-ncis-fast-6f82bd.png"},
    'mjh-10-forty-eight-hours': {"id": "48-hours", "name": "48 Hours", "number": 150, "logo": "https://10.com.au/ip/s3/2023/06/28/7dd910de29f31095b69e17f1da8f3f0e-1245997.png?image-profile=logo"},
    'mjh-10-deadlywomen': {"id": "deadly-women", "name": "Deadly Women", "number": 151, "logo": "https://10.com.au/ip/s3/2025/06/19/01e576c63918373cd03aa21ea8566f1e-1383812.png?image-profile=logo"},
    'mjh-9crime-fast': {"id": "9crime", "name": "9Crime", "number": 152, "logo": "https://imageresizer.static9.net.au/OwBWBtMcLMF5vBP09k6w4LneJQM=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F04%2F585343%2Fgroup-61566.png"},
    'mjh-10-crime-time': {"id": "crime-time", "name": "Crime Time", "number": 153, "logo": "https://10.com.au/ip/s3/2024/09/25/c27b803a4128c5b097cd3a23e1be973c-1341004.png?image-profile=logo"},
    'mjh-10-crime-hunters': {"id": "crime-hunters", "name": "Crime Hunters", "number": 154, "logo": "https://10.com.au/ip/s3/2024/03/06/cb69de15e7b8989a218ad25b7f6547ef-1301820.png?image-profile=logo"},
    'mjh-aircrashinvestigations-fast': {"id": "air-crash-investigations", "name": "Air Crash Investigations", "number": 155, "logo": "https://i.mjh.nz/.images/auto-aircrashinvestigations-fast-7ff35e.png"},
    'mjh-bordersecurityaustralia-fast': {"id": "border-security", "name": "Border Security Australia", "number": 156, "logo": "https://i.mjh.nz/.images/auto-bordersecurityaustralia-fast-30b210.png"},
    'mjh-10-cops': {"id": "cops", "name": "COPS", "number": 157, "logo": "https://10.com.au/ip/s3/2025/03/30/6fadf0873ac36ecacdc63ed8bba4cf3d-1371071.png?image-profile=logo"},
    'mjh-surveillancecentral-fast': {"id": "surveillance-central", "name": "Surveillance Central", "number": 158, "logo": "https://i.mjh.nz/.images/auto-surveillancecentral-fast-4eeefa.png"},
    'mjh-truecrimefiles-fast': {"id": "true-crime-files", "name": "True Crime Files", "number": 159, "logo": "https://i.mjh.nz/.images/auto-truecrimefiles-fast-26e3bf.png"},
    'mjh-10-diagnosismurder': {"id": "diagnosis-murder", "name": "Diagnosis Murder", "number": 160, "logo": "https://10.com.au/ip/s3/2023/06/28/5f85fc3d794a167630b935cb639abcc3-1246005.png?image-profile=logo"},
    'mjh-10-masterchef': {"id": "masterchef", "name": "MasterChef", "number": 161, "logo": "https://10.com.au/ip/s3/2022/09/02/3fff1b47f7c01770b7f0f319770d5362-1177252.png?image-profile=logo"},
    'mjh-married-at-first-sight-fast': {"id": "married-at-first-sight", "name": "Married At First Sight", "number": 162, "logo": "https://imageresizer.static9.net.au/OCF69HZLp4AWm0cGB8bvgx4U8mQ=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F04%2F585176%2Fsquircle_mafs.png"},
    'mjh-the-block-247-fast': {"id": "the-block", "name": "The Block 24/7", "number": 163, "logo": "https://imageresizer.static9.net.au/Mj-NaVq7oZgtzt2bf55lkLIfyuQ=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F08%2F623508%2Ftheblock_squircle.png"},
    'mjh-10-jamieoliver': {"id": "jamie-oliver", "name": "Jamie Oliver", "number": 164, "logo": "https://10.com.au/ip/s3/2026/10/05/f56ba740d7edd193360ff0e4cdba004b-1465603.png?image-profile=logo"},
    'mjh-heki-fast': {"id": "hells-kitchen", "name": "Hells Kitchen", "number": 165, "logo": "https://i.mjh.nz/.images/auto-heki-fast-6f7c4d.png"},
    'mjh-kitchennightmares-fast': {"id": "kitchen-nightmares", "name": "Kitchen Nightmares", "number": 166, "logo": "https://i.mjh.nz/.images/auto-kitchennightmares-fast-ba1ad2.png"},
    'mjh-sbs-sb01': {"id": "the-cook-up", "name": "The Cook Up", "number": 167, "logo": "https://image.pr.sbsod.com/82c5d9dc-bda6-5a6b-affa-67f1ba01ff38"},
    'mjh-betterhomesandgardens-fast': {"id": "better-homes-and-gardens", "name": "Better Homes And Gardens", "number": 168, "logo": "https://i.mjh.nz/.images/auto-betterhomesandgardens-fast-8d1753.png"},
    'mjh-etc-fast': {"id": "escape-to-the-country", "name": "Escape to the Country", "number": 169, "logo": "https://i.mjh.nz/.images/auto-etc-fast-6d4429.png"},
    'mjh-bbc-food-fast': {"id": "bbc-food", "name": "BBC Food", "number": 170, "logo": "https://imageresizer.static9.net.au/fsW8mo_8BA8nztvHgpodxtSmcjo=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F12%2F652517%2Fgroup-61812.png"},
    'mjh-bbc-home-garden-fast': {"id": "bbc-home-garden", "name": "BBC Home & Garden", "number": 171, "logo": "https://imageresizer.static9.net.au/RHsGPvwhtEktqfW-Tg4ygRMy1ug=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F11%2F648313%2Fgroup-61771.png"},
    'mjh-therealhousewivesvault-fast': {"id": "real-housewives", "name": "The Real Housewives VAULT", "number": 172, "logo": "https://i.mjh.nz/.images/auto-therealhousewivesvault-fast-dd8ea5.png"},
    'mjh-belowdeckvault-fast': {"id": "below-deck", "name": "Below Deck Vault", "number": 173, "logo": "https://i.mjh.nz/.images/auto-belowdeckvault-fast-587793.png"},
    'mjh-cas40-fast': {"id": "million-dollar-listing", "name": "Million Dollar Listing VAULT", "number": 174, "logo": "https://i.mjh.nz/.images/auto-cas40-fast-0b72b7.png"},
    'mjh-dance-moms-247-fast': {"id": "dance-moms", "name": "Dance Moms 24/7", "number": 175, "logo": "https://imageresizer.static9.net.au/OKBRw5HKp9hAAVX3XM-A1HrVRug=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F04%2F585178%2Fsquircle_dancemoms.png"},
    'mjh-seinfeld-fast': {"id": "seinfeld", "name": "Seinfeld", "number": 176, "logo": "https://imageresizer.static9.net.au/yKlUxIHgYC5cpCmL1DYpRCQ6w4o=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F04%2F585342%2Fgroup-61657.png"},
    'mjh-10-becker': {"id": "becker", "name": "Becker", "number": 177, "logo": "https://10.com.au/ip/s3/2023/06/28/e0449ed804aaacb1de64f87d94912dd3-1246030.png?image-profile=logo"},
    'mjh-10-grahamnorton': {"id": "graham-norton", "name": "The Graham Norton Show", "number": 178, "logo": "https://10.com.au/ip/s3/2023/07/12/bcb38e1591564d24894210f4abd02423-1248623.png?image-profile=logo"},
    'mjh-10-haveyoubeenpayingattention': {"id": "have-you-been-paying-attention", "name": "Have You Been Paying Attention?", "number": 179, "logo": "https://10.com.au/ip/s3/2024/12/17/20963e84ceedc64212b60c21c883e5c4-1356262.png?image-profile=logo"},
    'mjh-10-cheapseats': {"id": "the-cheap-seats", "name": "The Cheap Seats", "number": 180, "logo": "https://10.com.au/ip/s3/2025/08/08/47006754904d1d36520e76157ecbfb41-1390280.png?image-profile=logo"},
    'mjh-10-eightoutof10cats': {"id": "8-out-of-10-cats", "name": "8 Out Of 10 Cats", "number": 181, "logo": "https://10.com.au/ip/s3/2024/11/18/03a9b9a1a42bcf2ce1bbb94a8fa47224-1350731.png?image-profile=logo"},
    'mjh-10-thankgodyourehere': {"id": "thank-god-youre-here", "name": "Thank God You're Here", "number": 182, "logo": "https://10.com.au/ip/s3/2025/08/19/9cde4af8ad28a81defc2e020775ff74f-1390978.png?image-profile=logo"},
    'mjh-bbc-comedy-fast': {"id": "bbc-comedy", "name": "BBC Comedy", "number": 183, "logo": "https://imageresizer.static9.net.au/2bl6ZyviwjpHCeVoXf8twpEVFjo=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2024%2F11%2F648314%2Fgroup-61772.png"},
    'mjh-10-adultanimation': {"id": "adult-animation", "name": "Adult Animation", "number": 184, "logo": "https://10.com.au/ip/s3/2024/03/21/fb3a87d8a0126b81727106f43c2a2aef-1304705.png?image-profile=logo"},
    'mjh-cas26-fast': {"id": "home-and-away-classics", "name": "Home and Away Classics", "number": 185, "logo": "https://i.mjh.nz/.images/auto-cas26-fast-ea7944.png"},
    'mjh-allsaints-fast': {"id": "all-saints", "name": "All Saints", "number": 186, "logo": "https://i.mjh.nz/.images/auto-allsaints-fast-ebad23.png"},
    'mjh-blueheelers-fast': {"id": "blue-heelers", "name": "Blue Heelers", "number": 187, "logo": "https://i.mjh.nz/.images/auto-blueheelers-fast-8cc89d.png"},
    'mjh-waterrats-fast': {"id": "water-rats", "name": "Water Rats", "number": 188, "logo": "https://i.mjh.nz/.images/auto-waterrats-fast-428228.png"},
    'mjh-10-prisoner-cell-block-h': {"id": "prisoner-cell-block-h", "name": "Prisoner: Cell Block H", "number": 189, "logo": "https://10.com.au/ip/s3/2022/09/26/b6430b0f79d6b4c9fc5c6ea295bbae03-1182444.png?image-profile=logo"},
    'mjh-acountrypractice-fast': {"id": "a-country-practice", "name": "A Country Practice", "number": 190, "logo": "https://i.mjh.nz/.images/auto-acountrypractice-fast-3f02ad.png"},
    'mjh-all-starcinema-fast': {"id": "all-star-cinema", "name": "All-Star Cinema", "number": 191, "logo": "https://i.mjh.nz/.images/auto-all-starcinema-fast-9f2397.png"},
    'mjh-10-moviesphere': {"id": "moviesphere", "name": "Moviesphere", "number": 192, "logo": "https://10.com.au/ip/s3/2022/12/05/6bb229de8fcf96e206e99ca455fc2267-1202912.png?image-profile=logo"},
    'mjh-10-seasonalmovies': {"id": "thriller-movies", "name": "Thriller Movies", "number": 193, "logo": "https://10.com.au/ip/s3/2024/04/01/86e45216ee9df7d873e393dccb379d94-1306209.png?image-profile=logo"},
    'mjh-lmn-fast': {"id": "lmn", "name": "LMN", "number": 194, "logo": "https://imageresizer.static9.net.au/pEZzrJfH9LZQzOaS0IYXJ0TGXjA=/768x0/https%3A%2F%2Fvms-tv-images-prod.s3-ap-southeast-2.amazonaws.com%2F2026%2F10%2F804379%2Fgroup-61765.png"},
    'mjh-10-spongebobsquarepants': {"id": "spongebob", "name": "SpongeBob SquarePants", "number": 195, "logo": "https://10.com.au/ip/s3/2024/05/27/ee4d9694aa3f7a2fe97b6f18aa773b88-1316803.png?image-profile=logo"},
    'mjh-10-nick-jr': {"id": "nick-jr", "name": "Nick Jr Club", "number": 196, "logo": "https://10.com.au/ip/s3/2024/06/06/d14509f218578984e3a6f6f34f0ee12c-1319009.png?image-profile=logo"},
    'mjh-10-nicktoons': {"id": "nicktoons", "name": "NickToons", "number": 197, "logo": "https://10.com.au/ip/s3/2024/06/04/f2f7c4166d8450351c2ae5d8b28c769e-1318512.png?image-profile=logo"},
    'mjh-c31': {"id": "channel-31", "name": "Channel 31", "number": 198, "logo": "https://i.mjh.nz/.images/c31.png"},
    'mjh-c44': {"id": "channel-44", "name": "Channel 44", "number": 199, "logo": "https://i.mjh.nz/.images/c44.png"},
    'mjh-tvsn-fast': {"id": "tvsn", "name": "TVSN", "number": 200, "logo": "https://i.mjh.nz/.images/auto-tvsn-fast-eda516.png"},
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
