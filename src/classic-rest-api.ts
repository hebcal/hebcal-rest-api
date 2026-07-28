import {HDate, gematriya, isoDateString} from '@hebcal/hdate';
import {Zmanim} from '@hebcal/core/dist/esm/zmanim';
import {Event, flags} from '@hebcal/core/dist/esm/event';
import {version} from '@hebcal/core/dist/esm/pkgVersion';
import {Locale} from '@hebcal/core/dist/esm/locale';
import {MoladEvent} from '@hebcal/core/dist/esm/molad';
import {OmerEvent} from '@hebcal/core/dist/esm/omer';
import {TachanunResult} from '@hebcal/core/dist/esm/tachanun';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {reformatTimeStr} from '@hebcal/core/dist/esm/reformatTimeStr';
import {tachanun} from '@hebcal/core/dist/esm/tachanun';
import {AliyotMap, Leyning, StringMap} from '@hebcal/leyning/dist/esm/types';
import {formatAliyahWithBook} from '@hebcal/leyning/dist/esm/common';
import {getLeyningForParshaHaShavua} from '@hebcal/leyning/dist/esm/leyning';
import {makeSummaryFromParts} from '@hebcal/leyning/dist/esm/summary';
import {getLeyningForHoliday} from '@hebcal/leyning/dist/esm/getLeyningForHoliday';
import {
  RestApiOptions,
  getCalendarTitle,
  getEventCategories,
  shouldRenderBrief,
} from './common.js';
import {appendIsraelAndTracking} from './url.js';
import {locationToPlainObj} from './location.js';
import type {LocationPlainObj} from './location.js';
import {getHolidayDescription} from './holiday.js';
import {holidayDesc as hdesc} from '@hebcal/core/dist/esm/staticHolidays';

/**
 * A single event as rendered for the classic Hebcal.com JSON API, as
 * produced by `eventToClassicApiObject()`
 */
export type ClassicApiItem = {
  /** rendered event title, e.g. `'Rosh Hashana'` or `'Candle lighting: 7:14pm'` */
  title: string;
  /** ISO 8601 date (or date+time, for timed events) */
  date: string;
  /** Hebrew date rendered as a string, omitted for timed events */
  hdate?: string;
  /** category, e.g. `'holiday'`, `'roshchodesh'`, `'candles'` (see `getEventCategories()`) */
  category: string;
  /** subcategory, e.g. `'major'`, `'minor'` */
  subcat?: string;
  /** `true` if this is a Yom Tov holiday */
  yomtov?: boolean;
  /** original (non-brief) event description, present when it differs from `title` */
  title_orig?: string;
  /** Hebrew rendering of the title (`he-x-NoNikud` locale, no vowel points) */
  hebrew?: string;
  /** Torah/Haftarah readings, when applicable */
  leyning?: StringMap;
  /** URL with tracking parameters appended, for events that have one (see `appendIsraelAndTracking()`) */
  link?: string;
  /** Sefirat HaOmer count details, present only for Omer-count events */
  omer?: {
    count: {
      he: string;
      en: string;
    };
    sefira: {
      he: string;
      translit: string;
      en: string;
    };
    anaBekoachWord: string;
    lamnatzeachWord: string;
    lamnatzeachLetter: string;
  };
  /** Molad (new moon) details, present only for Molad announcement events */
  molad?: {
    hy: number;
    hm: string;
    dow: number;
    hour: number;
    minutes: number;
    chalakim: number;
    instant: string;
  };
  /**
   * Hebrew date broken into gematriya-rendered parts, present when
   * `RestApiEventOptions.heDateParts` is set (or the event itself is a
   * Hebrew-date event)
   */
  heDateParts?: {
    y: string;
    m: string;
    d: string;
  };
  /** holiday description or linked-event text, when available */
  memo?: string;
  /** the underlying `Event` object, present only when `RestApiEventOptions.includeEvent` is set */
  ev?: Event;
};

/**
 * The classic Hebcal.com JSON API response envelope, as produced by
 * `eventsToClassicApiHeader()` and `eventsToClassicApi()`
 */
