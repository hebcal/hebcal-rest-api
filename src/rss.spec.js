import test from 'ava';
import {hebcal, Location} from '@hebcal/core';
import {eventsToRss} from './rss';

test('eventsToRss', (t) => {
  const location = new Location(41.85003, -87.65005, false, 'America/Chicago', 'Chicago', 'US', 4887398);
  const options = {
    year: 1990,
    month: 4,
    noMinorFast: true,
    noRoshChodesh: true,
    noSpecialShabbat: true,
    candlelighting: true,
    havdalahMins: 50,
    location: location,
  };
  const events = hebcal.hebrewCalendar(options).slice(0, 10);
  const memo = 'Passover, the Feast of Unleavened Bread';
  events[4].getAttrs().memo = memo;
  const rss = eventsToRss(events, location);
  // console.log(rss);
  t.pass('message');
});
