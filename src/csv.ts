import {Event, flags} from '@hebcal/core/dist/esm/event';
import {reformatTimeStr} from '@hebcal/core/dist/esm/reformatTimeStr';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {
  RestApiOptions,
  StringMap,
  getEventCategories,
  shouldRenderBrief,
} from './common';
import {getHolidayDescription} from './getHolidayDescription';

// eslint-disable-next-line max-len
const csvHeader =
  '"Subject","Start Date","Start Time","End Date","End Time","All day event","Description","Show time as","Location"';

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
  const d = ev.greg();
  const mday = d.getDate();
  const mon = d.getMonth() + 1;
  const year = String(d.getFullYear()).padStart(4, '0');
  const date = options.euro
    ? `"${mday}/${mon}/${year}"`
    : `"${mon}/${mday}/${year}"`;

  let startTime = '';
  let endTime = '';
  let endDate = '';
  let allDay = '"true"';

  const timedEv = ev as TimedEvent;
  const timed = Boolean(timedEv.eventTime);
  let subj = shouldRenderBrief(ev)
    ? ev.renderBrief(options.locale)
    : ev.render(options.locale);
  if (timed) {
    const timeStr = reformatTimeStr(timedEv.eventTimeStr, ' PM', options);
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
    const cats = getEventCategories(ev);
    for (const cat of cats) {
      const category = CATEGORY[cat];
      if (typeof category === 'string') {
        loc = category;
        break;
      }
    }
  }

  subj = subj.replace(/,/g, '').replace(/"/g, "''");

  if (options.appendHebrewToSubject) {
    const hebrew = ev.renderBrief('he');
    if (hebrew) {
      subj += ` / ${hebrew}`;
    }
  }

  let memo0 = ev.memo || getHolidayDescription(ev, true, options.locale);
  if (!memo0 && typeof timedEv.linkedEvent !== 'undefined') {
    memo0 = timedEv.linkedEvent!.render(options.locale);
  }
  const memo = memo0
    .replace(/,/g, ';')
    .replace(/"/g, "''")
    .replace(/\n/g, ' / ');

  const isChag = Boolean(mask & flags.CHAG);
  const showTimeAs = timed || isChag ? 4 : 3;
  return `"${subj}",${date},${startTime},${endDate},${endTime},${allDay},"${memo}","${showTimeAs}","${loc}"`;
}

export function eventsToCsv(events: Event[], options: RestApiOptions): string {
  return (
    [csvHeader].concat(events.map(ev => eventToCsv(ev, options))).join('\r\n') +
    '\r\n'
  );
}
