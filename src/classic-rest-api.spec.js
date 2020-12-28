import test from 'ava';
import {HebrewCalendar, Location} from '@hebcal/core';
import {eventsToClassicApi, eventToClassicApiObject} from './classic-rest-api';

test('eventToClassicApiObject', (t) => {
  const location = Location.lookup('Paris');
  const options = {
    start: new Date(2020, 4, 22),
    end: new Date(2020, 4, 30),
    sedrot: true,
    candlelighting: true,
    havdalahMins: 50,
    location: location,
    il: false,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options));
  const candlesActual = apiObjs[1];
  const candlesExpected = {
    title: 'Candle lighting: 21:17',
    date: '2020-05-22T21:17:00+02:00',
    category: 'candles',
    hebrew: 'הדלקת נרות',
    title_orig: 'Candle lighting',
  };
  t.deepEqual(candlesActual, candlesExpected);
  const bamidbarActual = apiObjs[2];
  const bamidbarExpected = {
    title: 'Parashat Bamidbar',
    date: '2020-05-23',
    category: 'parashat',
    hebrew: 'פרשת במדבר',
    leyning: {
      '1': 'Numbers 1:1 - 1:19',
      '2': 'Numbers 1:20 - 1:54',
      '3': 'Numbers 2:1 - 2:34',
      '4': 'Numbers 3:1 - 3:13',
      '5': 'Numbers 3:14 - 3:39',
      '6': 'Numbers 3:40 - 3:51',
      '7': 'Numbers 4:1 - 4:20',
      'torah': 'Numbers 1:1-4:20',
      'haftarah': 'I Samuel 20:18 - 20:42 | Shabbat Machar Chodesh',
      'maftir': 'Numbers 4:17 - 4:20',
      'triennial': {
        '1': 'Numbers 1:1 - 1:4',
        '2': 'Numbers 1:5 - 1:16',
        '3': 'Numbers 1:17 - 1:19',
        '4': 'Numbers 1:20 - 1:27',
        '5': 'Numbers 1:28 - 1:35',
        '6': 'Numbers 1:36 - 1:43',
        '7': 'Numbers 1:44 - 1:54',
        'maftir': 'Numbers 1:52 - 1:54',
      },
    },
    link: 'https://www.hebcal.com/sedrot/bamidbar-20200523?utm_source=js&utm_medium=api',
  };
  t.deepEqual(bamidbarActual, bamidbarExpected);
  const shavuotActual = apiObjs[7];
  const shavuotExpected = {
    title: 'Shavuot I',
    date: '2020-05-29',
    category: 'holiday',
    subcat: 'major',
    memo: 'Festival of Weeks. Commemorates the giving of the Torah at Mount Sinai',
    yomtov: true,
    hebrew: 'שבועות יום א׳',
    leyning: {
      '1': 'Exodus 19:1 - 19:6',
      '2': 'Exodus 19:7 - 19:13',
      '3': 'Exodus 19:14 - 19:19',
      '4': 'Exodus 19:20 - 20:14',
      '5': 'Exodus 20:15 - 20:23',
      'torah': 'Exodus 19:1-20:23; Numbers 28:26-28:31',
      'haftarah': 'Ezekiel 1:1-28; 3:12',
      'maftir': 'Numbers 28:26 - 28:31',
    },
    link: 'https://www.hebcal.com/holidays/shavuot-2020?utm_source=js&utm_medium=api',
  };
  t.deepEqual(shavuotActual, shavuotExpected);
});

test('eventsToClassicApi', (t) => {
  const location = Location.lookup('Vancouver');
  const options = {
    year: 2022,
    month: 5,
    sedrot: true,
    candlelighting: true,
    havdalahMins: 42,
    location: location,
  };
  const events = HebrewCalendar.calendar(options);
  const apiResult = eventsToClassicApi(events, options);
  t.is(apiResult.title, 'Hebcal Vancouver May 2022');
  const locationExpected = {
    cc: 'CA',
    city: 'Vancouver',
    title: 'Vancouver',
    country: 'Canada',
    latitude: 49.24966,
    longitude: -123.11934,
    tzid: 'America/Vancouver',
  };
  t.deepEqual(apiResult.location, locationExpected);
  t.is(Array.isArray(apiResult.items), true);
  const roshChodesh = apiResult.items[0];
  const roshChodeshExpected = {
    category: 'roshchodesh',
    date: '2022-05-01',
    hebrew: 'ראש חודש אייר',
    link: 'https://www.hebcal.com/holidays/rosh-chodesh-iyyar-2022?utm_source=js&utm_medium=api',
    title: 'Rosh Chodesh Iyyar',
    // eslint-disable-next-line max-len
    memo: 'Beginning of new Hebrew month of Iyyar. Iyyar (somtimes transliterated Iyar) is the 2nd month of the Hebrew year. Corresponds to April or May on the Gregorian calendar',
  };
  t.deepEqual(roshChodesh, roshChodeshExpected);
  const candleLighting = apiResult.items[4];
  const candleLightingExpected = {
    category: 'candles',
    date: '2022-05-06T20:18:00-07:00',
    hebrew: 'הדלקת נרות',
    title: 'Candle lighting: 8:18pm',
    title_orig: 'Candle lighting',
  };
  t.deepEqual(candleLighting, candleLightingExpected);
});

