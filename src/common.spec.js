import test from 'ava';
import {getDownloadFilename, getCalendarTitle, makeTorahMemoText} from './common';
import {HebrewCalendar, Location, Event, HDate, flags} from '@hebcal/core';

test('getDownloadFilename', (t) => {
  const location = new Location(38.672294, -90.533239, false, 'America/Chicago',
      'Chesterfield, MO 63017', 'US', '63017');
  const options = {
    year: 2018,
    sedrot: true,
    candlelighting: true,
    location: location,
  };
  t.is(getDownloadFilename(options), 'hebcal_2018_Chesterfield');
  options.year = 5749;
  options.isHebrewYear = true;
  t.is(getDownloadFilename(options), 'hebcal_5749H_Chesterfield');
  t.is(getDownloadFilename({year: 2017}), 'hebcal_2017');
  t.is(getDownloadFilename({year: 2017, il: true}), 'hebcal_2017');
  t.is(getDownloadFilename({year: 5780, isHebrewYear: true}), 'hebcal_5780H');

  const loc2 = new Location(-23.5475, -46.63611, false, 'America/Sao_Paulo',
      'São Paulo, Brazil', 'BR', 3448439);
  loc2.asciiname = 'Sao Paulo';
  options.location = loc2;
  t.is(getDownloadFilename(options), 'hebcal_5749H_Sao_Paulo');

  const loc3 = new Location(34.103131, -118.416253, false, 'America/Los_Angeles',
      'Beverly Hills, CA 90210', 'US', '90210');
  loc3.state = 'CA';
  loc3.zip = '90210';
  options.location = loc3;
  t.is(getDownloadFilename(options), 'hebcal_5749H_90210');

  const loc4 = new Location(32.1836, 34.87386, true, 'Asia/Jerusalem',
      'Ra\'anana, Israel', 'IL', 293807);
  loc4.asciiname = 'Ra\'anana';
  loc4.admin1 = 'Central District';
  options.location = loc4;
  t.is(getDownloadFilename(options), 'hebcal_5749H_Ra_anana');
});

test('getCalendarTitle', (t) => {
  const location = new Location(38.672294, -90.533239, false, 'America/Chicago',
      'Chesterfield, MO 63017', 'US', '63017');
  let options = {
    year: 2018,
    sedrot: true,
    candlelighting: true,
    location: location,
  };
  let events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Chesterfield 2018');

  options.year = 5749;
  options.isHebrewYear = true;
  events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Chesterfield 5749');

  options = {year: 2017};
  events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Diaspora 2017');

  options = {year: 2017, il: true};
  events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Israel 2017');

  options = {year: 5780, isHebrewYear: true};
  events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Diaspora 5780');
});

test('makeTorahMemoText', (t) => {
  const events = HebrewCalendar.calendar({
    noHolidays: true,
    sedrot: true,
    start: new Date(2021, 1, 13),
    end: new Date(2021, 1, 13),
  });
  const memo = makeTorahMemoText(events[0], false).split('\n');
  const expected = [
    'Torah: Exodus 21:1-24:18; Numbers 28:9-15; Exodus 30:11-16',
    'Haftarah: II Kings 12:1 - 12:17 | Shabbat Shekalim (on Rosh Chodesh)',
  ];
  t.deepEqual(memo, expected);
});

test('makeTorahMemoText-userEvent', (t) => {
  const hd = new HDate(new Date(2021, 1, 13));
  const userEvent = new Event(hd, 'User Event', flags.USER_EVENT);
  t.is(makeTorahMemoText(userEvent, false), '');

  const holidayEvent = new Event(hd, 'Holiday Event', 0);
  t.is(makeTorahMemoText(holidayEvent, false), 'Haftarah: Isaiah 66:1 - 66:24');
});
