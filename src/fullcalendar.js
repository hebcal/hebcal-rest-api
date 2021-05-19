import {Locale, flags, Zmanim} from '@hebcal/core';
import {getEventCategories, makeTorahMemoText, toISOString,
  appendIsraelAndTracking} from './common';
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
  const start = timed ?
    Zmanim.formatISOWithTimeZone(tzid, ev.eventTime) :
    toISOString(ev.getDate().greg());
  const result = {
    title,
    start,
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
    result.url = appendIsraelAndTracking(url, il, 'js', 'fc');
  }
  const desc = ev.getDesc();
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
  if (!candles) {
    const memo = (ev.getFlags() & flags.PARSHA_HASHAVUA) ?
        makeTorahMemoText(ev, il) :
        ev.memo || holidayDescription[ev.basename()];
    if (memo) {
      result.description = memo;
    } else if (typeof ev.linkedEvent !== 'undefined') {
      result.description = ev.linkedEvent.render();
    }
  }
  return result;
}
