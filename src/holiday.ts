import {Event, flags} from '@hebcal/core/dist/esm/event';
import {Locale} from '@hebcal/hdate';
import poEn from './en.po.js';
import poHe from './he.po.js';

// Holiday descriptions are stored as gettext translations. The msgid
// strings are prefixed with `MEMO:` to avoid colliding with the actual
// holiday names already translated by `@hebcal/core`.
const MEMO_PREFIX = 'MEMO:';

Locale.addTranslations('en', poEn);
Locale.addTranslations('he', poHe);

/**
 * Returns a description of the holiday. Uses the English description by
 * default, or the Hebrew description when `locale` is a Hebrew locale.
 * Returns an empty string if no description is available.
 * @param ev - the holiday event to describe
 * @param firstSentence - `true` to truncate the description at the first
 *   sentence (up to and excluding the first `.`)
 * @param locale - the locale to render the description in; Hebrew locales
 *   (e.g. `'he'`) get the Hebrew description, everything else gets English
 * @returns the holiday description, or `''` if none is found
 */
export function getHolidayDescription(
  ev: Event,
  firstSentence = false,
  locale?: string
): string {
  const localeName = Locale.isHebrewLocale(locale) ? 'he' : 'en';
  const key =
    ev.getFlags() & flags.SHABBAT_MEVARCHIM
      ? 'Shabbat Mevarchim Chodesh'
      : ev.getDesc();
  const str0 =
    Locale.lookupTranslation(MEMO_PREFIX + key, localeName) ??
    Locale.lookupTranslation(MEMO_PREFIX + ev.basename(), localeName) ??
    '';
  const str = str0.normalize();
  if (firstSentence && str) {
    const dot = str.indexOf('.');
    if (dot !== -1) {
      return str.substring(0, dot);
    }
  }
  return str;
}
