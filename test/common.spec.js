import {getDownloadFilename, getCalendarTitle, makeTorahMemoText, getEventCategories,
  getHolidayDescription,
  appendIsraelAndTracking, locationToPlainObj, shouldRenderBrief} from '../src/common';
import {HebrewCalendar, Location, Event, HDate, flags, HolidayEvent,
  HebrewDateEvent, TimedEvent} from '@hebcal/core';
import {DafYomiEvent} from '@hebcal/learning';

test('getDownloadFilename', () => {
  const location = new Location(38.672294, -90.533239, false, 'America/Chicago',
      'Chesterfield, MO 63017', 'US', '63017');
  const options = {
    year: 2018,
    sedrot: true,
    candlelighting: true,
    location: location,
  };
  expect(getDownloadFilename(options)).toBe('hebcal_2018_chesterfield');
  options.year = 5749;
  options.isHebrewYear = true;
  expect(getDownloadFilename(options)).toBe('hebcal_5749h_chesterfield');
  expect(getDownloadFilename({year: 2017})).toBe('hebcal_2017');
  expect(getDownloadFilename({year: 2017, il: true})).toBe('hebcal_2017');
  expect(getDownloadFilename({year: 5780, isHebrewYear: true})).toBe('hebcal_5780h');

  const loc2 = new Location(-23.5475, -46.63611, false, 'America/Sao_Paulo',
      'São Paulo, Brazil', 'BR', 3448439);
  loc2.asciiname = 'Sao Paulo';
  options.location = loc2;
  expect(getDownloadFilename(options)).toBe('hebcal_5749h_sao_paulo');

  const loc3 = new Location(34.103131, -118.416253, false, 'America/Los_Angeles',
      'Beverly Hills, CA 90210', 'US', '90210');
  loc3.state = 'CA';
  loc3.zip = '90210';
  options.location = loc3;
  expect(getDownloadFilename(options)).toBe('hebcal_5749h_90210');

  const loc4 = new Location(32.1836, 34.87386, true, 'Asia/Jerusalem',
      'Ra\'anana, Israel', 'IL', 293807);
  loc4.asciiname = 'Ra\'anana';
  loc4.admin1 = 'Central District';
  options.location = loc4;
  expect(getDownloadFilename(options)).toBe('hebcal_5749h_raanana');

  const loc5 = new Location(19.4349023, -99.2069489, false, 'America/Mexico_City');
  options.location = loc5;
  expect(getDownloadFilename(options)).toBe('hebcal_5749h');
});

test('getCalendarTitle', () => {
  const location = new Location(38.672294, -90.533239, false, 'America/Chicago',
      'Chesterfield, MO 63017', 'US', '63017');
  let options = {
    year: 2018,
    sedrot: true,
    candlelighting: true,
    location: location,
  };
  let events = HebrewCalendar.calendar(options);
  expect(getCalendarTitle(events, options)).toBe('Hebcal Chesterfield 2018');

  const opts1 = {subscribe: '1', ...options};
  expect(getCalendarTitle(events, opts1)).toBe('Hebcal Chesterfield');

  const options2 = {
    year: 5749,
    isHebrewYear: true,
    sedrot: true,
    candlelighting: true,
    location: location,
  };
  events = HebrewCalendar.calendar(options2);
  const opts2 = {subscribe: '0', ...options2};
  expect(getCalendarTitle(events, opts2)).toBe('Hebcal Chesterfield 5749');
});

test('getCalendarTitle2', () => {
  const options = {year: 2017};
  const events = HebrewCalendar.calendar(options);
  expect(getCalendarTitle(events, options)).toBe('Hebcal Diaspora 2017');

  const opts2 = {year: 2017, il: true};
  const evts2 = HebrewCalendar.calendar(opts2);
  expect(getCalendarTitle(evts2, opts2)).toBe('Hebcal Israel 2017');

  const opts3 = {year: 5780, isHebrewYear: true};
  const evts3 = HebrewCalendar.calendar(opts3);
  expect(getCalendarTitle(evts3, opts3)).toBe('Hebcal Diaspora 5780');
});

test('makeTorahMemoText', () => {
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
    'Haftarah for Sephardim: II Kings 11:17-12:17',
  ];
  expect(memo).toEqual(expected);
});

