import {csvWriteContents, icalWriteContents} from './icalendar';
import {
  getEventCategories,
  pad2,
  timeZoneOffsetStr,
  toISOString,
  toISOStringWithTimezone,
} from './common';

/** Main interface to hebcal/icalendar */
const icalendar = {
  csvWriteContents,
  icalWriteContents,
  getEventCategories,
  pad2,
  timeZoneOffsetStr,
  toISOString,
  toISOStringWithTimezone,
};

export default icalendar;
