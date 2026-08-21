import { JOP_CATS } from '../constants/schema';

export function parseDateVal(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) {
    let y = +m[3];
    if (y < 100) y += 2000;
    return new Date(y, +m[1] - 1, +m[2]);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function fmtDate(v) {
  if (v == null || v === '') return '—';
  const d = v instanceof Date ? v : parseDateVal(v);
  if (!d) return String(v);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

export function num(v) {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (v == null || v === '') return 0;
  const t = String(v).trim();
  if (/^\d+([.,]\d+)?$/.test(t)) return parseFloat(t.replace(',', '.'));
  return 0;
}

export function isDone(st) {
  const s = String(st || '').toUpperCase();
  return s.includes('SELESAI') || s.includes('DONE') || s.includes('FINISH') || s.includes('COMPLETE');
}

export function jopCat(noJop) {
  const c = String(noJop || '').trim().charAt(0);
  const f = JOP_CATS.find(x => x[0] === c);
  return f ? f[1] : 'Lainnya';
}

export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}