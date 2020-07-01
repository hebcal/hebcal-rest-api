import {Locale, flags} from '@hebcal/core';
import leyning from '@hebcal/leyning';
import {
  getCalendarTitle,
  getEventCategories,
  toISOStringWithTimezone,
  toISOString,
} from './common';
import countryNames from './countryNames.json';
import holidayDescription from './holidays.json';

/**
 * Formats a list events for the classic Hebcal.com JSON API response
 * @param {Event[]} events
 * @param {HebcalOptions} options
 * @return {Object}
 */
export function eventsToClassicApi(events, options) {
  const result = {
    date: new Date().toISOString(),
    title: getCalendarTitle(events, options),
  };
  const location = options.location;
  const tzid = location && location.getTzid();
  if (location && location.name) {
    result.location = {
      city: location.getName(),
      tzid: tzid,
      latitude: location.getLatitude(),
      longitude: location.getLongitude(),
      cc: location.getCountryCode(),
      country: countryNames[location.getCountryCode()],
    };
  }
  result.items = events.map((ev) => eventToClassicApiObject(ev, tzid, options.il));
  return result;
}

/**
 * Converts a Hebcal event to a classic Hebcal.com JSON API object
 * @param {Event} ev
 * @param {string} tzid timeZone identifier
 * @param {boolean} il true if Israel
 * @return {Object}
 */
export function eventToClassicApiObject(ev, tzid, il) {
  const attrs = ev.getAttrs();
  const timed = Boolean(attrs.eventTime);
  const dt = ev.getDate().greg();
  const date = timed ?
    toISOStringWithTimezone(dt, attrs.eventTimeStr, tzid) :
    toISOString(dt);
  const categories = getEventCategories(ev);
  const title = ev.render();
  const result = {
    title: title,
    date: date,
    category: categories[0],
  };
  if (categories.length > 1) {
    result.subcat = categories[1];
  }
  if (categories[0] == 'holiday' && ev.getFlags() & flags.CHAG) {
    result.yomtov = true;
  }
  const desc = ev.getDesc();
  if (title != desc) {
    result.title_orig = desc;
  }
  const hebrew = ev.renderBrief('he');
  if (hebrew) {
    result.hebrew = Locale.hebrewStripNikkud(hebrew);
  }
  if (!timed) {
    const isParsha = ev.getFlags() == flags.PARSHA_HASHAVUA;
    const reading = isParsha ?
      leyning.getLeyningForParshaHaShavua(ev, il) :
      leyning.getLeyningForHoliday(ev, il);
    if (reading) {
      result.leyning = formatLeyningResult(reading);
      if (isParsha && !il) {
        const triReading = leyning.getTriennialForParshaHaShavua(ev);
        result.leyning.triennial = formatAliyot({}, triReading);
      }
    }
    const url = ev.url();
    if (url) {
      if (url.startsWith('https://www.hebcal.com')) {
        result.link = url + '?utm_source=js&utm_medium=api';
      } else {
        const sep = url.indexOf('?') == -1 ? '?' : '&';
        result.link = url + sep + 'utm_source=hebcal.com&utm_medium=api';
      }
    }
  }
  const memo = attrs.memo || holidayDescription[ev.basename()];
  if (memo) result.memo = memo;
  return result;
}

/**
 * @param {Object} result
 * @param {Object} aliyot
 * @return {Object}
 */
function formatAliyot(result, aliyot) {
  for (const [num, aliyah] of Object.entries(aliyot)) {
    const k = num == 'M' ? 'maftir' : num;
    result[k] = leyning.formatAliyahWithBook(aliyah);
  }
  return result;
}

/**
 * @param {leyning.Leyning} reading
 * @return {Object}
 */
function formatLeyningResult(reading) {
  const result = {};
  result.torah = reading.summary;
  if (reading.haftara) {
    result.haftarah = reading.haftara;
  }
  if (reading.sephardic) {
    result.haftarah_sephardic = reading.sephardic;
  }
  formatAliyot(result, reading.fullkriyah);
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