test('classic-api-no-sedra', (t) => {
  const options = {start: new Date(2022, 4, 15), end: new Date(2022, 5, 1), il: true};
  const events = HebrewCalendar.calendar(options);
  const apiResult = eventsToClassicApi(events, options);
  delete apiResult.date;
  const expected = {
    title: 'Hebcal Israel May 2022',
    location: {
      geo: 'none',
    },
    items: [
      {
        title: 'Pesach Sheni',
        date: '2022-05-15',
        category: 'holiday',
        subcat: 'minor',
        hebrew: 'פסח שני',
        link: 'https://www.hebcal.com/holidays/pesach-sheni-2022?i=on&utm_source=js&utm_medium=api',
        memo: 'Second Passover, one month after Passover',
      },
      {
        title: 'Lag BaOmer',
        date: '2022-05-19',
        category: 'holiday',
        subcat: 'minor',
        hebrew: 'ל״ג בעומר',
        link: 'https://www.hebcal.com/holidays/lag-baomer-2022?i=on&utm_source=js&utm_medium=api',
        memo: '33rd day of counting the Omer',
      },
      {
        title: 'Yom Yerushalayim',
        date: '2022-05-29',
        category: 'holiday',
        subcat: 'modern',
        hebrew: 'יום ירושלים',
        link: 'https://www.hebcal.com/holidays/yom-yerushalayim-2022?i=on&utm_source=js&utm_medium=api',
        memo: 'Jerusalem Day. Commemorates the re-unification of Jerusalem in 1967',
      },
      {
        title: 'Rosh Chodesh Sivan',
        date: '2022-05-31',
        category: 'roshchodesh',
        hebrew: 'ראש חודש סיון',
        link: 'https://www.hebcal.com/holidays/rosh-chodesh-sivan-2022?i=on&utm_source=js&utm_medium=api',
        // eslint-disable-next-line max-len
        memo: 'Beginning of new Hebrew month of Sivan. Sivan is the 3rd month of the Hebrew year. Corresponds to May or June on the Gregorian calendar',
      },
    ],
  };
  t.deepEqual(apiResult, expected);
});

test('reformat-time-usa', (t) => {
  const options = {
    start: new Date(2020, 4, 22),
    end: new Date(2020, 4, 30),
    noHolidays: true,
    location: Location.lookup('Boston'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const expected = {
    title: 'Candle lighting: 7:48pm',
    date: '2020-05-22T19:48:00-04:00',
    category: 'candles',
    title_orig: 'Candle lighting',
    hebrew: 'הדלקת נרות',
  };
  t.deepEqual(apiObjs[0], expected);
});

test('no-leyning', (t) => {
  const options = {
    start: new Date(2020, 4, 22),
    end: new Date(2020, 4, 30),
    sedrot: true,
    il: true,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const bamidbarActual = apiObjs[1];
  const bamidbarExpected = {
    title: 'Parashat Bamidbar',
    date: '2020-05-23',
    category: 'parashat',
    hebrew: 'פרשת במדבר',
    link: 'https://www.hebcal.com/sedrot/bamidbar-20200523?i=on&utm_source=js&utm_medium=api',
  };
  t.deepEqual(bamidbarActual, bamidbarExpected);
});

test('2-digit-year', (t) => {
  const options = {
    year: 23,
    month: 1,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  t.is(apiObjs[1].date, '0023-01-23');
});

test('chanukah-candles', (t) => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 11),
    location: Location.lookup('Boston'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const expected = [
    {
      title: 'Chanukah: 1 Candle',
      date: '2020-12-10T16:43:00-05:00',
      category: 'holiday',
      subcat: 'major',
      hebrew: 'חנוכה: א׳ נר',
      link: 'https://www.hebcal.com/holidays/chanukah-2020?utm_source=js&utm_medium=api',
      memo: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Chanukah: 2 Candles',
      date: '2020-12-11T15:53:00-05:00',
      category: 'holiday',
      subcat: 'major',
      hebrew: 'חנוכה: ב׳ נרות',
      link: 'https://www.hebcal.com/holidays/chanukah-2020?utm_source=js&utm_medium=api',
      memo: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Candle lighting: 3:53pm',
      date: '2020-12-11T15:53:00-05:00',
      category: 'candles',
      title_orig: 'Candle lighting',
      hebrew: 'הדלקת נרות',
    },
  ];
  t.deepEqual(apiObjs, expected);
});

test('chanukah-nocandles', (t) => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 11),
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const expected = [
    {
      title: 'Chanukah: 1 Candle',
      date: '2020-12-10',
      category: 'holiday',
      subcat: 'major',
      hebrew: 'חנוכה: א׳ נר',
      link: 'https://www.hebcal.com/holidays/chanukah-2020?utm_source=js&utm_medium=api',
      memo: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Chanukah: 2 Candles',
      date: '2020-12-11',
      category: 'holiday',
      subcat: 'major',
      hebrew: 'חנוכה: ב׳ נרות',
      link: 'https://www.hebcal.com/holidays/chanukah-2020?utm_source=js&utm_medium=api',
      memo: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
  ];
  t.deepEqual(apiObjs, expected);
});

test('fastStartEnd', (t) => {
  const options = {
    start: new Date(2021, 5, 27),
    end: new Date(2021, 5, 27),
    location: Location.lookup('Providence'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const expected = [
    {
      title: 'Fast begins',
      date: '2021-06-27T03:19:00-04:00',
      category: 'holiday',
      subcat: 'fast',
      hebrew: 'תחילת הצום',
    },
    {
      title: 'Tzom Tammuz',
      date: '2021-06-27',
      category: 'holiday',
      subcat: 'fast',
      hebrew: 'צום תמוז',
      link: 'https://www.hebcal.com/holidays/tzom-tammuz-2021?utm_source=js&utm_medium=api',
      memo: 'Fast commemorating breaching of the walls of Jerusalem before the destruction of the Second Temple',
    },
    {
      title: 'Fast ends',
      date: '2021-06-27T21:06:00-04:00',
      category: 'holiday',
      subcat: 'fast',
      hebrew: 'סיום הצום',
    },
  ];
  t.deepEqual(apiObjs, expected);
});
