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

## [API Documentation](https://hebcal.github.io/api/rest-api/index.html)
