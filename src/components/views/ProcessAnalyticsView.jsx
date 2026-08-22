import React, { useMemo } from 'react';
import { SHEETS, CAT_COLORS } from '../../constants/schema';
import { parseDateVal, num, cell, jopCat, startOfDay, endOfDay, fmtPeriodRange } from '../../utils/formatters';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { BarChart2, Layers, CheckCircle2, AlertTriangle, Percent } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ProcessAnalyticsView({ tabKey = 'db_ctcp', data = {}, period, onOpenList }) {
  const cfg = SHEETS[tabKey] || { label: tabKey, unit: 'Plate', i: { id: 0, jop: 1, nojop: 2, date: 4, baik: 10, rusak: 11, ganti: 9, shift: 15, op: 16 } };

  const rows = useMemo(() => {
    const raw = data[tabKey] || [];
    const fromTime = period?.from ? startOfDay(period.from).getTime() : null;
    const toTime = period?.to ? endOfDay(period.to).getTime() : null;

    return raw.filter((r) => {
      const idVal = cell(r, cfg.i.id).trim();
      const jopVal = cell(r, cfg.i.jop).trim();
      const noJopVal = cell(r, cfg.i.nojop).trim();
      if (!idVal || (!jopVal && !noJopVal)) return false;

      const d = parseDateVal(r[cfg.i.date]);
      if (d) {
        const t = d.getTime();
        if (fromTime && t < fromTime) return false;
        if (toTime && t > toTime) return false;
      }
      return true;
    });
  }, [data, tabKey, period, cfg]);

  // Agregasi Data
  const stats = useMemo(() => {
    let good = 0, reject = 0, replace = 0;
    rows.forEach((r) => {
      good += num(r[cfg.i.baik]);
      reject += num(r[cfg.i.rusak]);
      replace += num(r[cfg.i.ganti]);
    });
    const output = good + reject;
    const lossRate = output > 0 ? (reject / output) * 100 : 0;
    return { good, reject, replace, output, lossRate };
  }, [rows, cfg]);

  // Parameter Spesifik (Mesin Expose / Kertas / Tipe Screen / Tebal)
  const paramStats = useMemo(() => {
    const map = {};
    let paramCol = cfg.i.mesin_expose;
    if (tabKey === 'db_screen') paramCol = cfg.i.tipe;
    if (tabKey === 'db_flexo') paramCol = cfg.i.tebal;
    if (tabKey === 'db_etching') paramCol = cfg.i.tipe;

    rows.forEach((r) => {
      const val = cell(r, paramCol).trim() || 'Lainnya / Standar';
      const g = num(r[cfg.i.baik]);
      const rk = num(r[cfg.i.rusak]);
      if (!map[val]) map[val] = { good: 0, reject: 0, output: 0 };
      map[val].good += g;
      map[val].reject += rk;
      map[val].output += g + rk;
    });
    return map;
  }, [rows, cfg, tabKey]);

  return (
    <div className="space-y-5 anim-in">
      <div className="card p-5 bg-gradient-to-r from-slate-900 to-cyan-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-cyan-400/20 text-cyan-300 font-bold">ANALITIK PREPRESS</span>
            <span className="text-xs text-slate-300">· Evaluasi Parameter {cfg.label}</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl mt-1">Analytics — {cfg.label}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Analisis loss rate per mesin expose, jenis media, dan kategori JOP[span_1](start_span)[span_1](end_span) · <b>{rows.length} baris</b>
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Periode Evaluasi</div>
          <div className="font-bold text-sm text-cyan-300 mt-0.5">{fmtPeriodRange(period?.from, period?.to)}</div>
        </div>
      </div>

      {/* Ringkasan KPI Lini */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-white border-l-4 border-l-blue-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">OUTPUT {cfg.unit.toUpperCase()}</span>
          <div className="mt-2 font-display font-extrabold text-2xl text-slate-800">{stats.output.toLocaleString('id-ID')}</div>
        </div>
        <div className="card p-4 bg-white border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">GOOD</span>
          <div className="mt-2 font-display font-extrabold text-2xl text-emerald-600">{stats.good.toLocaleString('id-ID')}</div>
        </div>
        <div className="card p-4 bg-white border-l-4 border-l-rose-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">REJECT / LOSS</span>
          <div className="mt-2 font-display font-extrabold text-2xl text-rose-600">{stats.reject.toLocaleString('id-ID')}</div>
        </div>
        <div className="card p-4 bg-white border-l-4 border-l-purple-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase">LOSS RATE</span>
          <div className={`mt-2 font-display font-extrabold text-2xl ${stats.lossRate > 1.0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {stats.lossRate.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Breakdown Parameter Khusus */}
      <div className="card p-5 bg-white">
        <h3 className="card-title mb-3">Distribusi Loss Berdasarkan Parameter Proses</h3>
        <div className="h-64">
          <Bar
            data={{
              labels: Object.keys(paramStats),
              datasets: [
                { label: 'Good', data: Object.values(paramStats).map(v => v.good), backgroundColor: '#10b981', borderRadius: 4 },
                { label: 'Reject', data: Object.values(paramStats).map(v => v.reject), backgroundColor: '#f43f5e', borderRadius: 4 }
              ]
            }}
            options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }}
          />
        </div>
      </div>
    </div>
  );
}
