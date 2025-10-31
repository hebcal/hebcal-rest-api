import {Event, flags} from '@hebcal/core/dist/esm/event';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {Zmanim} from '@hebcal/core/dist/esm/zmanim';
import {CalOptions} from '@hebcal/core/dist/esm/CalOptions';
import {isoDateString} from '@hebcal/hdate';
import {
  LEARNING_MASK,
  appendIsraelAndTracking,
  getEventCategories,
  makeMemo,
  shouldRenderBrief,
} from './common';

/**
 * Converts a Hebcal event to a FullCalendar.io object
 */
export function eventToFullCalendar(
  ev: Event,
  tzid: string,
  options: CalOptions
): any {
  const classes = getEventCategories(ev);
  const mask = ev.getFlags();
  const isChag = Boolean(mask & flags.CHAG);
  if (isChag && classes[0] === 'holiday') {
    classes.push('yomtov');
  }
  if (mask & LEARNING_MASK) {
    classes.push('learning');
  }
  const timedEv = ev as TimedEvent;
  const eventTime: Date = timedEv.eventTime;
  const timed = Boolean(eventTime);
  const title = shouldRenderBrief(ev)
    ? ev.renderBrief(options.locale)
    : ev.render(options.locale);
  const start = timed
    ? Zmanim.formatISOWithTimeZone(tzid, eventTime)
    : isoDateString(ev.getDate().greg());
  const result: any = {
    title,
    start,
    allDay: !timed,
    className: classes.join(' '),
  };
  const hebrew = ev.renderBrief('he-x-NoNikud');
  if (hebrew) {
    result.hebrew = hebrew;
  }
  const url = ev.url();
  const il = Boolean(options.il);
  if (url) {
    const u = new URL(url);
    const utmSource = u.host === 'www.hebcal.com' ? 'js' : undefined;
    result.url = appendIsraelAndTracking(url, il, utmSource, 'fc');
  }
  const desc = ev.getDesc();
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
  if (!candles) {
    const memo = makeMemo(ev, il);
    if (memo) {
      result.description = memo;
    } else if (typeof timedEv.linkedEvent !== 'undefined') {
      result.description = timedEv.linkedEvent!.render(options.locale);
    }
  }
  return result;
}
