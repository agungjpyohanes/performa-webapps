import React, { useMemo } from 'react';
import { SHEETS, CAT_COLORS, JOP_CATS } from '../../constants/schema';
import { parseDateVal, fmtDate, num, hexA, jopCat } from '../../utils/formatters';
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
import { CheckCircle2, AlertTriangle, RotateCcw, Layers, Percent } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ProductionView({ tabKey, data, period, onSelectRow, onGoToData }) {
  const cfg = SHEETS[tabKey];
  const rawRows = data[tabKey] || [];

  // Filter berdasarkan periode tanggal dan validasi anti-ghost row
  const rows = useMemo(() => {
    return rawRows.filter(r => {
      const idVal = String(r[cfg.i.id] || '').trim();
      const jopVal = String(r[cfg.i.jop] || '').trim();
      const noJopVal = String(r[cfg.i.nojop] || '').trim();
      if (!idVal || (!jopVal && !noJopVal)) return false;

      const d = parseDateVal(r[cfg.i.date]);
      if (!d) return true;
      const from = period.from ? new Date(period.from).setHours(0, 0, 0, 0) : null;
      const to = period.to ? new Date(period.to).setHours(23, 59, 59, 999) : null;
      if (from && d.getTime() < from) return false;
      if (to && d.getTime() > to) return false;
      return true;
    });
  }, [rawRows, cfg, period]);

  // Kalkulasi Metrik
  const metrics = useMemo(() => {
    let baik = 0, rusak = 0, ganti = 0;
    rows.forEach(r => {
      baik += num(r[cfg.i.baik]);
      rusak += num(r[cfg.i.rusak]);
      ganti += num(r[cfg.i.ganti]);
    });
    const pakai = baik + rusak;
    const pct = pakai > 0 ? (rusak / pakai) * 100 : 0;
    return { baik, rusak, ganti, pakai, pct };
  }, [rows, cfg]);

  // Data Grafik Harian
  const dailyData = useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      const d = parseDateVal(r[cfg.i.date]);
      if (!d) return;
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const prev = map.get(key) || { baik: 0, rusak: 0 };
      prev.baik += num(r[cfg.i.baik]);
      prev.rusak += num(r[cfg.i.rusak]);
      map.set(key, prev);
    });

    const sortedKeys = [...map.keys()].sort((a, b) => a - b);
    return {
      labels: sortedKeys.map(k => {
        const d = new Date(k);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      }),
      datasets: [
        {
          label: `${cfg.unit} Baik`,
          data: sortedKeys.map(k => map.get(k).baik),
          backgroundColor: hexA(cfg.color, 0.85),
          borderRadius: 4,
          stack: 'stack0'
        },
        {
          label: `${cfg.unit} Rusak`,
          data: sortedKeys.map(k => map.get(k).rusak),
          backgroundColor: '#f43f5e',
          borderRadius: 4,
          stack: 'stack0'
        }
      ]
    };
  }, [rows, cfg]);

  // Data Kategori JOP
  const jopChartData = useMemo(() => {
    const counts = {};
    JOP_CATS.forEach(c => (counts[c[1]] = 0));
    rows.forEach(r => {
      const cat = jopCat(r[cfg.i.nojop]);
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const activeLabels = Object.keys(counts).filter(k => counts[k] > 0);
    return {
      labels: activeLabels,
      datasets: [
        {
          label: 'Jumlah Pekerjaan',
          data: activeLabels.map(k => counts[k]),
          backgroundColor: activeLabels.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]),
          borderRadius: 5
        }
      ]
    };
  }, [rows, cfg]);

  return (
    <div className="space-y-4">
      {/* Banner Atas */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <span
          className="w-11 h-11 rounded-xl grid place-items-center text-white font-display font-extrabold text-lg"
          style={{ background: cfg.color }}
        >
          {cfg.label.charAt(0)}
        </span>
        <div>
          <h3 className="card-title font-display font-bold text-slate-800">Dashboard Produksi {cfg.label}</h3>
          <p className="text-xs text-slate-500">{cfg.desc} · {rows.length} baris pekerjaan aktif</p>
        </div>
        <button
          onClick={() => onGoToData(tabKey)}
          className="ml-auto px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition"
        >
          Lihat Data {cfg.label} →
        </button>
      </div>

      {/* Grid 5 Metrik Card */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <div className="card card-h p-4 bg-white">
          <span className="w-8 h-8 rounded-lg grid place-items-center text-emerald-600 bg-emerald-50">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <div className="mt-3 font-display font-extrabold text-2xl text-slate-800">{metrics.baik.toLocaleString('id-ID')}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{cfg.cards.baik} (pcs)</div>
        </div>

        <div className="card card-h p-4 bg-white">
          <span className="w-8 h-8 rounded-lg grid place-items-center text-rose-600 bg-rose-50">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div className="mt-3 font-display font-extrabold text-2xl text-rose-600">{metrics.rusak.toLocaleString('id-ID')}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{cfg.cards.rusak} (pcs)</div>
        </div>

        <div className="card card-h p-4 bg-white">
          <span className="w-8 h-8 rounded-lg grid place-items-center text-amber-600 bg-amber-50">
            <RotateCcw className="w-4 h-4" />
          </span>
          <div className="mt-3 font-display font-extrabold text-2xl text-amber-600">{metrics.ganti.toLocaleString('id-ID')}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{cfg.cards.ganti} (pcs)</div>
        </div>

        <div className="card card-h p-4 bg-white">
          <span className="w-8 h-8 rounded-lg grid place-items-center text-blue-600 bg-blue-50">
            <Layers className="w-4 h-4" />
          </span>
          <div className="mt-3 font-display font-extrabold text-2xl text-slate-800">{metrics.pakai.toLocaleString('id-ID')}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{cfg.cards.pakai} (pcs)</div>
        </div>

        <div className="card card-h p-4 bg-white">
          <span className="w-8 h-8 rounded-lg grid place-items-center text-purple-600 bg-purple-50">
            <Percent className="w-4 h-4" />
          </span>
          <div className="mt-3 font-display font-extrabold text-2xl text-slate-800">{metrics.pct.toFixed(1)}%</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Rasio Rusak (%)</div>
        </div>
      </div>

      {/* Grid Grafik */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="card p-4 xl:col-span-2">
          <h3 className="card-title font-display font-bold text-slate-800 mb-3">{cfg.charts.daily}</h3>
          <div className="h-72">
            <Bar data={dailyData} options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }} />
          </div>
        </div>

        <div className="card p-4">
          <h3 className="card-title font-display font-bold text-slate-800 mb-3">Kategori JOP</h3>
          <div className="h-72">
            {jopChartData.labels.length > 0 ? (
              <Bar data={jopChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            ) : (
              <div className="h-full grid place-items-center text-xs text-slate-400">Tidak ada data JOP</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}