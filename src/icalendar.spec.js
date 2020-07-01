/* eslint-disable max-len */
import test from 'ava';
import {HebrewCalendar, Location} from '@hebcal/core';
import * as icalendar from './icalendar';

test('ical-sedra', (t) => {
  const options = {year: 1993, month: 4, sedrot: true, noHolidays: true};
  const events = new HebrewCalendar(options).events();
  const tzav = icalendar.eventToIcal(events[0], options);
  let lines = tzav.split('\r\n');
  t.is(lines.length, 13);
  t.is(lines[0], 'BEGIN:VEVENT');
  t.is(lines[7], 'TRANSP:TRANSPARENT');
  let expectedUrl = 'https://www.hebcal.com/sedrot/tzav?utm_source=js&utm_medium=icalendar';
  t.is(lines[10], `DESCRIPTION:Torah: Leviticus 6:1-8:36\\nHaftarah: Malachi 3:4 - 3:24 | Shabbat HaGadol\\n\\n${expectedUrl}`);
  t.is(lines[11], `URL:${expectedUrl}`);
  t.is(lines[12], 'END:VEVENT');

  const options2 = {year: 1993, month: 6, sedrot: true, noHolidays: true};
  const events2 = new HebrewCalendar(options2).events();
  const korach = icalendar.eventToIcal(events2[2], options);
  lines = korach.split('\r\n');
  t.is(lines.length, 13);
  t.is(lines[0], 'BEGIN:VEVENT');
  t.is(lines[7], 'TRANSP:TRANSPARENT');
  expectedUrl = 'https://www.hebcal.com/sedrot/korach?utm_source=js&utm_medium=icalendar';
  t.is(lines[10], `DESCRIPTION:Torah: Numbers 16:1-18:32\\nMaftir: Numbers 28:9 - 28:15 | Shabbat Rosh Chodesh\\nHaftarah: Isaiah 66:1 - 66:24 | Shabbat Rosh Chodesh\\n\\n${expectedUrl}`);
  t.is(lines[11], `URL:${expectedUrl}`);
  t.is(lines[12], 'END:VEVENT');
});

test('ical-transp-opaque', (t) => {
  const options = {
    year: 1993,
    month: 4,
    noMinorFast: true,
    noRoshChodesh: true,
    noSpecialShabbat: true,
  };
  const events = new HebrewCalendar(options).events();
  const memo = 'Passover, the Feast of Unleavened Bread';
  events[0].getAttrs().memo = memo;
  let lines = icalendar.eventToIcal(events[0], options).split('\r\n');
  t.is(lines.length, 13);
  t.is(lines[4], 'SUMMARY:Erev Pesach');
  t.is(lines[7], 'TRANSP:TRANSPARENT');
  const dtstart = lines[5];
  t.is(dtstart.startsWith('DTSTART'), true);
  t.is(dtstart.indexOf('VALUE=DATE'), 8);
  t.is(dtstart.substring(dtstart.indexOf(':') + 1), '19930405');
  const dtend = lines[6];
  t.is(dtend.startsWith('DTEND'), true);
  t.is(dtend.substring(dtend.indexOf(':') + 1), '19930406');
  const expectedUrl = 'https://www.hebcal.com/holidays/pesach?utm_source=js&utm_medium=icalendar'
  t.is(lines[10], `DESCRIPTION:Passover\\, the Feast of Unleavened Bread\\n\\n${expectedUrl}`);

  events[1].getAttrs().memo = memo;
  lines = icalendar.eventToIcal(events[1], options).split('\r\n');
  t.is(lines[4], 'SUMMARY:Pesach I');
  t.is(lines[7], 'TRANSP:OPAQUE');
  t.is(lines[10], `DESCRIPTION:Passover\\, the Feast of Unleavened Bread\\nTorah: Exodus 12:21-12:51\\nHaftarah: Joshua 5:2 - 6:1\\n\\n${expectedUrl}`);

  events[2].getAttrs().memo = memo;
  lines = icalendar.eventToIcal(events[2], options).split('\r\n');
  t.is(lines[4], 'SUMMARY:Pesach II');
  t.is(lines[7], 'TRANSP:OPAQUE');
  t.is(lines[10], `DESCRIPTION:Passover\\, the Feast of Unleavened Bread\\nTorah: Leviticus 22:26-23:44\\nHaftarah: II Kings 23:1 - 23:9\\; 23:21 - 23:25\\n\\n${expectedUrl}`);

  events[3].getAttrs().memo = memo;
  lines = icalendar.eventToIcal(events[3], options).split('\r\n');
  t.is(lines[4], 'SUMMARY:Pesach III (CH\'\'M)');
  t.is(lines[7], 'TRANSP:TRANSPARENT');
  t.is(lines[10], `DESCRIPTION:Passover\\, the Feast of Unleavened Bread\\nTorah: Exodus 13:1-28:25\\n\\n${expectedUrl}`);
});

