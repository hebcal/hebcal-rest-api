import test from 'ava';
import {timeZoneOffsetStr, getDownloadFilename, getCalendarTitle, makeTorahMemoText} from './common';
import {HebrewCalendar, Location, Event, HDate, flags} from '@hebcal/core';

test('timeZoneOffsetStr', (t) => {
  const winter = new Date(Date.UTC(2020, 1, 22, 0, 0, 0, 0));
  const summer = new Date(Date.UTC(2020, 6, 22, 0, 0, 0, 0));
  const tzids = [
    ['Africa/Johannesburg', '+02:00', '+02:00'],
    ['America/Anchorage', '-09:00', '-08:00'],
    ['America/Argentina/Buenos_Aires', '-03:00', '-03:00'],
    ['America/Bogota', '-05:00', '-05:00'],
    ['America/Chicago', '-06:00', '-05:00'],
    ['America/Denver', '-07:00', '-06:00'],
    ['America/Detroit', '-05:00', '-04:00'],
    ['America/La_Paz', '-04:00', '-04:00'],
    ['America/Los_Angeles', '-08:00', '-07:00'],
    ['America/Mexico_City', '-06:00', '-05:00'],
    ['America/New_York', '-05:00', '-04:00'],
    ['America/Panama', '-05:00', '-05:00'],
    ['America/Phoenix', '-07:00', '-07:00'],
    ['America/Sao_Paulo', '-03:00', '-03:00'],
    ['America/St_Johns', '-03:30', '-02:30'],
    ['America/Toronto', '-05:00', '-04:00'],
    ['Asia/Baghdad', '+03:00', '+03:00'],
    ['Asia/Colombo', '+05:30', '+05:30'],
    ['Asia/Jerusalem', '+02:00', '+03:00'],
    ['Asia/Kolkata', '+05:30', '+05:30'],
    ['Asia/Seoul', '+09:00', '+09:00'],
    ['Australia/Melbourne', '+11:00', '+10:00'],
    ['Australia/Sydney', '+11:00', '+10:00'],
    ['Europe/Berlin', '+01:00', '+02:00'],
    ['Europe/Budapest', '+01:00', '+02:00'],
    ['Europe/Gibraltar', '+01:00', '+02:00'],
    ['Europe/Helsinki', '+02:00', '+03:00'],
    ['Europe/Kiev', '+02:00', '+03:00'],
    ['Europe/London', '-00:00', '+01:00'],
    ['Europe/Moscow', '+03:00', '+03:00'],
    ['Europe/Paris', '+01:00', '+02:00'],
    ['Pacific/Honolulu', '-10:00', '-10:00'],
  ];
  for (const [tzid, wtz, stz] of tzids) {
    t.is(timeZoneOffsetStr(tzid, winter), wtz, `${tzid} winter`);
    t.is(timeZoneOffsetStr(tzid, summer), stz, `${tzid} summer`);
  }
});

test.skip('timeZoneOffsetStr-pacific', (t) => {
  const winter = new Date(Date.UTC(2020, 1, 22, 0, 0, 0, 0));
  const summer = new Date(Date.UTC(2020, 6, 22, 0, 0, 0, 0));
  const tzids = [
    ['Pacific/Auckland', '-11:00', '+12:00'],
    ['Pacific/Tarawa', '+12:00', '+12:00'],
    ['Pacific/Apia', '+14:00', '+13:00'],
  ];
  for (const [tzid, wtz, stz] of tzids) {
    t.is(timeZoneOffsetStr(tzid, winter), wtz, `${tzid} winter`);
    t.is(timeZoneOffsetStr(tzid, summer), stz, `${tzid} summer`);
  }
});

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
    'Torah: Exodus 21:1-24:18',
    '7th aliyah: Numbers 28:9 - 28:15 | Shabbat Shekalim (on Rosh Chodesh)',
    'Maftir: Exodus 30:11 - 30:16 | Shabbat Shekalim (on Rosh Chodesh)',
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
