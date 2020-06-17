import test from 'ava';
import {timeZoneOffsetStr} from './common';

test('timeZoneOffsetStr', (t) => {
  const winter = new Date(2020, 1, 22);
  const summer = new Date(2020, 6, 22);
  const tzids = [
    ['Africa/Johannesburg', '+02:00', '+02:00'],
    ['America/Anchorage', '-09:00', '-08:00'],
    ['America/Argentina/Buenos_Aires', '-03:00', '-03:00'],
    ['America/Bogota', '-05:00', '-05:00'],
    ['America/Chicago', '-06:00', '-05:00'],
    ['America/Denver', '-07:00', '-06:00'],
    ['America/Detroit', '-05:00', '-04:00'],
    ['America/La_Paz', '-04:00', '-04:00'],
    ['America/Los_Angeles', '-08:00', '-07:00'],
    ['America/Mexico_City', '-06:00', '-05:00'],
    ['America/New_York', '-05:00', '-04:00'],
    ['America/Panama', '-05:00', '-05:00'],
    ['America/Phoenix', '-07:00', '-07:00'],
    ['America/Sao_Paulo', '-03:00', '-03:00'],
    ['America/St_Johns', '-03:30', '-02:30'],
    ['America/Toronto', '-05:00', '-04:00'],
    ['Asia/Baghdad', '+03:00', '+03:00'],
    ['Asia/Colombo', '+05:30', '+05:30'],
    ['Asia/Jerusalem', '+02:00', '+03:00'],
    ['Asia/Kolkata', '+05:30', '+05:30'],
    ['Asia/Seoul', '+09:00', '+09:00'],
    ['Australia/Melbourne', '+11:00', '+10:00'],
    ['Australia/Sydney', '+11:00', '+10:00'],
    ['Europe/Berlin', '+01:00', '+02:00'],
    ['Europe/Budapest', '+01:00', '+02:00'],
    ['Europe/Gibraltar', '+01:00', '+02:00'],
    ['Europe/Helsinki', '+02:00', '+03:00'],
    ['Europe/Kiev', '+02:00', '+03:00'],
    ['Europe/London', '-00:00', '+01:00'],
    ['Europe/Moscow', '+03:00', '+03:00'],
    ['Europe/Paris', '+01:00', '+02:00'],
    ['Pacific/Honolulu', '-10:00', '-10:00'],
    ['Pacific/Auckland', '-11:00', '+12:00'],
  ];
  for (const [tzid, wtz, stz] of tzids) {
    t.is(timeZoneOffsetStr(tzid, winter), wtz, `${tzid} winter`);
    t.is(timeZoneOffsetStr(tzid, summer), stz, `${tzid} summer`);
  }
});
