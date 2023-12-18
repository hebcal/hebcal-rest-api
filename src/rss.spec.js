/* eslint-disable max-len */
import test from 'ava';
import {HebrewCalendar, Location, HDate, Event, flags} from '@hebcal/core';
import {eventToRssItem2, eventsToRss2} from './rss.js';

const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

test('eventsToRss2', (t) => {
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
  const events = HebrewCalendar.calendar(options).slice(0, 2);
  options.mainUrl = 'https://www.hebcal.com/shabbat?geonameid=4887398&m=50&lg=s';
  options.selfUrl = 'https://www.hebcal.com/shabbat?cfg=r&geonameid=4887398&m=50&lg=s&pubDate=1';
  options.buildDate = new Date(Date.UTC(2021, 11, 15, 12, 34, 56));
  options.utmSource = 'foobar';
  options.utmMedium = 'quux';
  options.description = 'The quick brown fox';
  const rss = eventsToRss2(events, options).split('\n');
  const expected = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    '<title>Hebcal Chicago April 1990</title>',
    '<link>https://www.hebcal.com/shabbat?geonameid=4887398&amp;m=50&amp;lg=s&amp;utm_source=foobar&amp;utm_medium=quux</link>',
    '<atom:link href="https://www.hebcal.com/shabbat?cfg=r&amp;geonameid=4887398&amp;m=50&amp;lg=s&amp;pubDate=1" rel="self" type="application/rss+xml" />',
    '<description>The quick brown fox</description>',
    '<language>en-US</language>',
    '<copyright>Copyright (c) 2021 Michael J. Radwin. All rights reserved.</copyright>',
    '<lastBuildDate>Wed, 15 Dec 2021 12:34:56 GMT</lastBuildDate>',
    '<item>',
    '<title>Candle lighting: 7:04pm</title>',
    '<link>https://www.hebcal.com/shabbat?geonameid=4887398&amp;m=50&amp;lg=s&amp;dt=1990-04-06&amp;utm_source=foobar&amp;utm_medium=quux#19900406-candle-lighting</link>',
    '<guid isPermaLink="false">https://www.hebcal.com/shabbat?geonameid=4887398&amp;m=50&amp;lg=s&amp;dt=1990-04-06#19900406-candle-lighting</guid>',
    '<description>Friday, April 06, 1990</description>',
    '<category>candles</category>',
    '<pubDate>Wed, 15 Dec 2021 12:34:56 GMT</pubDate>',
    '<geo:lat>41.85003</geo:lat>',
    '<geo:long>-87.65005</geo:long>',
    '</item>',
    '<item>',
    '<title>Havdalah (50 min): 8:14pm</title>',
    '<link>https://www.hebcal.com/shabbat?geonameid=4887398&amp;m=50&amp;lg=s&amp;dt=1990-04-07&amp;utm_source=foobar&amp;utm_medium=quux#19900407-havdalah</link>',
    '<guid isPermaLink="false">https://www.hebcal.com/shabbat?geonameid=4887398&amp;m=50&amp;lg=s&amp;dt=1990-04-07#19900407-havdalah</guid>',
    '<description>Saturday, April 07, 1990</description>',
    '<category>havdalah</category>',
    '<pubDate>Wed, 15 Dec 2021 12:34:56 GMT</pubDate>',
    '</item>',
    '</channel>',
    '</rss>',
    '',
  ];
  t.deepEqual(rss, expected);
});


