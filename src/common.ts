import {Event, flags} from '@hebcal/core/dist/esm/event';
import {CalOptions} from '@hebcal/core/dist/esm/CalOptions';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {HDate, isoDateString} from '@hebcal/hdate';
import {makeAnchor} from './makeAnchor';

export type StringMap = Record<string, string>;

export type RestApiEventOptions = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  appendHebrewToSubject?: boolean;
  yahrzeit?: boolean;
  subscribe?: string | number | boolean;
  heDateParts?: boolean;
  includeEvent?: boolean;
  euro?: boolean;
  title?: string;
  description?: string;
  dayFormat?: Intl.DateTimeFormat;
  mainUrl?: string;
  selfUrl?: string;
  buildDate?: Date;
  lastBuildDate?: string;
  evPubDate?: boolean;
  lang?: string;
  preferAsciiName?: boolean;
};

export type RestApiOptions = CalOptions & RestApiEventOptions;

export function getDownloadFilename(options: RestApiOptions): string {
  let fileName = 'hebcal';
  if (options.year) {
    fileName += '_' + options.year;
    if (options.isHebrewYear) {
      fileName += 'h';
    }
    if (options.month) {
      fileName += '_' + options.month;
    }
  } else if (
    typeof options.start === 'object' &&
    typeof options.end === 'object'
  ) {
    const start = new HDate(options.start);
    const end = new HDate(options.end);
    const y1 = start.greg().getFullYear();
    const y2 = end.greg().getFullYear();
    if (y1 === y2) {
      fileName += '_' + y1;
    } else {
      fileName += '_' + y1 + '_' + y2;
    }
  }
  if (typeof options.location === 'object') {
    const loc = options.location as any;
    const name = loc.zip || loc.asciiname || loc.getShortName() || '';
    if (name) {
      fileName += '_' + makeAnchor(name).replace(/[-]/g, '_');
    }
  }
  return fileName;
}

/**
 * Returns just the date portion as YYYY-MM-DD
 * @deprecated use `isoDateString` instead
 */
export function toISOString(d: Date): string {
  return isoDateString(d);
}

/**
 * Returns a category and subcategory name
 */
export function getEventCategories(ev: Event): string[] {
  const desc = ev.getDesc();
  if (desc === 'Purim' || desc === 'Erev Purim') {
    return ['holiday', 'major'];
  }
  return ev.getCategories();
}

/**
 * Renders the event title in default locale, but strips off time
 * @deprecated
 */
export function renderTitleWithoutTime(ev: Event, locale?: string): string {
  return typeof (ev as TimedEvent).eventTime === 'undefined'
    ? ev.render(locale)
    : ev.renderBrief(locale);
}

function shortLocationName(options: RestApiOptions): string | null {
  const loc = options.location;
  if (!loc) {
    return null;
  }
  if (options.preferAsciiName) {
    const asciiname = (loc as any).asciiname;
    if (typeof asciiname === 'string') {
      return asciiname;
    }
  }
  return loc.getShortName();
}

/**
 * Generates a title like "Hebcal 2020 Israel" or "Hebcal May 1993 Providence"
 */
export function getCalendarTitle(
  events: Event[],
  options: RestApiOptions
): string {
  let title = 'Hebcal';
  const locationName = shortLocationName(options);
  if (options.yahrzeit) {
    title += ' Yahrzeits and Anniversaries';
  } else if (locationName) {
    title += ' ' + locationName;
  } else if (options.il) {
    title += ' Israel';
  } else {
    title += ' Diaspora';
  }
  const sub = options.subscribe;
  if (sub === '1' || sub === 1 || sub === true) {
    return title;
  }
  if (options.year && (options.isHebrewYear || events.length === 0)) {
    title += ' ' + options.year;
  } else if (events.length) {
    const start = events[0].greg();
    const end = events[events.length - 1].greg();
    if (start.getFullYear() !== end.getFullYear()) {
      title += ' ' + start.getFullYear() + '-' + end.getFullYear();
    } else if (start.getMonth() === end.getMonth()) {
      const monthFormat = new Intl.DateTimeFormat('en-US', {month: 'long'});
      const startMonth = monthFormat.format(start);
      title += ' ' + startMonth + ' ' + start.getFullYear();
    } else {
      title += ' ' + start.getFullYear();
    }
  }
  return title;
}

/**
 * Bitmask for learning events (Daf Yomi, Nach Yomi, Mishna Yomi, Daily Learning, Yerushalmi Yomi)
 */
export const LEARNING_MASK =
  flags.DAF_YOMI |
  flags.NACH_YOMI |
  flags.MISHNA_YOMI |
  flags.DAILY_LEARNING |
  flags.YERUSHALMI_YOMI;

export function shouldRenderBrief(ev: Event): boolean {
  if (typeof (ev as TimedEvent).eventTime !== 'undefined') {
    return true;
  }
  const mask = ev.getFlags();
  if (mask & flags.HEBREW_DATE) {
    const hd = ev.getDate();
    return hd.getDate() !== 1;
  } else if (mask & (LEARNING_MASK | flags.SHABBAT_MEVARCHIM)) {
    return true;
  } else if (
    mask & flags.MINOR_FAST &&
    ev.getDesc().substring(0, 16) === 'Yom Kippur Katan'
  ) {
    return true;
  } else {
    return false;
  }
}
