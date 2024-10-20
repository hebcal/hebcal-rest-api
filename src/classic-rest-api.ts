import {
  Event,
  HDate,
  HebrewCalendar,
  Locale,
  MoladEvent,
  OmerEvent,
  TimedEvent,
  Zmanim,
  flags,
  gematriya,
} from '@hebcal/core';
import {isoDateString} from '@hebcal/hdate';
import {
  AliyotMap,
  Leyning,
  StringMap,
  formatAliyahWithBook,
  getLeyningForHoliday,
  getLeyningForParshaHaShavua,
} from '@hebcal/leyning';
import {getTriennialForParshaHaShavua} from '@hebcal/triennial';
import {
  RestApiOptions,
  appendIsraelAndTracking,
  getCalendarTitle,
  getEventCategories,
  getHolidayDescription,
  locationToPlainObj,
  shouldRenderBrief,
} from './common';

function eventIsoDate(ev: Event): string {
  return isoDateString(ev.getDate().greg());
}

/**
 * Formats a list events for the classic Hebcal.com JSON API response
 */
export function eventsToClassicApi(
  events: Event[],
  options: RestApiOptions,
  leyning = true
): any {
  const result: any = {
    title: getCalendarTitle(events, options),
    date: new Date().toISOString(),
  };
  result.location = locationToPlainObj(options.location);
  if (events.length) {
    result.range = {
      start: eventIsoDate(events[0]),
      end: eventIsoDate(events[events.length - 1]),
    };
  }
  result.items = events.map(ev =>
    eventToClassicApiObject(ev, options, leyning)
  );
  return result;
}

/**
 * Converts a Hebcal event to a classic Hebcal.com JSON API object
 */
export function eventToClassicApiObject(
  ev: Event,
  options: RestApiOptions,
  leyning = true
): any {
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
    const time = HebrewCalendar.reformatTimeStr(
      timedEv.eventTimeStr,
      'pm',
      options
    );
    title += ': ' + time;
  }
  const result: any = {
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
  const hebrew = ev.renderBrief('he');
  if (hebrew) {
    result.hebrew = Locale.hebrewStripNikkud(hebrew);
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
        const hyear = hd.getFullYear();
        if (isParsha && hyear >= 5745) {
          const triReading = getTriennialForParshaHaShavua(ev, il);
          if (triReading?.aliyot) {
            result.leyning.triennial = formatAliyot({}, triReading.aliyot);
          }
        }
      }
    }
    const url = ev.url();
    if (url) {
      const utmSource = options.utmSource || 'js';
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
  const memo = ev.memo || getHolidayDescription(ev);
  if (typeof memo === 'string' && memo.length !== 0) {
    result.memo = memo.normalize();
  } else if (typeof timedEv.linkedEvent !== 'undefined') {
    result.memo = timedEv.linkedEvent!.render(options.locale);
  }
  if (options.includeEvent) {
    result.ev = ev;
  }
  return result;
}

function formatAliyot(result: StringMap, aliyot: AliyotMap): StringMap {
  for (const [num, aliyah] of Object.entries(aliyot)) {
    if (typeof aliyah !== 'undefined') {
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
  if (reading.fullkriyah) {
    formatAliyot(result, reading.fullkriyah);
  }
  if (reading.reason) {
    formatReasons(result, reading.reason);
  }
  return result;
}
