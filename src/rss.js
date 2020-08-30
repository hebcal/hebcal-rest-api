import {getEventCategories, makeAnchor} from './common';
import {Locale, HebrewCalendar} from '@hebcal/core';

const utmParam = 'utm_source=shabbat1c&amp;utm_medium=rss';

/**
 * @param {Event} ev
 * @return {string[]}
 */
function getLinkAndGuid(ev) {
  let link;
  let guid;
  const attrs = ev.getAttrs();
  const dt = attrs.eventTime || ev.getDate().greg();
  const dtStr0 = dt.toISOString();
  const dtStr = encodeURIComponent(dtStr0.substring(0, attrs.eventTime ? 19 : 10));
  const url = ev.url();
  if (url) {
    const question = url.indexOf('?');
    if (question == -1) {
      link = url + '?' + utmParam;
    } else {
      link = url + '&amp;' + utmParam;
    }
    guid = link + '&amp;dt=' + dtStr;
  } else {
    const anchor = makeAnchor(ev.getDesc());
    guid = link = 'https://www.hebcal.com/shabbat?' + utmParam + '&amp;dt=' + dtStr + '#' + anchor;
  }
  return [link, guid];
}

/**
 * @param {Event[]} events
 * @param {Location} location
 * @param {string} mainUrl
 * @param {string} selfUrl
 * @param {string} [lang] language such as 'he' (default 'en-US')
 * @param {boolean} [evPubDate] if true, use event time as pubDate (false uses lastBuildDate)
 * @return {string}
 */
export function eventsToRss(events, location, mainUrl, selfUrl, lang='en-US', evPubDate=true) {
  const cityDescr = location.getName();
  const thisYear = new Date().getFullYear();
  const title = 'Shabbat Times for ' + cityDescr;
  const lastBuildDate = new Date().toUTCString();
  const dayFormat = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  mainUrl = mainUrl.replace(/&/g, '&amp;');
  selfUrl = selfUrl.replace(/&/g, '&amp;');
  let str = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${title}</title>
<link>${mainUrl}&amp;${utmParam}</link>
<atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
<description>Weekly Shabbat candle lighting times for ${cityDescr}</description>
<language>${lang}</language>
<copyright>Copyright (c) ${thisYear} Michael J. Radwin. All rights reserved.</copyright>
<lastBuildDate>${lastBuildDate}</lastBuildDate>
`;
  events.forEach((ev) => {
    str += eventToRssItem(ev, evPubDate, lastBuildDate, dayFormat, location);
  });
  str += '</channel>\n</rss>\n';
  return str;
}

/**
 * @private
 * @param {Event} ev
 * @param {boolean} evPubDate
 * @param {Date} evDate
 * @param {string} lastBuildDate
 * @return {string}
 */
function getPubDate(ev, evPubDate, evDate, lastBuildDate) {
  if (evPubDate) {
    const dt = ev.getAttrs().eventTime;
    if (dt) {
      return dt.toUTCString();
    }
    return evDate.toUTCString().replace(/ \S+ GMT$/, ' 00:00:00 GMT');
  }
  return lastBuildDate;
}

/**
 * @param {Event} ev
 * @param {boolean} evPubDate
 * @param {string} lastBuildDate
 * @param {Intl.DateTimeFormat} dayFormat
 * @param {Location} location
 * @return {string}
 */
export function eventToRssItem(ev, evPubDate, lastBuildDate, dayFormat, location) {
  let subj = ev.render();
  const evDate = ev.getDate().greg();
  const pubDate = getPubDate(ev, evPubDate, evDate, lastBuildDate);
  const linkGuid = getLinkAndGuid(ev);
  const link = linkGuid[0];
  const guid = linkGuid[1];
  const description = dayFormat.format(evDate);
  const categories = getEventCategories(ev);
  const cat0 = categories[0];
  const attrs = ev.getAttrs();
  if (typeof attrs.eventTimeStr === 'string') {
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      const options = {location, il: location.getIsrael(), locale: Locale.getLocaleName()};
      const time = HebrewCalendar.reformatTimeStr(attrs.eventTimeStr, 'pm', options);
      subj = subj.substring(0, colon) + ': ' + time;
    }
  }
  const geoTags = (cat0 == 'candles') ?
    `<geo:lat>${location.getLatitude()}</geo:lat>\n<geo:long>${location.getLongitude()}</geo:long>\n` :
    '';
  return `<item>
<title>${subj}</title>
<link>${link}</link>
<guid isPermaLink="false">${guid}</guid>
<description>${description}</description>
<category>${cat0}</category>
<pubDate>${pubDate}</pubDate>
${geoTags}</item>
`;
}
