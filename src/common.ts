import {Event, flags} from '@hebcal/core/dist/esm/event';
import {CalOptions} from '@hebcal/core/dist/esm/CalOptions';
import {Location} from '@hebcal/core/dist/esm/location';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {HDate, isoDateString} from '@hebcal/hdate';
import {getLeyningForParshaHaShavua} from '@hebcal/leyning/dist/esm/leyning';
import {getLeyningForHoliday} from '@hebcal/leyning/dist/esm/getLeyningForHoliday';
import countryNames0 from './countryNames.json';
import holidayDescription0 from './holidays.json';
import {shortenSedrotUrl} from './shorten';
import {makeAnchor} from './makeAnchor';

export interface StringMap {
  [key: string]: string;
}

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

/**
 * Location information
 */
export type LocationPlainObj = {
  title?: string | null;
  city?: string | null;
  tzid?: string;
  latitude?: number;
  longitude?: number;
  cc?: string;
  country?: string;
  admin1?: string;
  asciiname?: string;
  geo?: string;
  zip?: string;
  state?: string;
  stateName?: string;
  geonameid?: number;
};

const LOC_FIELDS = [
  'elevation',
  'admin1',
  'asciiname',
  'geo',
  'zip',
  'state',
  'stateName',
  'geonameid',
];

export const holidayDescription: StringMap = holidayDescription0 as StringMap;
export const countryNames: StringMap = countryNames0 as StringMap;

/**
 * Converts a @hebcal/core `Location` to a plain JS object.
 */
export function locationToPlainObj(
  location: Location | undefined
): LocationPlainObj {
  if (
    typeof location === 'object' &&
    location !== null &&
    typeof location.getLatitude === 'function'
  ) {
    const cc: string = location.getCountryCode()!;
    const o: LocationPlainObj = {
      title: location.getName(),
      city: location.getShortName(),
      tzid: location.getTzid(),
      latitude: location.getLatitude(),
      longitude: location.getLongitude(),
      cc: cc,
      country: countryNames[cc],
    };
    for (const k of LOC_FIELDS) {
      const val = (location as any)[k];
      if (val) {
        (o as any)[k] = val;
      }
    }
    return o;
  } else {
    return {geo: 'none'};
  }
}

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
    const name = loc.zip || loc.asciiname || loc.getShortName();
    if (name) {
      fileName += '_' + makeAnchor(name).replace(/[-]/g, '_');
    }
  }
  return fileName;
}

/**
 * Returns just the date portion as YYYY-MM-DD
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
 */
