# @hebcal/rest-api
Jewish holidays and Hebrew calendar as plain JSON objects, RSS, and CSV export

[![Build Status](https://github.com/hebcal/hebcal-rest-api/actions/workflows/node.js.yml/badge.svg)](https://github.com/hebcal/hebcal-rest-api/actions/workflows/node.js.yml)

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
<dt><a href="#locationToPlainObj">locationToPlainObj(location)</a> ⇒ <code>string</code></dt>
<dd></dd>
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
<dt><a href="#toISOString">toISOString(d)</a> ⇒ <code>string</code></dt>
<dd><p>Returns just the date portion as YYYY-MM-DD</p>
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
<dt><a href="#appendIsraelAndTracking">appendIsraelAndTracking(url, il, utmSource, utmMedium, utmCampaign)</a> ⇒ <code>string</code></dt>
<dd><p>Appends utm_source and utm_medium parameters to a URL</p>
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
<dt><a href="#eventsToRss2">eventsToRss2(events, options)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#eventToRssItem2">eventToRssItem2(ev, options)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#eventToFullCalendar">eventToFullCalendar(ev, tzid, il)</a> ⇒ <code>Object</code></dt>
<dd><p>Converts a Hebcal event to a FullCalendar.io object</p>
</dd>
</dl>

<a name="locationToPlainObj"></a>

## locationToPlainObj(location) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| location | <code>Location</code> | 

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
| options | <code>CalOptions</code> | 

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

<a name="toISOString"></a>

## toISOString(d) ⇒ <code>string</code>
Returns just the date portion as YYYY-MM-DD

**Kind**: global function  

| Param | Type |
| --- | --- |
| d | <code>Date</code> | 

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
| options | <code>CalOptions</code> | 

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

<a name="appendIsraelAndTracking"></a>

## appendIsraelAndTracking(url, il, utmSource, utmMedium, utmCampaign) ⇒ <code>string</code>
Appends utm_source and utm_medium parameters to a URL

**Kind**: global function  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 
| il | <code>boolean</code> | 
| utmSource | <code>string</code> | 
| utmMedium | <code>string</code> | 
| utmCampaign | <code>string</code> | 

<a name="eventToCsv"></a>

## eventToCsv(e, options) ⇒ <code>string</code>
Renders an Event as a string

**Kind**: global function  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 
| options | <code>CalOptions</code> | 

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
| options | <code>CalOptions</code> |  | 
| [leyning] | <code>boolean</code> | <code>true</code> | 

<a name="eventToClassicApiObject"></a>

## eventToClassicApiObject(ev, options, [leyning]) ⇒ <code>Object</code>
Converts a Hebcal event to a classic Hebcal.com JSON API object

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| ev | <code>Event</code> |  | 
| options | <code>CalOptions</code> |  | 
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
| reading | <code>Leyning</code> | 

<a name="eventsToRss2"></a>

## eventsToRss2(events, options) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| events | <code>Array.&lt;Event&gt;</code> | 
| options | <code>CalOptions</code> | 

<a name="eventToRssItem2"></a>

## eventToRssItem2(ev, options) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| ev | <code>Event</code> | 
| options | <code>CalOptions</code> | 

<a name="eventToFullCalendar"></a>

## eventToFullCalendar(ev, tzid, il) ⇒ <code>Object</code>
Converts a Hebcal event to a FullCalendar.io object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ev | <code>Event</code> |  |
| tzid | <code>string</code> | timeZone identifier |
| il | <code>boolean</code> | true if Israel |
