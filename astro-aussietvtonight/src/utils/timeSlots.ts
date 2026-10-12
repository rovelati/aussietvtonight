/**
 * Australian Timezone & Time Slots Utility
 *
 * Australia Macro Timezones:
 * - AEST / AEDT (Australia/Sydney) - Sydney, Melbourne, Canberra, Hobart (AEDT UTC+11 in DST, AEST UTC+10)
 * - Brisbane (Australia/Brisbane) - AEST UTC+10 (No DST)
 * - ACST / ACDT (Australia/Adelaide) - Adelaide, Darwin (ACDT UTC+10:30 in DST, ACST UTC+9:30)
 * - AWST (Australia/Perth) - Perth (AWST UTC+8)
 *
 * Prime Time starts at 19:30 (7:30 PM)!
 */

export type AustralianCity = 'sydney' | 'melbourne' | 'brisbane' | 'adelaide' | 'perth';

export interface CityTimezoneInfo {
  id: AustralianCity;
  name: string;
  state: string;
  timezone: string;
  offsetHoursStandard: number;
}

export const AUSTRALIAN_CITIES: Record<AustralianCity, CityTimezoneInfo> = {
  sydney: { id: 'sydney', name: 'Sydney', state: 'NSW', timezone: 'Australia/Sydney', offsetHoursStandard: 10 },
  melbourne: { id: 'melbourne', name: 'Melbourne', state: 'VIC', timezone: 'Australia/Melbourne', offsetHoursStandard: 10 },
  brisbane: { id: 'brisbane', name: 'Brisbane', state: 'QLD', timezone: 'Australia/Brisbane', offsetHoursStandard: 10 },
  adelaide: { id: 'adelaide', name: 'Adelaide', state: 'SA', timezone: 'Australia/Adelaide', offsetHoursStandard: 9.5 },
  perth: { id: 'perth', name: 'Perth', state: 'WA', timezone: 'Australia/Perth', offsetHoursStandard: 8 },
};

export const DEFAULT_CITY: AustralianCity = 'sydney';

/**
 * Returns today's ISO date string (YYYY-MM-DD) for a given Australian timezone (defaults to Australia/Sydney).
 */
export function getTodayInAustralia(tz: string = 'Australia/Sydney'): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Returns tomorrow's ISO date string (YYYY-MM-DD) for a given Australian timezone.
 */
export function getTomorrowInAustralia(tz: string = 'Australia/Sydney'): string {
  const today = getTodayInAustralia(tz);
  const d = new Date(today + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Format date for Australian presentation, e.g. "Monday, 12 October"
 */
export function formatDateAU(dateStr: string, tz: string = 'Australia/Sydney'): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0));
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
}

/**
 * Format time to Australian standard (e.g., "7:30 PM" or "19:30")
 */
export function formatTimeAU(isoString: string, tz: string = 'Australia/Sydney'): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-AU', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-hour format: 19:30
    }).format(d);
  } catch {
    return '--:--';
  }
}

/**
 * Extract hour (0-23) in Australian timezone.
 */
export function getAustralianHour(isoString: string, tz: string = 'Australia/Sydney'): number {
  try {
    const d = new Date(isoString);
    const hourStr = new Intl.DateTimeFormat('en-AU', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    }).format(d);
    return parseInt(hourStr, 10) || 0;
  } catch {
    return 0;
  }
}

/**
 * Prime Time in Australia starts strictly at 19:30 (7:30 PM).
 * Check if a program airs in Prime Time (between 19:30 and 23:00, or overlaps with it).
 */
export function isAustralianPrimeTime(startIso: string, stopIso?: string, tz: string = 'Australia/Sydney'): boolean {
  try {
    const dStart = new Date(startIso);
    const hour = getAustralianHour(startIso, tz);
    const minStr = new Intl.DateTimeFormat('en-AU', { timeZone: tz, minute: 'numeric' }).format(dStart);
    const min = parseInt(minStr, 10) || 0;
    const timeInMinutes = hour * 60 + min;

    // 19:30 is 19*60 + 30 = 1170 minutes
    // Prime time window: 19:30 to 23:30 (1170 to 1410)
    if (timeInMinutes >= 1170 && timeInMinutes <= 1410) {
      return true;
    }

    // Overlap: started slightly before 19:30 (e.g. 19:00 movie/special) and ends after 20:00
    if (stopIso && timeInMinutes >= 1140) {
      const dStop = new Date(stopIso);
      const stopHour = getAustralianHour(stopIso, tz);
      if (stopHour >= 20 || dStop.getTime() > dStart.getTime() + 60 * 60 * 1000) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Checks whether a program falls within the broadcast day of targetDateStr (YYYY-MM-DD),
 * starting at 04:00 AM on targetDateStr and extending to 04:00 AM the following morning (overrun).
 */
export function isCurrentBroadcastDay(startIso: string, targetDateStr: string, tz: string = 'Australia/Sydney'): boolean {
  try {
    const d = new Date(startIso);
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);

    const hourStr = new Intl.DateTimeFormat('en-AU', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    }).format(d);
    const hour = parseInt(hourStr, 10) || 0;

    const targetParts = targetDateStr.split('-');
    const nextDateObj = new Date(Date.UTC(Number(targetParts[0]), Number(targetParts[1]) - 1, Number(targetParts[2]) + 1));
    const nextDateStr = nextDateObj.toISOString().slice(0, 10);

    // Current broadcast day: today from 04:00 onwards
    if (dateStr === targetDateStr) {
      return hour >= 4;
    }

    // Overrun: next morning before 04:00
    if (dateStr === nextDateStr) {
      return hour < 4;
    }

    return false;
  } catch {
    return false;
  }
}
