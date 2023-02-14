import test from 'ava';
import {HebrewCalendar, Location, DafYomiEvent, HDate,
  HebrewDateEvent, MishnaYomiEvent, OmerEvent,
  YerushalmiYomiEvent} from '@hebcal/core';
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
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options));
  const candlesActual = apiObjs[1];
  const candlesExpected = {
    title: 'Candle lighting: 21:17',
    date: '2020-05-22T21:17:00+02:00',
    category: 'candles',
    hebrew: 'הדלקת נרות',
    title_orig: 'Candle lighting',
    memo: 'Parashat Bamidbar',
  };
  t.deepEqual(candlesActual, candlesExpected);
  const bamidbarActual = apiObjs[2];
  const bamidbarExpected = {
    title: 'Parashat Bamidbar',
    date: '2020-05-23',
    hdate: '29 Iyyar 5780',
    category: 'parashat',
    hebrew: 'פרשת במדבר',
    leyning: {
      '1': 'Numbers 1:1-1:19',
      '2': 'Numbers 1:20-1:54',
      '3': 'Numbers 2:1-2:34',
      '4': 'Numbers 3:1-3:13',
      '5': 'Numbers 3:14-3:39',
      '6': 'Numbers 3:40-3:51',
      '7': 'Numbers 4:1-4:20',
      'torah': 'Numbers 1:1-4:20',
      'haftarah': 'I Samuel 20:18-42 | Shabbat Machar Chodesh',
      'maftir': 'Numbers 4:17-4:20',
      'triennial': {
        '1': 'Numbers 1:1-1:4',
        '2': 'Numbers 1:5-1:16',
        '3': 'Numbers 1:17-1:19',
        '4': 'Numbers 1:20-1:27',
        '5': 'Numbers 1:28-1:35',
        '6': 'Numbers 1:36-1:43',
        '7': 'Numbers 1:44-1:54',
        'maftir': 'Numbers 1:52-1:54',
      },
    },
    link: 'https://hebcal.com/s/bamidbar-20200523?us=js&um=api',
  };
  t.deepEqual(bamidbarActual, bamidbarExpected);
  const shavuotActual = apiObjs[7];
  const shavuotExpected = {
    title: 'Shavuot I',
    date: '2020-05-29',
    hdate: '6 Sivan 5780',
    category: 'holiday',
    subcat: 'major',
    memo: 'Festival of Weeks. Commemorates the giving of the Torah at Mount Sinai',
    yomtov: true,
    hebrew: 'שבועות א׳',
    leyning: {
      '1': 'Exodus 19:1-19:6',
      '2': 'Exodus 19:7-19:13',
      '3': 'Exodus 19:14-19:19',
      '4': 'Exodus 19:20-20:14',
      '5': 'Exodus 20:15-20:23',
      'torah': 'Exodus 19:1-20:23; Numbers 28:26-31',
      'haftarah': 'Ezekiel 1:1-28, 3:12',
      'maftir': 'Numbers 28:26-28:31',
    },
    link: 'https://hebcal.com/h/shavuot-2020?us=js&um=api',
  };
  t.deepEqual(shavuotActual, shavuotExpected);
});

