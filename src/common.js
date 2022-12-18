import {flags, HDate} from '@hebcal/core';
import {getLeyningForParshaHaShavua, getLeyningForHoliday} from '@hebcal/leyning';
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
  let fileName = 'hebcal';
  if (options.year) {
    fileName += '_' + options.year;
    if (options.isHebrewYear) {
      fileName += 'h';
    }
    if (options.month) {
      fileName += '_' + options.month;
    }
  } else if (typeof options.start === 'object' && typeof options.end === 'object') {
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
    const loc = options.location;
    const name = loc.zip || loc.asciiname || loc.getShortName();
    if (name) {
      fileName += '_' + makeAnchor(name).replace(/[-]/g, '_');
    }
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
  return '' + number;
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
  return '' + number;
}

/**
 * Returns just the date portion as YYYY-MM-DD
 * @param {Date} d
 * @return {string}
 */
export function toISOString(d) {
  return pad4(d.getFullYear()) + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

const flagToCategory = [
  [flags.MAJOR_FAST, 'holiday', 'major', 'fast'],
  [flags.CHANUKAH_CANDLES, 'holiday', 'major'],
  [flags.DAF_YOMI, 'dafyomi'],
  [flags.HEBREW_DATE, 'hebdate'],
  [flags.MINOR_FAST, 'holiday', 'fast'],
  [flags.MINOR_HOLIDAY, 'holiday', 'minor'],
  [flags.MISHNA_YOMI, 'mishnayomi'],
  [flags.NACH_YOMI, 'nachyomi'],
  [flags.YERUSHALMI_YOMI, 'yerushalmi'],
  [flags.MODERN_HOLIDAY, 'holiday', 'modern'],
  [flags.MOLAD, 'molad'],
  [flags.OMER_COUNT, 'omer'],
  [flags.PARSHA_HASHAVUA, 'parashat'], // backwards-compat
  [flags.ROSH_CHODESH, 'roshchodesh'],
  [flags.SHABBAT_MEVARCHIM, 'mevarchim'],
  [flags.SPECIAL_SHABBAT, 'holiday', 'shabbat'],
  [flags.USER_EVENT, 'user'],
];

/**
 * Returns a category and subcategory name
 * @param {Event} ev
 * @return {string[]}
 */
export function getEventCategories(ev) {
  const desc = ev.getDesc();
  switch (desc) {
    // LIGHT_CANDLES or LIGHT_CANDLES_TZEIS
    case 'Candle lighting':
      return ['candles'];
    // YOM_TOV_ENDS
    case 'Havdalah':
      return ['havdalah'];
    // flags.MINOR_FAST or flags.MAJOR_FAST
    case 'Fast begins':
    case 'Fast ends':
      return ['zmanim', 'fast'];
  }
  if (ev.cholHaMoedDay) {
    return ['holiday', 'major', 'cholhamoed'];
  }
  const mask = ev.getFlags();
  for (let i = 0; i < flagToCategory.length; i++) {
    const attrs = flagToCategory[i];
    if (mask & attrs[0]) {
      return attrs.slice(1);
    }
  }
  // Don't depend on flags.MINOR_HOLIDAY always being set
  switch (desc) {
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
  if (options.year && (options.isHebrewYear || events.length == 0)) {
    title += ' ' + options.year;
  } else if (events.length) {
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
  flags.HEBREW_DATE | flags.YERUSHALMI_YOMI;

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
  } else if (typeof ev.eventTime !== 'undefined') {
    return '';
  }
  const reading = (mask & flags.PARSHA_HASHAVUA) ?
    getLeyningForParshaHaShavua(ev, il) :
    getLeyningForHoliday(ev, il);
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
 * @private
 * @param {Event} ev
 * @param {boolean} il
 * @return {string}
 */
export function makeMemo(ev, il) {
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
  return ev.memo || holidayDescription[ev.basename()];
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
  } else if (mask & (flags.DAF_YOMI | flags.YERUSHALMI_YOMI)) {
    return true;
  } else if (mask & flags.MINOR_FAST && ev.getDesc().substring(0, 16) === 'Yom Kippur Katan') {
    return true;
  } else if (mask & flags.SHABBAT_MEVARCHIM) {
    return true;
  } else {
    return false;
  }
}
