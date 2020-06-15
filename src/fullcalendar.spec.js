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
  t.is(fc[0].title, 'Candle lighting');
  t.is(fc[0].start, '1990-04-06T19:04:00-05:00');
  t.is(fc[0].allDay, false);
  t.is(fc[0].className, 'candles');

  t.is(fc[1].title, 'Havdalah (50 min)');
  t.is(fc[1].start, '1990-04-07T20:13:00-05:00');
  t.is(fc[1].allDay, false);
  t.is(fc[1].className, 'havdalah');

  t.is(fc[2].title, 'Erev Pesach');
  t.is(fc[2].start, '1990-04-09');
  t.is(fc[2].allDay, true);
  t.is(fc[2].className, 'holiday major');
  t.is(fc[2].url, 'https://www.hebcal.com/holidays/pesach');

  t.is(fc[4].title, 'Pesach I');
  t.is(fc[4].start, '1990-04-10');
  t.is(fc[4].allDay, true);
  t.is(fc[4].className, 'holiday major yomtov');
  t.is(fc[4].url, 'https://www.hebcal.com/holidays/pesach');
  t.is(fc[4].description, 'Passover, the Feast of Unleavened Bread');
});
