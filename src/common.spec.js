import test from 'ava';
import {getDownloadFilename, getCalendarTitle, makeTorahMemoText, getEventCategories,
  getHolidayDescription,
  appendIsraelAndTracking, locationToPlainObj, shouldRenderBrief} from './common';
import {HebrewCalendar, Location, Event, HDate, flags, HolidayEvent,
  HebrewDateEvent, TimedEvent, DafYomiEvent} from '@hebcal/core';

test('getDownloadFilename', (t) => {
  const location = new Location(38.672294, -90.533239, false, 'America/Chicago',
      'Chesterfield, MO 63017', 'US', '63017');
  const options = {
    year: 2018,
    sedrot: true,
    candlelighting: true,
    location: location,
  };
  t.is(getDownloadFilename(options), 'hebcal_2018_chesterfield');
  options.year = 5749;
  options.isHebrewYear = true;
  t.is(getDownloadFilename(options), 'hebcal_5749h_chesterfield');
  t.is(getDownloadFilename({year: 2017}), 'hebcal_2017');
  t.is(getDownloadFilename({year: 2017, il: true}), 'hebcal_2017');
  t.is(getDownloadFilename({year: 5780, isHebrewYear: true}), 'hebcal_5780h');

  const loc2 = new Location(-23.5475, -46.63611, false, 'America/Sao_Paulo',
      'São Paulo, Brazil', 'BR', 3448439);
  loc2.asciiname = 'Sao Paulo';
  options.location = loc2;
  t.is(getDownloadFilename(options), 'hebcal_5749h_sao_paulo');

  const loc3 = new Location(34.103131, -118.416253, false, 'America/Los_Angeles',
      'Beverly Hills, CA 90210', 'US', '90210');
  loc3.state = 'CA';
  loc3.zip = '90210';
  options.location = loc3;
  t.is(getDownloadFilename(options), 'hebcal_5749h_90210');

  const loc4 = new Location(32.1836, 34.87386, true, 'Asia/Jerusalem',
      'Ra\'anana, Israel', 'IL', 293807);
  loc4.asciiname = 'Ra\'anana';
  loc4.admin1 = 'Central District';
  options.location = loc4;
  t.is(getDownloadFilename(options), 'hebcal_5749h_raanana');

  const loc5 = new Location(19.4349023, -99.2069489, false, 'America/Mexico_City');
  options.location = loc5;
  t.is(getDownloadFilename(options), 'hebcal_5749h');
});

test('getCalendarTitle', (t) => {
  const location = new Location(38.672294, -90.533239, false, 'America/Chicago',
      'Chesterfield, MO 63017', 'US', '63017');
  let options = {
    year: 2018,
    sedrot: true,
    candlelighting: true,
    location: location,
  };
  let events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Chesterfield 2018');

  options.subscribe = '1';
  t.is(getCalendarTitle(events, options), 'Hebcal Chesterfield');

  options.subscribe = '0';
  options.year = 5749;
  options.isHebrewYear = true;
  events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Chesterfield 5749');

  options = {year: 2017};
  events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Diaspora 2017');

  options = {year: 2017, il: true};
  events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Israel 2017');

  options = {year: 5780, isHebrewYear: true};
  events = HebrewCalendar.calendar(options);
  t.is(getCalendarTitle(events, options), 'Hebcal Diaspora 5780');
});

test('makeTorahMemoText', (t) => {
  const events = HebrewCalendar.calendar({
    noHolidays: true,
    sedrot: true,
    start: new Date(2021, 1, 13),
    end: new Date(2021, 1, 13),
  });
  const memo = makeTorahMemoText(events[0], false).split('\n');
  const expected = [
    'Torah: Exodus 21:1-24:18; Numbers 28:9-15; Exodus 30:11-16',
    'Haftarah: II Kings 12:1-17 | Shabbat Shekalim (on Rosh Chodesh)',
  ];
  t.deepEqual(memo, expected);
});

test('makeTorahMemoText-userEvent', (t) => {
  const hd = new HDate(new Date(2021, 1, 13));
  const userEvent = new Event(hd, 'User Event', flags.USER_EVENT);
  t.is(makeTorahMemoText(userEvent, false), '');

  const holidayEvent = new Event(hd, 'Holiday Event', 0);
  t.is(makeTorahMemoText(holidayEvent, false), 'Haftarah: Isaiah 66:1-24');
});

