import {Location} from '@hebcal/core/dist/esm/location';
import type {StringMap} from './common.js';
import countryNames0 from './countryNames.json.js';

/**
 * Maps a 2-letter ISO 3166 country code (e.g. `'FR'`) to its English name
 * (e.g. `'France'`)
 */
export const countryNames: StringMap = countryNames0 as StringMap;

/**
 * JSON-serializable representation of a `@hebcal/core` `Location`, as
 * returned by `locationToPlainObj()`. When `locationToPlainObj()` is
 * called without a location, only `geo: 'none'` is set.
 */
export type LocationPlainObj = {
  /** display name, e.g. `'Providence, RI'` */
  title?: string | null;
  /** short city name, e.g. `'Providence'` */
  city?: string | null;
  /** Olson timezone ID, e.g. `'America/New_York'` */
  tzid?: string;
  latitude?: number;
  longitude?: number;
  /** 2-letter ISO 3166 country code, e.g. `'US'` */
  cc?: string;
  /** English country name, e.g. `'United States'` */
  country?: string;
  /** elevation in meters, when known */
  elevation?: number;
  /** GeoNames admin1 code (roughly, US state or subnational region) */
  admin1?: string;
  /** ASCII-only spelling of the location name */
  asciiname?: string;
  /** geocoding method or source, e.g. `'zip'`, `'city'`, or `'none'` */
  geo?: string;
  /** US ZIP code, when the location was looked up by ZIP */
  zip?: string;
  /** 2-letter US state abbreviation */
  state?: string;
  /** full US state name */
  stateName?: string;
  /** GeoNames.org geonameid */
  geonameid?: number;
};

const LOC_FIELDS = [
  'elevation',
  'admin1',
  'asciiname',
  'geo',
  'zip',
  'state',
  'stateName',
  'geonameid',
];

/**
 * Converts a `@hebcal/core` `Location` to a plain, JSON-serializable object.
 * Some fields (e.g. `elevation`, `state`, `geonameid`) are only present when
 * the `Location` was constructed with that extra metadata attached (as done
 * by GeoNames-backed location lookups).
 * @param location - the location to convert, or `undefined`
 * @returns a plain object, or `{geo: 'none'}` if `location` is `undefined`
 */
export function locationToPlainObj(
  location: Location | undefined
): LocationPlainObj {
  if (
    typeof location === 'object' &&
    location !== null &&
    typeof location.getLatitude === 'function'
  ) {
    const cc: string = location.getCountryCode()!;
    const o: LocationPlainObj = {
      title: location.getName(),
      city: location.getShortName(),
      tzid: location.getTzid(),
      latitude: location.getLatitude(),
      longitude: location.getLongitude(),
      cc: cc,
      country: countryNames[cc],
    };
    for (const k of LOC_FIELDS) {
      const val = (location as any)[k];
      if (val) {
        (o as any)[k] = val;
      }
    }
    return o;
  } else {
    return {geo: 'none'};
  }
}