export type ClassicApiResult = {
  /** calendar title, see `getCalendarTitle()` */
  title: string;
  /** ISO 8601 timestamp of when this response was generated */
  date: string;
  /** `@hebcal/core` package version */
  version: string;
  location: LocationPlainObj;
  /** whether Tachanun is recited, present when `RestApiEventOptions.tachanun` is set and the range is a single day */
  tachanun?: TachanunResult;
  /** ISO 8601 start/end dates spanned by `items` */
  range?: {
    start: string;
    end: string;
  };
  /** the events, present when generated via `eventsToClassicApi()` */
  items?: ClassicApiItem[];
};

function eventIsoDate(ev: Event): string {
  return isoDateString(ev.greg());
}

/**
 * Formats a list of events for the classic Hebcal.com JSON API response,
 * including both the header fields and the `items` array.
 * @param events - the events to render
 * @param options - controls title, location, tracking, and per-item rendering
 * @param leyning - `false` to omit Torah/Haftarah readings from each item
 * @returns the full classic API response object
 */
export function eventsToClassicApi(
  events: Event[],
  options: RestApiOptions,
  leyning = true
): ClassicApiResult {
  const result = eventsToClassicApiHeader(events, options);
  result.items = events.map(ev =>
    eventToClassicApiObject(ev, options, leyning)
  );
  return result;
}

/**
 * Builds just the header fields (title, date, version, location, range,
 * tachanun) of the classic Hebcal.com JSON API response, without the
 * `items` array.
 * @param events - the events used to determine title and date range
 * @param options - controls title, location, and tachanun rendering
 * @returns the classic API response object, without `items`
 */
export function eventsToClassicApiHeader(
  events: Event[],
  options: RestApiOptions
): ClassicApiResult {
  const result: ClassicApiResult = {
    title: getCalendarTitle(events, options),
    date: new Date().toISOString(),
    version,
    location: locationToPlainObj(options.location),
  };
  if (events.length) {
    result.range = {
      start: eventIsoDate(events[0]),
      end: eventIsoDate(events[events.length - 1]),
    };
    if (options.tachanun && result.range.start === result.range.end) {
      result.tachanun = tachanun(events[0].getDate(), Boolean(options.il));
    }
  }
  return result;
}

/**
 * Converts a single Hebcal event to a classic Hebcal.com JSON API object
 * @param ev - the event to convert
 * @param options - controls locale, tracking parameters, and which optional
 *   fields (`heDateParts`, `ev`) are included
 * @param leyning - `false` to omit Torah/Haftarah readings
 * @returns the rendered API item
 */