test('getEventCategories', (t) => {
  const events = HebrewCalendar.calendar({year: 2022});
  const actual = events.map((ev) => {
    return {
      h: ev.getDesc(),
      c: getEventCategories(ev),
    };
  });
  const expected = [
    {h: 'Rosh Chodesh Sh\'vat', c: ['roshchodesh']},
    {h: 'Shabbat Shirah', c: ['holiday', 'shabbat']},
    {h: 'Tu BiShvat', c: ['holiday', 'minor']},
    {h: 'Rosh Chodesh Adar I', c: ['roshchodesh']},
    {h: 'Rosh Chodesh Adar I', c: ['roshchodesh']},
    {h: 'Purim Katan', c: ['holiday', 'minor']},
    {h: 'Shabbat Shekalim', c: ['holiday', 'shabbat']},
    {h: 'Rosh Chodesh Adar II', c: ['roshchodesh']},
    {h: 'Rosh Chodesh Adar II', c: ['roshchodesh']},
    {h: 'Shabbat Zachor', c: ['holiday', 'shabbat']},
    {h: 'Ta\'anit Esther', c: ['holiday', 'fast']},
    {h: 'Erev Purim', c: ['holiday', 'minor']},
    {h: 'Purim', c: ['holiday', 'minor']},
    {h: 'Shushan Purim', c: ['holiday', 'minor']},
    {h: 'Shabbat Parah', c: ['holiday', 'shabbat']},
    {h: 'Shabbat HaChodesh', c: ['holiday', 'shabbat']},
    {h: 'Rosh Chodesh Nisan', c: ['roshchodesh']},
    {h: 'Shabbat HaGadol', c: ['holiday', 'shabbat']},
    {h: 'Yom HaAliyah', c: ['holiday', 'modern']},
    {h: 'Ta\'anit Bechorot', c: ['holiday', 'fast']},
    {h: 'Erev Pesach', c: ['holiday', 'major']},
    {h: 'Pesach I', c: ['holiday', 'major']},
    {h: 'Pesach II', c: ['holiday', 'major']},
    {h: 'Pesach III (CH\'\'M)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Pesach IV (CH\'\'M)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Pesach V (CH\'\'M)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Pesach VI (CH\'\'M)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Pesach VII', c: ['holiday', 'major']},
    {h: 'Pesach VIII', c: ['holiday', 'major']},
    {h: 'Yom HaShoah', c: ['holiday', 'modern']},
    {h: 'Rosh Chodesh Iyyar', c: ['roshchodesh']},
    {h: 'Rosh Chodesh Iyyar', c: ['roshchodesh']},
    {h: 'Yom HaZikaron', c: ['holiday', 'modern']},
    {h: 'Yom HaAtzma\'ut', c: ['holiday', 'modern']},
    {h: 'Pesach Sheni', c: ['holiday', 'minor']},
    {h: 'Lag BaOmer', c: ['holiday', 'minor']},
    {h: 'Yom Yerushalayim', c: ['holiday', 'modern']},
    {h: 'Rosh Chodesh Sivan', c: ['roshchodesh']},
    {h: 'Erev Shavuot', c: ['holiday', 'major']},
    {h: 'Shavuot I', c: ['holiday', 'major']},
    {h: 'Shavuot II', c: ['holiday', 'major']},
    {h: 'Rosh Chodesh Tamuz', c: ['roshchodesh']},
    {h: 'Rosh Chodesh Tamuz', c: ['roshchodesh']},
    {h: 'Tzom Tammuz', c: ['holiday', 'fast']},
    {h: 'Rosh Chodesh Av', c: ['roshchodesh']},
    {h: 'Shabbat Chazon', c: ['holiday', 'shabbat']},
    {h: 'Erev Tish\'a B\'Av', c: ['holiday', 'fast', 'major']},
    {h: 'Tish\'a B\'Av (observed)', c: ['holiday', 'fast', 'major']},
    {h: 'Tu B\'Av', c: ['holiday', 'minor']},
    {h: 'Shabbat Nachamu', c: ['holiday', 'shabbat']},
    {h: 'Rosh Chodesh Elul', c: ['roshchodesh']},
    {h: 'Rosh Hashana LaBehemot', c: ['holiday', 'minor']},
    {h: 'Rosh Chodesh Elul', c: ['roshchodesh']},
    {h: 'Leil Selichot', c: ['holiday', 'minor']},
    {h: 'Erev Rosh Hashana', c: ['holiday', 'major']},
    {h: 'Rosh Hashana 5783', c: ['holiday', 'major']},
    {h: 'Rosh Hashana II', c: ['holiday', 'major']},
    {h: 'Tzom Gedaliah', c: ['holiday', 'fast']},
    {h: 'Shabbat Shuva', c: ['holiday', 'shabbat']},
    {h: 'Erev Yom Kippur', c: ['holiday', 'major']},
    {h: 'Yom Kippur', c: ['holiday', 'major']},
    {h: 'Erev Sukkot', c: ['holiday', 'major']},
    {h: 'Sukkot I', c: ['holiday', 'major']},
    {h: 'Sukkot II', c: ['holiday', 'major']},
    {h: 'Sukkot III (CH\'\'M)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Sukkot IV (CH\'\'M)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Sukkot V (CH\'\'M)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Sukkot VI (CH\'\'M)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Sukkot VII (Hoshana Raba)', c: ['holiday', 'major', 'cholhamoed']},
    {h: 'Shmini Atzeret', c: ['holiday', 'major']},
    {h: 'Simchat Torah', c: ['holiday', 'major']},
    {h: 'Rosh Chodesh Cheshvan', c: ['roshchodesh']},
    {h: 'Rosh Chodesh Cheshvan', c: ['roshchodesh']},
    {h: 'Yom HaAliyah School Observance', c: ['holiday', 'modern']},
    {h: 'Sigd', c: ['holiday', 'modern']},
    {h: 'Rosh Chodesh Kislev', c: ['roshchodesh']},
    {h: 'Rosh Chodesh Kislev', c: ['roshchodesh']},
    {h: 'Chanukah: 1 Candle', c: ['holiday', 'major']},
    {h: 'Chanukah: 2 Candles', c: ['holiday', 'major']},
    {h: 'Chanukah: 3 Candles', c: ['holiday', 'major']},
    {h: 'Chanukah: 4 Candles', c: ['holiday', 'major']},
    {h: 'Chanukah: 5 Candles', c: ['holiday', 'major']},
    {h: 'Chanukah: 6 Candles', c: ['holiday', 'major']},
    {h: 'Chanukah: 7 Candles', c: ['holiday', 'major']},
    {h: 'Rosh Chodesh Tevet', c: ['roshchodesh']},
    {h: 'Chanukah: 8 Candles', c: ['holiday', 'major']},
    {h: 'Rosh Chodesh Tevet', c: ['roshchodesh']},
    {h: 'Chanukah: 8th Day', c: ['holiday', 'minor']},
  ];
  t.deepEqual(actual, expected);
});

