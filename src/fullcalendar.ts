import { Event, Locale, Zmanim, flags } from '@hebcal/core';
import { isoDateString } from '@hebcal/hdate';
import {
  appendIsraelAndTracking, getEventCategories, makeMemo,
  shouldRenderBrief
} from './common';

/**
 * Converts a Hebcal event to a FullCalendar.io object
 */
export function eventToFullCalendar(ev: Event, tzid: string, il: boolean): any {
  const classes = getEventCategories(ev);
  const mask = ev.getFlags();
  if (classes[0] == 'holiday' && mask & flags.CHAG) {
    classes.push('yomtov');
  }
  const eventTime: Date = (ev as any).eventTime;
  const timed = Boolean(eventTime);
  const title = shouldRenderBrief(ev) ? ev.renderBrief() : ev.render();
  const start = timed ?
    Zmanim.formatISOWithTimeZone(tzid, eventTime) :
    isoDateString(ev.getDate().greg());
  const result: any = {
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
    const memo = makeMemo(ev, il);
    if (memo) {
      result.description = memo;
    } else if (typeof (ev as any).linkedEvent !== 'undefined') {
      result.description = (ev as any).linkedEvent.render();
    }
  }
  return result;
}
