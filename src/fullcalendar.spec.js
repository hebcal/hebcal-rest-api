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
  const expected = [
    {
      title: 'Candle lighting',
      start: '1990-04-06T19:04:00-05:00',
      allDay: false,
      className: 'candles',
    },
    {
      title: 'Havdalah (50 min)',
      start: '1990-04-07T20:13:00-05:00',
      allDay: false,
      className: 'havdalah',
    },
    {
      title: 'Erev Pesach',
      start: '1990-04-09',
      allDay: true,
      className: 'holiday major',
      url: 'https://www.hebcal.com/holidays/pesach',
    },
    {
      title: 'Candle lighting',
      start: '1990-04-09T19:07:00-05:00',
      allDay: false,
      className: 'candles',
    },
    {
      title: 'Pesach I',
      start: '1990-04-10',
      allDay: true,
      className: 'holiday major yomtov',
      url: 'https://www.hebcal.com/holidays/pesach',
      description: 'Passover, the Feast of Unleavened Bread',
    },
    {
      title: 'Candle lighting',
      start: '1990-04-10T20:17:00-05:00',
      allDay: false,
      className: 'candles',
    },
    {
      title: 'Pesach II',
      start: '1990-04-11',
      allDay: true,
      className: 'holiday major yomtov',
      url: 'https://www.hebcal.com/holidays/pesach',
    },
    {
      title: 'Havdalah (50 min)',
      start: '1990-04-11T20:18:00-05:00',
      allDay: false,
      className: 'havdalah',
    },
    {
      title: 'Pesach III (CH\'\'M)',
      start: '1990-04-12',
      allDay: true,
      className: 'holiday major cholhamoed',
      url: 'https://www.hebcal.com/holidays/pesach',
    },
    {
      title: 'Pesach IV (CH\'\'M)',
      start: '1990-04-13',
      allDay: true,
      className: 'holiday major cholhamoed',
      url: 'https://www.hebcal.com/holidays/pesach',
    },
  ];
  for (let i = 0; i < fc.length; i++) {
    t.deepEqual(fc[i], expected[i], `FullCalendar result ${i} not equal`);
  }
});