import {Locale, flags} from '@hebcal/core';
import {toISOStringWithTimezone, getEventCategories, makeTorahMemoText} from './common';
import holidayDescription from './holidays.json';

/**
 * Converts a Hebcal event to a FullCalendar.io object
 * @param {Event} ev
 * @param {string} tzid timeZone identifier
 * @param {boolean} il true if Israel
 * @return {Object}
 */
export function eventToFullCalendar(ev, tzid, il) {
  const classes = getEventCategories(ev);
  if (classes[0] == 'holiday' && ev.getFlags() & flags.CHAG) {
    classes.push('yomtov');
  }
  const timed = Boolean(ev.eventTime);
  const title = timed || (ev.getFlags() & flags.DAF_YOMI) ? ev.renderBrief() : ev.render();
  const result = {
    title: title,
    start: toISOStringWithTimezone(ev.getDate().greg(), ev.eventTimeStr, tzid),
    allDay: !timed,
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
    if (url.substring(0, 22) == 'https://www.hebcal.com') {
      const suffix = il ? 'i=on&' : '';
      result.url = `${url}?${suffix}utm_source=js&utm_medium=fc`;
    } else {
      const sep = url.indexOf('?') == -1 ? '?' : '&';
      result.url = url + sep + 'utm_source=hebcal.com&utm_medium=fc';
    }
  }
  const desc = ev.getDesc();
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
  if (!candles) {
    const memo = (ev.getFlags() & flags.PARSHA_HASHAVUA) ?
        makeTorahMemoText(ev, il) :
        ev.memo || holidayDescription[ev.basename()];
    if (memo) result.description = memo;
  }
  return result;
}
