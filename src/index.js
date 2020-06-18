import {csvWriteContents, icalWriteContents} from './icalendar';
import {
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
  csvWriteContents,
  icalWriteContents,
  eventToFullCalendar,
  getEventCategories,
  pad2,
  timeZoneOffsetStr,
  toISOString,
  toISOStringWithTimezone,
};

export default icalendar;
