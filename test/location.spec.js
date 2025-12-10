import {expect, test} from 'vitest';
import {Location} from '@hebcal/core';
import {locationToPlainObj} from '../src/location';

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

