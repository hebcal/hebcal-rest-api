import { Event, HebrewCalendar, flags } from '@hebcal/core';
import {
  RestApiOptions, StringMap,
  getEventCategories, getHolidayDescription,
  shouldRenderBrief
} from './common';

// eslint-disable-next-line max-len
const csvHeader = '"Subject","Start Date","Start Time","End Date","End Time","All day event","Description","Show time as","Location"';

const CATEGORY: StringMap = {
  dafyomi: 'Daf Yomi',
  mishnayomi: 'Mishna Yomi',
  nachyomi: 'Nach Yomi',
  yerushalmi: 'Yerushalmi Yomi',
  hebdate: 'Hebrew Date',
  holiday: 'Jewish Holidays',
  mevarchim: '',
  molad: '',
  omer: '',
  parashat: 'Torah Reading',
  roshchodesh: 'Jewish Holidays',
  user: 'Personal',
  zmanim: '',
};

/**
 * Renders an Event as a string
 */
export function eventToCsv(ev: Event, options: RestApiOptions): string {
  const d = ev.getDate().greg();
  const mday = d.getDate();
  const mon = d.getMonth() + 1;
  const year = String(d.getFullYear()).padStart(4, '0');
  const date = options.euro ? `"${mday}/${mon}/${year}"` : `"${mon}/${mday}/${year}"`;

  let startTime = '';
  let endTime = '';
  let endDate = '';
  let allDay = '"true"';

  const timed = Boolean((ev as any).eventTime);
  let subj = shouldRenderBrief(ev) ? ev.renderBrief(options.locale) : ev.render(options.locale);
  if (timed) {
    const timeStr = HebrewCalendar.reformatTimeStr((ev as any).eventTimeStr, ' PM', options);
    endTime = startTime = `"${timeStr}"`;
    endDate = date;
    allDay = '"false"';
  }

  let loc = 'Jewish Holidays';
  const mask = ev.getFlags();
  if (timed && typeof options.location === 'object') {
    const locationName = options.location.getShortName()!;
    if (locationName) {
      loc = locationName;
    }
  } else {
    const category = CATEGORY[getEventCategories(ev)[0]];
    if (typeof category === 'string') {
      loc = category;
    }
  }

  subj = subj.replace(/,/g, '').replace(/"/g, '\'\'');

  if (options.appendHebrewToSubject) {
    const hebrew = ev.renderBrief('he');
    if (hebrew) {
      subj += ` / ${hebrew}`;
    }
  }

  let memo0 = ev.memo || getHolidayDescription(ev, true);
  if (!memo0 && typeof (ev as any).linkedEvent !== 'undefined') {
    memo0 = (ev as any).linkedEvent.render(options.locale);
  }
  const memo = memo0.replace(/,/g, ';').replace(/"/g, '\'\'').replace(/\n/g, ' / ');

  const showTimeAs = (timed || (mask & flags.CHAG)) ? 4 : 3;
  return `"${subj}",${date},${startTime},${endDate},${endTime},${allDay},"${memo}","${showTimeAs}","${loc}"`;
}

export function eventsToCsv(events: Event[], options: RestApiOptions): string {
  return [csvHeader].concat(events.map((ev) => eventToCsv(ev, options))).join('\r\n') + '\r\n';
}
