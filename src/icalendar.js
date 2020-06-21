/* eslint-disable max-len */
// import stream from 'stream';
// eslint-disable-next-line no-unused-vars
import {hebcal, Event, flags} from '@hebcal/core';
import md5 from 'md5';
import leyning from '@hebcal/leyning';
import {pad2, getDownloadFilename, getCalendarTitle} from './common';
import holidayDescription from './holidays.json';

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
 * @param {stream.Writable} res
 * @param {...string} str
 */
export function icalWriteLine(res, ...str) {
  for (const s of str) {
    res.write(s);
    res.write('\r\n');
  }
}

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
 *
 * @param {stream.Writable} res
 * @param {Event} e
 * @param {string} dtstamp
 * @param {hebcal.HebcalOptions} options
 */
function icalWriteEvent(res, e, dtstamp, options) {
  options.dtstamp = dtstamp;
  res.write(eventToIcal(e, options));
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
 * @param {hebcal.HebcalOptions} options
 * @return {string} multi-line result, delimited by \r\n
 */
export function eventToIcal(e, options) {
  const dtstamp = options.dtstamp || makeDtstamp(new Date());
  let subj = e.render();
  const desc = e.getDesc(); // original untranslated
  const attrs = e.getAttrs();
  const mask = e.getFlags();
  const timed = Boolean(attrs.eventTime);
  let location = timed ? options.location.name : undefined;
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
    const parshaLeyning = leyning.getLeyningForParshaHaShavua(e, options.il);
    memo = `Torah: ${parshaLeyning.summary}`;
    if (parshaLeyning.reason) {
      for (const num of ['7', '8', 'M']) {
        if (parshaLeyning.reason[num]) {
          const aname = Number(num) ? `${num}th aliyah` : 'Maftir';
          memo += `\\n${aname}: ` +
                        leyning.formatAliyahWithBook(parshaLeyning.fullkriyah[num]) +
                        ' | ' +
                        parshaLeyning.reason[num];
        }
      }
    }
    if (parshaLeyning.haftara) {
      memo += '\\nHaftarah: ' + parshaLeyning.haftara;
    }
    if (parshaLeyning.sephardic) {
      memo += '\\nHaftarah for Sephardim: ' + parshaLeyning.sephardic;
    }
    memo += '\\n\\n' + url;
  } else {
    memo = attrs.memo || holidayDescription[e.basename()] || '';
    const holidayLeyning = leyning.getLeyningForHoliday(e, options.il);
    if (holidayLeyning) {
      memo += `\\nTorah: ${holidayLeyning.summary}`;
      if (holidayLeyning.haftara) {
        memo += '\\nHaftarah: ' + holidayLeyning.haftara;
      }
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
      uid += '-' + hebcal.makeAnchor(options.location.name);
    }
  }

  // make subject safe for iCalendar
  subj = subj.replace(/,/g, '\\,');

  const arr = [
    'BEGIN:VEVENT',
    `DTSTAMP:${dtstamp}`,
    'CATEGORIES:Holiday',
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
  if (options.location) {
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
 * @param {stream.Writable} res
 * @param {string} mimeType
 * @param {string} fileName
 */
function exportHttpHeader(res, mimeType, fileName) {
  res.setHeader('Content-Type', `${mimeType}; filename=\"${fileName}\"`);
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.setHeader('Last-Modified', new Date().toUTCString());
}

/**
 *
 * @param {stream.Writable} res
 * @param {Event[]} events
 * @param {hebcal.HebcalOptions} options
 */
export function icalWriteContents(res, events, options) {
  const mimeType = 'text/calendar; charset=UTF-8';
  if (options.subscribe) {
    res.setHeader('Content-Type', mimeType);
  } else {
    const fileName = getDownloadFilename(options) + '.ics';
    exportHttpHeader(res, mimeType, fileName);
  }
}

/**
 * Renders an array of events as a full RFC 2445 iCalendar string
 * @param {Event[]} events
 * @param {hebcal.HebcalOptions} options
 * @return {string} multi-line result, delimited by \r\n
 */
export function eventsToIcalendar(events, options) {
  let res = [];

  res.push('BEGIN:VCALENDAR');

  res.push('VERSION:2.0');
  const uclang = (options.locale || 'en').toUpperCase();
  res.push(
      `PRODID:-//hebcal.com/NONSGML Hebcal Calendar v7.0//${uclang}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-LOTUS-CHARSET:UTF-8',
      'X-PUBLISHED-TTL:PT7D');
  const title = getCalendarTitle(events, options);
  res.push(`X-WR-CALNAME:${title}`);

  // include an iCal description
  const caldesc = options.yahrzeit ? 'Yahrzeits + Anniversaries from www.hebcal.com' : 'Jewish Holidays from www.hebcal.com';
  res.push(`X-WR-CALDESC:${caldesc}`);

  const location = options.location;
  if (location && location.tzid) {
    const tzid = location.tzid;
    res.push(`X-WR-TIMEZONE;VALUE=TEXT:${tzid}`);
    if (VTIMEZONE[tzid]) {
      res.push(VTIMEZONE[tzid]);
    } else {
      // const vtimezoneIcs = `/foo/zoneinfo/${tzid}.ics`;
      // read it from disk
    }
  }

  options.dtstamp = makeDtstamp(new Date());
  res = res.concat(events.map((e) => eventToIcal(e, options)));
  res.push('END:VCALENDAR');
  return res.join('\r\n');
}
