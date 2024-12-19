import {expect, test} from 'vitest';
import {HebrewCalendar, Location, HDate, HebrewDateEvent} from '@hebcal/core';
import {DafYomiEvent} from '@hebcal/learning';
import {eventToFullCalendar} from '../src/fullcalendar';

test('eventToFullCalendar', () => {
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
  const tzid = options.location.getTzid();
  const fc = events.map((ev) => eventToFullCalendar(ev, tzid));
  const pesachMemo = 'Passover, the Feast of Unleavened Bread. Also called Chag HaMatzot (the Festival of Matzah),' +
    ' it commemorates the Exodus and freedom of the Israelites from ancient Egypt';
  const expectedUrl = 'https://hebcal.com/h/pesach-1990?us=js&um=fc';
  const expected = [
    {
      title: 'Candle lighting',
      start: '1990-04-06T19:04:00-05:00',
      allDay: false,
      hebrew: 'הדלקת נרות',
      className: 'candles',
    },
    {
      title: 'Havdalah (50 min)',
      start: '1990-04-07T20:14:00-05:00',
      allDay: false,
      hebrew: 'הבדלה (50 דקות)',
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
      start: '1990-04-09T19:07:00-05:00',
      allDay: false,
      hebrew: 'הדלקת נרות',
      className: 'candles',
    },
    {
      title: 'Pesach I',
      start: '1990-04-10',
      allDay: true,
      hebrew: 'פסח א׳',
      className: 'holiday major yomtov',
      url: expectedUrl,
      description: pesachMemo,
    },
    {
      title: 'Candle lighting',
      start: '1990-04-10T20:17:00-05:00',
      allDay: false,
      hebrew: 'הדלקת נרות',
      className: 'candles',
    },
    {
      title: 'Pesach II',
      start: '1990-04-11',
      allDay: true,
      hebrew: 'פסח ב׳',
      className: 'holiday major yomtov',
      url: expectedUrl,
      description: pesachMemo,
    },
    {
      title: 'Havdalah (50 min)',
      start: '1990-04-11T20:18:00-05:00',
      allDay: false,
      hebrew: 'הבדלה (50 דקות)',
      className: 'havdalah',
    },
    {
      title: 'Pesach III (CH’’M)',
      start: '1990-04-12',
      allDay: true,
      hebrew: 'פסח ג׳ (חוה״מ)',
      className: 'holiday major cholhamoed',
      url: expectedUrl,
      description: pesachMemo,
    },
    {
      title: 'Pesach IV (CH’’M)',
      start: '1990-04-13',
      allDay: true,
      hebrew: 'פסח ד׳ (חוה״מ)',
      className: 'holiday major cholhamoed',
      url: expectedUrl,
      description: pesachMemo,
    },
  ];
  expect(fc).toEqual(expected);
});

test('chanukah-candles', () => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 11),
    location: Location.lookup('Boston'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const tzid = options.location.getTzid();
  const fc = events.map((ev) => eventToFullCalendar(ev, tzid));
  for (const item of fc) {
    delete item.description;
  }
  const expected = [
    {
      title: 'Chanukah: 1 Candle',
      start: '2020-12-10T16:36:00-05:00',
      allDay: false,
      className: 'holiday major',
      hebrew: 'חנוכה: א׳ נר',
      url: 'https://hebcal.com/h/chanukah-2020?us=js&um=fc',
    },
    {
      title: 'Chanukah: 2 Candles',
      start: '2020-12-11T15:53:00-05:00',
      allDay: false,
      className: 'holiday major',
      hebrew: 'חנוכה: ב׳ נרות',
      url: 'https://hebcal.com/h/chanukah-2020?us=js&um=fc',
    },
    {
      title: 'Candle lighting',
      start: '2020-12-11T15:53:00-05:00',
      allDay: false,
      className: 'candles',
      hebrew: 'הדלקת נרות',
    },
  ];
  expect(fc).toEqual(expected);
});

test('chanukah-nocandles', () => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 11),
  };
  const events = HebrewCalendar.calendar(options);
  const fc = events.map((ev) => eventToFullCalendar(ev, 'UTC'));
  for (const item of fc) {
    delete item.description;
  }
  const expected = [
    {
      title: 'Chanukah: 1 Candle',
      start: '2020-12-10',
      allDay: true,
      className: 'holiday major',
      hebrew: 'חנוכה: א׳ נר',
      url: 'https://hebcal.com/h/chanukah-2020?us=js&um=fc',
    },
    {
      title: 'Chanukah: 2 Candles',
      start: '2020-12-11',
      allDay: true,
      className: 'holiday major',
      hebrew: 'חנוכה: ב׳ נרות',
      url: 'https://hebcal.com/h/chanukah-2020?us=js&um=fc',
    },
  ];

  expect(fc).toEqual(expected);
});

test('fastStartEnd', () => {
  const options = {
    start: new Date(2021, 5, 27),
    end: new Date(2021, 5, 27),
    location: Location.lookup('Providence'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const tzid = options.location.getTzid();
  const fc = events.map((ev) => eventToFullCalendar(ev, tzid));
  const expected = [
    {
      title: 'Fast begins',
      start: '2021-06-27T03:20:00-04:00',
      allDay: false,
      className: 'zmanim fast',
      hebrew: 'תחילת הצום',
      description: 'Tzom Tammuz',
    },
    {
      title: 'Tzom Tammuz',
      start: '2021-06-27',
      allDay: true,
      className: 'holiday fast',
      hebrew: 'צום תמוז',
      url: 'https://hebcal.com/h/tzom-tammuz-2021?us=js&um=fc',
      description: 'Fast commemorating breaching of the walls of Jerusalem before the destruction of the Second Temple',
    },
    {
      title: 'Fast ends',
      start: '2021-06-27T21:07:00-04:00',
      allDay: false,
      className: 'zmanim fast',
      hebrew: 'סיום הצום',
      description: 'Tzom Tammuz',
    },
  ];
  expect(fc).toEqual(expected);
});

test('bce', () => {
  const options = {
    start: new Date(-1, 4, 6),
    end: new Date(-1, 4, 6),
    il: false,
  };
  const ev = HebrewCalendar.calendar(options)[0];
  const fc = eventToFullCalendar(ev);
  const expected = {
    title: 'Erev Shavuot',
    start: '-000001-05-06',
    allDay: true,
    className: 'holiday major',
    hebrew: 'ערב שבועות',
    description: 'Festival of Weeks. Commemorates the giving of the Torah at Mount Sinai',
  };
  expect(fc).toEqual(expected);
});

test('daf-yomi', () => {
  const ev = new DafYomiEvent(new HDate(new Date(1995, 11, 17)));
  const fc = eventToFullCalendar(ev, null, false);
  const expected = {
    title: 'Avodah Zarah 68',
    start: '1995-12-17',
    allDay: true,
    className: 'dafyomi',
    hebrew: 'עבודה זרה דף ס״ח',
    url: 'https://www.sefaria.org/Avodah_Zarah.68a?lang=bi&utm_source=hebcal.com&utm_medium=fc',
  };
  expect(fc).toEqual(expected);
});

test('hebdate', () => {
  const ev = new HebrewDateEvent(new HDate(new Date(1995, 11, 17)));
  const fc = eventToFullCalendar(ev, null, false);
  const expected = {
    title: '24th of Kislev',
    start: '1995-12-17',
    allDay: true,
    className: 'hebdate',
    hebrew: 'כ״ד כסלו',
  };
  expect(fc).toEqual(expected);
});
