/* eslint-disable max-len */
import test from 'ava';
import {HebrewCalendar, Location, HDate, HebrewDateEvent} from '@hebcal/core';
import {eventToCsv, eventsToCsv} from './csv';

test('eventToCsv', (t) => {
  const options = {
    year: 1990,
    month: 4,
    noMinorFast: true,
    noRoshChodesh: true,
    noSpecialShabbat: true,
    candlelighting: true,
    location: Location.lookup('Chicago'),
  };
  const events = HebrewCalendar.calendar(options).slice(0, 5);
  const csv = events.map((e) => eventToCsv(e, options));
  t.is(csv[0], `"Candle lighting","4/6/1990","7:03 PM","4/6/1990","7:03 PM","false","","4","Chicago"`);
  t.is(csv[1], `"Havdalah","4/7/1990","8:05 PM","4/7/1990","8:05 PM","false","","4","Chicago"`);
  t.is(csv[2], `"Erev Pesach","4/9/1990",,,,"true","Passover; the Feast of Unleavened Bread","3","Jewish Holidays"`);
  t.is(csv[3], `"Candle lighting","4/9/1990","7:06 PM","4/9/1990","7:06 PM","false","Erev Pesach","4","Chicago"`);
  t.is(csv[4], `"Pesach I","4/10/1990",,,,"true","Passover; the Feast of Unleavened Bread","4","Jewish Holidays"`);
});

test('eventsToCsv', (t) => {
  const options = {
    start: new Date(1990, 3, 10),
    end: new Date(1990, 3, 10),
  };
  const events = HebrewCalendar.calendar(options);
  const csv = eventsToCsv(events, options).split('\r\n');
  t.is(csv.length, 3);
  const csvHeader = '"Subject","Start Date","Start Time","End Date","End Time","All day event","Description","Show time as","Location"';
  t.is(csv[0], csvHeader);
  t.is(csv[1], `"Pesach I","4/10/1990",,,,"true","Passover; the Feast of Unleavened Bread","4","Jewish Holidays"`);
  t.is(csv[2], '');
});

test('appendHebrewToSubject', (t) => {
  const options = {
    start: new Date(2020, 4, 23),
    end: new Date(2020, 4, 30),
    sedrot: true,
    candlelighting: true,
    havdalahMins: 42,
    location: Location.lookup('Gibraltar'),
    appendHebrewToSubject: true,
  };
  const events = HebrewCalendar.calendar(options);
  const csv = eventsToCsv(events, options).split('\r\n').slice(1, 10);
  const subject = csv.map((line) => line.substring(0, line.indexOf(',')));
  const expected = [
    '"Parashat Bamidbar / פָּרָשַׁת בְּמִדְבַּר"',
    '"Havdalah (42 min) / הַבדָלָה (42 דקות)"',
    '"Rosh Chodesh Sivan / רֹאשׁ חוֹדֶשׁ סִיוָן"',
    '"Erev Shavuot / עֶרֶב שָׁבוּעוֹת"',
    '"Candle lighting / הַדלָקָת נֵרוֹת"',
    '"Shavuot I / שָׁבוּעוֹת א׳"',
    '"Candle lighting / הַדלָקָת נֵרוֹת"',
    '"Shavuot II / שָׁבוּעוֹת ב׳"',
    '"Havdalah (42 min) / הַבדָלָה (42 דקות)"',
  ];
  t.deepEqual(subject, expected);
});

test('chanukah-candles', (t) => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 10),
    location: Location.lookup('Boston'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const csv = eventToCsv(events[0], options);
  t.is(csv, '"Chanukah: 1 Candle","12/10/2020","4:43 PM","12/10/2020","4:43 PM","false","Hanukkah; the Jewish festival of rededication","4","Boston"');
});

test('fastStartEnd', (t) => {
  const options = {
    start: new Date(2021, 5, 27),
    end: new Date(2021, 5, 27),
    location: Location.lookup('Providence'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const csv = eventsToCsv(events, options).split('\r\n').slice(1, 4);
  const expected = [
    '"Fast begins","6/27/2021","3:20 AM","6/27/2021","3:20 AM","false","Tzom Tammuz","4","Providence"',
    '"Tzom Tammuz","6/27/2021",,,,"true","Fast commemorating breaching of the walls of Jerusalem before the destruction of the Second Temple","3","Jewish Holidays"',
    '"Fast ends","6/27/2021","9:07 PM","6/27/2021","9:07 PM","false","Tzom Tammuz","4","Providence"',
  ];
  t.deepEqual(csv, expected);
});

test('HebrewDateEvent', (t) => {
  const ev = new HebrewDateEvent(new HDate(new Date(1995, 11, 17)));
  t.is(eventToCsv(ev, {locale: 'en'}), '"24th of Kislev","12/17/1995",,,,"true","","3","Hebrew Date"');
  t.is(eventToCsv(ev, {locale: 'he'}), '"כ״ד כִּסְלֵו","12/17/1995",,,,"true","","3","Hebrew Date"');
  t.is(eventToCsv(ev, {locale: 'he-x-NoNikud'}), '"כ״ד כסלו","12/17/1995",,,,"true","","3","Hebrew Date"');
});