test('appendIsraelAndTracking', (t) => {
  t.is(appendIsraelAndTracking('https://www.hebcal.com/foo', true, 'foo', 'bar'),
      'https://www.hebcal.com/foo?i=on&utm_source=foo&utm_medium=bar');
  t.is(appendIsraelAndTracking('https://www.hebcal.com/foo', false, 'foo', 'bar'),
      'https://www.hebcal.com/foo?utm_source=foo&utm_medium=bar');
  t.is(appendIsraelAndTracking('https://www.hebcal.com/sedrot/foo-123', true, 'foo', 'bar'),
      'https://hebcal.com/s/foo-123?i=on&us=foo&um=bar');
  t.is(appendIsraelAndTracking('https://www.hebcal.com/sedrot/foo-345', false, 'foo', 'bar'),
      'https://hebcal.com/s/foo-345?us=foo&um=bar');
  t.is(appendIsraelAndTracking('https://www.hebcal.com/sedrot/foo-345', false, 'foo', 'bar', 'hello'),
      'https://hebcal.com/s/foo-345?us=foo&um=bar&uc=hello');
  t.is(appendIsraelAndTracking('https://www.hebcal.com/holidays/quux-678', true, 'foo', 'bar', 'ical-abc'),
      'https://hebcal.com/h/quux-678?i=on&uc=ical-abc');
  t.is(appendIsraelAndTracking('https://www.hebcal.com/holidays/quux-987', false, 'foo', 'bar', 'pdf-abc'),
      'https://hebcal.com/h/quux-987?uc=pdf-abc');
});

