import React, { useMemo, useState } from 'react';
import { SHEETS, CAT_COLORS } from '../../constants/schema';
import {
  parseDateVal,
  num,
  cell,
  jopCat,
  fmtDate,
  startOfDay,
  endOfDay,
  fmtPeriodRange
} from '../../utils/formatters';
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
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Percent,
  Calendar,
  ArrowRight
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ProductionView({
  tabKey = 'db_ctcp',
  data = {},
  period,
  onSelectRow,
  onOpenList,
  onOpenMetric,
  onOpenDayModal,
  onGoToData
}) {
  const cfg = SHEETS[tabKey] || {
    label: tabKey,
    unit: 'Plate',
    cards: {},
    i: { id: 0, jop: 1, nojop: 2, date: 4, baik: 10, rusak: 11, ganti: 9, shift: 15, op: 16 }
  };

  // Filter baris data berdasarkan periode tanggal
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

  // Kalkulasi Metrik Utama
  const stats = useMemo(() => {
    let good = 0,
      reject = 0,
      replace = 0;
    rows.forEach((r) => {
      good += num(r[cfg.i.baik]);
      reject += num(r[cfg.i.rusak]);
      replace += num(r[cfg.i.ganti]);
    });
    const output = good + reject;
    const lossRate = output > 0 ? (reject / output) * 100 : 0;
    return { good, reject, replace, output, lossRate };
  }, [rows, cfg]);

  // Distribusi Berdasarkan Kategori JOP
  const jopStats = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const cat = jopCat(cell(r, cfg.i.jop));
      const g = num(r[cfg.i.baik]);
      const rk = num(r[cfg.i.rusak]);
      if (!map[cat]) map[cat] = { good: 0, reject: 0, output: 0 };
      map[cat].good += g;
      map[cat].reject += rk;
      map[cat].output += g + rk;
    });
    return map;
  }, [rows, cfg]);

  return (
    <div className="space-y-5 anim-in">
      {/* Header Banner Lini */}
      <div className="card p-5 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-emerald-500/10 text-emerald-600 font-bold">Lini Produksi</span>
            <span className="text-xs text-slate-400">· {cfg.unit} Prepress</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 mt-1">
            Dashboard Produksi — {cfg.label}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periode: <b>{fmtPeriodRange(period?.from, period?.to)}</b> · <b>{rows.length.toLocaleString('id-ID')} baris transaksi</b>
          </p>
        </div>

        {onGoToData && (
          <button
            onClick={() => onGoToData(tabKey)}
            className="btn btn-outline text-xs !py-2 !px-3.5 flex items-center gap-1.5"
          >
            <span>Lihat Data {cfg.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 5 Kartu Metrik Produksi */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <div
          onClick={() => onOpenMetric?.(tabKey, 'baik', rows)}
          className="card p-4 bg-white border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">GOOD {cfg.unit.toUpperCase()}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-emerald-600">
            {stats.good.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Lolos QC / Siap Cetak</div>
        </div>

        <div
          onClick={() => onOpenMetric?.(tabKey, 'rusak', rows)}
          className="card p-4 bg-white border-l-4 border-l-rose-500 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">REJECT {cfg.unit.toUpperCase()}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-rose-600">
            {stats.reject.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Cacat / Afval Produksi</div>
        </div>

        <div
          onClick={() => onOpenMetric?.(tabKey, 'ganti', rows)}
          className="card p-4 bg-white border-l-4 border-l-amber-500 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">REPLACE {cfg.unit.toUpperCase()}</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-amber-600">
            {stats.replace.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Proses Ulang / Ganti</div>
        </div>

        <div
          onClick={() => onOpenMetric?.(tabKey, 'pakai', rows)}
          className="card p-4 bg-white border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">TOTAL OUTPUT</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-slate-800">
            {stats.output.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Good + Reject</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-purple-500 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">LOSS RATE</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div
            className={`mt-2 font-display font-extrabold text-2xl ${
              stats.lossRate > 1.0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {stats.lossRate.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Target &le; 1.00%</div>
        </div>
      </div>

      {/* Visual Chart Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 bg-white">
          <h3 className="card-title mb-3">Porsi Output Berdasarkan Kategori JOP</h3>
          <div className="h-64 flex items-center justify-center">
            {Object.keys(jopStats).length === 0 ? (
              <span className="text-xs text-slate-400">Tidak ada data JOP</span>
            ) : (
              <Doughnut
                data={{
                  labels: Object.keys(jopStats),
                  datasets: [
                    {
                      data: Object.values(jopStats).map((v) => v.output),
                      backgroundColor: Object.keys(jopStats).map(
                        (k) => CAT_COLORS[k] || '#64748b'
                      )
                    }
                  ]
                }}
                options={{ maintainAspectRatio: false }}
              />
            )}
          </div>
        </div>

        <div className="card p-5 bg-white">
          <h3 className="card-title mb-3">Distribusi Good vs Reject JOP</h3>
          <div className="h-64">
            {Object.keys(jopStats).length === 0 ? (
              <span className="text-xs text-slate-400">Tidak ada data JOP</span>
            ) : (
              <Bar
                data={{
                  labels: Object.keys(jopStats),
                  datasets: [
                    {
                      label: 'Good',
                      data: Object.values(jopStats).map((v) => v.good),
                      backgroundColor: '#10b981',
                      borderRadius: 4
                    },
                    {
                      label: 'Reject',
                      data: Object.values(jopStats).map((v) => v.reject),
                      backgroundColor: '#f43f5e',
                      borderRadius: 4
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: { x: { stacked: true }, y: { stacked: true } }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
