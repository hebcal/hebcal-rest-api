import {hebcal, flags} from '@hebcal/core';

// eslint-disable-next-line max-len
const csvHeader = '"Subject","Start Date","Start Time","End Date","End Time","All day event","Description","Show time as","Location"';

/**
 * Renders an Event as a string
 * @param {Event} e
 * @param {hebcal.HebcalOptions} options
 * @return {string}
 */
export function eventToCsv(e, options) {
  const d = e.getDate().greg();
  const mday = d.getDate();
  const mon = d.getMonth() + 1;
  const year = String(d.getFullYear()).padStart(4, '0');
  const date = options.euro ? `${mday}/${mon}/${year}` : `${mon}/${mday}/${year}`;

  let subj = e.render();
  let startTime = '';
  let endTime = '';
  let endDate = '';
  let allDay = '"true"';

  const attrs = e.getAttrs();
  const timed = Boolean(attrs.eventTime);
  if (timed) {
    const timeStr = hebcal.reformatTimeStr(attrs.eventTimeStr, ' PM', options);
    endTime = startTime = `"${timeStr}"`;
    endDate = date;
    allDay = '"false"';
    // replace "Candle lighting: 15:34" with shorter title
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      subj = subj.substring(0, colon);
    }
  }

  let loc = 'Jewish Holidays';
  const mask = e.getFlags();
  if (timed && options.location && options.location.name) {
    const comma = options.location.name.indexOf(',');
    loc = (comma == -1) ? options.location.name : options.location.name.substring(0, comma);
  } else if (mask & flags.DAF_YOMI) {
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      loc = subj.substring(0, colon);
      subj = subj.substring(colon + 2);
    }
  }

  subj = subj.replace(/,/g, '').replace(/"/g, '\'\'');
  const memo = (attrs.memo || '').replace(/,/g, ';').replace(/"/g, '\'\'');

  const showTimeAs = (timed || (mask & flags.CHAG)) ? 4 : 3;
  return `"${subj}",${date},${startTime},${endDate},${endTime},${allDay},"${memo}",${showTimeAs},"${loc}"`;
}

/**
 * @param {stream.Writable} res
 * @param {Event[]} events
 * @param {hebcal.HebcalOptions} options
 */
export function csvWriteContents(res, events, options) {
  const fileName = getDownloadFilename(options) + '.csv';
  exportHttpHeader(res, 'text/x-csv', fileName);
  res.write(csvHeader);
  res.write('\r\n');
  events.forEach((e) => {
    res.write(eventToCsv(e, options));
    res.write('\r\n');
  });
}

/**
 * @param {Event[]} events
 * @param {hebcal.HebcalOptions} options
 * @return {string}
 */
export function eventsToCsv(events, options) {
  return [csvHeader].concat(events.map((e) => eventToCsv(e, options))).join('\r\n');
}