test('makeTorahMemoText-userEvent', () => {
  const hd = new HDate(new Date(2021, 1, 13));
  const userEvent = new Event(hd, 'User Event', flags.USER_EVENT);
  expect(makeTorahMemoText(userEvent, false)).toBe('');

  const holidayEvent = new Event(hd, 'Holiday Event', 0);
  expect(makeTorahMemoText(holidayEvent, false)).toBe('Haftarah: Isaiah 66:1-24');
});

test('makeTorahMemoText-untimed', () => {
  const ev1 = HebrewCalendar.calendar({
    start: new Date(2020, 11, 14),
    end: new Date(2020, 11, 14),
  })[0];
  expect(makeTorahMemoText(ev1, false)).toBe('Torah: Numbers 7:30-41');
  const ev2 = HebrewCalendar.calendar({
    start: new Date(2020, 11, 14),
    end: new Date(2020, 11, 14),
    location: Location.lookup('Boston'),
    candlelighting: true,
  })[0];
  expect(makeTorahMemoText(ev2, false)).toBe('');
});

test('getEventCategories', () => {
  const events = HebrewCalendar.calendar({year: 2022, il: true});
  const actual = {};
  for (const ev of events) {
    actual[ev.getDesc()] = getEventCategories(ev);
  }
  const expected = {
    'Rosh Chodesh Sh\'vat': ['roshchodesh'],
    'Shabbat Shirah': ['holiday', 'shabbat'],
    'Tu BiShvat': ['holiday', 'minor'],
    'Family Day': ['holiday', 'modern'],
    'Rosh Chodesh Adar I': ['roshchodesh'],
    'Purim Katan': ['holiday', 'minor'],
    'Shabbat Shekalim': ['holiday', 'shabbat'],
    'Rosh Chodesh Adar II': ['roshchodesh'],
    'Shabbat Zachor': ['holiday', 'shabbat'],
    'Ta\'anit Esther': ['holiday', 'fast'],
    'Erev Purim': ['holiday', 'major'],
    'Purim': ['holiday', 'major'],
    'Shushan Purim': ['holiday', 'minor'],
    'Shushan Purim Katan': ['holiday', 'minor'],
    'Shabbat Parah': ['holiday', 'shabbat'],
    'Shabbat HaChodesh': ['holiday', 'shabbat'],
    'Rosh Chodesh Nisan': ['roshchodesh'],
    'Shabbat HaGadol': ['holiday', 'shabbat'],
    'Yom HaAliyah': ['holiday', 'modern'],
    'Ta\'anit Bechorot': ['holiday', 'fast'],
    'Erev Pesach': ['holiday', 'major'],
    'Pesach I': ['holiday', 'major'],
    'Pesach II (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Pesach III (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Pesach IV (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Pesach V (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Pesach VI (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Pesach VII': ['holiday', 'major'],
    'Yom HaShoah': ['holiday', 'modern'],
    'Rosh Chodesh Iyyar': ['roshchodesh'],
    'Yom HaZikaron': ['holiday', 'modern'],
    'Yom HaAtzma\'ut': ['holiday', 'modern'],
    'Herzl Day': ['holiday', 'modern'],
    'Pesach Sheni': ['holiday', 'minor'],
    'Lag BaOmer': ['holiday', 'minor'],
    'Yom Yerushalayim': ['holiday', 'modern'],
    'Rosh Chodesh Sivan': ['roshchodesh'],
    'Erev Shavuot': ['holiday', 'major'],
    'Shavuot': ['holiday', 'major'],
    'Rosh Chodesh Tamuz': ['roshchodesh'],
    'Tzom Tammuz': ['holiday', 'fast'],
    'Jabotinsky Day': ['holiday', 'modern'],
    'Rosh Chodesh Av': ['roshchodesh'],
    'Shabbat Chazon': ['holiday', 'shabbat'],
    'Erev Tish\'a B\'Av': ['holiday', 'major', 'fast'],
    'Tish\'a B\'Av (observed)': ['holiday', 'major', 'fast'],
    'Tu B\'Av': ['holiday', 'minor'],
    'Shabbat Nachamu': ['holiday', 'shabbat'],
    'Rosh Chodesh Elul': ['roshchodesh'],
    'Rosh Hashana LaBehemot': ['holiday', 'minor'],
    'Leil Selichot': ['holiday', 'minor'],
    'Erev Rosh Hashana': ['holiday', 'major'],
    'Rosh Hashana 5783': ['holiday', 'major'],
    'Rosh Hashana II': ['holiday', 'major'],
    'Tzom Gedaliah': ['holiday', 'fast'],
    'Shabbat Shuva': ['holiday', 'shabbat'],
    'Erev Yom Kippur': ['holiday', 'major'],
    'Yom Kippur': ['holiday', 'major', 'fast'],
    'Erev Sukkot': ['holiday', 'major'],
    'Sukkot I': ['holiday', 'major'],
    'Sukkot II (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Sukkot III (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Sukkot IV (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Sukkot V (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Sukkot VI (CH\'\'M)': ['holiday', 'major', 'cholhamoed'],
    'Sukkot VII (Hoshana Raba)': ['holiday', 'major', 'cholhamoed'],
    'Shmini Atzeret': ['holiday', 'major'],
    'Rosh Chodesh Cheshvan': ['roshchodesh'],
    'Yom HaAliyah School Observance': ['holiday', 'modern'],
    'Yitzhak Rabin Memorial Day': ['holiday', 'modern'],
    'Sigd': ['holiday', 'modern'],
    'Rosh Chodesh Kislev': ['roshchodesh'],
    'Ben-Gurion Day': ['holiday', 'modern'],
    'Chag HaBanot': ['holiday', 'minor'],
    'Chanukah: 1 Candle': ['holiday', 'major'],
    'Chanukah: 2 Candles': ['holiday', 'major'],
    'Chanukah: 3 Candles': ['holiday', 'major'],
    'Chanukah: 4 Candles': ['holiday', 'major'],
    'Chanukah: 5 Candles': ['holiday', 'major'],
    'Chanukah: 6 Candles': ['holiday', 'major'],
    'Chanukah: 7 Candles': ['holiday', 'major'],
    'Rosh Chodesh Tevet': ['roshchodesh'],
    'Chanukah: 8 Candles': ['holiday', 'major'],
    'Chanukah: 8th Day': ['holiday', 'minor'],
  };
  expect(actual).toEqual(expected);
});

