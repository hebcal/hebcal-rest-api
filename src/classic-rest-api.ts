import {HDate, gematriya, isoDateString} from '@hebcal/hdate';
import {Zmanim} from '@hebcal/core/dist/esm/zmanim';
import {Event, flags} from '@hebcal/core/dist/esm/event';
import {version} from '@hebcal/core/dist/esm/pkgVersion';
import {Locale} from '@hebcal/core/dist/esm/locale';
import {MoladEvent, Molad} from '@hebcal/core/dist/esm/molad';
import {OmerEvent} from '@hebcal/core/dist/esm/omer';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {reformatTimeStr} from '@hebcal/core/dist/esm/reformatTimeStr';
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
} from './common';
import {appendIsraelAndTracking} from './url';
import {locationToPlainObj} from './location';
import type {LocationPlainObj} from './location';
import {getHolidayDescription} from './holiday';

export type ClassicApiItem = {
  title: string;
  date: string;
  hdate?: string;
  category: string;
  subcat?: string;
  yomtov?: boolean;
  title_orig?: string;
  hebrew?: string;
  leyning?: StringMap;
  link?: string;
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
  molad?: {
    hy: number;
    hm: string;
    dow: number;
    hour: number;
    minutes: number;
    chalakim: number;
    hdate: string;
    instant: string;
  };
  heDateParts?: {
    y: string;
    m: string;
    d: string;
  };
  memo?: string;
  ev?: Event;
};

export type ClassicApiResult = {
  title: string;
  date: string;
  version: string;
  location: LocationPlainObj;
  range?: {
    start: string;
    end: string;
  };
  items?: ClassicApiItem[];
};

function eventIsoDate(ev: Event): string {
  return isoDateString(ev.greg());
}

/**
 * Formats a list events for the classic Hebcal.com JSON API response
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
  }
  return result;
}

/**
 * Converts a Hebcal event to a classic Hebcal.com JSON API object
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
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
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
    const m = moladEv.molad as Molad;
    const hy = m.getYear();
    result.molad = {
      hy,
      hm: HDate.getMonthName(m.getMonth(), hy),
      dow: m.getDow(),
      hour: m.getHour(),
      minutes: m.getMinutes(),
      chalakim: m.getChalakim(),
      hdate: m.getMoladDate().toString(),
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
