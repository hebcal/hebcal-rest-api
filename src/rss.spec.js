/* eslint-disable max-len */
import test from 'ava';
import {HebrewCalendar, Location} from '@hebcal/core';
import {eventsToRss, eventToRssItem} from './rss';

const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

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
  const events = HebrewCalendar.calendar(options).slice(0, 10);
  const mainUrl = 'https://www.hebcal.com/shabbat?geonameid=4887398&m=50&lg=s';
  const selfUrl = 'https://www.hebcal.com/shabbat?cfg=r&geonameid=4887398&m=50&lg=s&pubDate=1';
  const rss = eventsToRss(events, location, mainUrl, selfUrl, 'en-US', true).split('\n');
  t.is(rss[2], '<channel>');
  t.is(rss[3], '<title>Shabbat Times for Chicago</title>');
  t.is(rss[10], '<item>');
  t.is(rss[rss.length - 4], '</item>');
  t.is(rss[rss.length - 3], '</channel>');
  t.is(rss[rss.length - 2], '</rss>');
  t.is(rss[rss.length - 1], '');
});

test('eventToRssItem', (t) => {
  const location = Location.lookup('Eilat');
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
  const events = HebrewCalendar.calendar(options).slice(0, 3);
  const lastBuildDate = 'Mon, 22 Jun 2020 20:03:18 GMT';
  const mainUrl = 'https://www.hebcal.com/shabbat?city=Eilat';
  const items = events.map((ev) => eventToRssItem(ev, true, lastBuildDate, dayFormat, location, mainUrl));
  const expected = [
    '<item>\n' +
    '<title>Candle lighting: 18:43</title>\n' +
    '<link>https://www.hebcal.com/shabbat?city=Eilat&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-06T15%3A43%3A00#candle-lighting</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/shabbat?city=Eilat&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-06T15%3A43%3A00#candle-lighting</guid>\n' +
    '<description>Friday, April 06, 1990</description>\n' +
    '<category>candles</category>\n' +
    '<pubDate>Fri, 06 Apr 1990 15:43:00 GMT</pubDate>\n' +
    '<geo:lat>29.55805</geo:lat>\n' +
    '<geo:long>34.94821</geo:long>\n' +
    '</item>\n',
    '<item>\n' +
    '<title>Havdalah (50 min): 19:52</title>\n' +
    '<link>https://www.hebcal.com/shabbat?city=Eilat&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-07T16%3A52%3A00#havdalah</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/shabbat?city=Eilat&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-07T16%3A52%3A00#havdalah</guid>\n' +
    '<description>Saturday, April 07, 1990</description>\n' +
    '<category>havdalah</category>\n' +
    '<pubDate>Sat, 07 Apr 1990 16:52:00 GMT</pubDate>\n' +
    '</item>\n',
    '<item>\n' +
    '<title>Erev Pesach</title>\n' +
    '<link>https://www.hebcal.com/holidays/pesach-1990?i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/holidays/pesach-1990?i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-09</guid>\n' +
    '<description>Monday, April 09, 1990</description>\n' +
    '<category>holiday</category>\n' +
    '<pubDate>Mon, 09 Apr 1990 00:00:00 GMT</pubDate>\n' +
    '</item>\n',
  ];
  t.deepEqual(items, expected);
});

test('parsha', (t) => {
  const events = HebrewCalendar.calendar({
    start: new Date(2020, 10, 28),
    end: new Date(2020, 10, 28),
    sedrot: true,
  });
  const location = Location.lookup('Kiev');
  const item = eventToRssItem(events[0], true, '', dayFormat, location, '');
  const expected = '<item>\n' +
    '<title>Parashat Vayetzei</title>\n' +
    '<link>https://www.hebcal.com/sedrot/vayetzei-20201128?utm_source=shabbat1c&amp;utm_medium=rss</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/sedrot/vayetzei-20201128?utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=2020-11-28</guid>\n' +
    '<description>Saturday, November 28, 2020</description>\n' +
    '<category>parashat</category>\n' +
    '<pubDate>Sat, 28 Nov 2020 00:00:00 GMT</pubDate>\n' +
    '</item>\n';
  t.is(item, expected);
});

test('parsha-il', (t) => {
  const events = HebrewCalendar.calendar({
    start: new Date(2020, 10, 28),
    end: new Date(2020, 10, 28),
    sedrot: true,
  });
  const location = Location.lookup('Jerusalem');
  const item = eventToRssItem(events[0], true, '', dayFormat, location, '');
  const expected = '<item>\n' +
    '<title>Parashat Vayetzei</title>\n' +
    '<link>https://www.hebcal.com/sedrot/vayetzei-20201128?i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/sedrot/vayetzei-20201128?i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=2020-11-28</guid>\n' +
    '<description>Saturday, November 28, 2020</description>\n' +
    '<category>parashat</category>\n' +
    '<pubDate>Sat, 28 Nov 2020 00:00:00 GMT</pubDate>\n' +
    '</item>\n';
  t.is(item, expected);
});

test('fastStartEnd', (t) => {
  const location = Location.lookup('Tel Aviv');
  const options = {
    start: new Date(2021, 5, 27),
    end: new Date(2021, 5, 27),
    location,
    il: location.getIsrael(),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const lastBuildDate = 'Mon, 22 Jun 2020 20:03:18 GMT';
  const mainUrl = 'https://www.hebcal.com/shabbat?city=Tel+Aviv';
  const items = events.map((ev) => eventToRssItem(ev, true, lastBuildDate, dayFormat, location, mainUrl));
  const expected = [
    '<item>\n' +
      '<title>Fast begins: 04:09</title>\n' +
      '<link>https://www.hebcal.com/shabbat?city=Tel+Aviv&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=2021-06-27T01%3A09%3A00#fast-begins</link>\n' +
      '<guid isPermaLink="false">https://www.hebcal.com/shabbat?city=Tel+Aviv&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=2021-06-27T01%3A09%3A00#fast-begins</guid>\n' +
      '<description>Sunday, June 27, 2021</description>\n' +
      '<category>zmanim</category>\n' +
      '<pubDate>Sun, 27 Jun 2021 01:09:00 GMT</pubDate>\n' +
      '</item>\n',
    '<item>\n' +
      '<title>Tzom Tammuz</title>\n' +
      '<link>https://www.hebcal.com/holidays/tzom-tammuz-2021?i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss</link>\n' +
      '<guid isPermaLink="false">https://www.hebcal.com/holidays/tzom-tammuz-2021?i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=2021-06-27</guid>\n' +
      '<description>Sunday, June 27, 2021</description>\n' +
      '<category>holiday</category>\n' +
      '<pubDate>Sun, 27 Jun 2021 00:00:00 GMT</pubDate>\n' +
      '</item>\n',
    '<item>\n' +
      '<title>Fast ends: 20:25</title>\n' +
      '<link>https://www.hebcal.com/shabbat?city=Tel+Aviv&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=2021-06-27T17%3A25%3A00#fast-ends</link>\n' +
      '<guid isPermaLink="false">https://www.hebcal.com/shabbat?city=Tel+Aviv&amp;utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=2021-06-27T17%3A25%3A00#fast-ends</guid>\n' +
      '<description>Sunday, June 27, 2021</description>\n' +
      '<category>zmanim</category>\n' +
      '<pubDate>Sun, 27 Jun 2021 17:25:00 GMT</pubDate>\n' +
      '</item>\n',
  ];
  t.deepEqual(items, expected);
});
