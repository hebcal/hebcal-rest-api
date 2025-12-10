import {expect, test} from 'vitest';
import {Event, flags} from '@hebcal/core/dist/esm/event';
import {HebrewCalendar, Location, HDate} from '@hebcal/core';
import {makeTorahMemoText} from '../src/memo';

test('makeTorahMemoText', () => {
  const events = HebrewCalendar.calendar({
    noHolidays: true,
    sedrot: true,
    start: new Date(2021, 1, 13),
    end: new Date(2021, 1, 13),
  });
  const memo = makeTorahMemoText(events[0], false).split('\n');
  const expected = [
    'Torah: Exodus 21:1-24:18; Numbers 28:9-15; Exodus 30:11-16',
    'Haftarah: II Kings 12:1-17 | Shabbat Shekalim (on Rosh Chodesh)',
    'Haftarah for Sephardim: II Kings 11:17-12:17',
  ];
  expect(memo).toEqual(expected);
});

test('makeTorahMemoText-userEvent', () => {
  const hd = new HDate(new Date(2021, 1, 13));
  const userEvent = new Event(hd, 'User Event', flags.USER_EVENT);
  expect(makeTorahMemoText(userEvent, false)).toBe('');

  const holidayEvent = new Event(hd, 'Holiday Event', 0);
  expect(makeTorahMemoText(holidayEvent, false)).toBe('Haftarah: Isaiah 66:1-24');
});

test('makeTorahMemoText-untimed', () => {
  const ev1 = HebrewCalendar.calendar({
    start: new Date(2020, 11, 14),
    end: new Date(2020, 11, 14),
  })[0];
  expect(makeTorahMemoText(ev1, false)).toBe('Torah: Numbers 7:30-41');
  const ev2 = HebrewCalendar.calendar({
    start: new Date(2020, 11, 14),
    end: new Date(2020, 11, 14),
    location: Location.lookup('Boston'),
    candlelighting: true,
  })[0];
  expect(makeTorahMemoText(ev2, false)).toBe('');
});
