import {eventToIcal, eventsToIcalendar} from './icalendar';
import {eventToCsv, eventsToCsv} from './csv';
import {
  getCalendarTitle,
  getDownloadFilename,
  getEventCategories,
  pad2,
  timeZoneOffsetStr,
  toISOString,
  toISOStringWithTimezone,
} from './common';
import {eventToFullCalendar} from './fullcalendar';
import countryNames from './countryNames.json';

/** Main interface to hebcal/icalendar */
const icalendar = {
  countryNames,
  eventToCsv,
  eventsToCsv,
  eventToIcal,
  eventsToIcalendar,
  eventToFullCalendar,
  getCalendarTitle,
  getDownloadFilename,
  getEventCategories,
  pad2,
  timeZoneOffsetStr,
  toISOString,
  toISOStringWithTimezone,
};

export default icalendar;