test('locationToPlainObj', (t) => {
  const location = Location.lookup('Paris');
  const actual = locationToPlainObj(location);
  const expected = {
    title: 'Paris',
    city: 'Paris',
    tzid: 'Europe/Paris',
    latitude: 48.85341,
    longitude: 2.3488,
    cc: 'FR',
    country: 'France',
  };
  t.deepEqual(actual, expected);
});

test('location-zip', (t) => {
  const location = new Location(41.83815, -71.393139, false, 'America/New_York', 'Providence, RI 02906', 'US');
  location.admin1 = location.state = 'RI';
  location.zip = '02906';
  location.stateName = 'Rhode Island';
  const expected = {
    title: 'Providence, RI 02906',
    city: 'Providence',
    tzid: 'America/New_York',
    latitude: 41.83815,
    longitude: -71.393139,
    cc: 'US',
    country: 'United States',
    admin1: 'RI',
    zip: '02906',
    state: 'RI',
    stateName: 'Rhode Island',
  };
  const actual = locationToPlainObj(location);
  t.deepEqual(actual, expected);
});

test('locationToPlainObj-none', (t) => {
  const expected = {geo: 'none'};
  t.deepEqual(locationToPlainObj(null), expected);
  t.deepEqual(locationToPlainObj(undefined), expected);
  t.deepEqual(locationToPlainObj({}), expected);
});

test('getHolidayDescription-firstSentence', (t) => {
  const ev = new HolidayEvent(new HDate(14, 'Nisan', 5784), 'Erev Pesach', flags.EREV);
  t.is(getHolidayDescription(ev, true), 'Passover, the Feast of Unleavened Bread');
  // eslint-disable-next-line max-len
  t.is(getHolidayDescription(ev, false), 'Passover, the Feast of Unleavened Bread. Also called Chag HaMatzot (the Festival of Matzah), it commemorates the Exodus and freedom of the Israelites from ancient Egypt');
});

test('getHolidayDescription-ykk', (t) => {
  const ev = new HolidayEvent(new HDate(29, 'Tevet', 5784), 'Yom Kippur Katan', flags.MINOR_FAST);
  const s = getHolidayDescription(ev);
  t.is(s, 'Minor day of atonement occurring monthly on the day preceeding each Rosh Chodesh');
});

test('getHolidayDescription-notfound', (t) => {
  const ev = new Event(new HDate(3, 'Tevet', 5784), 'Foobar', flags.USER_EVENT);
  const s = getHolidayDescription(ev);
  t.is(s, '');
});

test('shouldRenderBrief', (t) => {
  t.is(shouldRenderBrief(new HolidayEvent(new HDate(17, 'Tevet', 5784), 'Asara B\'Tevet', flags.MINOR_FAST)), false);
  t.is(shouldRenderBrief(new HolidayEvent(new HDate(29, 'Tevet', 5784), 'Yom Kippur Katan', flags.MINOR_FAST)), true);
  t.is(shouldRenderBrief(new HolidayEvent(new HDate(14, 'Nisan', 5784), 'Erev Pesach', flags.EREV)), false);
  t.is(shouldRenderBrief(new HebrewDateEvent(new HDate(1, 'Nisan', 5784))), false);
  t.is(shouldRenderBrief(new HebrewDateEvent(new HDate(2, 'Nisan', 5784))), true);
  t.is(shouldRenderBrief(new Event(new HDate(new Date('1959-11-28')),
      'Shabbat Mevarchim Chodesh Kislev', flags.SHABBAT_MEVARCHIM)), true);
  t.is(shouldRenderBrief(new TimedEvent(new HDate(25, 'Sivan', 5782),
      'Candle lighting: 8:15pm', flags.LIGHT_CANDLES,
      new Date(), Location.lookup('Boston'))), true);
  t.is(shouldRenderBrief(new DafYomiEvent(new HDate(25, 'Sivan', 5782))), true);
});
