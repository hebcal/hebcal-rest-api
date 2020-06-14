import getTimezoneOffset from 'get-timezone-offset';

/**
 * @param {number} number
 * @return {string}
 */
export function pad2(number) {
  if (number < 10) {
    return '0' + number;
  }
  return String(number);
}

/**
   * Get offset string (like "+05:00" or "-08:00") from tzid (like "Europe/Moscow")
   * @param {string} tzid
   * @param {Date} date
   * @return {string}
   */
export function timeZoneOffsetStr(tzid, date) {
  const offset = getTimezoneOffset(tzid, date);
  const offsetAbs = Math.abs(offset);
  const dir = Boolean(offset < 0);
  const hours = Math.floor(offsetAbs / 60);
  const minutes = offsetAbs % 60;
  return (dir ? '+' : '-') + pad2(hours) + ':' + pad2(minutes);
}

/**
 * Returns just the date portion as YYYY-MM-DD
 * @param {Date} d
 * @return {string}
 */
export function toISOString(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

/**
 * Returns a string like "2018-09-01T12:30:00-05:00'"
 * @param {Date} date
 * @param {string} timeStr must be formatted with only hours and minutes, like "17:12"
 * @param {string} tzid like "America/New_York"
 * @return {string}
 */
export function toISOStringWithTimezone(date, timeStr, tzid) {
  const str = toISOString(date);
  if (!timeStr) return str;
  return str + 'T' + timeStr + ':00' + timeZoneOffsetStr(tzid, date);
}
