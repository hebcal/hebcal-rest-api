import {HDate} from '@hebcal/hdate';
import {parshiot} from '@hebcal/core/dist/esm/sedra';
import {makeAnchor} from './makeAnchor';

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
