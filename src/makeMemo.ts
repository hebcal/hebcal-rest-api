import {Event, flags} from '@hebcal/core';
import {makeTorahMemoText} from './common';
import {getHolidayDescription} from './getHolidayDescription';

export function makeMemo(ev: Event, il: boolean): string {
  if (ev.getFlags() & flags.PARSHA_HASHAVUA) {
    try {
      const memo = makeTorahMemoText(ev, il);
      if (memo) {
        return memo;
      }
    } catch (err) {
      // fallthru
    }
  }
  if (ev.memo) {
    return ev.memo;
  }
  return getHolidayDescription(ev, false, 'en');
}
