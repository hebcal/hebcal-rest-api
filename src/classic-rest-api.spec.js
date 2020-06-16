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
  console.log(apiResult);
  t.pass('message');
});
