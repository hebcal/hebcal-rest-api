import {Locale, flags, Zmanim} from '@hebcal/core';
import {getEventCategories, makeTorahMemoText, toISOString,
  appendIsraelAndTracking} from './common';
import holidayDescription from './holidays.json';

const BRIEF_FLAGS = flags.DAF_YOMI | flags.HEBREW_DATE;

/**
 * Converts a Hebcal event to a FullCalendar.io object
 * @param {Event} ev
 * @param {string} tzid timeZone identifier
 * @param {boolean} il true if Israel
 * @return {Object}
 */
export function eventToFullCalendar(ev, tzid, il) {
  const classes = getEventCategories(ev);
  const mask = ev.getFlags();
  if (classes[0] == 'holiday' && mask & flags.CHAG) {
    classes.push('yomtov');
  }
  const timed = Boolean(ev.eventTime);
  const title = timed || (mask & BRIEF_FLAGS) ? ev.renderBrief() : ev.render();
  const start = timed ?
    Zmanim.formatISOWithTimeZone(tzid, ev.eventTime) :
    toISOString(ev.getDate().greg());
  const result = {
    title,
    start,
    allDay: !timed,
    className: classes.join(' '),
  };
  const hebrew = ev.renderBrief('he');
  if (hebrew) {
    result.hebrew = Locale.hebrewStripNikkud(hebrew);
  }
  const url = ev.url();
  if (url) {
    result.url = appendIsraelAndTracking(url, il, 'js', 'fc');
  }
  const desc = ev.getDesc();
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
  if (!candles) {
    const memo = (mask & flags.PARSHA_HASHAVUA) ?
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
