import {expect, test} from 'vitest';
import {makeAnchor} from '../src/makeAnchor';

test('makeAnchor', () => {
  expect(makeAnchor('Rosh Chodesh Adar II')).toBe('rosh-chodesh-adar-ii');
  expect(makeAnchor('Chanukah: 2 Candles')).toBe('chanukah-2-candles');
  expect(makeAnchor('Yom Kippur')).toBe('yom-kippur');
  expect(makeAnchor("Ki Teitzei")).toBe('ki-teitzei');
  expect(makeAnchor("doesn't-matter")).toBe('doesnt-matter');
  expect(makeAnchor('test--hyphen')).toBe('test-hyphen');
  expect(makeAnchor('99-bottles_of_beer')).toBe('99-bottles-of-beer');
});
