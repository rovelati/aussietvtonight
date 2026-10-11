/**
 * EPG data fetching — SERVER-ONLY (Astro build time).
 *
 * Uses DATABASE_URL (PostgreSQL Contabo) if configured.
 * Fallback: src/data/epg-cache.json (Australian XMLTV snapshot).
 */
import pg from 'pg';
import { getChannelLogo } from '../utils/channelLogos';
import { normCid } from '../utils/channelSlug';
import { MAJOR_AU_ORDER } from '../utils/channelFilters';
import type { Channel, Program } from '../types';

// Import fallback data directly
import epgData from '../data/epg-cache.json';

const { Pool } = pg;

const databaseUrl = (import.meta.env.DATABASE_URL as string | undefined)?.trim() || '';

const pgPool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: Number(import.meta.env.POSTGRES_POOL_MAX ?? 4),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
    })
  : null;

async function pgQuery<T = any>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  if (!pgPool) throw new Error('DATABASE_URL not configured');
  const result = await pgPool.query(text, values);
  return result.rows as T[];
}

export async function fetchChannels(): Promise<Channel[]> {
  if (pgPool) {
    try {
      const rows = await pgQuery(
        `SELECT id, channel_id, name, logo_url, channel_number, category, stream_url, website_url
         FROM channels_au
         ORDER BY channel_number ASC NULLS LAST
         LIMIT 500`,
      );
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: normCid(r.channel_id),
          name: r.name,
          number: r.channel_number ?? 0,
          logo: getChannelLogo(normCid(r.channel_id), r.logo_url, r.name),
          type: 'Generalista',
          programs: [],
          visible: true,
          position: r.channel_number ?? 999,
          streamUrl: r.stream_url ?? undefined,
          website: r.website_url ?? undefined,
        }));
      }
    } catch (err) {
      console.warn('[epg.ts] PostgreSQL fetchChannels failed, using local cache:', err instanceof Error ? err.message : err);
    }
  }

  // Fallback: epg-cache.json
  if (epgData?.channels && epgData.channels.length > 0) {
    return epgData.channels.map((ch: any) => {
      const normId = normCid(ch.id);
      return {
        id: normId,
        name: ch.name,
        number: ch.number ?? 0,
        logo: getChannelLogo(normId, ch.logo, ch.name),
        type: 'Generalista',
        programs: [],
        visible: true,
        position: ch.number ?? 999,
      };
    });
  }

  return [];
}

export async function fetchProgramsForDate(dateStr: string): Promise<Program[]> {
  if (pgPool) {
    try {
      const rows = await pgQuery(
        `SELECT p.id, p.channel_id, p.title, p.sub_title, p.description, p.category,
                p.start_time, p.end_time, p.rating, p.image_url
         FROM programs_au p
         WHERE p.start_time >= $1::timestamptz - interval '12 hours'
           AND p.start_time <= $1::timestamptz + interval '36 hours'
         ORDER BY p.start_time ASC`,
        [dateStr]
      );
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: String(r.id),
          channel_id: normCid(r.channel_id),
          title: r.title,
          sub_title: r.sub_title,
          description: r.description ?? '',
          category: r.category ?? '',
          start_time: new Date(r.start_time).toISOString(),
          end_time: new Date(r.end_time).toISOString(),
          image_url: r.image_url,
          rating: r.rating,
        }));
      }
    } catch (err) {
      console.warn('[epg.ts] PostgreSQL fetchPrograms failed, using local cache:', err instanceof Error ? err.message : err);
    }
  }

  // Fallback: epg-cache.json
  if (epgData?.programs && epgData.programs.length > 0) {
    const targetDateStart = new Date(`${dateStr}T00:00:00Z`).getTime() - 12 * 3600 * 1000;
    const targetDateEnd = new Date(`${dateStr}T23:59:59Z`).getTime() + 14 * 3600 * 1000;

    return (epgData.programs as any[])
      .filter(p => {
        const t = new Date(p.start_time).getTime();
        return t >= targetDateStart && t <= targetDateEnd;
      })
      .map((p, idx) => ({
        id: `${p.channel_id}-${p.start_time}-${idx}`,
        channel_id: normCid(p.channel_id),
        title: p.title,
        sub_title: p.sub_title,
        description: p.description ?? '',
        category: p.category ?? '',
        start_time: p.start_time,
        end_time: p.end_time,
        image_url: p.image_url,
        rating: p.rating,
      }));
  }

  return [];
}