export function eventToClassicApiObject(
  ev: Event,
  options: RestApiOptions,
  leyning = true
): ClassicApiItem {
  const timedEv = ev as TimedEvent;
  const eventTime: Date = timedEv.eventTime;
  const timed = Boolean(eventTime);
  const hd = ev.getDate();
  const dt = hd.greg();
  const tzid =
    typeof options.location === 'object' ? options.location.getTzid() : 'UTC';
  const date = timed
    ? Zmanim.formatISOWithTimeZone(tzid, eventTime)
    : isoDateString(dt);
  const categories = getEventCategories(ev);
  const mask = ev.getFlags();
  let title = shouldRenderBrief(ev)
    ? ev.renderBrief(options.locale)
    : ev.render(options.locale);
  const desc = ev.getDesc();
  const candles = desc === hdesc.HAVDALAH || desc === hdesc.CANDLE_LIGHTING;
  if (candles) {
    const time = reformatTimeStr(timedEv.eventTimeStr, 'pm', options);
    title += ': ' + time;
  }
  const result: Partial<ClassicApiItem> = {
    title: title,
    date: date,
  };
  if (!timed) {
    result.hdate = hd.toString();
  }
  result.category = categories[0];
  if (categories.length > 1) {
    result.subcat = categories[1];
  }
  if (categories[0] === 'holiday' && mask & flags.CHAG) {
    result.yomtov = true;
  }
  if (title !== desc) {
    result.title_orig = desc;
  }
  const hebrew = ev.renderBrief('he-x-NoNikud');
  if (hebrew) {
    result.hebrew = hebrew;
  }
  if (!candles) {
    if (leyning) {
      const il = options.il;
      const isParsha = mask === flags.PARSHA_HASHAVUA;
      const reading = isParsha
        ? getLeyningForParshaHaShavua(ev, il)
        : getLeyningForHoliday(ev, il);
      if (reading) {
        result.leyning = formatLeyningResult(reading);
      }
    }
    const url = ev.url();
    if (url) {
      let utmSource = options.utmSource;
      if (!utmSource) {
        const u = new URL(url);
        if (u.host === 'www.hebcal.com') {
          utmSource = 'js';
        }
      }
      const utmMedium = options.utmMedium || 'api';
      const utmCampaign = options.utmCampaign;
      result.link = appendIsraelAndTracking(
        url,
        Boolean(options.il),
        utmSource,
        utmMedium,
        utmCampaign
      );
    }
  }
  if (mask & flags.OMER_COUNT) {
    const omerEv = ev as OmerEvent;
    result.omer = {
      count: {
        he: omerEv.getTodayIs('he'),
        en: omerEv.getTodayIs('en'),
      },
      sefira: {
        he: omerEv.sefira('he'),
        translit: omerEv.sefira('translit'),
        en: omerEv.sefira('en'),
      },
      anaBekoachWord: omerEv.getAnaBekoachWord(),
      lamnatzeachWord: omerEv.getLamnatzeachWord(),
      lamnatzeachLetter: omerEv.getLamnatzeachLetter(),
    };
  }
  if (mask & flags.MOLAD) {
    const moladEv = ev as MoladEvent;
    const m = moladEv.molad;
    const hy = m.getYear();
    result.molad = {
      hy,
      hm: HDate.getMonthName(m.getMonth(), hy),
      dow: m.getDow(),
      hour: m.getHour(),
      minutes: m.getMinutes(),
      chalakim: m.getChalakim(),
      instant: m.getInstant().toInstant().toJSON(),
    };
    delete result.hebrew;
  }
  if ((options.heDateParts && !timed) || mask & flags.HEBREW_DATE) {
    const yy = hd.getFullYear();
    const mm = hd.getMonthName();
    const dd = hd.getDate();
    result.heDateParts = {
      y: gematriya(yy),
      m: Locale.gettext(mm, 'he-x-NoNikud'),
      d: gematriya(dd),
    };
  }
  const memo = ev.memo || getHolidayDescription(ev, false, options.locale);
  if (typeof memo === 'string' && memo.length !== 0) {
    result.memo = memo.normalize();
  } else if (timedEv.linkedEvent) {
    result.memo = timedEv.linkedEvent.render(options.locale);
  }
  if (options.includeEvent) {
    result.ev = ev;
  }
  return result as ClassicApiItem;
}

function formatAliyot(result: StringMap, aliyot: AliyotMap): StringMap {
  for (const [num, aliyah] of Object.entries(aliyot)) {
    if (aliyah) {
      const k = num === 'M' ? 'maftir' : num;
      result[k] = formatAliyahWithBook(aliyah);
    }
  }
  return result;
}

function formatReasons(result: StringMap, reason: StringMap): StringMap {
  for (const num of ['7', '8', 'M']) {
    if (reason[num]) {
      const k = num === 'M' ? 'maftir' : num;
      result[k] += ' | ' + reason[num];
    }
  }
  if (reason.haftara) {
    result.haftarah += ' | ' + reason.haftara;
  }
  if (reason.sephardic) {
    result.haftarah_sephardic += ' | ' + reason.sephardic;
  }
  if (reason.chabad) {
    result.haftarah_chabad += ' | ' + reason.chabad;
  }
  return result;
}

function formatLeyningResult(reading: Leyning): StringMap {
  const result: StringMap = {};
  if (reading.summary) {
    result.torah = reading.summary;
  }
  if (reading.haftara) {
    result.haftarah = reading.haftara;
  }
  if (reading.sephardic) {
    result.haftarah_sephardic = reading.sephardic;
  }
  if (reading.chabad) {
    result.haftarah_chabad = makeSummaryFromParts(reading.chabad);
  }
  if (reading.fullkriyah) {
    formatAliyot(result, reading.fullkriyah);
  }
  if (reading.reason) {
    formatReasons(result, reading.reason);
  }
  return result;
}
