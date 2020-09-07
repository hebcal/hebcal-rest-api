import test from 'ava';
import {HebrewCalendar, Location} from '@hebcal/core';
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
  const events = HebrewCalendar.calendar(options).slice(0, 10);
  const tzid = options && options.location && options.location.tzid;
  const fc = events.map((ev) => eventToFullCalendar(ev, tzid));
  const pesachMemo = 'Passover, the Feast of Unleavened Bread. Also called Chag HaMatzot (the Festival of Matzah),' +
    ' it commemorates the Exodus and freedom of the Israelites from ancient Egypt';
  const expectedUrl = 'https://www.hebcal.com/holidays/pesach-1990?utm_source=js&utm_medium=fc';
  const expected = [
    {
      title: 'Candle lighting',
      start: '1990-04-06T19:03:00-05:00',
      allDay: false,
      hebrew: 'הדלקת נרות',
      className: 'candles',
    },
    {
      title: 'Havdalah (50 min)',
      start: '1990-04-07T20:13:00-05:00',
      allDay: false,
      hebrew: 'הבדלה',
      className: 'havdalah',
    },
    {
      title: 'Erev Pesach',
      start: '1990-04-09',
      allDay: true,
      hebrew: 'ערב פסח',
      className: 'holiday major',
      description: pesachMemo,
      url: expectedUrl,
    },
    {
      title: 'Candle lighting',
      start: '1990-04-09T19:06:00-05:00',
      allDay: false,
      hebrew: 'הדלקת נרות',
      className: 'candles',
    },
    {
      title: 'Pesach I',
      start: '1990-04-10',
      allDay: true,
      hebrew: 'פסח יום א׳',
      className: 'holiday major yomtov',
      url: expectedUrl,
      description: pesachMemo,
    },
    {
      title: 'Candle lighting',
      start: '1990-04-10T20:16:00-05:00',
      allDay: false,
      hebrew: 'הדלקת נרות',
      className: 'candles',
    },
    {
      title: 'Pesach II',
      start: '1990-04-11',
      allDay: true,
      hebrew: 'פסח יום ב׳',
      className: 'holiday major yomtov',
      url: expectedUrl,
      description: pesachMemo,
    },
    {
      title: 'Havdalah (50 min)',
      start: '1990-04-11T20:17:00-05:00',
      allDay: false,
      hebrew: 'הבדלה',
      className: 'havdalah',
    },
    {
      title: 'Pesach III (CH\'\'M)',
      start: '1990-04-12',
      allDay: true,
      hebrew: 'פסח יום ג׳ (חול המועד)',
      className: 'holiday major cholhamoed',
      url: expectedUrl,
      description: pesachMemo,
    },
    {
      title: 'Pesach IV (CH\'\'M)',
      start: '1990-04-13',
      allDay: true,
      hebrew: 'פסח יום ד׳ (חול המועד)',
      className: 'holiday major cholhamoed',
      url: expectedUrl,
      description: pesachMemo,
    },
  ];
  t.deepEqual(fc, expected);
});

test('chanukah-candles', (t) => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 11),
    location: Location.lookup('Boston'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const tzid = options && options.location && options.location.tzid;
  const fc = events.map((ev) => eventToFullCalendar(ev, tzid));
  const expected = [
    {
      title: 'Chanukah: 1 Candle',
      start: '2020-12-10T16:58:00-05:00',
      allDay: false,
      className: 'holiday major',
      hebrew: 'חנוכה: א׳ נר',
      url: 'https://www.hebcal.com/holidays/chanukah-2020?utm_source=js&utm_medium=fc',
      description: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Chanukah: 2 Candles',
      start: '2020-12-11T15:53:00-05:00',
      allDay: false,
      className: 'holiday major',
      hebrew: 'חנוכה: ב׳ נרות',
      url: 'https://www.hebcal.com/holidays/chanukah-2020?utm_source=js&utm_medium=fc',
      description: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Candle lighting',
      start: '2020-12-11T15:53:00-05:00',
      allDay: false,
      className: 'candles',
      hebrew: 'הדלקת נרות',
    },
  ];
  t.deepEqual(fc, expected);
});

test('chanukah-nocandles', (t) => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 11),
  };
  const events = HebrewCalendar.calendar(options);
  const fc = events.map((ev) => eventToFullCalendar(ev, 'UTC'));
  const expected = [
    {
      title: 'Chanukah: 1 Candle',
      start: '2020-12-10',
      allDay: true,
      className: 'holiday major',
      hebrew: 'חנוכה: א׳ נר',
      url: 'https://www.hebcal.com/holidays/chanukah-2020?utm_source=js&utm_medium=fc',
      description: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Chanukah: 2 Candles',
      start: '2020-12-11',
      allDay: true,
      className: 'holiday major',
      hebrew: 'חנוכה: ב׳ נרות',
      url: 'https://www.hebcal.com/holidays/chanukah-2020?utm_source=js&utm_medium=fc',
      description: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
  ];

  t.deepEqual(fc, expected);
});