test('getEventCategories-candles', () => {
  const events = HebrewCalendar.calendar({
    start: new HDate(9, 'Tishrei', 5783),
    end: new HDate(13, 'Tishrei', 5783),
    candlelighting: true,
    location: Location.lookup('Los Angeles'),
  });
  const actual = [];
  for (const ev of events) {
    actual.push([ev.getDesc(), getEventCategories(ev)]);
  }
  const expected = [
    ['Erev Yom Kippur', ['holiday', 'major']],
    ['Candle lighting', ['candles']],
    ['Yom Kippur', ['holiday', 'major', 'fast']],
    ['Havdalah', ['havdalah']],
    ['Candle lighting', ['candles']],
    ['Havdalah', ['havdalah']],
  ];
  expect(actual).toEqual(expected);
});

test('appendIsraelAndTracking', () => {
  expect(appendIsraelAndTracking('https://www.hebcal.com/foo', true, 'foo', 'bar'))
    .toBe('https://www.hebcal.com/foo?i=on&utm_source=foo&utm_medium=bar');
  expect(appendIsraelAndTracking('https://www.hebcal.com/foo', false, 'foo', 'bar'))
    .toBe('https://www.hebcal.com/foo?utm_source=foo&utm_medium=bar');
  expect(appendIsraelAndTracking('https://www.hebcal.com/sedrot/foo-123', true, 'foo', 'bar'))
    .toBe('https://hebcal.com/s/foo-123?i=on&us=foo&um=bar');
  expect(appendIsraelAndTracking('https://www.hebcal.com/sedrot/foo-345', false, 'foo', 'bar'))
    .toBe('https://hebcal.com/s/foo-345?us=foo&um=bar');
  expect(appendIsraelAndTracking('https://www.hebcal.com/sedrot/foo-345', false, 'foo', 'bar', 'hello'))
    .toBe('https://hebcal.com/s/foo-345?us=foo&um=bar&uc=hello');
  expect(appendIsraelAndTracking('https://www.hebcal.com/holidays/quux-678', true, 'foo', 'bar', 'ical-abc'))
    .toBe('https://hebcal.com/h/quux-678?i=on&uc=ical-abc');
  expect(appendIsraelAndTracking('https://www.hebcal.com/holidays/quux-987', false, 'foo', 'bar', 'pdf-abc'))
    .toBe('https://hebcal.com/h/quux-987?uc=pdf-abc');
});

test('locationToPlainObj', () => {
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
    elevation: 42,
  };
  expect(actual).toEqual(expected);
});

test('location-zip', () => {
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
  expect(actual).toEqual(expected);
});

