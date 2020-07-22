import {Locale, flags, HebrewCalendar} from '@hebcal/core';
import leyn from '@hebcal/leyning';
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
 * @param {HebrewCalendar.Options} options
 * @param {boolean} [leyning=true]
 * @return {Object}
 */
export function eventsToClassicApi(events, options, leyning=true) {
  const result = {
    title: getCalendarTitle(events, options),
    date: new Date().toISOString(),
  };
  const location = options.location;
  if (typeof location === 'object' && typeof location.name === 'string') {
    result.location = {
      title: location.getName(),
      city: location.getShortName(),
      tzid: location.getTzid(),
      latitude: location.getLatitude(),
      longitude: location.getLongitude(),
      cc: location.getCountryCode(),
      country: countryNames[location.getCountryCode()],
    };
    ['admin1', 'asciiname', 'geo', 'zip', 'state', 'geonameid'].forEach((k) => {
      if (location[k]) {
        result.location[k] = location[k];
      }
    });
  } else {
    result.location = {geo: 'none'};
  }
  result.items = events.map((ev) => eventToClassicApiObject(ev, options, leyning));
  return result;
}

/**
 * Converts a Hebcal event to a classic Hebcal.com JSON API object
 * @param {Event} ev
 * @param {HebrewCalendar.Options} options
 * @param {boolean} [leyning=true]
 * @return {Object}
 */
export function eventToClassicApiObject(ev, options, leyning=true) {
  const attrs = ev.getAttrs();
  const timed = Boolean(attrs.eventTime);
  const dt = ev.getDate().greg();
  const tzid = typeof options.location === 'object' ? options.location.getTzid() : 'UTC';
  const date = timed ?
    toISOStringWithTimezone(dt, attrs.eventTimeStr, tzid) :
    toISOString(dt);
  const categories = getEventCategories(ev);
  let title = ev.render();
  if (timed) {
    const colon = title.indexOf(': ');
    if (colon != -1) {
      const time = HebrewCalendar.reformatTimeStr(attrs.eventTimeStr, 'pm', options);
      title = title.substring(0, colon) + ': ' + time;
    }
  }
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
    if (leyning) {
      const il = options.il;
      const isParsha = ev.getFlags() == flags.PARSHA_HASHAVUA;
      const reading = isParsha ?
        leyn.getLeyningForParshaHaShavua(ev, il) :
        leyn.getLeyningForHoliday(ev, il);
      if (reading) {
        result.leyning = formatLeyningResult(reading);
        if (isParsha && !il) {
          const triReading = leyn.getTriennialForParshaHaShavua(ev);
          if (triReading) {
            result.leyning.triennial = formatAliyot({}, triReading);
          }
        }
      }
    }
    const url = ev.url();
    if (url) {
      if (url.substring(0, 22) == 'https://www.hebcal.com') {
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
  Object.keys(aliyot).forEach((num) => {
    const aliyah = aliyot[num];
    if (typeof aliyah !== 'undefined') {
      const k = num == 'M' ? 'maftir' : num;
      result[k] = leyn.formatAliyahWithBook(aliyah);
    }
  });
  return result;
}

/**
 * @param {leyn.Leyning} reading
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
    ['7', '8', 'M'].forEach((num) => {
      if (reading.reason[num]) {
        const k = num == 'M' ? 'maftir' : num;
        result[k] += ' | ' + reading.reason[num];
      }
    });
    if (reading.reason.haftara) {
      result.haftarah += ' | ' + reading.reason.haftara;
    }
  }
  return result;
}
