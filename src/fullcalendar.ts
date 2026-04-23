import {Event, flags} from '@hebcal/core/dist/esm/event';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {Zmanim} from '@hebcal/core/dist/esm/zmanim';
import {CalOptions} from '@hebcal/core/dist/esm/CalOptions';
import {isoDateString} from '@hebcal/hdate';
import {LEARNING_MASK, getEventCategories, shouldRenderBrief} from './common';
import {appendIsraelAndTracking} from './url';
import {makeMemo} from './memo';
import {holidayDesc as hdesc} from '@hebcal/core/dist/esm/staticHolidays';

export type FullCalendarEvent = {
  title: string;
  start: string;
  allDay: boolean;
  className: string;
  hebrew?: string;
  url?: string;
  description?: string;
};

/**
 * Converts a Hebcal event to a FullCalendar.io object
 */
export function eventToFullCalendar(
  ev: Event,
  tzid: string,
  options: CalOptions
): FullCalendarEvent {
  const classes = getEventCategories(ev).slice();
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
    : isoDateString(ev.greg());
  const result: FullCalendarEvent = {
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
  const candles = desc === hdesc.HAVDALAH || desc === hdesc.CANDLE_LIGHTING;
  if (!candles) {
    const memo = makeMemo(ev, il);
    if (memo) {
      result.description = memo;
    } else if (timedEv.linkedEvent !== undefined) {
      result.description = timedEv.linkedEvent.render(options.locale);
    }
  }
  return result;
}
