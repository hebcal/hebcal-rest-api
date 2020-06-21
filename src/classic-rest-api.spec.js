import test from 'ava';
import {hebcal, Location} from '@hebcal/core';
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
  const events = hebcal.hebrewCalendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, location.getTzid(), options.il));
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
    link: 'https://www.hebcal.com/sedrot/bamidbar?utm_source=js&utm_medium=api',
  };
  t.deepEqual(bamidbarActual, bamidbarExpected);
  const shavuotActual = apiObjs[7];
  const shavuotExpected = {
    title: 'Shavuot I',
    date: '2020-05-29',
    category: 'holiday',
    subcat: 'major',
    yomtov: true,
    hebrew: 'שבועות יום א׳',
    leyning: {
      '1': 'Exodus 19:1 - 19:6',
      '2': 'Exodus 19:7 - 19:13',
      '3': 'Exodus 19:14 - 19:19',
      '4': 'Exodus 19:20 - 20:14',
      '5': 'Exodus 20:15 - 20:23',
      'torah': 'Exodus 19:1-20:23',
      'haftarah': 'Ezekiel 1:1-28; 3:12',
      'maftir': 'Numbers 28:26 - 28:31',
    },
    link: 'https://www.hebcal.com/holidays/shavuot?utm_source=js&utm_medium=api',
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
  const events = hebcal.hebrewCalendar(options);
  const apiResult = eventsToClassicApi(events, options);
  t.is(apiResult.title, 'Hebcal Vancouver May 2022');
  const locationExpected = {
    cc: 'CA',
    city: 'Vancouver',
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
    link: 'https://www.hebcal.com/holidays/rosh-chodesh-iyyar?utm_source=js&utm_medium=api',
    title: 'Rosh Chodesh Iyyar',
  };
  t.deepEqual(roshChodesh, roshChodeshExpected);
  const candleLighting = apiResult.items[4];
  const candleLightingExpected = {
    category: 'candles',
    date: '2022-05-06T20:19:00-07:00',
    hebrew: 'הדלקת נרות',
    title: 'Candle lighting: 20:19',
    title_orig: 'Candle lighting',
  };
  t.deepEqual(candleLighting, candleLightingExpected);
});
