import {Zmanim} from '@hebcal/core/dist/esm/zmanim';
import {Event} from '@hebcal/core/dist/esm/event';
import {Locale} from '@hebcal/core/dist/esm/locale';
import {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';
import {reformatTimeStr} from '@hebcal/core/dist/esm/reformatTimeStr';
import {
  RestApiOptions,
  StringMap,
  appendIsraelAndTracking,
  getCalendarTitle,
  getEventCategories,
  makeMemo,
} from './common';
import {makeAnchor} from './makeAnchor';

function getLinkAndGuid(
  ev: Event,
  il: boolean,
  tzid: string,
  mainUrl: string,
  utmSource?: string,
  utmMedium?: string
): string[] {
  let link;
  let guid;
  const eventTime: Date = (ev as TimedEvent).eventTime;
  const dt = eventTime || ev.greg();
  const isoDateTime = Zmanim.formatISOWithTimeZone(tzid, dt);
  const dtStr = isoDateTime.substring(0, isoDateTime.indexOf('T'));
  const dtAnchor = dtStr.replace(/-/g, '');
  const descAnchor = makeAnchor(ev.getDesc());
  const anchor = `${dtAnchor}-${descAnchor}`;
  const url0 = ev.url();
  if (url0) {
    link = appendIsraelAndTracking(url0, il, utmSource, utmMedium).replace(
      /&/g,
      '&amp;'
    );
    guid = `${url0}#${anchor}`;
  } else {
    const url1 = `${mainUrl}&dt=${dtStr}`;
    const url = appendIsraelAndTracking(url1, il, utmSource, utmMedium).replace(
      /&/g,
      '&amp;'
    );
    guid = url1.replace(/&/g, '&amp;') + `#${anchor}`;
    link = `${url}#${anchor}`;
  }
  return [link, guid];
}

const localeToLg: StringMap = {
  s: 'en',
  a: 'en',
  'he-x-NoNikud': 'he',
  h: 'he',
  ah: 'en',
  sh: 'en',
};

export function eventsToRss2(events: Event[], options: RestApiOptions): string {
  options.dayFormat = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const location = options.location;
  if (!options.mainUrl || !options.selfUrl) {
    throw new TypeError('mainUrl cannot be empty or blank');
  }
  const buildDate = (options.buildDate = options.buildDate || new Date());
  const thisYear = buildDate.getFullYear();
  const lastBuildDate = (options.lastBuildDate = buildDate.toUTCString());
  const title = options.title || getCalendarTitle(events, options);
  const description = options.description || title;
  const utmSource = options.utmSource || 'shabbat1c';
  const utmMedium = options.utmMedium || 'rss';
  const mainUrlEsc = appendIsraelAndTracking(
    options.mainUrl,
    Boolean(location?.getIsrael()),
    utmSource,
    utmMedium,
    options.utmCampaign
  ).replace(/&/g, '&amp;');
  const selfUrlEsc = options.selfUrl.replace(/&/g, '&amp;');
  const lang: string =
    options.lang || localeToLg[options.locale!] || options.locale || 'en-US';
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
  for (const ev of events) {
    str += eventToRssItem2(ev, options);
  }
  str += '</channel>\n</rss>\n';
  return str;
}

function getPubDate(
  ev: Event,
  evPubDate: boolean | undefined,
  evDate: Date,
  lastBuildDate?: string
): string | undefined {
  if (evPubDate) {
    const dt = (ev as TimedEvent).eventTime as Date;
    if (dt) {
      return dt.toUTCString();
    }
    return evDate.toUTCString().replace(/ \S+ GMT$/, ' 00:00:00 GMT');
  }
  return lastBuildDate;
}

export function eventToRssItem2(ev: Event, options: RestApiOptions): string {
  let subj = ev.render(options.locale);
  const evDate = ev.greg();
  const pubDate = getPubDate(
    ev,
    options.evPubDate,
    evDate,
    options.lastBuildDate
  );
  const location = options.location;
  const il = location ? location.getIsrael() : false;
  const tzid = location ? location.getTzid() : 'UTC';
  let utmSource = options.utmSource;
  if (!utmSource) {
    const url = ev.url();
    if (url) {
      const u = new URL(url);
      if (u.host === 'www.hebcal.com') {
        utmSource = 'shabbat1c';
      }
    } else {
      utmSource = 'shabbat1c';
    }
  }
  const utmMedium = options.utmMedium || 'rss';
  const mainUrl = options.mainUrl || '';
  const linkGuid = getLinkAndGuid(ev, il, tzid, mainUrl, utmSource, utmMedium);
  const link = linkGuid[0];
  const guid = linkGuid[1];
  const categories = getEventCategories(ev);
  const cat0 = categories[0];
  const desc = ev.getDesc();
  const candles = desc === 'Havdalah' || desc === 'Candle lighting';
  let memo;
  if (candles) {
    const colon = subj.indexOf(': ');
    if (colon !== -1) {
      const locale = options.locale || 'en';
      const opts = {location, il, locale};
      const time = reformatTimeStr(
        (ev as TimedEvent).eventTimeStr,
        'pm',
        opts
      );
      subj = subj.substring(0, colon) + ': ' + time;
    }
  } else {
    memo = makeMemo(ev, il);
  }
  const dayFormat = options.dayFormat!;
  const tmp = memo || dayFormat.format(evDate);
  const description = tmp.indexOf('<') === -1 ? tmp : `<![CDATA[${tmp}]]>`;
  const geoTags =
    cat0 === 'candles'
      ? `<geo:lat>${location!.getLatitude()}</geo:lat>\n<geo:long>${location!.getLongitude()}</geo:long>\n`
      : '';
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
