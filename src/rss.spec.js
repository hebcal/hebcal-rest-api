/* eslint-disable max-len */
import test from 'ava';
import {HebrewCalendar, Location} from '@hebcal/core';
import {eventsToRss, eventToRssItem} from './rss';

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
  const mainUrl = 'https://www.hebcal.com/shabbat/?geonameid=4887398&m=50&lg=s';
  const selfUrl = 'https://www.hebcal.com/shabbat/?cfg=r&geonameid=4887398&m=50&lg=s&pubDate=1';
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
  const dayFormat = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const lastBuildDate = 'Mon, 22 Jun 2020 20:03:18 GMT';
  const items = events.map((ev) => eventToRssItem(ev, true, lastBuildDate, dayFormat, location));
  const expected = [
    '<item>\n' +
    '<title>Candle lighting: 18:44</title>\n' +
    '<link>https://www.hebcal.com/shabbat/?utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-06T15%3A44%3A00#candle-lighting</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/shabbat/?utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-06T15%3A44%3A00#candle-lighting</guid>\n' +
    '<description>Friday, April 06, 1990</description>\n' +
    '<category>candles</category>\n' +
    '<pubDate>Fri, 06 Apr 1990 15:44:00 GMT</pubDate>\n' +
    '<geo:lat>29.55805</geo:lat>\n' +
    '<geo:long>34.94821</geo:long>\n' +
    '</item>\n',
  '<item>\n' +
    '<title>Havdalah (50 min): 19:53</title>\n' +
    '<link>https://www.hebcal.com/shabbat/?utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-07T16%3A53%3A00#havdalah</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/shabbat/?utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-07T16%3A53%3A00#havdalah</guid>\n' +
    '<description>Saturday, April 07, 1990</description>\n' +
    '<category>havdalah</category>\n' +
    '<pubDate>Sat, 07 Apr 1990 16:53:00 GMT</pubDate>\n' +
    '</item>\n',
  '<item>\n' +
    '<title>Erev Pesach</title>\n' +
    '<link>https://www.hebcal.com/holidays/pesach?utm_source=shabbat1c&amp;utm_medium=rss</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/holidays/pesach?utm_source=shabbat1c&amp;utm_medium=rss&amp;dt=1990-04-09</guid>\n' +
    '<description>Monday, April 09, 1990</description>\n' +
    '<category>holiday</category>\n' +
    '<pubDate>Mon, 09 Apr 1990 00:00:00 GMT</pubDate>\n' +
    '</item>\n',
  ];
  t.deepEqual(items, expected);
});
