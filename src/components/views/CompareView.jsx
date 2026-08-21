import React, { useState, useMemo } from 'react';
import { PROD_KEYS, SHEETS } from '../../constants/schema';
import { parseDateVal, num, hexA } from '../../utils/formatters';
import { Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Minus, ArrowRightLeft } from 'lucide-react';

export default function CompareView({ data }) {
  const [key, setKey] = useState('db_ctcp');
  const cfg = SHEETS[key];

  const [p1, setP1] = useState(() => {
    const today = new Date();
    const p1To = new Date(today.getFullYear(), today.getMonth(), 0);
    const p1From = new Date(p1To.getFullYear(), p1To.getMonth(), 1);
    return { from: p1From.toISOString().split('T')[0], to: p1To.toISOString().split('T')[0] };
  });

  const [p2, setP2] = useState(() => {
    const today = new Date();
    const p2From = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: p2From.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
  });

  const getMetricsForPeriod = (fromStr, toStr) => {
    const from = new Date(fromStr).setHours(0, 0, 0, 0);
    const to = new Date(toStr).setHours(23, 59, 59, 999);
    const rows = (data[key] || []).filter(r => {
      const idVal = String(r[cfg.i.id] || '').trim();
      if (!idVal) return false;
      const d = parseDateVal(r[cfg.i.date]);
      return d && d.getTime() >= from && d.getTime() <= to;
    });

    let baik = 0, rusak = 0, ganti = 0;
    rows.forEach(r => {
      baik += num(r[cfg.i.baik]);
      rusak += num(r[cfg.i.rusak]);
      ganti += num(r[cfg.i.ganti]);
    });
    return { pakai: baik + rusak, rusak, ganti, count: rows.length };
  };

  const m1 = useMemo(() => getMetricsForPeriod(p1.from, p1.to), [data, key, p1]);
  const m2 = useMemo(() => getMetricsForPeriod(p2.from, p2.to), [data, key, p2]);

  const calcDelta = (v1, v2) => {
    if (v1 === 0 && v2 === 0) return { pct: '0%', dir: 'equal' };
    if (v1 === 0) return { pct: '+100%', dir: 'up' };
    const diff = ((v2 - v1) / v1) * 100;
    return {
      pct: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`,
      dir: diff > 0.01 ? 'up' : diff < -0.01 ? 'down' : 'equal'
    };
  };

  const deltaHasil = calcDelta(m1.pakai, m2.pakai);
  const deltaRusak = calcDelta(m1.rusak, m2.rusak);
  const deltaGanti = calcDelta(m1.ganti, m2.ganti);

  const chartData = {
    labels: ['Total Hasil', 'Total Ganti', 'Total Rusak'],
    datasets: [
      {
        label: 'Periode 1 (Pembanding)',
        data: [m1.pakai, m1.ganti, m1.rusak],
        backgroundColor: hexA(cfg.color, 0.4),
        borderColor: cfg.color,
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Periode 2 (Dibandingkan)',
        data: [m2.pakai, m2.ganti, m2.rusak],
        backgroundColor: hexA(cfg.color, 0.9),
        borderColor: cfg.color,
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="space-y-4">
      {/* Pengaturan Komparasi */}
      <div className="card p-5">
        <h3 className="card-title font-display font-bold text-slate-800 mb-4">Pengaturan Komparasi Periode</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Jenis Produksi</label>
            <select
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              {PROD_KEYS.map(k => (
                <option key={k} value={k}>{SHEETS[k].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Periode 1 (Pembanding)</label>
            <div className="flex gap-2">
              <input type="date" value={p1.from} onChange={e => setP1({ ...p1, from: e.target.value })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              <input type="date" value={p1.to} onChange={e => setP1({ ...p1, to: e.target.value })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Periode 2 (Dibandingkan)</label>
            <div className="flex gap-2">
              <input type="date" value={p2.from} onChange={e => setP2({ ...p2, from: e.target.value })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              <input type="date" value={p2.to} onChange={e => setP2({ ...p2, to: e.target.value })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Perbandingan */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs font-bold uppercase text-slate-400">Total Hasil</div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-slate-400">P1: {m1.pakai.toLocaleString('id-ID')}</div>
              <div className="text-2xl font-bold text-slate-800">P2: {m2.pakai.toLocaleString('id-ID')}</div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${deltaHasil.dir === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {deltaHasil.pct}
            </span>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-bold uppercase text-slate-400">Total Rusak</div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-slate-400">P1: {m1.rusak.toLocaleString('id-ID')}</div>
              <div className="text-2xl font-bold text-rose-600">P2: {m2.rusak.toLocaleString('id-ID')}</div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${deltaRusak.dir === 'down' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {deltaRusak.pct}
            </span>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-bold uppercase text-slate-400">Total Ganti</div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-slate-400">P1: {m1.ganti.toLocaleString('id-ID')}</div>
              <div className="text-2xl font-bold text-amber-600">P2: {m2.ganti.toLocaleString('id-ID')}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {deltaGanti.pct}
            </span>
          </div>
        </div>
      </div>

      {/* Grafik Komparasi */}
      <div className="card p-5">
        <h3 className="card-title font-display font-bold text-slate-800 mb-3">Grafik Komparasi Hasil & Kerusakan</h3>
        <div className="h-80">
          <Bar data={chartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>
    </div>
  );
}