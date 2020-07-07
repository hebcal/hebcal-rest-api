import {getTimezoneOffset} from './getTimezoneOffset';
import {flags} from '@hebcal/core';
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
  if (options.location && options.location.name) {
    fileName += '_' + makeAnchor(options.location.name);
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
 * Get offset string (like "+05:00" or "-08:00") from tzid (like "Europe/Moscow")
 * @param {string} tzid
 * @param {Date} date
 * @return {string}
 */
export function timeZoneOffsetStr(tzid, date) {
  const offset = getTimezoneOffset(tzid, date);
  const offsetAbs = Math.abs(offset);
  const dir = Boolean(offset < 0);
  const hours = Math.floor(offsetAbs / 60);
  const minutes = offsetAbs % 60;
  return (dir ? '+' : '-') + pad2(hours) + ':' + pad2(minutes);
}

/**
 * Returns just the date portion as YYYY-MM-DD
 * @param {Date} d
 * @return {string}
 */
export function toISOString(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/**
 * Returns a string like "2018-09-01T12:30:00-05:00'"
 * @param {Date} date
 * @param {string} timeStr must be formatted with only hours and minutes, like "17:12"
 * @param {string} tzid like "America/New_York"
 * @return {string}
 */
export function toISOStringWithTimezone(date, timeStr, tzid) {
  const str = toISOString(date);
  if (!timeStr) return str;
  return str + 'T' + timeStr + ':00' + timeZoneOffsetStr(tzid, date);
}

/**
 * Returns a category and subcategory name
 * @param {Event} ev
 * @return {string[]}
 */
export function getEventCategories(ev) {
  switch (ev.getFlags()) {
    case flags.OMER_COUNT: return ['omer'];
    case flags.HEBREW_DATE: return ['hebdate'];
    case flags.PARSHA_HASHAVUA: return ['parashat']; // backwards-compat
    case flags.DAF_YOMI: return ['dafyomi'];
    case flags.ROSH_CHODESH: return ['roshchodesh'];
    case flags.SPECIAL_SHABBAT: return ['holiday', 'shabbat'];
    case flags.MINOR_FAST: return ['holiday', 'fast'];
    case flags.MODERN_HOLIDAY: return ['holiday', 'modern'];
    case flags.SHABBAT_MEVARCHIM: return ['mevarchim'];
    default:
      break; // fall through to string-based category
  }
  if (ev.getAttrs().cholHaMoedDay) {
    return ['holiday', 'major', 'cholhamoed'];
  }
  switch (ev.getDesc()) {
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
  if (options.isHebrewYear) {
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
