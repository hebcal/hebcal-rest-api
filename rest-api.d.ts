/// <reference types="node"/>

import {Event, Location, CalOptions} from '@hebcal/core';

declare module '@hebcal/rest-api' {
  /**
   * Renders an Event as a string
   */
  export function eventToCsv(e: Event, options: CalOptions): string;
  export function eventsToCsv(events: Event[], options: CalOptions): string;
  /**
   * Formats a list events for the classic Hebcal.com JSON API response
   */
  export function eventsToClassicApi(events: Event[], options: CalOptions, leyning?: boolean): any;
  /**
   * Converts a Hebcal event to a classic Hebcal.com JSON API object
   */
  export function eventToClassicApiObject(ev: Event, options: CalOptions, leyning?: boolean): any;
  /**
   * Converts a Hebcal event to a FullCalendar.io object
   * @param tzid - timeZone identifier
   * @param il - true if Israel
   */
  export function eventToFullCalendar(ev: Event, tzid: string, il: boolean): any;
  /**
   * Makes mulit-line text that summarizes Torah & Haftarah
   */
  export function makeTorahMemoText(ev: Event, il: boolean): string;
  /**
   * Appends utm_source and utm_medium parameters to a URL
   */
  export function appendIsraelAndTracking(url: string, il: boolean, utmSource: string, utmMedium: string, utmCampaign?: string): string;
  /**
   * @private
   */
  export function shouldRenderBrief(ev: Event): boolean;
  /**
   * Extends `CalOptions` with
   * `lang` - language such as 'he' (default 'en-US')
   * `evPubDate` - if true, use event time as pubDate (false uses lastBuildDate)
   */
  export function eventsToRss2(events: Event[], options: CalOptions): string;
  export function eventToRssItem2(ev: Event, options: CalOptions): string;
  export function getDownloadFilename(options: CalOptions): string;
  export function pad2(number: number): string;
  export function pad4(number: number): string;
  /**
   * Helper function to transform a string to make it more usable in a URL or filename.
   * Converts to lowercase and replaces non-word characters with hyphen ('-').
   */
  export function makeAnchor(s: string): string;
  /**
   * Returns just the date portion as YYYY-MM-DD
   */
  export function toISOString(d: Date): string;
  /**
   * Returns a category and subcategory name
   */
  export function getEventCategories(ev: Event): string[];
  /**
   * Generates a title like "Hebcal 2020 Israel" or "Hebcal May 1993 Providence"
   */
  export function getCalendarTitle(events: Event[], options: CalOptions): string;

  /**
   * Returns an English language description of the holiday
   * @param [firstSentence=false]
   */
  export function getHolidayDescription(ev: Event, firstSentence?: boolean): string;

  export type LocationPlainObj = {
    title: string;
    city: string;
    tzid: string;
    latitude: number;
    longitude: number;
    cc: string;
    country: string;
    admin1?: string;
    asciiname?: string;
    geo?: string;
    zip?: string;
    state?: string;
    stateName?: string;
    geonameid?: number;
  };

  export function locationToPlainObj(location: Location): LocationPlainObj;

  export interface StringMap {
    [key: string]: string;
  }
  export const countryNames: StringMap;
  export const holidayDescription: StringMap;
}
