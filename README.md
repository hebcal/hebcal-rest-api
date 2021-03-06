# @hebcal/rest-api
Jewish holidays and Hebrew calendar as plain JSON objects, RSS, and CSV export

[![Build Status](https://circleci.com/gh/hebcal/hebcal-rest-api.svg?style=svg)](https://circleci.com/gh/hebcal/hebcal-rest-api)

## Installation
```bash
$ npm install @hebcal/rest-api
```

## Synopsis
```javascript
import {HebrewCalendar, Location} from '@hebcal/core';
import {eventsToClassicApi, eventsToCsv} from '@hebcal/rest-api';

const options = {
  year: 2020,
  month: 2,
  sedrot: true,
  candlelighting: true,
  location: Location.lookup('Hawaii'),
};
const events = HebrewCalendar.calendar(options);
const apiResult = eventsToClassicApi(events, options);

console.log(JSON.stringify(apiResult));

const csv = eventsToCsv(events, options);
console.log(JSON.stringify(csv));
```

## Functions

<dl>
<dt><a href="#makeAnchor">makeAnchor(s)</a> ⇒ <code>string</code></dt>
<dd><p>Helper function to transform a string to make it more usable in a URL or filename.
Converts to lowercase and replaces non-word characters with hyphen (&#39;-&#39;).</p>
</dd>
<dt><a href="#getDownloadFilename">getDownloadFilename(options)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#pad2">pad2(number)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#pad4">pad4(number)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><del><a href="#timeZoneOffsetStr">timeZoneOffsetStr(tzid, date)</a> ⇒ <code>string</code></del></dt>
<dd><p>Get offset string (like &quot;+05:00&quot; or &quot;-08:00&quot;) from tzid (like &quot;Europe/Moscow&quot;)</p>
</dd>
<dt><a href="#toISOString">toISOString(d)</a> ⇒ <code>string</code></dt>
<dd><p>Returns just the date portion as YYYY-MM-DD</p>
</dd>
<dt><del><a href="#toISOStringWithTimezone">toISOStringWithTimezone(date, timeStr, tzid)</a> ⇒ <code>string</code></del></dt>
<dd><p>Returns a string like &quot;2018-09-01T12:30:00-05:00&quot;</p>
</dd>
<dt><a href="#getEventCategories">getEventCategories(ev)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Returns a category and subcategory name</p>
</dd>
<dt><a href="#renderTitleWithoutTime">renderTitleWithoutTime(ev)</a> ⇒ <code>string</code></dt>
<dd><p>Renders the event title in default locale, but strips off time</p>
</dd>
<dt><a href="#getCalendarTitle">getCalendarTitle(events, options)</a> ⇒ <code>string</code></dt>
<dd><p>Generates a title like &quot;Hebcal 2020 Israel&quot; or &quot;Hebcal May 1993 Providence&quot;</p>
</dd>
<dt><a href="#getHolidayDescription">getHolidayDescription(ev, [firstSentence])</a> ⇒ <code>string</code></dt>
<dd><p>Returns an English language description of the holiday</p>
</dd>
<dt><a href="#makeTorahMemoText">makeTorahMemoText(ev, il)</a> ⇒ <code>string</code></dt>
<dd><p>Makes mulit-line text that summarizes Torah &amp; Haftarah</p>
</dd>
<dt><a href="#eventToCsv">eventToCsv(e, options)</a> ⇒ <code>string</code></dt>
<dd><p>Renders an Event as a string</p>
</dd>
<dt><a href="#eventsToCsv">eventsToCsv(events, options)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#eventsToClassicApi">eventsToClassicApi(events, options, [leyning])</a> ⇒ <code>Object</code></dt>
<dd><p>Formats a list events for the classic Hebcal.com JSON API response</p>
</dd>
<dt><a href="#eventToClassicApiObject">eventToClassicApiObject(ev, options, [leyning])</a> ⇒ <code>Object</code></dt>
<dd><p>Converts a Hebcal event to a classic Hebcal.com JSON API object</p>
</dd>
<dt><a href="#formatAliyot">formatAliyot(result, aliyot)</a> ⇒ <code>Object</code></dt>
<dd></dd>
<dt><a href="#formatLeyningResult">formatLeyningResult(reading)</a> ⇒ <code>Object</code></dt>
<dd></dd>
<dt><a href="#eventsToRss">eventsToRss(events, location, mainUrl, selfUrl, [lang], [evPubDate])</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#eventToRssItem">eventToRssItem(ev, evPubDate, lastBuildDate, dayFormat, location, mainUrl)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#eventToFullCalendar">eventToFullCalendar(ev, tzid, il)</a> ⇒ <code>Object</code></dt>
<dd><p>Converts a Hebcal event to a FullCalendar.io object</p>
</dd>
</dl>

<a name="makeAnchor"></a>

## makeAnchor(s) ⇒ <code>string</code>
Helper function to transform a string to make it more usable in a URL or filename.
Converts to lowercase and replaces non-word characters with hyphen ('-').

**Kind**: global function  

| Param | Type |
| --- | --- |
| s | <code>string</code> | 

**Example**  
```js
makeAnchor('Rosh Chodesh Adar II') // 'rosh-chodesh-adar-ii'
```
<a name="getDownloadFilename"></a>

## getDownloadFilename(options) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| options | <code>HebrewCalendar.Options</code> | 

<a name="pad2"></a>

## pad2(number) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| number | <code>number</code> | 

<a name="pad4"></a>

## pad4(number) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| number | <code>number</code> | 

<a name="timeZoneOffsetStr"></a>

## ~~timeZoneOffsetStr(tzid, date) ⇒ <code>string</code>~~
***Deprecated***

Get offset string (like "+05:00" or "-08:00") from tzid (like "Europe/Moscow")

**Kind**: global function  

| Param | Type |
| --- | --- |
| tzid | <code>string</code> | 
| date | <code>Date</code> | 

<a name="toISOString"></a>

## toISOString(d) ⇒ <code>string</code>
Returns just the date portion as YYYY-MM-DD

**Kind**: global function  

| Param | Type |
| --- | --- |
| d | <code>Date</code> | 

<a name="toISOStringWithTimezone"></a>

## ~~toISOStringWithTimezone(date, timeStr, tzid) ⇒ <code>string</code>~~
***Deprecated***

Returns a string like "2018-09-01T12:30:00-05:00"

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>Date</code> |  |
| timeStr | <code>string</code> | must be formatted with only hours and minutes, like "17:12" |
| tzid | <code>string</code> | like "America/New_York" |

<a name="getEventCategories"></a>

## getEventCategories(ev) ⇒ <code>Array.&lt;string&gt;</code>
Returns a category and subcategory name

**Kind**: global function  

| Param | Type |
| --- | --- |
| ev | <code>Event</code> | 

<a name="renderTitleWithoutTime"></a>

## renderTitleWithoutTime(ev) ⇒ <code>string</code>
Renders the event title in default locale, but strips off time

**Kind**: global function  

| Param | Type |
| --- | --- |
| ev | <code>Event</code> | 

<a name="getCalendarTitle"></a>

## getCalendarTitle(events, options) ⇒ <code>string</code>
Generates a title like "Hebcal 2020 Israel" or "Hebcal May 1993 Providence"

**Kind**: global function  

| Param | Type |
| --- | --- |
| events | <code>Array.&lt;Event&gt;</code> | 
| options | <code>HebrewCalendar.Options</code> | 

<a name="getHolidayDescription"></a>

## getHolidayDescription(ev, [firstSentence]) ⇒ <code>string</code>
Returns an English language description of the holiday

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| ev | <code>Event</code> |  | 
| [firstSentence] | <code>boolean</code> | <code>false</code> | 

<a name="makeTorahMemoText"></a>

## makeTorahMemoText(ev, il) ⇒ <code>string</code>
Makes mulit-line text that summarizes Torah & Haftarah

**Kind**: global function  

| Param | Type |
| --- | --- |
| ev | <code>Event</code> | 
| il | <code>boolean</code> | 

<a name="eventToCsv"></a>

## eventToCsv(e, options) ⇒ <code>string</code>
Renders an Event as a string

**Kind**: global function  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 
| options | <code>HebcalOptions</code> | 

<a name="eventsToCsv"></a>

## eventsToCsv(events, options) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| events | <code>Array.&lt;Event&gt;</code> | 
| options | <code>HebcalOptions</code> | 

<a name="eventsToClassicApi"></a>

## eventsToClassicApi(events, options, [leyning]) ⇒ <code>Object</code>
Formats a list events for the classic Hebcal.com JSON API response

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| events | <code>Array.&lt;Event&gt;</code> |  | 
| options | <code>HebrewCalendar.Options</code> |  | 
| [leyning] | <code>boolean</code> | <code>true</code> | 

<a name="eventToClassicApiObject"></a>

## eventToClassicApiObject(ev, options, [leyning]) ⇒ <code>Object</code>
Converts a Hebcal event to a classic Hebcal.com JSON API object

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| ev | <code>Event</code> |  | 
| options | <code>HebrewCalendar.Options</code> |  | 
| [leyning] | <code>boolean</code> | <code>true</code> | 

<a name="formatAliyot"></a>

## formatAliyot(result, aliyot) ⇒ <code>Object</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| result | <code>Object</code> | 
| aliyot | <code>Object</code> | 

<a name="formatLeyningResult"></a>

## formatLeyningResult(reading) ⇒ <code>Object</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| reading | <code>leyn.Leyning</code> | 

<a name="eventsToRss"></a>

## eventsToRss(events, location, mainUrl, selfUrl, [lang], [evPubDate]) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| events | <code>Array.&lt;Event&gt;</code> |  |  |
| location | <code>Location</code> |  |  |
| mainUrl | <code>string</code> |  |  |
| selfUrl | <code>string</code> |  |  |
| [lang] | <code>string</code> | <code>&quot;en-US&quot;</code> | language such as 'he' (default 'en-US') |
| [evPubDate] | <code>boolean</code> | <code>true</code> | if true, use event time as pubDate (false uses lastBuildDate) |

<a name="eventToRssItem"></a>

## eventToRssItem(ev, evPubDate, lastBuildDate, dayFormat, location, mainUrl) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| ev | <code>Event</code> | 
| evPubDate | <code>boolean</code> | 
| lastBuildDate | <code>string</code> | 
| dayFormat | <code>Intl.DateTimeFormat</code> | 
| location | <code>Location</code> | 
| mainUrl | <code>string</code> | 

<a name="eventToFullCalendar"></a>

## eventToFullCalendar(ev, tzid, il) ⇒ <code>Object</code>
Converts a Hebcal event to a FullCalendar.io object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ev | <code>Event</code> |  |
| tzid | <code>string</code> | timeZone identifier |
| il | <code>boolean</code> | true if Israel |
