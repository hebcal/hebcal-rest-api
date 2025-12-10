import {Location} from '@hebcal/core/dist/esm/location';
import type {StringMap} from './common';
import countryNames0 from './countryNames.json';

export const countryNames: StringMap = countryNames0 as StringMap;

/**
 * Location information
 */
export type LocationPlainObj = {
  title?: string | null;
  city?: string | null;
  tzid?: string;
  latitude?: number;
  longitude?: number;
  cc?: string;
  country?: string;
  admin1?: string;
  asciiname?: string;
  geo?: string;
  zip?: string;
  state?: string;
  stateName?: string;
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
 * Converts a @hebcal/core `Location` to a plain JS object.
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
