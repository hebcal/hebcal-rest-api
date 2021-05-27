import {getEventCategories, makeAnchor, appendIsraelAndTracking, makeTorahMemoText} from './common';
import {Locale, HebrewCalendar, Zmanim, flags} from '@hebcal/core';
import holidayDescription from './holidays.json';

/**
 * @private
 * @param {Event} ev
 * @param {boolean} il
 * @param {string} tzid
 * @param {string} mainUrl
 * @return {string[]}
 */
function getLinkAndGuid(ev, il, tzid, mainUrl) {
  let link;
  let guid;
  const dt = ev.eventTime || ev.getDate().greg();
  const isoDateTime = Zmanim.formatISOWithTimeZone(tzid, dt);
  const dtStr = isoDateTime.substring(0, isoDateTime.indexOf('T'));
  const dtAnchor = dtStr.replace(/-/g, '');
  const descAnchor = makeAnchor(ev.getDesc());
  const anchor = `${dtAnchor}-${descAnchor}`;
  const url0 = ev.url();
  if (url0) {
    link = appendIsraelAndTracking(url0, il, 'shabbat1c', 'rss').replace(/&/g, '&amp;');
    guid = `${url0}#${anchor}`;
  } else {
    const url1 = `${mainUrl}&dt=${dtStr}`;
    const url = appendIsraelAndTracking(url1, il, 'shabbat1c', 'rss').replace(/&/g, '&amp;');
    guid = url1.replace(/&/g, '&amp;') + `#${anchor}`;
    link = `${url}#${anchor}`;
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
  const mainUrlEsc = appendIsraelAndTracking(mainUrl, location.getIsrael(), 'shabbat1c', 'rss').replace(/&/g, '&amp;');
  selfUrl = selfUrl.replace(/&/g, '&amp;');
  let str = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${title}</title>
<link>${mainUrlEsc}</link>
<atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
<description>Weekly Shabbat candle lighting times for ${cityDescr}</description>
<language>${lang}</language>
<copyright>Copyright (c) ${thisYear} Michael J. Radwin. All rights reserved.</copyright>
<lastBuildDate>${lastBuildDate}</lastBuildDate>
`;
  events.forEach((ev) => {
    str += eventToRssItem(ev, evPubDate, lastBuildDate, dayFormat, location, mainUrl);
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
 * @param {string} mainUrl
 * @return {string}
 */
export function eventToRssItem(ev, evPubDate, lastBuildDate, dayFormat, location, mainUrl) {
  let subj = ev.render();
  const evDate = ev.getDate().greg();
  const pubDate = getPubDate(ev, evPubDate, evDate, lastBuildDate);
  const il = location ? location.getIsrael() : false;
  const tzid = location ? location.getTzid() : 'UTC';
  const linkGuid = getLinkAndGuid(ev, il, tzid, mainUrl);
  const link = linkGuid[0];
  const guid = linkGuid[1];
  const categories = getEventCategories(ev);
  const cat0 = categories[0];
  const desc = ev.getDesc();
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
  let memo;
  if (candles) {
    const colon = subj.indexOf(': ');
    if (colon != -1) {
      const options = {location, il, locale: Locale.getLocaleName()};
      const time = HebrewCalendar.reformatTimeStr(ev.eventTimeStr, 'pm', options);
      subj = subj.substring(0, colon) + ': ' + time;
    }
  } else {
    memo = (ev.getFlags() & flags.PARSHA_HASHAVUA) ?
        makeTorahMemoText(ev, il) :
        ev.memo || holidayDescription[ev.basename()];
  }
  const description = memo || dayFormat.format(evDate);
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