test('ical-candles', (t) => {
  const options = {
    year: 1993,
    month: 3,
    location: new Location(41.85003, -87.65005, false, 'America/Chicago', 'Chicago', 'US', 4887398),
    candlelighting: true,
    noHolidays: true,
  };
  const events = new HebrewCalendar(options).events();
  const ical = icalendar.eventToIcal(events[0], options);
  let lines = ical.split('\r\n');
  t.is(lines.length, 18);
  t.is(lines[0], 'BEGIN:VEVENT');
  t.is(lines[4], 'SUMMARY:Candle lighting');
  t.is(lines[17], 'END:VEVENT');
  const dtstart = lines[5];
  t.is(dtstart.startsWith('DTSTART'), true);
  t.is(dtstart.indexOf('TZID='), 8);
  t.is(dtstart.substring(dtstart.indexOf(':') + 1), '19930305T172900');
  const dtend = lines[6];
  t.is(dtend.startsWith('DTEND'), true);
  t.is(dtend.substring(dtend.indexOf(':') + 1), '19930305T172900');
  t.is(lines[15], 'TRIGGER;RELATED=START:-PT10M');
  t.is(lines[10], 'LOCATION:Chicago');

  const havdalah = icalendar.eventToIcal(events[1], options);
  lines = havdalah.split('\r\n');
  t.is(lines.length, 13);
  t.is(lines[0], 'BEGIN:VEVENT');
  t.is(lines[4], 'SUMMARY:Havdalah');
  t.is(lines[10], 'LOCATION:Chicago');
});

test('ical-dafyomi', (t) => {
  const options = {
    year: 1993,
    month: 3,
    noHolidays: true,
    dafyomi: true,
    locale: 'he',
  };
  const ev = new HebrewCalendar(options).events()[0];
  t.is(ev.render(), 'דף יומי: נדרים 14');
  const ical = icalendar.eventToIcal(ev, options);
  const lines = ical.split('\r\n');
  t.is(lines.length, 14);
  t.is(lines[4], 'SUMMARY:נדרים 14');
  t.is(lines[11], 'LOCATION:דף יומי');
});

test('ical-omer', (t) => {
  const options = {year: 1993, noHolidays: true, omer: true};
  const ev = new HebrewCalendar(options).events()[0];
  const ical = icalendar.eventToIcal(ev, options);
  const lines = ical.split('\r\n');
  t.is(lines.length, 16);
  t.is(lines[4], 'SUMMARY:1st day of the Omer');
});

test('eventsToIcalendar', (t) => {
  const options = {
    year: 2020,
    month: 2,
    sedrot: true,
    candlelighting: true,
    location: Location.lookup('Hawaii'),
  };
  const events = new HebrewCalendar(options).events();
  const ical = icalendar.eventsToIcalendar(events, options);
  console.log(ical);
  t.pass('message');
});