test('bce', (t) => {
  const options = {
    start: new Date(-1, 4, 6),
    end: new Date(-1, 4, 6),
    il: false,
  };
  const ev = HebrewCalendar.calendar(options)[0];
  const apiObj = eventToClassicApiObject(ev, options);
  const expected = {
    title: 'Erev Shavuot',
    date: '-000001-05-06',
    hdate: '5 Sivan 3759',
    category: 'holiday',
    subcat: 'major',
    hebrew: 'ערב שבועות',
    memo: 'Festival of Weeks. Commemorates the giving of the Torah at Mount Sinai',
  };
  t.deepEqual(apiObj, expected);
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
  const events = HebrewCalendar.calendar(options);
  const apiResult = eventsToClassicApi(events, options);
  t.is(apiResult.title, 'Hebcal Vancouver May 2022');
  const locationExpected = {
    cc: 'CA',
    city: 'Vancouver',
    title: 'Vancouver',
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
    hdate: '30 Nisan 5782',
    hebrew: 'ראש חודש אייר',
    leyning: {
      'torah': 'Numbers 28:1-15',
      '1': 'Numbers 28:1-28:3',
      '2': 'Numbers 28:3-28:5',
      '3': 'Numbers 28:6-28:10',
      '4': 'Numbers 28:11-28:15',
    },
    link: 'https://hebcal.com/h/rosh-chodesh-iyyar-2022?us=js&um=api',
    title: 'Rosh Chodesh Iyyar',
    // eslint-disable-next-line max-len
    memo: 'Start of month of Iyyar on the Hebrew calendar. אִיָיר (transliterated Iyyar or Iyar) is the 2nd month of the Hebrew year, has 29 days, and corresponds to April or May on the Gregorian calendar.  רֹאשׁ חוֹדֶשׁ, transliterated Rosh Chodesh or Rosh Hodesh, is a minor holiday that occurs at the beginning of every month in the Hebrew calendar. It is marked by the birth of a new moon',
  };
  t.deepEqual(roshChodesh, roshChodeshExpected);
  const candleLighting = apiResult.items[4];
  const candleLightingExpected = {
    category: 'candles',
    date: '2022-05-06T20:18:00-07:00',
    hebrew: 'הדלקת נרות',
    title: 'Candle lighting: 8:18pm',
    title_orig: 'Candle lighting',
    memo: 'Parashat Kedoshim',
  };
  t.deepEqual(candleLighting, candleLightingExpected);
});

test('classic-api-no-sedra', (t) => {
  const options = {start: new Date(2022, 4, 15), end: new Date(2022, 5, 1), il: true};
  const events = HebrewCalendar.calendar(options);
  const apiResult = eventsToClassicApi(events, options);
  delete apiResult.date;
  const expected = {
    title: 'Hebcal Israel May 2022',
    location: {
      geo: 'none',
    },
    range: {
      start: '2022-05-15',
      end: '2022-05-31',
    },
    items: [
      {
        title: 'Pesach Sheni',
        date: '2022-05-15',
        hdate: '14 Iyyar 5782',
        category: 'holiday',
        subcat: 'minor',
        hebrew: 'פסח שני',
        link: 'https://hebcal.com/h/pesach-sheni-2022?i=on&us=js&um=api',
        memo: 'Second Passover, one month after Passover',
      },
      {
        title: 'Lag BaOmer',
        date: '2022-05-19',
        hdate: '18 Iyyar 5782',
        category: 'holiday',
        subcat: 'minor',
        hebrew: 'ל״ג בעומר',
        link: 'https://hebcal.com/h/lag-baomer-2022?i=on&us=js&um=api',
        memo: '33rd day of counting the Omer',
      },
      {
        title: 'Yom Yerushalayim',
        date: '2022-05-29',
        hdate: '28 Iyyar 5782',
        category: 'holiday',
        subcat: 'modern',
        hebrew: 'יום ירושלים',
        link: 'https://hebcal.com/h/yom-yerushalayim-2022?i=on&us=js&um=api',
        memo: 'Jerusalem Day. Commemorates the re-unification of Jerusalem in 1967',
      },
      {
        title: 'Rosh Chodesh Sivan',
        date: '2022-05-31',
        hdate: '1 Sivan 5782',
        category: 'roshchodesh',
        hebrew: 'ראש חודש סיון',
        leyning: {
          'torah': 'Numbers 28:1-15',
          '1': 'Numbers 28:1-28:3',
          '2': 'Numbers 28:3-28:5',
          '3': 'Numbers 28:6-28:10',
          '4': 'Numbers 28:11-28:15',
        },
        link: 'https://hebcal.com/h/rosh-chodesh-sivan-2022?i=on&us=js&um=api',
        // eslint-disable-next-line max-len
        memo: 'Start of month of Sivan on the Hebrew calendar. Sivan (סִיוָן) is the 3rd month of the Hebrew year, has 30 days, and corresponds to May or June on the Gregorian calendar.  רֹאשׁ חוֹדֶשׁ, transliterated Rosh Chodesh or Rosh Hodesh, is a minor holiday that occurs at the beginning of every month in the Hebrew calendar. It is marked by the birth of a new moon',
      },
    ],
  };
  t.deepEqual(apiResult, expected);
});

