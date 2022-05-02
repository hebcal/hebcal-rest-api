import {HebrewCalendar, flags} from '@hebcal/core';
import {getHolidayDescription, getEventCategories, shouldRenderBrief} from './common';

// eslint-disable-next-line max-len
const csvHeader = '"Subject","Start Date","Start Time","End Date","End Time","All day event","Description","Show time as","Location"';

const CATEGORY = {
  dafyomi: 'Daf Yomi',
  hebdate: 'Hebrew Date',
  holiday: 'Jewish Holidays',
  mevarchim: null,
  molad: null,
  omer: null,
  parashat: 'Torah Reading',
  roshchodesh: 'Jewish Holidays',
  user: 'Personal',
};

/**
 * Renders an Event as a string
 * @param {Event} e
 * @param {CalOptions} options
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
  let subj = shouldRenderBrief(e) ? e.renderBrief(options.locale) : e.render(options.locale);
  if (e.eventTime) {
    const timeStr = HebrewCalendar.reformatTimeStr(e.eventTimeStr, ' PM', options);
    endTime = startTime = `"${timeStr}"`;
    endDate = date;
    allDay = '"false"';
  }

  let loc = 'Jewish Holidays';
  const mask = e.getFlags();
  if (timed && options.location && options.location.name) {
    const locationName = options.location.name;
    const comma = locationName.indexOf(',');
    loc = (comma === -1) ? locationName : locationName.substring(0, comma);
  } else if (mask & flags.DAF_YOMI) {
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      loc = subj.substring(0, colon);
      subj = subj.substring(colon + 2);
    }
  } else {
    const category = CATEGORY[getEventCategories(e)[0]];
    if (category) {
      loc = category;
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
    memo0 = e.linkedEvent.render(options.locale);
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
