import {hebcal, Event, flags} from '@hebcal/core';
import {toISOStringWithTimezone} from './common';

/**
 * Converts a Hebcal event to a FullCalendar.io object
 * @param {Event} ev
 * @param {string} tzid timeZone identifier
 * @return {Object}
 */
export function eventToFullCalendar(ev, tzid) {
  const attrs = ev.getAttrs();
  const classes = ['holiday'];
  if (ev.getFlags() & flags.CHAG) {
    classes.push('yomtov');
  }
  let title = ev.render();
  const desc = ev.getDesc();
  if (desc == 'Havdalah' || desc == 'Candle lighting') {
    const colon = title.indexOf(':');
    if (colon != -1) {
      title = title.substring(0, colon);
    }
  }
  const result = {
    title: title,
    start: toISOStringWithTimezone(ev.getDate().greg(), attrs.eventTimeStr, tzid),
    allDay: !Boolean(attrs.eventTime),
    className: classes.join(' '),
  };
  const url = hebcal.getEventUrl(ev);
  if (url) result.url = url;
  if (attrs.memo) result.description = attrs.memo;
  return result;
}


/**
 * Converts a Hebcal event to a FullCalendar.io object
 * @param {Event[]} events
 * @param {hebcal.HebcalOptions} options
 * @return {Object[]}
 */
export function eventsToFullCalendar(events, options) {
  const tzid = options && options.location && options.location.tzid;
  return events.map((ev) => eventToFullCalendar(ev, tzid));
}
