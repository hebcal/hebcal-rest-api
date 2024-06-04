import {HDate, Locale, flags, HebrewCalendar, Zmanim, gematriya} from '@hebcal/core';
import {formatAliyahWithBook, getLeyningForHoliday,
  getLeyningForParshaHaShavua} from '@hebcal/leyning';
import {getTriennialForParshaHaShavua} from '@hebcal/triennial';
import {
  getCalendarTitle,
  getEventCategories,
  toISOString,
  appendIsraelAndTracking,
  shouldRenderBrief,
  locationToPlainObj,
} from './common.js';
import holidayDescription from './holidays.json.js';

/**
 * @private
 * @param {Event} ev
 * @return {string}
 */
function eventIsoDate(ev) {
  return toISOString(ev.getDate().greg());
}

/**
 * Formats a list events for the classic Hebcal.com JSON API response
 * @param {Event[]} events
 * @param {CalOptions} options
 * @param {boolean} [leyning=true]
 * @return {Object}
 */
export function eventsToClassicApi(events, options, leyning=true) {
  const result = {
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
  result.items = events.map((ev) => eventToClassicApiObject(ev, options, leyning));
  return result;
}

/**
 * Converts a Hebcal event to a classic Hebcal.com JSON API object
 * @param {Event} ev
 * @param {CalOptions} options
 * @param {boolean} [leyning=true]
 * @return {Object}
 */
export function eventToClassicApiObject(ev, options, leyning=true) {
  const timed = Boolean(ev.eventTime);
  const hd = ev.getDate();
  const dt = hd.greg();
  const tzid = typeof options.location === 'object' ? options.location.getTzid() : 'UTC';
  const date = timed ?
    Zmanim.formatISOWithTimeZone(tzid, ev.eventTime) :
    toISOString(dt);
  const categories = getEventCategories(ev);
  const mask = ev.getFlags();
  let title = shouldRenderBrief(ev) ? ev.renderBrief(options.locale) : ev.render(options.locale);
  const desc = ev.getDesc();
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
  if (candles) {
    const time = HebrewCalendar.reformatTimeStr(ev.eventTimeStr, 'pm', options);
    title += ': ' + time;
  }
  const result = {
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
  if (categories[0] === 'holiday' && (mask & flags.CHAG)) {
    result.yomtov = true;
  }
  if (title != desc) {
    result.title_orig = desc;
  }
  const hebrew = ev.renderBrief('he');
  if (hebrew) {
    result.hebrew = Locale.hebrewStripNikkud(hebrew);
  }
  if (!candles) {
    if (leyning) {
      const il = options.il;
      const isParsha = (mask === flags.PARSHA_HASHAVUA);
      const reading = isParsha ?
        getLeyningForParshaHaShavua(ev, il) :
        getLeyningForHoliday(ev, il);
      if (reading) {
        result.leyning = formatLeyningResult(reading);
        const hyear = hd.getFullYear();
        if (isParsha && !il && hyear >= 5745) {
          const triReading = getTriennialForParshaHaShavua(ev);
          if (triReading) {
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
      result.link = appendIsraelAndTracking(url, options.il,
          utmSource, utmMedium, utmCampaign);
    }
  }
  if (mask & flags.OMER_COUNT) {
    result.omer = {
      count: {
        he: ev.getTodayIs('he'),
        en: ev.getTodayIs('en'),
      },
      sefira: {
        he: ev.sefira('he'),
        translit: ev.sefira('translit'),
        en: ev.sefira('en'),
      },
    };
  }
  if (mask & flags.MOLAD) {
    const m = ev.molad;
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
  if ((options.heDateParts && !timed) || (mask & flags.HEBREW_DATE)) {
    const yy = hd.getFullYear();
    const mm = hd.getMonthName();
    const dd = hd.getDate();
    result.heDateParts = {
      y: gematriya(yy),
      m: Locale.gettext(mm, 'he-x-NoNikud'),
      d: gematriya(dd),
    };
  }
  const memo = ev.memo || holidayDescription[ev.basename()];
  if (typeof memo === 'string' && memo.length !== 0) {
    result.memo = memo.normalize();
  } else if (typeof ev.linkedEvent !== 'undefined') {
    result.memo = ev.linkedEvent.render(options.locale);
  }
  if (options.includeEvent) {
    result.ev = ev;
  }
  return result;
}

/**
 * @param {Object} result
 * @param {Object} aliyot
 * @return {Object}
 */
function formatAliyot(result, aliyot) {
  for (const [num, aliyah] of Object.entries(aliyot)) {
    if (typeof aliyah !== 'undefined') {
      const k = num == 'M' ? 'maftir' : num;
      result[k] = formatAliyahWithBook(aliyah);
    }
  }
  return result;
}

/**
 * @param {Leyning} reading
 * @return {Object}
 */
function formatLeyningResult(reading) {
  const result = {};
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
    for (const num of ['7', '8', 'M']) {
      if (reading.reason[num]) {
        const k = num == 'M' ? 'maftir' : num;
        result[k] += ' | ' + reading.reason[num];
      }
    }
    if (reading.reason.haftara) {
      result.haftarah += ' | ' + reading.reason.haftara;
    }
  }
  return result;
}
