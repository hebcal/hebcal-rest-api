# hebcal-icalendar
Jewish holidays and Hebrew calendar as iCalendar RFC 2445

## Installation
```bash
$ npm install @hebcal/icalendar
```

## Synopsis
```javascript
import {hebcal, Location} from '@hebcal/core';
import icalendar from '@hebcal/icalendar';

const options = {
  year: 2020,
  month: 2,
  sedrot: true,
  candlelighting: true,
  location: Location.lookup('Hawaii'),
};
const events = hebcal.hebrewCalendar(options);
console.log(icalendar.eventsToIcalendar(ev, options));
```

## Constants

<dl>
<dt><a href="#icalendar">icalendar</a></dt>
<dd><p>Main interface to hebcal/icalendar</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getFormatter">getFormatter(tzid)</a> ⇒ <code>Intl.DateTimeFormat</code></dt>
<dd></dd>
<dt><a href="#getPseudoISO">getPseudoISO(tzid, date)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#getTimezoneOffset">getTimezoneOffset(tzid, date)</a> ⇒ <code>number</code></dt>
<dd></dd>
<dt><a href="#pad2">pad2(number)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#timeZoneOffsetStr">timeZoneOffsetStr(tzid, date)</a> ⇒ <code>string</code></dt>
<dd><p>Get offset string (like &quot;+05:00&quot; or &quot;-08:00&quot;) from tzid (like &quot;Europe/Moscow&quot;)</p>
</dd>
<dt><a href="#toISOString">toISOString(d)</a> ⇒ <code>string</code></dt>
<dd><p>Returns just the date portion as YYYY-MM-DD</p>
</dd>
<dt><a href="#toISOStringWithTimezone">toISOStringWithTimezone(date, timeStr, tzid)</a> ⇒ <code>string</code></dt>
<dd><p>Returns a string like &quot;2018-09-01T12:30:00-05:00&#39;&quot;</p>
</dd>
<dt><a href="#getEventCategories">getEventCategories(ev)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Returns a category and subcategory name</p>
</dd>
<dt><a href="#icalWriteLine">icalWriteLine(res, ...str)</a></dt>
<dd></dd>
<dt><a href="#formatYYYYMMDD">formatYYYYMMDD(d)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#formatTime">formatTime(hour, min, sec)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#makeDtstamp">makeDtstamp(dt)</a> ⇒ <code>string</code></dt>
<dd><p>Returns UTC string for iCalendar</p>
</dd>
<dt><a href="#icalWriteEvent">icalWriteEvent(res, e, dtstamp, options)</a></dt>
<dd></dd>
<dt><a href="#addOptional">addOptional(arr, key, val)</a></dt>
<dd></dd>
<dt><a href="#eventToIcal">eventToIcal(e, options)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#exportHttpHeader">exportHttpHeader(res, mimeType, fileName)</a></dt>
<dd></dd>
<dt><a href="#icalWriteContents">icalWriteContents(res, events, options)</a></dt>
<dd></dd>
<dt><a href="#getDownloadFilename">getDownloadFilename(options)</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#eventToCsv">eventToCsv(e, options)</a> ⇒ <code>string</code></dt>
<dd><p>Renders an Event as a string</p>
</dd>
<dt><a href="#csvWriteContents">csvWriteContents(res, events, options)</a></dt>
<dd></dd>
<dt><a href="#eventToFullCalendar">eventToFullCalendar(ev, tzid)</a> ⇒ <code>Object</code></dt>
<dd><p>Converts a Hebcal event to a FullCalendar.io object</p>
</dd>
</dl>

<a name="icalendar"></a>

## icalendar
Main interface to hebcal/icalendar

**Kind**: global constant  
<a name="getFormatter"></a>

## getFormatter(tzid) ⇒ <code>Intl.DateTimeFormat</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| tzid | <code>string</code> | 

<a name="getPseudoISO"></a>

