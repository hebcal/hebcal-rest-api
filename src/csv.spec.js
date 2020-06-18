/* eslint-disable max-len */
import test from 'ava';
import {hebcal, Location} from '@hebcal/core';
import {eventToCsv} from './csv';

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
  const events = hebcal.hebrewCalendar(options).slice(0, 5);
  const memo = 'Passover, the Feast of Unleavened Bread';
  events[4].getAttrs().memo = memo;
  const csv = events.map((e) => eventToCsv(e, options));
  t.is(csv[0], `"Candle lighting",4/6/1990,"7:04 PM",4/6/1990,"7:04 PM","false","",4,"Chicago"`);
  t.is(csv[1], `"Havdalah",4/7/1990,"8:06 PM",4/7/1990,"8:06 PM","false","",4,"Chicago"`);
  t.is(csv[2], `"Erev Pesach",4/9/1990,,,,"true","",3,"Jewish Holidays"`);
  t.is(csv[3], `"Candle lighting",4/9/1990,"7:07 PM",4/9/1990,"7:07 PM","false","",4,"Chicago"`);
  t.is(csv[4], `"Pesach I",4/10/1990,,,,"true","Passover; the Feast of Unleavened Bread",4,"Jewish Holidays"`);
});
