/* eslint-disable max-len */
import {expect, test} from 'vitest';
import {HebrewCalendar, Location, HDate, HebrewDateEvent,
  OmerEvent} from '@hebcal/core';
import {YerushalmiYomiEvent, DafYomiEvent, MishnaYomiEvent} from '@hebcal/learning';
import {eventToCsv, eventsToCsv} from '../src/csv';

test('eventToCsv', () => {
  const options = {
    year: 1990,
    month: 4,
    noMinorFast: true,
    noRoshChodesh: true,
    noSpecialShabbat: true,
    candlelighting: true,
    location: Location.lookup('Chicago'),
  };
  const events = HebrewCalendar.calendar(options).slice(0, 5);
  const csv = events.map((e) => eventToCsv(e, options));
  expect(csv[0]).toBe(`"Candle lighting","4/6/1990","7:04 PM","4/6/1990","7:04 PM","false","","4","Chicago"`);
  expect(csv[1]).toBe(`"Havdalah","4/7/1990","8:06 PM","4/7/1990","8:06 PM","false","","4","Chicago"`);
  expect(csv[2]).toBe(`"Erev Pesach","4/9/1990",,,,"true","Passover; the Feast of Unleavened Bread","3","Jewish Holidays"`);
  expect(csv[3]).toBe(`"Candle lighting","4/9/1990","7:07 PM","4/9/1990","7:07 PM","false","Erev Pesach","4","Chicago"`);
  expect(csv[4]).toBe(`"Pesach I","4/10/1990",,,,"true","Passover; the Feast of Unleavened Bread","4","Jewish Holidays"`);
});

test('eventsToCsv', () => {
  const options = {
    start: new Date(1990, 3, 10),
    end: new Date(1990, 3, 10),
  };
  const events = HebrewCalendar.calendar(options);
  const csv = eventsToCsv(events, options).split('\r\n');
  expect(csv.length).toBe(3);
  const csvHeader = '"Subject","Start Date","Start Time","End Date","End Time","All day event","Description","Show time as","Location"';
  expect(csv[0]).toBe(csvHeader);
  expect(csv[1]).toBe(`"Pesach I","4/10/1990",,,,"true","Passover; the Feast of Unleavened Bread","4","Jewish Holidays"`);
  expect(csv[2]).toBe('');
});

test('appendHebrewToSubject', () => {
  const options = {
    start: new Date(2020, 4, 23),
    end: new Date(2020, 4, 30),
    sedrot: true,
    candlelighting: true,
    havdalahMins: 42,
    location: Location.lookup('Gibraltar'),
    appendHebrewToSubject: true,
  };
  const events = HebrewCalendar.calendar(options);
  const csv = eventsToCsv(events, options).split('\r\n').slice(1, 10);
  const subject = csv.map((line) => line.substring(0, line.indexOf(',')));
  const expected = [
    '"Parashat Bamidbar / פָּרָשַׁת בְּמִדְבַּר"',
    '"Havdalah (42 min) / הַבְדָּלָה (42 דַּקּוֹת)"',
    '"Rosh Chodesh Sivan / רֹאשׁ חוֹדֶשׁ סִיוָן"',
    '"Erev Shavuot / עֶרֶב שָׁבוּעוֹת"',
    '"Candle lighting / הַדְלָקַת נֵרוֹת"',
    '"Shavuot I / שָׁבוּעוֹת א׳"',
    '"Candle lighting / הַדְלָקַת נֵרוֹת"',
    '"Shavuot II / שָׁבוּעוֹת ב׳"',
    '"Havdalah (42 min) / הַבְדָּלָה (42 דַּקּוֹת)"',
  ];
  expect(subject).toEqual(expected);
});

test('chanukah-candles', () => {
  const options = {
    start: new Date(2020, 11, 10),
    end: new Date(2020, 11, 10),
    location: Location.lookup('Boston'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const csv = eventToCsv(events[0], options);
  expect(csv).toBe('"Chanukah: 1 Candle","12/10/2020","4:36 PM","12/10/2020","4:36 PM","false","Hanukkah; the Jewish festival of rededication","4","Boston"');
});

test('fastStartEnd', () => {
  const options = {
    start: new Date(2021, 5, 27),
    end: new Date(2021, 5, 27),
    location: Location.lookup('Providence'),
    candlelighting: true,
  };
  const events = HebrewCalendar.calendar(options);
  const csv = eventsToCsv(events, options).split('\r\n').slice(1, 4);
  const expected = [
    '"Fast begins","6/27/2021","3:20 AM","6/27/2021","3:20 AM","false","Tzom Tammuz","4","Providence"',
    '"Tzom Tammuz","6/27/2021",,,,"true","Fast commemorating breaching of the walls of Jerusalem before the destruction of the Second Temple","3","Jewish Holidays"',
    '"Fast ends","6/27/2021","9:07 PM","6/27/2021","9:07 PM","false","Tzom Tammuz","4","Providence"',
  ];
  expect(csv).toEqual(expected);
});

test('HebrewDateEvent', () => {
  const ev = new HebrewDateEvent(new HDate(new Date(1995, 11, 17)));
  expect(eventToCsv(ev, {locale: 'en'})).toBe('"24th of Kislev","12/17/1995",,,,"true","","3","Hebrew Date"');
  expect(eventToCsv(ev, {locale: 'he'})).toBe('"כ״ד כִּסְלֵו","12/17/1995",,,,"true","","3","Hebrew Date"');
  expect(eventToCsv(ev, {locale: 'he-x-NoNikud'})).toBe('"כ״ד כסלו","12/17/1995",,,,"true","","3","Hebrew Date"');
});

test('newline', () => {
  const ev = new HebrewDateEvent(new HDate(2, 'Sivan', 5770));
  ev.memo = 'foo\nbar\nbaaz';
  const actual = eventToCsv(ev, {locale: 'en'});
  expect(actual).toBe('"2nd of Sivan","5/15/2010",,,,"true","foo / bar / baaz","3","Hebrew Date"');
});

test('CSV Location', () => {
  const hd = new HDate(new Date(2022, 10, 15));
  const toTest = [
    [new DafYomiEvent(hd),
      '"Nedarim 21","11/15/2022",,,,"true","","3","Daf Yomi"'],
    [new MishnaYomiEvent(hd,
        [{k: 'Bikkurim', v: '4:1'}, {k: 'Bikkurim', v: '4:2'}]),
    '"Bikkurim 4:1-2","11/15/2022",,,,"true","","3","Mishna Yomi"'],
    [new YerushalmiYomiEvent(hd,
        {name: 'Berakhot', blatt: 2, ed: 'vilna'}),
    '"Berakhot 2","11/15/2022",,,,"true","","3","Yerushalmi Yomi"'],
    [new OmerEvent(new HDate(28, 'Nisan', 5783), 13),
      '"13th day of the Omer","4/19/2023",,,,"true","","3",""'],
  ];
  for (const [ev, expected] of toTest) {
    const actual = eventToCsv(ev, {});
    expect(actual).toEqual(expected);
  }
});
