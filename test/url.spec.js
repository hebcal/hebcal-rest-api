import {expect, test} from 'vitest';
import {appendIsraelAndTracking} from '../src/url';

test('appendIsraelAndTracking', () => {
  expect(appendIsraelAndTracking('https://www.hebcal.com/foo', true, 'foo', 'bar'))
    .toBe('https://www.hebcal.com/foo?i=on&utm_source=foo&utm_medium=bar');
  expect(appendIsraelAndTracking('https://www.hebcal.com/foo', false, 'foo', 'bar'))
    .toBe('https://www.hebcal.com/foo?utm_source=foo&utm_medium=bar');
  expect(appendIsraelAndTracking('https://www.hebcal.com/sedrot/bamidbar-20250531', true, 'foo', 'bar'))
    .toBe('https://hebcal.com/s/5785i/34?us=foo&um=bar');
  expect(appendIsraelAndTracking('https://www.hebcal.com/sedrot/lech-lecha-19991023', false, 'foo', 'bar'))
    .toBe('https://hebcal.com/s/5760/3?us=foo&um=bar');
  expect(appendIsraelAndTracking('https://www.hebcal.com/sedrot/lech-lecha-19991023', false, 'foo', 'bar', 'hello'))
    .toBe('https://hebcal.com/s/5760/3?us=foo&um=bar&uc=hello');
  expect(appendIsraelAndTracking('https://www.hebcal.com/sedrot/vayakhel-pekudei-20340318', false, undefined, undefined, 'ical-abc'))
    .toBe('https://hebcal.com/s/5794/22d?uc=ical-abc');
  expect(appendIsraelAndTracking('https://www.hebcal.com/holidays/quux-678', true, 'foo', 'bar', 'ical-abc'))
    .toBe('https://hebcal.com/h/quux-678?i=on&uc=ical-abc');
  expect(appendIsraelAndTracking('https://www.hebcal.com/holidays/quux-987', false, 'foo', 'bar', 'pdf-abc'))
    .toBe('https://hebcal.com/h/quux-987?uc=pdf-abc');
});