## getPseudoISO(tzid, date) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| tzid | <code>string</code> | 
| date | <code>Date</code> | 

<a name="getTimezoneOffset"></a>

## getTimezoneOffset(tzid, date) ⇒ <code>number</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| tzid | <code>string</code> | 
| date | <code>Date</code> | 

<a name="pad2"></a>

## pad2(number) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| number | <code>number</code> | 

<a name="timeZoneOffsetStr"></a>

## timeZoneOffsetStr(tzid, date) ⇒ <code>string</code>
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

## toISOStringWithTimezone(date, timeStr, tzid) ⇒ <code>string</code>
Returns a string like "2018-09-01T12:30:00-05:00'"

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

<a name="icalWriteLine"></a>

## icalWriteLine(res, ...str)
**Kind**: global function  

| Param | Type |
| --- | --- |
| res | <code>stream.Writable</code> | 
| ...str | <code>string</code> | 

<a name="formatYYYYMMDD"></a>

## formatYYYYMMDD(d) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| d | <code>Date</code> | 

<a name="formatTime"></a>

## formatTime(hour, min, sec) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| hour | <code>number</code> \| <code>string</code> | 
| min | <code>number</code> \| <code>string</code> | 
| sec | <code>number</code> \| <code>string</code> | 

<a name="makeDtstamp"></a>

## makeDtstamp(dt) ⇒ <code>string</code>
Returns UTC string for iCalendar

**Kind**: global function  

| Param | Type |
| --- | --- |
| dt | <code>Date</code> | 

<a name="icalWriteEvent"></a>

## icalWriteEvent(res, e, dtstamp, options)
**Kind**: global function  

| Param | Type |
| --- | --- |
| res | <code>stream.Writable</code> | 
| e | <code>Event</code> | 
| dtstamp | <code>string</code> | 
| options | <code>hebcal.HebcalOptions</code> | 

<a name="addOptional"></a>

## addOptional(arr, key, val)
**Kind**: global function  

| Param | Type |
| --- | --- |
| arr | <code>Array.&lt;string&gt;</code> | 
| key | <code>string</code> | 
| val | <code>string</code> | 

<a name="eventToIcal"></a>

## eventToIcal(e, options) ⇒ <code>string</code>
**Kind**: global function  
**Returns**: <code>string</code> - multi-line result, delimited by \r\n  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 
| options | <code>hebcal.HebcalOptions</code> | 

<a name="exportHttpHeader"></a>

## exportHttpHeader(res, mimeType, fileName)
**Kind**: global function  

| Param | Type |
| --- | --- |
| res | <code>stream.Writable</code> | 
| mimeType | <code>string</code> | 
| fileName | <code>string</code> | 

<a name="icalWriteContents"></a>

## icalWriteContents(res, events, options)
**Kind**: global function  

| Param | Type |
| --- | --- |
| res | <code>stream.Writable</code> | 
| events | <code>Array.&lt;Event&gt;</code> | 
| options | <code>hebcal.HebcalOptions</code> | 

<a name="getDownloadFilename"></a>

## getDownloadFilename(options) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| options | <code>hebcal.HebcalOptions</code> | 

<a name="eventToCsv"></a>

## eventToCsv(e, options) ⇒ <code>string</code>
Renders an Event as a string

**Kind**: global function  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 
| options | <code>hebcal.HebcalOptions</code> | 

<a name="csvWriteContents"></a>

## csvWriteContents(res, events, options)
**Kind**: global function  

| Param | Type |
| --- | --- |
| res | <code>stream.Writable</code> | 
| events | <code>Array.&lt;Event&gt;</code> | 
| options | <code>hebcal.HebcalOptions</code> | 

<a name="eventToFullCalendar"></a>

## eventToFullCalendar(ev, tzid) ⇒ <code>Object</code>
Converts a Hebcal event to a FullCalendar.io object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ev | <code>Event</code> |  |
| tzid | <code>string</code> | timeZone identifier |

