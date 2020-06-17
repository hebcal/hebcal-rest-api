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
    title_orig: 'Candle lighting',
  };
  t.deepEqual(candlesActual, candlesExpected);
  const bamidbarActual = apiObjs[2];
  const bamidbarExpected = {
    title: 'Parashat Bamidbar',
    date: '2020-05-23',
    category: 'parashat',
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
    link: 'https://www.hebcal.com/sedrot/bamidbar',
  };
  t.deepEqual(bamidbarActual, bamidbarExpected);
  const shavuotActual = apiObjs[7];
  const shavuotExpected = {
    title: 'Shavuot I',
    date: '2020-05-29',
    category: 'holiday',
    subcat: 'major',
    yomtov: true,
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
    link: 'https://www.hebcal.com/holidays/shavuot',
  };
  t.deepEqual(shavuotActual, shavuotExpected);
});

test('eventsToClassicApi', (t) => {
  const location = Location.lookup('Providence');
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
  t.is(apiResult.title, 'Hebcal Providence May 2022');
  t.is(apiResult.location.city, 'Providence');
  t.is(Array.isArray(apiResult.items), true);
  const item = apiResult.items[0];
  t.is(item.title, 'Rosh Chodesh Iyyar');
  t.is(item.date, '2022-05-01');
  t.is(item.category, 'roshchodesh');
  t.is(item.link, 'https://www.hebcal.com/holidays/rosh-chodesh-iyyar');
  const candleLighting = apiResult.items[4];
  t.is(candleLighting.title, 'Candle lighting: 19:32');
  t.is(candleLighting.date, '2022-05-06T19:32:00-04:00');
  t.is(candleLighting.category, 'candles');
  t.is(candleLighting.title_orig, 'Candle lighting');
});
