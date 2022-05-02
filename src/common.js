import {flags, Zmanim} from '@hebcal/core';
import * as leyning from '@hebcal/leyning';
import holidayDescription from './holidays.json';
import countryNames from './countryNames.json';

/**
 * @param {Location} location
 * @return {string}
 */
export function locationToPlainObj(location) {
  if (typeof location === 'object' && location !== null && typeof location.name === 'string') {
    const o = {
      title: location.getName(),
      city: location.getShortName(),
      tzid: location.getTzid(),
      latitude: location.getLatitude(),
      longitude: location.getLongitude(),
      cc: location.getCountryCode(),
      country: countryNames[location.getCountryCode()],
    };
    ['admin1', 'asciiname', 'geo', 'zip', 'state', 'stateName', 'geonameid'].forEach((k) => {
      if (location[k]) {
        o[k] = location[k];
      }
    });
    return o;
  } else {
    return {geo: 'none'};
  }
}

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
 * @param {CalOptions} options
 * @return {string}
 */
export function getDownloadFilename(options) {
  let fileName = 'hebcal_' + options.year;
  if (options.isHebrewYear) {
    fileName += 'h';
  }
  if (options.month) {
    fileName += '_' + options.month;
  }
  if (options.location) {
    const name = options.location.zip || options.location.asciiname || options.location.getShortName();
    fileName += '_' + makeAnchor(name).replace(/[-]/g, '_');
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
    case flags.MINOR_HOLIDAY: return ['holiday', 'minor'];
    case flags.MISHNA_YOMI: return ['mishnayomi'];
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
    case 'Erev Purim':
    case 'Purim Katan':
    case 'Shushan Purim':
    case 'Tu B\'Av':
    case 'Tu BiShvat':
    case 'Rosh Hashana LaBehemot':
      return ['holiday', 'minor'];
    case 'Erev Tish\'a B\'Av':
      return ['holiday', 'fast', 'major'];
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
 * @param {CalOptions} options
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
  if (options.subscribe == '1') {
    return title;
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
  const reading = (mask & flags.PARSHA_HASHAVUA) ?
    leyning.getLeyningForParshaHaShavua(ev, il) :
    leyning.getLeyningForHoliday(ev, il);
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
      if (reading.reason && reading.reason.haftara) {
        memo += ' | ' + reading.reason.haftara;
      }
    }
  }
  if (reading && reading.sephardic) {
    memo += '\nHaftarah for Sephardim: ' + reading.sephardic;
  }
  return memo;
}

/**
 * Appends utm_source and utm_medium parameters to a URL
 * @param {string} url
 * @param {boolean} il
 * @param {string} utmSource
 * @param {string} utmMedium
 * @param {string} utmCampaign
 * @return {string}
 */
export function appendIsraelAndTracking(url, il, utmSource, utmMedium, utmCampaign) {
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
        u.pathname = '/s/' + path.substring(8);
      } else { // isOmer
        u.pathname = '/o/' + path.substring(6);
      }
      if (!utmCampaign || !(utmCampaign.startsWith('ical-') || utmCampaign.startsWith('pdf-'))) {
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

/**
 * @private
 * @param {Event} ev
 * @return {boolean}
 */
export function shouldRenderBrief(ev) {
  if (typeof ev.eventTime !== 'undefined') return true;
  const mask = ev.getFlags();
  if (mask & flags.HEBREW_DATE) {
    const hd = ev.getDate();
    return (hd.getDate() === 1) ? false : true;
  } else if (mask & flags.DAF_YOMI) {
    return true;
  } else {
    return false;
  }
}
