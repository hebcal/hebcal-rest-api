import {HDate} from '@hebcal/hdate';
import {parshiot} from '@hebcal/core/dist/esm/sedra';
import {makeAnchor} from './makeAnchor.js';

const parsha2id = new Map<string, number>();
for (let id = 0; id < parshiot.length; id++) {
  const name = parshiot[id];
  parsha2id.set(makeAnchor(name), id + 1);
}

const doubledParshiyot: string[] = [
  'Vayakhel-Pekudei',
  'Tazria-Metzora',
  'Achrei Mot-Kedoshim',
  'Behar-Bechukotai',
  'Chukat-Balak',
  'Matot-Masei',
  'Nitzavim-Vayeilech',
] as const;

const doubled = new Set<string>();
for (const name of doubledParshiyot) {
  const anchor = makeAnchor(name);
  doubled.add(anchor);
  const [p1] = anchor.split('-');
  const id = parsha2id.get(p1);
  parsha2id.set(anchor, id!);
}

function parse8digitDateStr(date: string): Date {
  const gy = date.substring(0, 4);
  const gm = date.substring(4, 6);
  const gd = date.substring(6, 8);
  const yy = parseInt(gy, 10);
  const mm = parseInt(gm, 10);
  const dd = parseInt(gd, 10);
  const dt = new Date(yy, mm - 1, dd);
  if (yy < 100) {
    dt.setFullYear(yy);
  }
  return dt;
}

/**
 * Rewrites a long-form `hebcal.com/sedrot/<parsha>-<YYYYMMDD>` URL in place
 * to the short `hebcal.com/s/<year>[i]/<parsha-id>[d]` form, e.g.
 * `/sedrot/bereshit-20201017` becomes `/s/5781/1`. Falls back to trimming
 * the `/sedrot/` prefix to `/s/` if the path doesn't match the expected
 * `<parsha>-<8-digit-date>` shape.
 * @param u - the URL to rewrite; mutated in place via `u.pathname`
 */
export function shortenSedrotUrl(u: URL) {
  const path = u.pathname;
  const dash = path.lastIndexOf('-');
  const dateStr = path.substring(dash + 1);
  const name = path.substring(8, dash);
  const id = parsha2id.get(name);
  if (id && dateStr.length === 8) {
    const dt = parse8digitDateStr(dateStr);
    const hd = new HDate(dt);
    let p = '/s/' + hd.getFullYear();
    if (u.searchParams.get('i') === 'on') {
      p += 'i';
      u.searchParams.delete('i');
    }
    const id = parsha2id.get(name);
    p += '/' + id;
    if (doubled.has(name)) {
      p += 'd';
    }
    u.pathname = p;
  } else {
    u.pathname = '/s/' + path.substring(8);
  }
}

/**
 * Adjusts a Hebcal.com event link for Israel/Diaspora and appends UTM
 * tracking parameters. For `www.hebcal.com` holiday/sedrot/omer links, this
 * also sets `i=on` when `il` is true, rewrites the host to the shorter
 * `hebcal.com` and shortens the path (see `shortenSedrotUrl()` for sedrot),
 * and uses the abbreviated `us`/`um`/`uc` parameter names instead of the
 * full `utm_source`/`utm_medium`/`utm_campaign` (the `us`/`um` params are
 * omitted when `utmCampaign` starts with `'ical-'` or `'pdf-'`, since those
 * campaigns are tracked by `uc` alone). For all other URLs, the standard
 * `utm_source`/`utm_medium`/`utm_campaign` parameters are appended, and
 * `utm_source` defaults to `'hebcal.com'` when not otherwise specified.
 * @param url - the event URL to rewrite
 * @param il - `true` to mark the link as using the Israel holiday schedule
 * @param utmSource - tracking source, e.g. `'js'`
 * @param utmMedium - tracking medium, e.g. `'api'`
 * @param utmCampaign - tracking campaign, e.g. `'ical-foo'`
 * @returns the rewritten URL as a string
 */
export function appendIsraelAndTracking(
  url: string,
  il: boolean,
  utmSource?: string,
  utmMedium?: string,
  utmCampaign?: string
): string {
  const u = new URL(url);
  const isHebcal = u.host === 'www.hebcal.com';
  if (isHebcal) {
    if (il) {
      u.searchParams.set('i', 'on');
    }
    const path = u.pathname;
    const isHolidays = path.startsWith('/holidays/');
    const isSedrot = path.startsWith('/sedrot/');
    const isOmer = path.startsWith('/omer/');
    if (isHolidays || isSedrot || isOmer) {
      u.host = 'hebcal.com';
      if (isHolidays) {
        u.pathname = '/h/' + path.substring(10);
      } else if (isSedrot) {
        shortenSedrotUrl(u);
      } else {
        // isOmer
        u.pathname = '/o/' + path.substring(6);
      }
      if (
        !utmCampaign ||
        !(utmCampaign.startsWith('ical-') || utmCampaign.startsWith('pdf-'))
      ) {
        if (utmSource) {
          u.searchParams.set('us', utmSource);
        }
        if (utmMedium) {
          u.searchParams.set('um', utmMedium);
        }
      }
      if (utmCampaign) {
        u.searchParams.set('uc', utmCampaign);
      }
      return u.toString();
    }
  }
  if (!utmSource && !isHebcal) {
    utmSource = 'hebcal.com'; // e.g. sefaria.org/foo?utm_source=hebcal.com
  }
  if (utmSource) {
    u.searchParams.set('utm_source', utmSource);
  }
  if (utmMedium) {
    u.searchParams.set('utm_medium', utmMedium);
  }
  if (utmCampaign) {
    u.searchParams.set('utm_campaign', utmCampaign);
  }
  return u.toString();
}
