import {Locale, flags} from '@hebcal/core';
import {toISOStringWithTimezone, getEventCategories} from './common';
import holidayDescription from './holidays.json';
import leyning from '@hebcal/leyning';

/**
 * Converts a Hebcal event to a FullCalendar.io object
 * @param {Event} ev
 * @param {string} tzid timeZone identifier
 * @param {boolean} il true if Israel
 * @return {Object}
 */
export function eventToFullCalendar(ev, tzid, il) {
  const attrs = ev.getAttrs();
  const classes = getEventCategories(ev);
  if (classes[0] == 'holiday' && ev.getFlags() & flags.CHAG) {
    classes.push('yomtov');
  }
  let title = ev.render();
  const desc = ev.getDesc();
  if (desc == 'Havdalah' || desc == 'Candle lighting') {
    const colon = title.indexOf(':');
    if (colon != -1) {
      title = title.substring(0, colon);
    }
  } else if (ev.getFlags() & flags.DAF_YOMI) {
    const colon = title.indexOf(':');
    if (colon != -1) {
      title = title.substring(colon + 1);
    }
  }
  const result = {
    title: title,
    start: toISOStringWithTimezone(ev.getDate().greg(), attrs.eventTimeStr, tzid),
    allDay: !Boolean(attrs.eventTime),
    className: classes.join(' '),
  };
  let hebrew = ev.renderBrief('he');
  if (hebrew) {
    const colon = hebrew.indexOf(':');
    if (colon != -1 && ev.getFlags() & flags.DAF_YOMI) {
      hebrew = hebrew.substring(colon + 1);
    }
    result.hebrew = Locale.hebrewStripNikkud(hebrew);
  }
  const url = ev.url();
  if (url) {
    if (url.startsWith('https://www.hebcal.com')) {
      result.url = url + '?utm_source=js&utm_medium=fc';
    } else {
      const sep = url.indexOf('?') == -1 ? '?' : '&';
      result.url = url + sep + 'utm_source=hebcal.com&utm_medium=fc';
    }
  }
  if (ev.getFlags() & flags.PARSHA_HASHAVUA) {
    const reading = leyning.getLeyningForParshaHaShavua(ev, il);
    if (reading) {
      let memo = `Torah: ${reading.summary}`;
      if (reading.reason) {
        for (const num of ['7', '8', 'M']) {
          if (reading.reason[num]) {
            const aname = Number(num) ? `${num}th aliyah` : 'Maftir';
            memo += `\n<br>${aname}: ` +
                          leyning.formatAliyahWithBook(reading.fullkriyah[num]) +
                          ' | ' +
                          reading.reason[num];
          }
        }
      }
      if (reading.haftara) {
        memo += '\n<br>Haftarah: ' + reading.haftara;
        if (reading.reason && reading.reason.haftara) {
          memo += ' | ' + reading.reason.haftara;
        }
      }
      if (reading.sephardic) {
        memo += '\n<br>Haftarah for Sephardim: ' + reading.sephardic;
      }
      result.description = memo;
    }
  } else {
    const memo = attrs.memo || holidayDescription[ev.basename()];
    if (memo) result.description = memo;
  }
  return result;
}
