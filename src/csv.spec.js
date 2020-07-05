/* eslint-disable max-len */
import test from 'ava';
import {HebrewCalendar, Location} from '@hebcal/core';
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
  t.is(csv[0], `"Candle lighting","4/6/1990","7:04 PM","4/6/1990","7:04 PM","false","","4","Chicago"`);
  t.is(csv[1], `"Havdalah","4/7/1990","8:06 PM","4/7/1990","8:06 PM","false","","4","Chicago"`);
  t.is(csv[2], `"Erev Pesach","4/9/1990",,,,"true","Passover; the Feast of Unleavened Bread","3","Jewish Holidays"`);
  t.is(csv[3], `"Candle lighting","4/9/1990","7:07 PM","4/9/1990","7:07 PM","false","","4","Chicago"`);
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
