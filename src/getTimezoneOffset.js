const _formatters = new Map();

/**
 * @param {string} tzid
 * @return {Intl.DateTimeFormat}
 */
function getFormatter(tzid) {
  const fmt = _formatters.get(tzid);
  if (fmt) return fmt;
  const f = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: tzid,
  });
  _formatters.set(tzid, f);
  return f;
}

const dateFormatRegex = /^(\d+).(\d+).(\d+),?\s+(\d+).(\d+).(\d+)/;

/**
 * @param {string} tzid
 * @param {Date} date
 * @return {string}
 */
function getPseudoISO(tzid, date) {
  const str = getFormatter(tzid).format(date);
  const [, mm, dd, yyyy, hour, min, sec] = dateFormatRegex.exec(str);
  return `${yyyy}-${mm}-${dd}T${hour}:${min}:${sec}Z`;
}

/**
 * @param {string} tzid
 * @param {Date} date
 * @return {number}
 */
export function getTimezoneOffset(tzid, date) {
  const utcStr = getPseudoISO('UTC', date);
  const localStr = getPseudoISO(tzid, date);
  const diffMs = new Date(utcStr).getTime() - new Date(localStr).getTime();
  return Math.ceil(diffMs / 1000 / 60);
}
