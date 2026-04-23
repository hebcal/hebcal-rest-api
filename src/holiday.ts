import {Event, flags} from '@hebcal/core/dist/esm/event';
import type {StringMap} from './common';
import {Locale} from '@hebcal/hdate';
import holidayDescription0 from './holidays.json';
import holidayDescHe0 from './holidays-he.json';

const holidayDescription: StringMap = holidayDescription0 as StringMap;
const holidayDescriptionHe: StringMap = holidayDescHe0 as StringMap;

/**
 * Returns an English language description of the holiday
 */

export function getHolidayDescription(
  ev: Event,
  firstSentence = false,
  locale?: string
): string {
  const he = Locale.isHebrewLocale(locale);
  const strs = he ? holidayDescriptionHe : holidayDescription;
  const str0 =
    ev.getFlags() & flags.SHABBAT_MEVARCHIM
      ? strs['Shabbat Mevarchim Chodesh']
      : strs[ev.getDesc()] || strs[ev.basename()] || '';
  const str = str0.normalize();
  if (firstSentence && str) {
    const dot = str.indexOf('.');
    if (dot !== -1) {
      return str.substring(0, dot);
    }
  }
  return str;
}
