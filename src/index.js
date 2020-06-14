import {csvWriteContents, icalWriteContents} from './icalendar';
import {
  getEventCategories,
  pad2,
  timeZoneOffsetStr,
  toISOString,
  toISOStringWithTimezone,
} from './common';
import {eventToFullCalendar} from './fullcalendar';

/** Main interface to hebcal/icalendar */
const icalendar = {
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
