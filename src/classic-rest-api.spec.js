import test from 'ava';
import {hebcal, Location} from '@hebcal/core';
import {eventToClassicApiObject} from './classic-rest-api';

test('eventToClassicApiObject', (t) => {
  const location = Location.lookup('Sao Paulo');
  const options = {
    start: new Date(2020, 4, 22),
    end: new Date(2020, 4, 30),
    sedrot: true,
    candlelighting: true,
    havdalahMins: 50,
    location: location,
  };
  const events = hebcal.hebrewCalendar(options);
  const objs = events.map((ev) => eventToClassicApiObject(ev, location.getTzid(), false));
  objs.forEach((o) => console.log(o));
  t.pass('message');
});
