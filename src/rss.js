import {hebcal, Location, Event} from '@hebcal/core';
import {getEventCategories} from './common';

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
    const anchor = hebcal.makeAnchor(ev.getDesc());
    guid = link = 'https://www.hebcal.com/shabbat/?' + utmParam + '&amp;dt=' + dtStr + '#' + anchor;
  }
  return [link, guid];
}

/**
 * @param {Event[]} events
 * @param {Location} location
 * @param {string} [lang] language such as 'he' (default 'en-US')
 * @param {boolean} [evPubDate] if true, use event time as pubDate (false uses lastBuildDate)
 * @return {string}
 */
export function eventsToRss(events, location, lang='en-US', evPubDate=true) {
  const cityDescr = location.getName();
  const thisYear = new Date().getFullYear();
  const title = 'Shabbat Times for ' + cityDescr;
  const mainUrl = 'https://hebcal.com/bogus?a=b';
  const lastBuildDate = new Date().toUTCString();
  const dayFormat = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  let str = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${title}</title>
<link>${mainUrl}&amp;${utmParam}</link>
<atom:link href="${mainUrl}&amp;cfg=r" rel="self" type="application/rss+xml" />
<description>Weekly Shabbat candle lighting times for ${cityDescr}</description>
<language>${lang}</language>
<copyright>Copyright (c) ${thisYear} Michael J. Radwin. All rights reserved.</copyright>
<lastBuildDate>${lastBuildDate}</lastBuildDate>`;
  for (const ev of events) {
    const subj = ev.render();
    const evDate = ev.getDate().greg();
    const pubDate = evPubDate ? evDate.toUTCString() : lastBuildDate;
    const [link, guid] = getLinkAndGuid(ev);
    const description = dayFormat.format(evDate);
    const categories = getEventCategories(ev);
    str += `<item>
<title>${subj}</title>
<link>${link}</link>
<guid isPermaLink="false">${guid}</guid>
<description>${description}</description>
<category>${categories[0]}</category>
<pubDate>${pubDate}</pubDate>
`;
    if (categories[0] == 'candles') {
      str += `<geo:lat>${location.getLatitude()}</geo:lat>\n<geo:long>${location.getLongitude()}</geo:long>\n`;
    }
    str += '</item>\n';
  }
  str += '</channel>\n</rss>\n';
  return str;
}
