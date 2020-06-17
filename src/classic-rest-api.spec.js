import test from 'ava';
import {hebcal, Location} from '@hebcal/core';
import {eventsToClassicApi, eventToClassicApiObject} from './classic-rest-api';

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
  const apiResult = eventsToClassicApi(events, 'foo', options);
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
