/* eslint-disable max-len */
import {flags} from '@hebcal/core';
import md5 from 'md5';
import leyning from '@hebcal/leyning';
import {pad2, getCalendarTitle, makeAnchor, getHolidayDescription} from './common';
import fs from 'fs';
import {Readable} from 'stream';

const VTIMEZONE = {
  'US/Eastern': 'BEGIN:VTIMEZONE\r\nTZID:US/Eastern\r\nBEGIN:STANDARD\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nTZOFFSETTO:-0500\r\nTZOFFSETFROM:-0400\r\nTZNAME:EST\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nTZOFFSETTO:-0400\r\nTZOFFSETFROM:-0500\r\nTZNAME:EDT\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE',
  'US/Central': 'BEGIN:VTIMEZONE\r\nTZID:US/Central\r\nBEGIN:STANDARD\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nTZOFFSETTO:-0600\r\nTZOFFSETFROM:-0500\r\nTZNAME:CST\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nTZOFFSETTO:-0500\r\nTZOFFSETFROM:-0600\r\nTZNAME:CDT\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE',
  'US/Mountain': 'BEGIN:VTIMEZONE\r\nTZID:US/Mountain\r\nBEGIN:STANDARD\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nTZOFFSETTO:-0700\r\nTZOFFSETFROM:-0600\r\nTZNAME:MST\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nTZOFFSETTO:-0600\r\nTZOFFSETFROM:-0700\r\nTZNAME:MDT\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE',
  'US/Pacific': 'BEGIN:VTIMEZONE\r\nTZID:US/Pacific\r\nX-MICROSOFT-CDO-TZID:13\r\nBEGIN:STANDARD\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nTZOFFSETFROM:-0700\r\nTZOFFSETTO:-0800\r\nTZNAME:PST\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nTZOFFSETFROM:-0800\r\nTZOFFSETTO:-0700\r\nTZNAME:PDT\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE',
  'US/Alaska': 'BEGIN:VTIMEZONE\r\nTZID:US/Alaska\r\nBEGIN:STANDARD\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nTZOFFSETTO:-0900\r\nTZOFFSETFROM:+0000\r\nTZNAME:AKST\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nTZOFFSETTO:-0800\r\nTZOFFSETFROM:-0900\r\nTZNAME:AKDT\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE',
  'US/Hawaii': 'BEGIN:VTIMEZONE\r\nTZID:US/Hawaii\r\nLAST-MODIFIED:20060309T044821Z\r\nBEGIN:DAYLIGHT\r\nDTSTART:19330430T123000\r\nTZOFFSETTO:-0930\r\nTZOFFSETFROM:+0000\r\nTZNAME:HDT\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nDTSTART:19330521T020000\r\nTZOFFSETTO:-1030\r\nTZOFFSETFROM:-0930\r\nTZNAME:HST\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19420209T020000\r\nTZOFFSETTO:-0930\r\nTZOFFSETFROM:-1030\r\nTZNAME:HWT\r\nEND:DAYLIGHT\r\nBEGIN:DAYLIGHT\r\nDTSTART:19450814T133000\r\nTZOFFSETTO:-0930\r\nTZOFFSETFROM:-0930\r\nTZNAME:HPT\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nDTSTART:19450930T020000\r\nTZOFFSETTO:-1030\r\nTZOFFSETFROM:-0930\r\nTZNAME:HST\r\nEND:STANDARD\r\nBEGIN:STANDARD\r\nDTSTART:19470608T020000\r\nTZOFFSETTO:-1000\r\nTZOFFSETFROM:-1030\r\nTZNAME:HST\r\nEND:STANDARD\r\nEND:VTIMEZONE',
  'US/Aleutian': 'BEGIN:VTIMEZONE\r\nTZID:US/Aleutian\r\nBEGIN:STANDARD\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nTZOFFSETTO:-1000\r\nTZOFFSETFROM:-0900\r\nTZNAME:HAST\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nTZOFFSETTO:-0900\r\nTZOFFSETFROM:-1000\r\nTZNAME:HADT\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE',
  'America/Phoenix': 'BEGIN:VTIMEZONE\r\nTZID:America/Phoenix\r\nBEGIN:STANDARD\r\nDTSTART:19700101T000000\r\nTZOFFSETTO:-0700\r\nTZOFFSETFROM:-0700\r\nEND:STANDARD\r\nEND:VTIMEZONE',
};

/**
 *
 * @param {Date} d
 * @return {string}
 */
function formatYYYYMMDD(d) {
  return String(d.getFullYear()).padStart(4, '0') +
        pad2(d.getMonth() + 1) + pad2(d.getDate());
}

/**
 * @param {number|string} hour
 * @param {number|string} min
 * @param {number|string} sec
 * @return {string}
 */