test('reformat-time-usa', (t) => {
  const options = {
    start: new Date(2020, 4, 22),
    end: new Date(2020, 4, 30),
    noHolidays: true,
    location: Location.lookup('Boston'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const expected = {
    title: 'Candle lighting: 7:48pm',
    date: '2020-05-22T19:48:00-04:00',
    category: 'candles',
    title_orig: 'Candle lighting',
    hebrew: 'הדלקת נרות',
  };
  t.deepEqual(apiObjs[0], expected);
});

test('no-leyning', (t) => {
  const options = {
    start: new Date(2020, 4, 22),
    end: new Date(2020, 4, 30),
    sedrot: true,
    il: true,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const bamidbarActual = apiObjs[1];
  const bamidbarExpected = {
    title: 'Parashat Bamidbar',
    date: '2020-05-23',
    hdate: '29 Iyyar 5780',
    category: 'parashat',
    hebrew: 'פרשת במדבר',
    link: 'https://hebcal.com/s/bamidbar-20200523?i=on&us=js&um=api',
  };
  t.deepEqual(bamidbarActual, bamidbarExpected);
});

test('2-digit-year', (t) => {
  const options = {
    year: 23,
    month: 1,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  t.is(apiObjs[2].date, '0023-01-23');
});

test('chanukah-candles', (t) => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 11),
    location: Location.lookup('Boston'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const expected = [
    {
      title: 'Chanukah: 1 Candle',
      date: '2020-12-10T16:43:00-05:00',
      category: 'holiday',
      subcat: 'major',
      hebrew: 'חנוכה: א׳ נר',
      link: 'https://hebcal.com/h/chanukah-2020?us=js&um=api',
      memo: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Chanukah: 2 Candles',
      date: '2020-12-11T15:53:00-05:00',
      category: 'holiday',
      subcat: 'major',
      hebrew: 'חנוכה: ב׳ נרות',
      link: 'https://hebcal.com/h/chanukah-2020?us=js&um=api',
      memo: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Candle lighting: 3:53pm',
      date: '2020-12-11T15:53:00-05:00',
      category: 'candles',
      title_orig: 'Candle lighting',
      hebrew: 'הדלקת נרות',
    },
  ];
  t.deepEqual(apiObjs, expected);
});

test('chanukah-nocandles', (t) => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 11),
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const expected = [
    {
      title: 'Chanukah: 1 Candle',
      date: '2020-12-10',
      hdate: '24 Kislev 5781',
      category: 'holiday',
      subcat: 'major',
      hebrew: 'חנוכה: א׳ נר',
      link: 'https://hebcal.com/h/chanukah-2020?us=js&um=api',
      memo: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
    {
      title: 'Chanukah: 2 Candles',
      date: '2020-12-11',
      hdate: '25 Kislev 5781',
      category: 'holiday',
      subcat: 'major',
      hebrew: 'חנוכה: ב׳ נרות',
      link: 'https://hebcal.com/h/chanukah-2020?us=js&um=api',
      memo: 'Hanukkah, the Jewish festival of rededication. Also known as the Festival of Lights',
    },
  ];
  t.deepEqual(apiObjs, expected);
});

test('fastStartEnd', (t) => {
  const options = {
    start: new Date(2021, 5, 27),
    end: new Date(2021, 5, 27),
    location: Location.lookup('Providence'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const apiObjs = events.map((ev) => eventToClassicApiObject(ev, options, false));
  const expected = [
    {
      title: 'Fast begins',
      date: '2021-06-27T03:20:00-04:00',
      category: 'zmanim',
      subcat: 'fast',
      hebrew: 'תחילת הצום',
      memo: 'Tzom Tammuz',
    },
    {
      title: 'Tzom Tammuz',
      date: '2021-06-27',
      hdate: '17 Tamuz 5781',
      category: 'holiday',
      subcat: 'fast',
      hebrew: 'צום תמוז',
      link: 'https://hebcal.com/h/tzom-tammuz-2021?us=js&um=api',
      memo: 'Fast commemorating breaching of the walls of Jerusalem before the destruction of the Second Temple',
    },
    {
      title: 'Fast ends',
      date: '2021-06-27T21:07:00-04:00',
      category: 'zmanim',
      subcat: 'fast',
      hebrew: 'סיום הצום',
      memo: 'Tzom Tammuz',
    },
  ];
  t.deepEqual(apiObjs, expected);
});

test.skip('candles-year221', (t) => {
  const options = {
    start: new Date(221, 0, 5),
    end: new Date(221, 0, 5),
    location: Location.lookup('London'),
    candlelighting: true,
  };
  const ev = HebrewCalendar.calendar(options)[0];
  const apiObj = eventToClassicApiObject(ev, options, false);
  const expected = {
    title: 'Candle lighting: 15:49',
    date: '0221-01-05T15:49:43-00:02',
    category: 'candles',
    title_orig: 'Candle lighting',
    hebrew: 'הדלקת נרות',
  };
  t.deepEqual(apiObj, expected);
});

test('daf-yomi', (t) => {
  const ev = new DafYomiEvent(new HDate(new Date(1995, 11, 17)));
  const obj = eventToClassicApiObject(ev, {}, false);
  const expected = {
    title: 'Avodah Zarah 68',
    date: '1995-12-17',
    hdate: '24 Kislev 5756',
    category: 'dafyomi',
    hebrew: 'עבודה זרה דף ס״ח',
    link: 'https://www.sefaria.org/Avodah_Zarah.68a?lang=bi&utm_source=hebcal.com&utm_medium=api',
  };
  t.deepEqual(obj, expected);
});

test('hebdate', (t) => {
  const ev = new HebrewDateEvent(new HDate(new Date(1995, 11, 17)));
  const obj = eventToClassicApiObject(ev, {}, false);
  const expected = {
    title: '24th of Kislev',
    date: '1995-12-17',
    hdate: '24 Kislev 5756',
    category: 'hebdate',
    title_orig: '24 Kislev 5756',
    hebrew: 'כ״ד כסלו',
    heDateParts: {
      d: 'כ״ד',
      m: 'כסלו',
      y: 'תשנ״ו',
    },
  };
  t.deepEqual(obj, expected);
});

test('mishna-yomi', (t) => {
  const my = [{k: 'Berakhot', v: '3:6'}, {k: 'Berakhot', v: '4:1'}];
  const hd = new HDate(new Date(1947, 4, 29));
  const ev = new MishnaYomiEvent(hd, my);
  const obj = eventToClassicApiObject(ev, {}, false);
  const expected = {
    title: 'Berakhot 3:6-4:1',
    date: '1947-05-29',
    hdate: '10 Sivan 5707',
    category: 'mishnayomi',
    hebrew: 'ברכות 3:6-4:1',
    link: 'https://www.sefaria.org/Mishnah_Berakhot.3.6-4.1?lang=bi&utm_source=hebcal.com&utm_medium=api',
  };
  t.deepEqual(obj, expected);
});

test('location-zip', (t) => {
  const location = new Location(41.83815, -71.393139, false, 'America/New_York', 'Providence, RI 02906', 'US');
  location.admin1 = location.state = 'RI';
  location.zip = '02906';
  location.stateName = 'Rhode Island';
  const ev = new HebrewDateEvent(new HDate(new Date(2022, 2, 4)));
  const apiResult = eventsToClassicApi([ev], {location});
  delete apiResult.date;
  const expected = {
    title: 'Hebcal Providence March 2022',
    location: {
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
    },
    range: {
      start: '2022-03-04',
      end: '2022-03-04',
    },
    items: [
      {
        title: '1st of Adar II, 5782',
        date: '2022-03-04',
        hdate: '1 Adar II 5782',
        category: 'hebdate',
        title_orig: '1 Adar II 5782',
        hebrew: 'א׳ אדר ב׳',
        heDateParts: {
          d: 'א׳',
          m: 'אדר ב׳',
          y: 'תשפ״ב',
        },
      },
    ],
  };
  t.deepEqual(apiResult, expected);
});

test('omer', (t) => {
  const ev = new OmerEvent(new HDate(2, 'Sivan', 5770), 46);
  const obj = eventToClassicApiObject(ev, {}, false);
  const expected = {
    title: '46th day of the Omer',
    date: '2010-05-15',
    hdate: '2 Sivan 5770',
    category: 'omer',
    title_orig: 'Omer 46',
    hebrew: 'עומר יום 46',
    link: 'https://hebcal.com/o/5770/46?us=js&um=api',
    omer: {
      count: {
        en: 'Today is 46 days, which is 6 weeks and 4 days of the Omer',
        he: 'הַיוֹם שִׁשָׁה וְאַרְבָּעִים יוֹם, שְׁהֵם שִׁשָׁה שָׁבוּעוֹת וְאַרְבָּעָה יָמִים לָעוֹמֶר',
      },
      sefira: {
        en: 'Eternity within Majesty',
        he: 'נֶּֽצַח שֶׁבְּמַּלְכוּת',
        translit: 'Netzach sheb\'Malkhut',
      },
    },
  };
  t.deepEqual(obj, expected);
});

test('classic-api-empty', (t) => {
  const apiResult = eventsToClassicApi([], {}, false);
  delete apiResult.date;
  const expected = {
    title: 'Hebcal Diaspora',
    location: {geo: 'none'},
    items: [],
  };
  t.deepEqual(apiResult, expected);
});

test('options.heDateParts', (t) => {
  const hd = new HDate(18, 'Tishrei', 5783);
  const options = {start: hd, end: hd};
  const events = HebrewCalendar.calendar(options);
  options.heDateParts = true;
  const actual = eventToClassicApiObject(events[0], options, false);
  t.deepEqual(actual.heDateParts, {y: 'תשפ״ג', m: 'תשרי', d: 'י״ח'});
});

test('yerushalmi-yomi', (t) => {
  const hd = new HDate(new Date(2022, 10, 15));
  const daf = {name: 'Berakhot', blatt: 2};
  const ev = new YerushalmiYomiEvent(hd, daf);
  const obj = eventToClassicApiObject(ev, {}, false);
  const expected = {
    title: 'Berakhot 2',
    date: '2022-11-15',
    hdate: '21 Cheshvan 5783',
    category: 'yerushalmi',
    hebrew: 'ברכות דף ב׳',
  };
  t.deepEqual(obj, expected);
});

test('molad', (t) => {
  const options = {year: 2022, molad: true, noHolidays: true};
  const events = HebrewCalendar.calendar(options);
  const apiResult = eventsToClassicApi(events.slice(2, 5), options, false);
  const expected = [{
    title: 'Molad Adar II: Thu, 51 minutes and 17 chalakim after 3:00',
    date: '2022-02-26',
    hdate: '25 Adar I 5782',
    category: 'molad',
    title_orig: 'Molad Adar II 5782',
    molad: {
      year: 5782,
      month: 'Adar II',
      dow: 4,
      hour: 3,
      minutes: 51,
      chalakim: 17,
    },
  }, {
    title: 'Molad Nisan: Fri, 36 minutes and 0 chalakim after 16:00',
    date: '2022-03-26',
    hdate: '23 Adar II 5782',
    category: 'molad',
    title_orig: 'Molad Nisan 5782',
    molad: {
      year: 5782,
      month: 'Nisan',
      dow: 5,
      hour: 16,
      minutes: 36,
      chalakim: 0,
    },
  }, {
    title: 'Molad Iyyar: Sun, 20 minutes and 1 chalakim after 5:00',
    date: '2022-04-30',
    hdate: '29 Nisan 5782',
    category: 'molad',
    title_orig: 'Molad Iyyar 5782',
    molad: {
      year: 5782,
      month: 'Iyyar',
      dow: 0,
      hour: 5,
      minutes: 20,
      chalakim: 1,
    },
  }];
  t.deepEqual(apiResult.items, expected);
});
