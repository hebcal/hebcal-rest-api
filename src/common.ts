import {Event, flags} from '@hebcal/core/dist/esm/event';
import {CalOptions} from '@hebcal/core/dist/esm/CalOptions';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {HDate} from '@hebcal/hdate';
import {makeAnchor} from './makeAnchor.js';
import {Location} from '@hebcal/core/dist/esm/location';

/**
 * A simple string-to-string dictionary
 */
export type StringMap = Record<string, string>;

/**
 * Options specific to rendering events for the REST API, as opposed to
 * options in `CalOptions` that control which events are generated
 */
export type RestApiEventOptions = {
  /**
   * value for the `utm_source` (or hebcal.com-internal `us`) tracking
   * parameter appended to event links
   */
  utmSource?: string;
  /**
   * value for the `utm_medium` (or hebcal.com-internal `um`) tracking
   * parameter appended to event links (default `'api'`)
   */
  utmMedium?: string;
  /**
   * value for the `utm_campaign` (or hebcal.com-internal `uc`) tracking
   * parameter appended to event links
   */
  utmCampaign?: string;
  /**
   * include a `tachanun` field in the classic API response describing
   * whether Tachanun is recited (only applies when the result covers a
   * single day)
   */
  tachanun?: boolean;
  /**
   * append the Hebrew rendering of the event title to the CSV subject line
   */
  appendHebrewToSubject?: boolean;
  /**
   * `true` if this calendar is a Yahrzeit/Anniversary calendar; changes the
   * generated calendar title
   */
  yahrzeit?: boolean;
  /**
   * `true`, `'1'`, or `1` marks this calendar as a recurring subscription
   * (e.g. a webcal feed); suppresses the year from the generated calendar
   * title since the feed is perpetually up to date
   */
  subscribe?: string | number | boolean;
  /**
   * include a `heDateParts` field (Hebrew year/month/day rendered with
   * `gematriya`) on each classic API event
   */
  heDateParts?: boolean;
  /**
   * include the underlying `Event` object as the `ev` field on each
   * classic API event
   */
  includeEvent?: boolean;
  /**
   * render CSV dates as `DD/MM/YYYY` (European order) instead of the
   * default `MM/DD/YYYY`
   */
  euro?: boolean;
  /**
   * prefer a location's ASCII name over its short display name when
   * generating a calendar title or download filename
   */
  preferAsciiName?: boolean;
};

/**
 * Combines `@hebcal/core`'s `CalOptions` (which control which events are
 * generated) with `RestApiEventOptions` (which control how events are
 * rendered by this package)
 */
export type RestApiOptions = CalOptions & RestApiEventOptions;

/**
 * Generates a base filename (without extension) for a calendar download,
 * incorporating the year, date range, and/or location as available.
 * @param options - the year/date-range/location used to construct the
 *   filename; typically the same options passed to the calendar generator
 * @returns a filename like `hebcal_2020` or `hebcal_1993_providence`
 */
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
    const loc = options.location as Location;
    const name = loc.zip || loc.asciiname || loc.getShortName() || '';
    if (name) {
      fileName += '_' + makeAnchor(name).replaceAll(/[-]/g, '_');
    }
  }
  return fileName;
}

/**
 * Returns a category and subcategory name for an event, e.g.
 * `['holiday', 'major']` or `['roshchodesh']`.
 * @param ev - the event to categorize
 * @returns an array of 1 or 2 category strings
 */
export function getEventCategories(ev: Event): string[] {
  const s = ev.getDesc();
  if (s === 'Purim' || s === 'Erev Purim' || s.startsWith('Chanukah: ')) {
    return ['holiday', 'major'];
  }
  return ev.getCategories();
}

function shortLocationName(options: RestApiOptions): string | null {
  const loc = options.location as Location;
  if (!loc) {
    return null;
  }
  if (options.preferAsciiName) {
    const asciiname = loc.asciiname;
    if (typeof asciiname === 'string') {
      return asciiname;
    }
  }
  return loc.getShortName();
}

/**
 * Generates a title like "Hebcal 2020 Israel" or "Hebcal May 1993 Providence"
 * @param events - the events in the calendar, used to determine the date
 *   range shown in the title
 * @param options - controls location name, `il`/Diaspora, and whether this
 *   is a Yahrzeit calendar or a subscription (see `RestApiEventOptions`)
 * @returns the generated calendar title
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

/**
 * Determines whether an event's title should be rendered with `Event.renderBrief()`
 * instead of `Event.render()` — for example timed events, non-1st-of-month
 * Hebrew date events, learning-schedule events, Shabbat Mevarchim, and Yom
 * Kippur Katan.
 * @param ev - the event to check
 * @returns `true` if the brief rendering should be used
 */
export function shouldRenderBrief(ev: Event): boolean {
  if ((ev as TimedEvent).eventTime !== undefined) {
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
    ev.getDesc().startsWith('Yom Kippur Katan')
  ) {
    return true;
  } else {
    return false;
  }
}