function formatTime(hour, min, sec) {
  return pad2(hour) + pad2(min) + pad2(sec);
}

/**
 * Returns UTC string for iCalendar
 * @param {Date} dt
 * @return {string}
 */
function makeDtstamp(dt) {
  const s = dt.toISOString();
  return s.slice(0, 4) + s.slice(5, 7) + s.slice(8, 13) +
            s.slice(14, 16) + s.slice(17, 19) + 'Z';
}

/**
 * @param {string[]} arr
 * @param {string} key
 * @param {string} val
 */
function addOptional(arr, key, val) {
  if (val) {
    const str = val.replace(/,/g, '\\,').replace(/;/g, '\\;');
    arr.push(key + ':' + str);
  }
}

/**
 * @param {string} url
 * @return {string}
 */
function appendTrackingToUrl(url) {
  if (!url) {
    return url;
  } else if (url.startsWith('https://www.hebcal.com')) {
    return url + '?utm_source=js&utm_medium=icalendar';
  } else {
    const sep = url.indexOf('?') == -1 ? '?' : '&';
    return url + sep + 'utm_source=hebcal.com&utm_medium=icalendar';
  }
}

/**
 *
 * @param {Event} e
 * @param {HebcalOptions} options
 * @return {string} multi-line result, delimited by \r\n
 */
export function eventToIcal(e, options) {
  const dtstamp = options.dtstamp || makeDtstamp(new Date());
  let subj = e.render();
  const desc = e.getDesc(); // original untranslated
  const attrs = e.getAttrs();
  const mask = e.getFlags();
  const timed = Boolean(attrs.eventTime);
  let location;
  if (timed && options.location.name) {
    const comma = options.location.name.indexOf(',');
    location = (comma == -1) ? options.location.name : options.location.name.substring(0, comma);
  }
  if (mask & flags.DAF_YOMI) {
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      location = subj.substring(0, colon);
      subj = subj.substring(colon + 2);
    }
  }

  // create memo (holiday descr, Torah, etc)
  const url = appendTrackingToUrl(e.url());
  let memo;
  if (mask & flags.PARSHA_HASHAVUA) {
    const reading = leyning.getLeyningForParshaHaShavua(e, options.il);
    memo = `Torah: ${reading.summary}`;
    if (reading.reason) {
      for (const num of ['7', '8', 'M']) {
        if (reading.reason[num]) {
          const aname = Number(num) ? `${num}th aliyah` : 'Maftir';
          memo += `\\n${aname}: ` +
                        leyning.formatAliyahWithBook(reading.fullkriyah[num]) +
                        ' | ' +
                        reading.reason[num];
        }
      }
    }
    if (reading.haftara) {
      memo += '\\nHaftarah: ' + reading.haftara;
      if (reading.reason && reading.reason.haftara) {
        memo += ' | ' + reading.reason.haftara;
      }
    }
    if (reading.sephardic) {
      memo += '\\nHaftarah for Sephardim: ' + reading.sephardic;
    }
    memo += '\\n\\n' + url;
  } else {
    memo = attrs.memo || getHolidayDescription(e);
    const holidayLeyning = leyning.getLeyningForHoliday(e, options.il);
    if (holidayLeyning && holidayLeyning.summary) {
      memo += `\\nTorah: ${holidayLeyning.summary}`;
    }
    if (holidayLeyning && holidayLeyning.haftara) {
      memo += '\\nHaftarah: ' + holidayLeyning.haftara;
    }
    if (url) {
      if (memo.length) memo += '\\n\\n';
      memo += url;
    }
  }

  const date = formatYYYYMMDD(e.getDate().greg());
  let startDate = date;
  let dtargs; let endDate;
  let transp = 'TRANSPARENT'; let busyStatus = 'FREE';
  if (timed) {
    let [hour, minute] = attrs.eventTimeStr.split(':');
    if (Number(hour) < 12) {
      hour = 12 + Number(hour);
    }
    startDate += 'T' + formatTime(hour, minute, 0);
    endDate = startDate;
    dtargs = `;TZID=${options.location.tzid}`;
    // replace "Candle lighting: 15:34" with shorter title
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      subj = subj.substring(0, colon);
    }
  } else {
    endDate = formatYYYYMMDD(e.getDate().next().greg());
    // for all-day untimed, use DTEND;VALUE=DATE intsead of DURATION:P1D.
    // It's more compatible with everthing except ancient versions of
    // Lotus Notes circa 2004
    dtargs = ';VALUE=DATE';
    if (mask & flags.CHAG) {
      transp = 'OPAQUE';
      busyStatus = 'OOF';
    }
  }

  const digest = md5(subj);
  let uid = `hebcal-${date}-${digest}`;
  if (timed && options.location) {
    if (options.location.geoid) {
      uid += `-${options.location.geoid}`;
    } else if (options.location.name) {
      uid += '-' + makeAnchor(options.location.name);
    }
  }

  // make subject safe for iCalendar
  subj = subj.replace(/,/g, '\\,');

  const category = mask & flags.USER_EVENT ? 'Personal' : 'Holiday';
  const arr = [
    'BEGIN:VEVENT',
    `DTSTAMP:${dtstamp}`,
    `CATEGORIES:${category}`,
    'CLASS:PUBLIC',
    `SUMMARY:${subj}`,
    `DTSTART${dtargs}:${startDate}`,
    `DTEND${dtargs}:${endDate}`,
    `TRANSP:${transp}`,
    `X-MICROSOFT-CDO-BUSYSTATUS:${busyStatus}`,
    `UID:${uid}`,
  ];

  addOptional(arr, 'DESCRIPTION', memo);
  addOptional(arr, 'LOCATION', location);
  if (timed && options.location) {
    arr.push('GEO:' + options.location.latitude + ';' + options.location.longitude);
  }
  if (url) {
    arr.push(`URL:${url}`); // don't munge [;,]
  }

  let alarm;
  if (e.getFlags() & flags.OMER_COUNT) {
    alarm = '3H'; // 9pm Omer alarm evening before
  } else if (e.getFlags() & flags.USER_EVENT) {
    alarm = '12H'; // noon the day before
  } else if (timed && desc.startsWith('Candle lighting')) {
    alarm = '10M'; // ten minutes
  }
  if (alarm) {
    arr.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:REMINDER',
        `TRIGGER;RELATED=START:-PT${alarm}`,
        'END:VALARM',
    );
  }

  arr.push('END:VEVENT');

  return arr.join('\r\n');
}

