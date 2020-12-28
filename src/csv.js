import {HebrewCalendar, flags} from '@hebcal/core';
import {getHolidayDescription} from './common';

// eslint-disable-next-line max-len
const csvHeader = '"Subject","Start Date","Start Time","End Date","End Time","All day event","Description","Show time as","Location"';

/**
 * Renders an Event as a string
 * @param {Event} e
 * @param {HebcalOptions} options
 * @return {string}
 */
export function eventToCsv(e, options) {
  const d = e.getDate().greg();
  const mday = d.getDate();
  const mon = d.getMonth() + 1;
  const year = String(d.getFullYear()).padStart(4, '0');
  const date = options.euro ? `"${mday}/${mon}/${year}"` : `"${mon}/${mday}/${year}"`;

  let startTime = '';
  let endTime = '';
  let endDate = '';
  let allDay = '"true"';

  const timed = Boolean(e.eventTime);
  let subj = timed ? e.renderBrief() : e.render();
  if (e.eventTime) {
    const timeStr = HebrewCalendar.reformatTimeStr(e.eventTimeStr, ' PM', options);
    endTime = startTime = `"${timeStr}"`;
    endDate = date;
    allDay = '"false"';
  }

  let loc = 'Jewish Holidays';
  const mask = e.getFlags();
  if (timed && options.location && options.location.name) {
    const comma = options.location.name.indexOf(',');
    loc = (comma == -1) ? options.location.name : options.location.name.substring(0, comma);
  } else if (mask & flags.DAF_YOMI) {
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      loc = subj.substring(0, colon);
      subj = subj.substring(colon + 2);
    }
  }

  subj = subj.replace(/,/g, '').replace(/"/g, '\'\'');

  if (options.appendHebrewToSubject) {
    const hebrew = e.renderBrief('he');
    if (hebrew) {
      subj += ` / ${hebrew}`;
    }
  }

  let memo0 = e.memo || getHolidayDescription(e, true);
  if (!memo0 && typeof e.linkedEvent !== 'undefined') {
    memo0 = e.linkedEvent.render();
  }
  const memo = memo0.replace(/,/g, ';').replace(/"/g, '\'\'');

  const showTimeAs = (timed || (mask & flags.CHAG)) ? 4 : 3;
  return `"${subj}",${date},${startTime},${endDate},${endTime},${allDay},"${memo}","${showTimeAs}","${loc}"`;
}

/**
 * @param {Event[]} events
 * @param {HebcalOptions} options
 * @return {string}
 */
export function eventsToCsv(events, options) {
  return [csvHeader].concat(events.map((e) => eventToCsv(e, options))).join('\r\n') + '\r\n';
}