test('eventToRssItem2', (t) => {
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
  options.evPubDate = true;
  options.lastBuildDate = 'Mon, 22 Jun 2020 20:03:18 GMT';
  options.mainUrl = 'https://www.hebcal.com/shabbat?city=Eilat';
  options.dayFormat = dayFormat;
  const items = events.map((ev) => eventToRssItem2(ev, options));
  const expected = [
    '<item>\n' +
    '<title>Candle lighting: 18:43</title>\n' +
    '<link>https://www.hebcal.com/shabbat?city=Eilat&amp;dt=1990-04-06&amp;i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss#19900406-candle-lighting</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/shabbat?city=Eilat&amp;dt=1990-04-06#19900406-candle-lighting</guid>\n' +
    '<description>Friday, April 06, 1990</description>\n' +
    '<category>candles</category>\n' +
    '<pubDate>Fri, 06 Apr 1990 15:43:00 GMT</pubDate>\n' +
    '<geo:lat>29.55805</geo:lat>\n' +
    '<geo:long>34.94821</geo:long>\n' +
    '</item>\n',
    '<item>\n' +
    '<title>Havdalah (50 min): 19:53</title>\n' +
    '<link>https://www.hebcal.com/shabbat?city=Eilat&amp;dt=1990-04-07&amp;i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss#19900407-havdalah</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/shabbat?city=Eilat&amp;dt=1990-04-07#19900407-havdalah</guid>\n' +
    '<description>Saturday, April 07, 1990</description>\n' +
    '<category>havdalah</category>\n' +
    '<pubDate>Sat, 07 Apr 1990 16:53:00 GMT</pubDate>\n' +
    '</item>\n',
    '<item>\n' +
    '<title>Erev Pesach</title>\n' +
    '<link>https://hebcal.com/h/pesach-1990?i=on&amp;us=shabbat1c&amp;um=rss</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/holidays/pesach-1990?i=on#19900409-erev-pesach</guid>\n' +
    '<description>Passover, the Feast of Unleavened Bread. Also called Chag HaMatzot (the Festival of Matzah), it commemorates the Exodus and freedom of the Israelites from ancient Egypt</description>\n' +
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
  const options = {
    location,
    dayFormat,
    evPubDate: true,
    lastBuildDate: '',
    mainUrl: '',
    selfUrl: '',
  };
  const item = eventToRssItem2(events[0], options);
  const expected = '<item>\n' +
    '<title>Parashat Vayetzei</title>\n' +
    '<link>https://hebcal.com/s/vayetzei-20201128?us=shabbat1c&amp;um=rss</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/sedrot/vayetzei-20201128#20201128-parashat-vayetzei</guid>\n' +
    '<description>Torah: Genesis 28:10-32:3\n' +
      'Haftarah: Hosea 12:13-14:10\n' +
      'Haftarah for Sephardim: Hosea 11:7-12:12</description>\n' +
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
  const options = {
    location,
    dayFormat,
    evPubDate: true,
    lastBuildDate: '',
    mainUrl: '',
    selfUrl: '',
  };
  const item = eventToRssItem2(events[0], options);
  const expected = '<item>\n' +
    '<title>Parashat Vayetzei</title>\n' +
    '<link>https://hebcal.com/s/vayetzei-20201128?i=on&amp;us=shabbat1c&amp;um=rss</link>\n' +
    '<guid isPermaLink="false">https://www.hebcal.com/sedrot/vayetzei-20201128#20201128-parashat-vayetzei</guid>\n' +
    '<description>Torah: Genesis 28:10-32:3\n' +
      'Haftarah: Hosea 12:13-14:10\n' +
      'Haftarah for Sephardim: Hosea 11:7-12:12</description>\n' +
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
  options.evPubDate = true;
  options.dayFormat = dayFormat;
  options.lastBuildDate = 'Mon, 22 Jun 2020 20:03:18 GMT';
  options.mainUrl = 'https://www.hebcal.com/shabbat?city=Tel+Aviv&lg=s';
  const items = events.map((ev) => eventToRssItem2(ev, options));
  const expected = [
    '<item>\n' +
      '<title>Fast begins: 04:09</title>\n' +
      '<link>https://www.hebcal.com/shabbat?city=Tel+Aviv&amp;lg=s&amp;dt=2021-06-27&amp;i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss#20210627-fast-begins</link>\n' +
      '<guid isPermaLink="false">https://www.hebcal.com/shabbat?city=Tel+Aviv&amp;lg=s&amp;dt=2021-06-27#20210627-fast-begins</guid>\n' +
      '<description>Sunday, June 27, 2021</description>\n' +
      '<category>zmanim</category>\n' +
      '<pubDate>Sun, 27 Jun 2021 01:09:00 GMT</pubDate>\n' +
      '</item>\n',
    '<item>\n' +
      '<title>Tzom Tammuz</title>\n' +
      '<link>https://hebcal.com/h/tzom-tammuz-2021?i=on&amp;us=shabbat1c&amp;um=rss</link>\n' +
      '<guid isPermaLink="false">https://www.hebcal.com/holidays/tzom-tammuz-2021#20210627-tzom-tammuz</guid>\n' +
      '<description>Fast commemorating breaching of the walls of Jerusalem before the destruction of the Second Temple</description>\n' +
      '<category>holiday</category>\n' +
      '<pubDate>Sun, 27 Jun 2021 00:00:00 GMT</pubDate>\n' +
      '</item>\n',
    '<item>\n' +
      '<title>Fast ends: 20:25</title>\n' +
      '<link>https://www.hebcal.com/shabbat?city=Tel+Aviv&amp;lg=s&amp;dt=2021-06-27&amp;i=on&amp;utm_source=shabbat1c&amp;utm_medium=rss#20210627-fast-ends</link>\n' +
      '<guid isPermaLink="false">https://www.hebcal.com/shabbat?city=Tel+Aviv&amp;lg=s&amp;dt=2021-06-27#20210627-fast-ends</guid>\n' +
      '<description>Sunday, June 27, 2021</description>\n' +
      '<category>zmanim</category>\n' +
      '<pubDate>Sun, 27 Jun 2021 17:25:00 GMT</pubDate>\n' +
      '</item>\n',
  ];
  t.deepEqual(items, expected);
});

// eslint-disable-next-line require-jsdoc
class MemoEvent extends Event {
  // eslint-disable-next-line require-jsdoc
  constructor(date, desc, memo) {
    super(date, desc, flags.USER_EVENT);
    this.memo = memo;
  }
  // eslint-disable-next-line require-jsdoc
  url() {
    return 'http://localhost/';
  }
}

test('CDATA', (t) => {
  const hd = new HDate(new Date(2021, 1, 13));
  const ev = new MemoEvent(hd, 'Hello World', 'Foo Bar');
  const options = {
    dayFormat,
    evPubDate: true,
    lastBuildDate: '',
  };
  const str = eventToRssItem2(ev, options);
  t.is(str, `<item>
<title>Hello World</title>
<link>http://localhost/?utm_source=hebcal.com&amp;utm_medium=rss</link>
<guid isPermaLink="false">http://localhost/#20210213-hello-world</guid>
<description>Foo Bar</description>
<category>user</category>
<pubDate>Sat, 13 Feb 2021 00:00:00 GMT</pubDate>
</item>
`);

  const ev2 = new MemoEvent(hd, 'Hello Two', '<p>Baaz Quux</p>');
  const str2 = eventToRssItem2(ev2, options);
  t.is(str2, `<item>
<title>Hello Two</title>
<link>http://localhost/?utm_source=hebcal.com&amp;utm_medium=rss</link>
<guid isPermaLink="false">http://localhost/#20210213-hello-two</guid>
<description><![CDATA[<p>Baaz Quux</p>]]></description>
<category>user</category>
<pubDate>Sat, 13 Feb 2021 00:00:00 GMT</pubDate>
</item>
`);
});
