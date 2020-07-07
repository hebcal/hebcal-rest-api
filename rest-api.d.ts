/// <reference types="node"/>
import {HebrewCalendar, Event} from '@hebcal/core';
declare module '@hebcal/rest-api' {
/**
 * Renders an Event as a string
 */
export function eventToCsv(e: Event, options: HebrewCalendar.Options): string;
export function eventsToCsv(events: Event[], options: HebrewCalendar.Options): string;
/**
 * Formats a list events for the classic Hebcal.com JSON API response
 */
export function eventsToClassicApi(events: Event[], options: HebrewCalendar.Options): any;
/**
 * Converts a Hebcal event to a classic Hebcal.com JSON API object
 * @param tzid - timeZone identifier
 * @param il - true if Israel
 */
export function eventToClassicApiObject(ev: Event, tzid: string, il: boolean): any;
/**
 * Converts a Hebcal event to a FullCalendar.io object
 * @param tzid - timeZone identifier
 * @param il - true if Israel
 */
export function eventToFullCalendar(ev: Event, tzid: string, il: boolean): any;
/**
 * @param [lang] - language such as 'he' (default 'en-US')
 * @param [evPubDate] - if true, use event time as pubDate (false uses lastBuildDate)
 */
export function eventsToRss(events: Event[], location: Location, lang?: string, evPubDate?: boolean): string;
export function eventToRssItem(ev: Event, evPubDate: boolean, lastBuildDate: string, dayFormat: Intl.DateTimeFormat, location: Location): string;
export function getDownloadFilename(options: HebrewCalendar.Options): string;
export function pad2(number: number): string;
/**
 * Get offset string (like "+05:00" or "-08:00") from tzid (like "Europe/Moscow")
 */
export function timeZoneOffsetStr(tzid: string, date: Date): string;
/**
 * Returns just the date portion as YYYY-MM-DD
 */
export function toISOString(d: Date): string;
/**
 * Returns a string like "2018-09-01T12:30:00-05:00'"
 * @param timeStr - must be formatted with only hours and minutes, like "17:12"
 * @param tzid - like "America/New_York"
 */
export function toISOStringWithTimezone(date: Date, timeStr: string, tzid: string): string;
/**
 * Returns a category and subcategory name
 */
export function getEventCategories(ev: Event): string[];
/**
 * Generates a title like "Hebcal 2020 Israel" or "Hebcal May 1993 Providence"
 */
export function getCalendarTitle(events: Event[], options: HebrewCalendar.Options): string;
}
