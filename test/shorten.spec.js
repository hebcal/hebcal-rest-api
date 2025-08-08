import {expect, test} from 'vitest';
import {shortenSedrotUrl} from '../src/shorten';

test('shortenSedrotUrl', () => {
  const u1 = new URL('https://www.hebcal.com/sedrot/vayakhel-pekudei-20340318');
  shortenSedrotUrl(u1);
  expect(u1.toString()).toBe('https://www.hebcal.com/s/5794/22d');

  const u2 = new URL('https://www.hebcal.com/sedrot/lech-lecha-19991023?i=on');
  shortenSedrotUrl(u2);
  expect(u2.toString()).toBe('https://www.hebcal.com/s/5760i/3');

  const u3 = new URL('https://www.hebcal.com/sedrot/masei-20240817');
  shortenSedrotUrl(u3);
  expect(u3.toString()).toBe('https://www.hebcal.com/s/5784/43');

  const u4 = new URL('https://www.hebcal.com/sedrot/invalid-url-date');
  shortenSedrotUrl(u4);
  expect(u4.toString()).toBe('https://www.hebcal.com/s/invalid-url-date');

  const u5 = new URL('https://www.hebcal.com/sedrot/nitzavim-vayeilech-20240928?i=on');
  shortenSedrotUrl(u5);
  expect(u5.toString()).toBe('https://www.hebcal.com/s/5784i/51d');
});