export function renderTitleWithoutTime(ev: Event): string {
  return typeof (ev as TimedEvent).eventTime === 'undefined'
    ? ev.render()
    : ev.renderBrief();
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
    const start = events[0].getDate().greg();
    const end = events[events.length - 1].getDate().greg();
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
 * Returns an English language description of the holiday
 */
export function getHolidayDescription(
  ev: Event,
  firstSentence = false
): string {
  const str0 =
    ev.getFlags() & flags.SHABBAT_MEVARCHIM
      ? holidayDescription['Shabbat Mevarchim Chodesh']
      : holidayDescription[ev.getDesc()] ||
        holidayDescription[ev.basename()] ||
        '';
  const str = str0.normalize();
  if (firstSentence && str) {
    const dot = str.indexOf('.');
    if (dot !== -1) {
      return str.substring(0, dot);
    }
  }
  return str;
}

const HOLIDAY_IGNORE_MASK =
  flags.DAF_YOMI |
  flags.OMER_COUNT |
  flags.SHABBAT_MEVARCHIM |
  flags.MOLAD |
  flags.USER_EVENT |
  flags.NACH_YOMI |
  flags.DAILY_LEARNING |
  flags.HEBREW_DATE |
  flags.YERUSHALMI_YOMI;

/**
 * Makes mulit-line text that summarizes Torah & Haftarah
 */
export function makeTorahMemoText(ev: Event, il: boolean): string {
  const mask = ev.getFlags();
  if (
    mask & HOLIDAY_IGNORE_MASK ||
    typeof (ev as TimedEvent).eventTime !== 'undefined'
  ) {
    return '';
  }
  const reading =
    mask & flags.PARSHA_HASHAVUA
      ? getLeyningForParshaHaShavua(ev, il)
      : getLeyningForHoliday(ev, il);
  let memo = '';
  if (reading && (reading.summary || reading.haftara)) {
    if (reading.summary) {
      memo += `Torah: ${reading.summary}`;
    }
    if (reading.summary && reading.haftara) {
      memo += '\n';
    }
    if (reading.haftara) {
      memo += 'Haftarah: ' + reading.haftara;
      if (reading.reason?.haftara) {
        memo += ' | ' + reading.reason.haftara;
      }
    }
  }
  if (reading?.sephardic) {
    memo += '\nHaftarah for Sephardim: ' + reading.sephardic;
  }
  return memo;
}

export function makeMemo(ev: Event, il: boolean): string {
  if (ev.getFlags() & flags.PARSHA_HASHAVUA) {
    try {
      const memo = makeTorahMemoText(ev, il);
      if (memo) {
        return memo;
      }
    } catch (err) {
      // fallthru
    }
  }
  if (ev.memo) {
    return ev.memo;
  }
  return getHolidayDescription(ev);
}

/**
 * Appends utm_source and utm_medium parameters to a URL
 */
export function appendIsraelAndTracking(
  url: string,
  il: boolean,
  utmSource: string,
  utmMedium: string,
  utmCampaign?: string
): string {
  const u = new URL(url);
  const isHebcal = u.host === 'www.hebcal.com';
  if (isHebcal) {
    if (il) {
      u.searchParams.set('i', 'on');
    }
    const path = u.pathname;
    const isHolidays = path.startsWith('/holidays/');
    const isSedrot = path.startsWith('/sedrot/');
    const isOmer = path.startsWith('/omer/');
    if (isHolidays || isSedrot || isOmer) {
      u.host = 'hebcal.com';
      if (isHolidays) {
        u.pathname = '/h/' + path.substring(10);
      } else if (isSedrot) {
        shortenSedrotUrl(u);
      } else {
        // isOmer
        u.pathname = '/o/' + path.substring(6);
      }
      if (
        !utmCampaign ||
        !(utmCampaign.startsWith('ical-') || utmCampaign.startsWith('pdf-'))
      ) {
        if (utmSource) {
          u.searchParams.set('us', utmSource);
        }
        if (utmMedium) {
          u.searchParams.set('um', utmMedium);
        }
      }
      if (utmCampaign) {
        u.searchParams.set('uc', utmCampaign);
      }
      return u.toString();
    }
  }
  utmSource = isHebcal ? utmSource : 'hebcal.com';
  if (utmSource) {
    u.searchParams.set('utm_source', utmSource);
  }
  if (utmMedium) {
    u.searchParams.set('utm_medium', utmMedium);
  }
  if (utmCampaign) {
    u.searchParams.set('utm_campaign', utmCampaign);
  }
  return u.toString();
}

export function shouldRenderBrief(ev: Event): boolean {
  if (typeof (ev as TimedEvent).eventTime !== 'undefined') {
    return true;
  }
  const mask = ev.getFlags();
  if (mask & flags.HEBREW_DATE) {
    const hd = ev.getDate();
    return hd.getDate() === 1 ? false : true;
  } else if (
    mask &
    (flags.DAILY_LEARNING | flags.DAF_YOMI | flags.YERUSHALMI_YOMI)
  ) {
    return true;
  } else if (
    mask & flags.MINOR_FAST &&
    ev.getDesc().substring(0, 16) === 'Yom Kippur Katan'
  ) {
    return true;
  } else if (mask & flags.SHABBAT_MEVARCHIM) {
    return true;
  } else {
    return false;
  }
}