test('locationToPlainObj-none', () => {
  const expected = {geo: 'none'};
  expect(locationToPlainObj(null)).toEqual(expected);
  expect(locationToPlainObj(undefined)).toEqual(expected);
  expect(locationToPlainObj({})).toEqual(expected);
});

test('getHolidayDescription-firstSentence', () => {
  const ev = new HolidayEvent(new HDate(14, 'Nisan', 5784), 'Erev Pesach', flags.EREV);
  expect(getHolidayDescription(ev, true))
    .toBe('Passover, the Feast of Unleavened Bread');
  expect(getHolidayDescription(ev, false))
    .toBe('Passover, the Feast of Unleavened Bread. Also called Chag HaMatzot (the Festival of Matzah), it commemorates the Exodus and freedom of the Israelites from ancient Egypt');
});

test('getHolidayDescription-ykk', () => {
  const ev = new HolidayEvent(new HDate(29, 'Tevet', 5784), 'Yom Kippur Katan', flags.MINOR_FAST);
  const s = getHolidayDescription(ev);
  expect(s).toBe('Minor day of atonement occurring monthly on the day preceeding each Rosh Chodesh');
});

test('getHolidayDescription Shabbat Mevarchim Chodesh', () => {
  const ev = new HolidayEvent(new HDate(25, 'Adar I', 5782),
      'Shabbat Mevarchim Chodesh Adar II', flags.SHABBAT_MEVARCHIM);
  const s = getHolidayDescription(ev);
  expect(s).toBe('Shabbat that precedes Rosh Chodesh. The congregation blesses the forthcoming new month');
});

test('getHolidayDescription-notfound', () => {
  const ev = new Event(new HDate(3, 'Tevet', 5784), 'Foobar', flags.USER_EVENT);
  const s = getHolidayDescription(ev);
  expect(s).toBe('');
});

test('shouldRenderBrief', () => {
  expect(shouldRenderBrief(new HolidayEvent(new HDate(17, 'Tevet', 5784), 'Asara B\'Tevet', flags.MINOR_FAST)))
    .toBe(false);
  expect(shouldRenderBrief(new HolidayEvent(new HDate(29, 'Tevet', 5784), 'Yom Kippur Katan', flags.MINOR_FAST)))
    .toBe(true);
  expect(shouldRenderBrief(new HolidayEvent(new HDate(14, 'Nisan', 5784), 'Erev Pesach', flags.EREV)))
    .toBe(false);
  expect(shouldRenderBrief(new HebrewDateEvent(new HDate(1, 'Nisan', 5784))))
    .toBe(false);
  expect(shouldRenderBrief(new HebrewDateEvent(new HDate(2, 'Nisan', 5784))))
    .toBe(true);
  expect(shouldRenderBrief(new Event(new HDate(new Date('1959-11-28')),
      'Shabbat Mevarchim Chodesh Kislev', flags.SHABBAT_MEVARCHIM)))
    .toBe(true);
  const hd = new HDate(25, 'Sivan', 5782);
  expect(shouldRenderBrief(new TimedEvent(hd,
      'Candle lighting: 8:15pm', flags.LIGHT_CANDLES,
      new Date(), Location.lookup('Boston'))))
    .toBe(true);
  expect(shouldRenderBrief(new DafYomiEvent(hd)))
    .toBe(true);
  expect(shouldRenderBrief(new Event(hd, 'Foo Bar', flags.DAILY_LEARNING)))
    .toBe(true);
  expect(shouldRenderBrief(new Event(hd, 'Foo Bar', flags.CHAG)))
    .toBe(false);
  expect(shouldRenderBrief(new Event(hd, 'Foo Bar', 0)))
    .toBe(false);
});

test('getDownloadFilename-nodate', () => {
  expect(getDownloadFilename({})).toBe('hebcal');
});

test('getDownloadFilename-year-month', () => {
  expect(getDownloadFilename({year: 1993, month: 6})).toBe('hebcal_1993_6');
});

test('getDownloadFilename-start-end', () => {
  expect(getDownloadFilename({
    start: new Date(1995, 10, 10),
    end: new Date(1996, 2, 2),
  })).toBe('hebcal_1995_1996');
  expect(getDownloadFilename({
    start: new Date(2022, 10, 10),
    end: new Date(2022, 11, 11),
  })).toBe('hebcal_2022');
  expect(getDownloadFilename({
    start: new HDate(new Date(2021, 1, 13)),
    end: new HDate(new Date(2021, 11, 13)),
  })).toBe('hebcal_2021');
});
