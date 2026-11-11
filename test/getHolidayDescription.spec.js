import {expect, test} from 'vitest';
import {Event, flags, HDate, HolidayEvent, ParshaEvent} from '@hebcal/core';
import {getHolidayDescription} from '../src/holiday';

test('getHolidayDescription-firstSentence', () => {
  const ev = new HolidayEvent(new HDate(14, 'Nisan', 5784), 'Erev Pesach', flags.EREV);
  expect(getHolidayDescription(ev, true))
    .toBe('Passover, the Feast of Unleavened Bread');
  expect(getHolidayDescription(ev, false))
    .toBe('Passover, the Feast of Unleavened Bread. Also called Chag HaMatzot (the Festival of Matzah), it commemorates the Exodus and freedom of the Israelites from ancient Egypt');
});

test('getHolidayDescription-ykk', () => {
  const ev = new HolidayEvent(new HDate(29, 'Tevet', 5784), 'Yom Kippur Katan', flags.MINOR_FAST);
  const s = getHolidayDescription(ev);
  expect(s).toBe('Minor day of atonement occurring monthly on the day preceeding each Rosh Chodesh');
});

test('getHolidayDescription-erev-ykk', () => {
  const ev = new HolidayEvent(new HDate(9, 'Tishrei', 5786), 'Erev Yom Kippur', flags.LIGHT_CANDLES | flags.EREV);
  const s = getHolidayDescription(ev);
  expect(s).toBe('Evening of Yom Kippur (Day of Atonement), which includes the Kol Nidre service. The Yom Kippur fast begins at sundown and continues for 25 hours');
});

test('getHolidayDescription Shabbat Mevarchim Chodesh', () => {
  const ev = new HolidayEvent(new HDate(25, 'Adar I', 5782),
      'Shabbat Mevarchim Chodesh Adar II', flags.SHABBAT_MEVARCHIM);
  const s = getHolidayDescription(ev);
  expect(s).toBe('Shabbat that precedes Rosh Chodesh. The congregation blesses the forthcoming new month');
});

test('getHolidayDescription-notfound', () => {
  const ev = new Event(new HDate(3, 'Tevet', 5784), 'Foobar', flags.USER_EVENT);
  const s = getHolidayDescription(ev);
  expect(s).toBe('');
});

test('getHolidayDescription-he', () => {
  const ev = new HolidayEvent(new HDate(30, 'Shvat', 5786), 'Family Day', flags.IL_ONLY);
  const s = getHolidayDescription(ev, false, 'he');
  expect(s).toBe('יום המשפחה, יום להוקרת התא המשפחתי');
  const s2 = getHolidayDescription(ev, false, 'en');
  expect(s2).toBe('Yom HaMishpacha, a day to honor the family unit');
});

test('getHolidayDescription returns empty string for ParshaEvent', () => {
  const ev = new ParshaEvent({
    hdate: new HDate(20, 'Cheshvan', 5787),
    parsha: ['Vayera'],
    num: 4,
    chag: false,
    il: false,
  });
  expect(ev.getDesc()).toBe('Parashat Vayera');
  expect(ev.basename()).toBe('Vayera');
  expect(getHolidayDescription(ev)).toBe('');
  expect(getHolidayDescription(ev, true)).toBe('');
  expect(getHolidayDescription(ev, false, 'he')).toBe('');
});
