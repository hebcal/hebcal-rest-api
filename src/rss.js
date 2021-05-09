import {getEventCategories, makeAnchor} from './common';
import {Locale, HebrewCalendar} from '@hebcal/core';

const utmParam = 'utm_source=shabbat1c&amp;utm_medium=rss';

/**
 * @param {Event} ev
 * @param {boolean} il
 * @return {string[]}
 */
function getLinkAndGuid(ev, il) {
  let link;
  let guid;
  const dt = ev.eventTime || ev.getDate().greg();
  const dtStr0 = dt.toISOString();
  const dtStr = encodeURIComponent(dtStr0.substring(0, ev.eventTime ? 19 : 10));
  const url0 = ev.url();
  const url = url0 && il ? url0 + '?i=on' : url0;
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
  const title = Locale.gettext('Shabbat') + ' Times for ' + cityDescr;
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
    const dt = ev.eventTime;
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
  const linkGuid = getLinkAndGuid(ev, location.getIsrael());
  const link = linkGuid[0];
  const guid = linkGuid[1];
  const description = dayFormat.format(evDate);
  const categories = getEventCategories(ev);
  const cat0 = categories[0];
  const desc = ev.getDesc();
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
  if (candles) {
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      const options = {location, il: location.getIsrael(), locale: Locale.getLocaleName()};
      const time = HebrewCalendar.reformatTimeStr(ev.eventTimeStr, 'pm', options);
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
