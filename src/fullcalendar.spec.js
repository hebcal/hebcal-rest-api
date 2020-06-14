import test from 'ava';
import {hebcal, Location} from '@hebcal/core';
import {eventToFullCalendar} from './fullcalendar';

test('eventToFullCalendar', (t) => {
  const options = {
    year: 1990,
    month: 4,
    noMinorFast: true,
    noRoshChodesh: true,
    noSpecialShabbat: true,
    candlelighting: true,
    havdalahMins: 50,
    location: new Location(41.85003, -87.65005, false, 'America/Chicago', 'Chicago', 'US', 4887398),
  };
  const events = hebcal.hebrewCalendar(options).slice(0, 10);
  const memo = 'Passover, the Feast of Unleavened Bread';
  events[4].getAttrs().memo = memo;
  const tzid = options && options.location && options.location.tzid;
  const fc = events.map((ev) => eventToFullCalendar(ev, tzid));
  console.log(fc);
  t.pass('message');
});
