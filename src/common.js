import {flags, Zmanim} from '@hebcal/core';
import * as leyning from '@hebcal/leyning';
import holidayDescription from './holidays.json';

/**
 * Helper function to transform a string to make it more usable in a URL or filename.
 * Converts to lowercase and replaces non-word characters with hyphen ('-').
 * @example
 * makeAnchor('Rosh Chodesh Adar II') // 'rosh-chodesh-adar-ii'
 * @param {string} s
 * @return {string}
 */
export function makeAnchor(s) {
  return s.toLowerCase()
      .replace(/'/g, '')
      .replace(/[^\w]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-/g, '')
      .replace(/-$/g, '');
}

/**
 * @param {HebrewCalendar.Options} options
 * @return {string}
 */
export function getDownloadFilename(options) {
  let fileName = 'hebcal_' + options.year;
  if (options.isHebrewYear) {
    fileName += 'H';
  }
  if (options.month) {
    fileName += '_' + options.month;
  }
  if (options.location) {
    const name = options.location.zip || options.location.asciiname || options.location.getShortName();
    fileName += '_' + name.replace(/[^A-Za-z0-9]/g, '_');
  }
  return fileName;
}

/**
 * @param {number} number
 * @return {string}
 */
export function pad2(number) {
  if (number < 10) {
    return '0' + number;
  }
  return String(number);
}

/**
 * @param {number} number
 * @return {string}
 */
export function pad4(number) {
  if (number < 0) {
    return '-00' + pad4(-number);
  } else if (number < 10) {
    return '000' + number;
  } else if (number < 100) {
    return '00' + number;
  } else if (number < 1000) {
    return '0' + number;
  }
  return String(number);
}

/**
 * Get offset string (like "+05:00" or "-08:00") from tzid (like "Europe/Moscow")
 * @deprecated
 * @param {string} tzid
 * @param {Date} date
 * @return {string}
 */
export function timeZoneOffsetStr(tzid, date) {
  return Zmanim.timeZoneOffset(tzid, date);
}

/**
 * Returns just the date portion as YYYY-MM-DD
 * @param {Date} d
 * @return {string}
 */
export function toISOString(d) {
  return pad4(d.getFullYear()) + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/**
 * Returns a string like "2018-09-01T12:30:00-05:00"
 * @deprecated
 * @param {Date} date
 * @param {string} timeStr must be formatted with only hours and minutes, like "17:12"
 * @param {string} tzid like "America/New_York"
 * @return {string}
 */
export function toISOStringWithTimezone(date, timeStr, tzid) {
  const str = toISOString(date);
  if (!timeStr) return str;
  return str + 'T' + timeStr + ':00' + Zmanim.timeZoneOffset(tzid, date);
}

/**
 * Returns a category and subcategory name
 * @param {Event} ev
 * @return {string[]}
 */
export function getEventCategories(ev) {
  const desc = ev.getDesc();
  // since these use flags.MINOR_FAST or flags.MAJOR_FAST, check description first
  if (desc === 'Fast begins' || desc === 'Fast ends') {
    return ['zmanim', 'fast'];
  }
  switch (ev.getFlags()) {
    case flags.OMER_COUNT: return ['omer'];
    case flags.HEBREW_DATE: return ['hebdate'];
    case flags.PARSHA_HASHAVUA: return ['parashat']; // backwards-compat
    case flags.DAF_YOMI: return ['dafyomi'];
    case flags.ROSH_CHODESH: return ['roshchodesh'];
    case flags.SPECIAL_SHABBAT: return ['holiday', 'shabbat'];
    case flags.MINOR_FAST: return ['holiday', 'fast'];
    case flags.MAJOR_FAST: return ['holiday', 'fast', 'major'];
    case flags.MODERN_HOLIDAY: return ['holiday', 'modern'];
    case flags.SHABBAT_MEVARCHIM: return ['mevarchim'];
    case flags.MOLAD: return ['molad'];
    case flags.USER_EVENT: return ['user'];
    default:
      break; // fall through to string-based category
  }
  if (ev.cholHaMoedDay) {
    return ['holiday', 'major', 'cholhamoed'];
  }
  switch (desc) {
    case 'Havdalah':
      return ['havdalah'];
    case 'Candle lighting':
      return ['candles'];
    case 'Lag BaOmer':
    case 'Leil Selichot':
    case 'Pesach Sheni':
    case 'Purim Katan':
    case 'Shushan Purim':
    case 'Tu B\'Av':
    case 'Tu BiShvat':
      return ['holiday', 'minor'];
    default:
      return ['holiday', 'major'];
  }
}

/**
 * Renders the event title in default locale, but strips off time
 * @param {Event} ev
 * @return {string}
 */
export function renderTitleWithoutTime(ev) {
  return typeof ev.eventTime === 'undefined' ? ev.render() : ev.renderBrief();
}

/**
 * Generates a title like "Hebcal 2020 Israel" or "Hebcal May 1993 Providence"
 * @param {Event[]} events
 * @param {HebrewCalendar.Options} options
 * @return {string}
 */
export function getCalendarTitle(events, options) {
  let title = 'Hebcal';
  const location = options.location;
  if (options.yahrzeit) {
    title += ' Yahrzeits and Anniversaries';
  } else if (location && location.name) {
    const comma = location.name.indexOf(',');
    const name = (comma == -1) ? location.name : location.name.substring(0, comma);
    title += ' ' + name;
  } else if (options.il) {
    title += ' Israel';
  } else {
    title += ' Diaspora';
  }
  if (options.isHebrewYear || events.length == 0) {
    title += ' ' + options.year;
  } else {
    const start = events[0].getDate().greg();
    const end = events[events.length - 1].getDate().greg();
    if (start.getFullYear() != end.getFullYear()) {
      title += ' ' + start.getFullYear() + '-' + end.getFullYear();
    } else if (start.getMonth() == end.getMonth()) {
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
 * @param {Event} ev
 * @param {boolean} [firstSentence=false]
 * @return {string}
 */
export function getHolidayDescription(ev, firstSentence=false) {
  const str = holidayDescription[ev.getDesc()] || holidayDescription[ev.basename()] || '';
  if (firstSentence && str) {
    const dot = str.indexOf('.');
    if (dot != -1) {
      return str.substring(0, dot);
    }
  }
  return str;
}

const HOLIDAY_IGNORE_MASK = flags.DAF_YOMI | flags.OMER_COUNT |
  flags.SHABBAT_MEVARCHIM | flags.MOLAD | flags.USER_EVENT |
  flags.HEBREW_DATE;

/**
 * Makes mulit-line text that summarizes Torah & Haftarah
 * @param {Event} ev
 * @param {boolean} il
 * @return {string}
 */
export function makeTorahMemoText(ev, il) {
  const mask = ev.getFlags();
  if (mask & HOLIDAY_IGNORE_MASK) {
    return '';
  }
  let reading;
  let memo = '';
  if (mask & flags.PARSHA_HASHAVUA) {
    reading = leyning.getLeyningForParshaHaShavua(ev, il);
    memo = `Torah: ${reading.summary}`;
    if (reading.reason) {
      ['7', 'M'].forEach((num) => {
        const special = reading.reason[num];
        if (special) {
          const aname = num === '7' ? '7th aliyah' : 'Maftir';
          const verses = leyning.formatAliyahWithBook(reading.fullkriyah[num]);
          memo += `\n${aname}: ${verses} | ${special}`;
        }
      });
    }
    if (reading.haftara) {
      memo += '\nHaftarah: ' + reading.haftara;
      if (reading.reason && reading.reason.haftara) {
        memo += ' | ' + reading.reason.haftara;
      }
    }
  } else {
    reading = leyning.getLeyningForHoliday(ev, il);
    if (reading && (reading.summary || reading.haftara)) {
      if (reading.summary) {
        memo += `Torah: ${reading.summary}`;
      }
      if (reading.summary && reading.haftara) {
        memo += '\n';
      }
      if (reading.haftara) {
        memo += 'Haftarah: ' + reading.haftara;
      }
      return memo;
    }
  }
  if (reading && reading.sephardic) {
    memo += '\nHaftarah for Sephardim: ' + reading.sephardic;
  }
  return memo;
}

/**
 * @private
 * @param {string} url
 * @param {boolean} il
 * @param {string} utmSource
 * @param {string} utmMedium
 * @return {string}
 */
export function appendIsraelAndTracking(url, il, utmSource, utmMedium) {
  if (url.substring(0, 22) !== 'https://www.hebcal.com') {
    utmSource = 'hebcal.com';
  } else if (il && url.indexOf('?') === -1) {
    url += '?i=on';
  }
  const sep = url.indexOf('?') === -1 ? '?' : '&';
  const utm = `utm_source=${utmSource}&utm_medium=${utmMedium}`;
  return url + sep + utm;
}
