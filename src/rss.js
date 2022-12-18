import {getEventCategories, makeAnchor, appendIsraelAndTracking,
  makeMemo, getCalendarTitle} from './common';
import {Locale, HebrewCalendar, Zmanim} from '@hebcal/core';

/**
 * @private
 * @param {Event} ev
 * @param {boolean} il
 * @param {string} tzid
 * @param {string} mainUrl
 * @param {string} utmSource
 * @param {string} utmMedium
 * @return {string[]}
 */
function getLinkAndGuid(ev, il, tzid, mainUrl, utmSource, utmMedium) {
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
    link = appendIsraelAndTracking(url0, il, utmSource, utmMedium).replace(/&/g, '&amp;');
    guid = `${url0}#${anchor}`;
  } else {
    const url1 = `${mainUrl}&dt=${dtStr}`;
    const url = appendIsraelAndTracking(url1, il, utmSource, utmMedium).replace(/&/g, '&amp;');
    guid = url1.replace(/&/g, '&amp;') + `#${anchor}`;
    link = `${url}#${anchor}`;
  }
  return [link, guid];
}

const localeToLg = {
  's': 'en',
  'a': 'en',
  'he-x-NoNikud': 'he',
  'h': 'he',
  'ah': 'en',
  'sh': 'en',
};

/**
 * @param {Event[]} events
 * @param {CalOptions} options
 * @return {string}
 */
export function eventsToRss2(events, options) {
  options.dayFormat = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const location = options.location;
  const mainUrl = options.mainUrl;
  const buildDate = options.buildDate = options.buildDate || new Date();
  const thisYear = buildDate.getFullYear();
  const lastBuildDate = options.lastBuildDate = buildDate.toUTCString();
  const title = options.title || getCalendarTitle(events, options);
  const description = options.description || title;
  const utmSource = options.utmSource || 'shabbat1c';
  const utmMedium = options.utmMedium || 'rss';
  const mainUrlEsc = appendIsraelAndTracking(mainUrl,
      location && location.getIsrael(),
      utmSource, utmMedium, options.utmCampaign).replace(/&/g, '&amp;');
  const selfUrlEsc = options.selfUrl.replace(/&/g, '&amp;');
  const lang = options.lang || localeToLg[options.locale] || options.locale || 'en-US';
  let str = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${title}</title>
<link>${mainUrlEsc}</link>
<atom:link href="${selfUrlEsc}" rel="self" type="application/rss+xml" />
<description>${description}</description>
<language>${lang}</language>
<copyright>Copyright (c) ${thisYear} Michael J. Radwin. All rights reserved.</copyright>
<lastBuildDate>${lastBuildDate}</lastBuildDate>
`;
  events.forEach((ev) => {
    str += eventToRssItem2(ev, options);
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
 * @param {CalOptions} options
 * @return {string}
 */
export function eventToRssItem2(ev, options) {
  let subj = ev.render();
  const evDate = ev.getDate().greg();
  const pubDate = getPubDate(ev, options.evPubDate, evDate, options.lastBuildDate);
  const location = options.location;
  const il = location ? location.getIsrael() : false;
  const tzid = location ? location.getTzid() : 'UTC';
  const utmSource = (options && options.utmSource) || 'shabbat1c';
  const utmMedium = (options && options.utmMedium) || 'rss';
  const linkGuid = getLinkAndGuid(ev, il, tzid, options.mainUrl, utmSource, utmMedium);
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
    memo = makeMemo(ev, il);
  }
  const dayFormat = options.dayFormat;
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