/**
 * Generates an RFC 2445 iCalendar stream from an array of events
 * @param {stream.Readable} readable
 * @param {Event[]} events
 * @param {HebcalOptions} options
 * @return {stream.Readable}
 */
export function eventsToIcalendarStream(readable, events, options) {
  if (!events.length) throw new RangeError('Events can not be empty');
  if (!options) throw new TypeError('Invalid options object');
  const uclang = (options.locale || 'en').toUpperCase();
  const title = getCalendarTitle(events, options);
  const caldesc = options.yahrzeit ?
    'Yahrzeits + Anniversaries from www.hebcal.com' :
    'Jewish Holidays from www.hebcal.com';
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//hebcal.com/NONSGML Hebcal Calendar v7.0//${uclang}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-LOTUS-CHARSET:UTF-8',
    'X-PUBLISHED-TTL:PT7D',
    `X-WR-CALNAME:${title}`,
    `X-WR-CALDESC:${caldesc}`,
  ].forEach((line) => {
    readable.push(line);
    readable.push('\r\n');
  });
  const location = options.location;
  if (location && location.tzid) {
    const tzid = location.tzid;
    readable.push(`X-WR-TIMEZONE;VALUE=TEXT:${tzid}\r\n`);
    if (VTIMEZONE[tzid]) {
      readable.push(VTIMEZONE[tzid]);
      readable.push('\r\n');
    } else {
      try {
        const vtimezoneIcs = `./zoneinfo/${tzid}.ics`;
        const lines = fs.readFileSync(vtimezoneIcs, 'utf-8').split('\r\n');
        // ignore first 3 and last 1 lines
        const str = lines.slice(3, lines.length - 2).join('\r\n');
        readable.push(str);
        readable.push('\r\n');
        VTIMEZONE[tzid] = str; // cache for later
      } catch (error) {
        // ignore failure when no timezone definition to read
      }
    }
  }

  options.dtstamp = makeDtstamp(new Date());
  events.forEach((e) => {
    readable.push(eventToIcal(e, options));
    readable.push('\r\n');
  });
  readable.push('END:VCALENDAR\r\n');
  readable.push(null); // indicates end of the stream
  return readable;
}

/**
 * @param {stream.Readable} readable
 * @return {string}
 */
async function readableToString(readable) {
  let result = '';
  for await (const chunk of readable) {
    result += chunk;
  }
  return result;
}

/**
 * Renders an array of events as a full RFC 2445 iCalendar string
 * @param {Event[]} events
 * @param {HebcalOptions} options
 * @return {string} multi-line result, delimited by \r\n
 */
export async function eventsToIcalendar(events, options) {
  const readStream = new Readable();
  eventsToIcalendarStream(readStream, events, options);
  readStream.on('error', (err) => {
    throw err;
  });
  const str = await readableToString(readStream);
  return str;
}
