import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {Event, flags} from '@hebcal/core/dist/esm/event';
import {getLeyningForParshaHaShavua} from '@hebcal/leyning/dist/esm/leyning';
import {getLeyningForHoliday} from '@hebcal/leyning/dist/esm/getLeyningForHoliday';
import {LEARNING_MASK} from './common';
import {getHolidayDescription} from './holiday';

const HOLIDAY_IGNORE_MASK =
  flags.OMER_COUNT |
  flags.SHABBAT_MEVARCHIM |
  flags.MOLAD |
  flags.USER_EVENT |
  flags.HEBREW_DATE |
  LEARNING_MASK;

/**
 * Makes mulit-line text that summarizes Torah & Haftarah
 */
export function makeTorahMemoText(ev: Event, il: boolean): string {
  const mask = ev.getFlags();
  if (
    mask & HOLIDAY_IGNORE_MASK ||
    (ev as TimedEvent).eventTime !== undefined
  ) {
    return '';
  }
  const reading =
    mask & flags.PARSHA_HASHAVUA
      ? getLeyningForParshaHaShavua(ev, il)
      : getLeyningForHoliday(ev, il);
  let memo = '';
  if (reading && (reading.summary || reading.haftara)) {
    if (reading.summary) {
      memo += `Torah: ${reading.summary}`;
    }
    if (reading.summary && reading.haftara) {
      memo += '\n';
    }
    if (reading.haftara) {
      memo += 'Haftarah: ' + reading.haftara;
      if (reading.reason?.haftara) {
        memo += ' | ' + reading.reason.haftara;
      }
    }
  }
  if (reading?.sephardic) {
    memo += '\nHaftarah for Sephardim: ' + reading.sephardic;
  }
  return memo;
}

export function makeMemo(ev: Event, il: boolean): string {
  if (ev.getFlags() & flags.PARSHA_HASHAVUA) {
    try {
      const memo = makeTorahMemoText(ev, il);
      if (memo) {
        return memo;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch {
      // fallthru
    }
  }
  if (ev.memo) {
    return ev.memo;
  }
  return getHolidayDescription(ev, false, 'en');
}
