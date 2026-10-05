import type {Event} from '@hebcal/core/dist/esm/event';
import {reformatTimeStr} from '@hebcal/core/dist/esm/reformatTimeStr';
import type {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import type {RestApiOptions} from './common.js';
import {getEventCategories, shouldRenderBrief} from './common.js';
import {getHolidayDescription} from './holiday.js';
import {isTimedEvent} from './isTimedEvent.js';

/**
 * The header row for an Outlook-compatible CSV document.
 */
export const CSV_HEADER =
  '"Subject","Start Date","Start Time","End Date","End Time","All day event","Description","Show time as","Location"';

const CATEGORY: Readonly<Record<string, string>> = {
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

/** Options for `eventToCsv()`, extending `RestApiOptions` with an override for the memo/description field. */
export type EventToCsvOptions = RestApiOptions & {
  /** if specified, takes precedence over `ev.memo` */
  memo?: string;
};

/**
 * Renders a single event as one line of Outlook-compatible CSV
 * (no trailing newline).
 * @param ev - the event to render
 * @param options - controls locale, date format (`euro`), whether to
 *   append the Hebrew title (`appendHebrewToSubject`), and an optional
 *   `memo` that takes precedence over `ev.memo`
 * @returns a CSV row: subject, start/end date/time, all-day flag,
 *   description, "show time as", and location
 */
export function eventToCsv(ev: Event, options: EventToCsvOptions): string {
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

  const timed = isTimedEvent(ev);
  let subj = shouldRenderBrief(ev)
    ? ev.renderBrief(options.locale)
    : ev.render(options.locale);
  if (timed) {
    const timeStr = reformatTimeStr(ev.eventTimeStr, ' PM', options);
    endTime = startTime = `"${timeStr}"`;
    endDate = date;
    allDay = '"false"';
  }

  let loc = 'Jewish Holidays';
  if (timed && typeof options.location === 'object') {
    const locationName = options.location.getShortName();
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

  subj = subj.replaceAll(',', '').replaceAll('"', "''");

  if (options.appendHebrewToSubject) {
    const hebrew = ev.renderBrief('he');
    if (hebrew) {
      subj += ` / ${hebrew}`;
    }
  }

  let memo0 =
    options.memo || ev.memo || getHolidayDescription(ev, true, options.locale);
  // TimedEvent and FastDayEvent (not a TimedEvent) both carry linkedEvent
  const linkedEvent = (ev as Partial<TimedEvent>).linkedEvent;
  if (!memo0 && linkedEvent !== undefined) {
    memo0 = linkedEvent.render(options.locale);
  }
  const memo = memo0
    .replaceAll(',', ';')
    .replaceAll('"', "''")
    .replaceAll('\n', ' / ');

  const isChag = ev.hasFlag('CHAG');
  const showTimeAs = timed || isChag ? 4 : 3;
  return `"${subj}",${date},${startTime},${endDate},${endTime},${allDay},"${memo}","${showTimeAs}","${loc}"`;
}

/**
 * Renders a list of events as an Outlook-compatible CSV document, including
 * the header row and a trailing CRLF.
 * @param events - the events to render
 * @param options - see `eventToCsv()`
 * @returns the full CSV document, using CRLF line endings
 */
export function eventsToCsv(events: Event[], options: RestApiOptions): string {
  const lines = [CSV_HEADER, ...events.map(ev => eventToCsv(ev, options))];
  return lines.join('\r\n') + '\r\n';
}
