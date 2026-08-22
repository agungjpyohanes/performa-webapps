import React, { useMemo, useState } from 'react';
import { SHEETS, JOP_CATS } from '../../constants/schema';
import { parseDateVal, num, cell, jopCat, fmtPeriodRange, startOfDay } from '../../utils/formatters';
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
import { CheckCircle2, AlertTriangle, RotateCcw, Layers, Percent, Award, Search, Users } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ProcessAnalyticsView({ tabKey, data, period }) {
  const activeKey = tabKey || 'db_ctcp';
  const cfg = SHEETS[activeKey] || SHEETS.db_ctcp;
  const rawRows = data[activeKey] || [];
  const [searchOp, setSearchOp] = useState('');

  // Filter baris data yang valid & sesuai rentang tanggal
  const rows = useMemo(() => {
    return rawRows.filter(r => {
      const idVal = cell(r, cfg.i.id).trim();
      const jopVal = cell(r, cfg.i.jop).trim();
      const noJopVal = cell(r, cfg.i.nojop).trim();
      if (!idVal || (!jopVal && !noJopVal)) return false;

      const d = parseDateVal(r[cfg.i.date]);
      if (!d) return true;
      const from = period?.from ? startOfDay(period.from).getTime() : null;
      const to = period?.to ? new Date(period.to).setHours(23, 59, 59, 999) : null;
      if (from && d.getTime() < from) return false;
      if (to && d.getTime() > to) return false;
      return true;
    });
  }, [rawRows, cfg, period]);

  // Kalkulasi Metrik Utama KPI
  const kpi = useMemo(() => {
    let good = 0, reject = 0, replace = 0;
    rows.forEach(r => {
      good += num(r[cfg.i.baik]);
      reject += num(r[cfg.i.rusak]);
      replace += num(r[cfg.i.ganti]);
    });
    const output = good + reject;
    const lossRate = output > 0 ? (reject / output) * 100 : 0;
    const perfScore = output > 0 ? Math.max(0, 100 - lossRate) : 100;
    return { good, reject, replace, output, lossRate, perfScore };
  }, [rows, cfg]);

  // Parameter Spesifik per Mesin/Proses
  const paramData = useMemo(() => {
    let colIdx = -1;
    let label = 'Parameter Mesin';

    if (activeKey === 'db_ctcp' || activeKey === 'db_ctp') {
      colIdx = 5; // Kolom Mesin Expose
      label = 'Mesin Expose';
    } else if (activeKey === 'db_screen') {
      colIdx = cfg?.i?.tipe ?? -1;
      label = 'Tipe Screen';
    } else if (activeKey === 'db_flexo') {
      colIdx = cfg?.i?.tebal ?? -1;
      label = 'Tebal Flexo';
    } else if (activeKey === 'db_etching') {
      colIdx = cfg?.i?.tipe ?? -1;
      label = 'Tipe Plate';
    }

    if (colIdx === -1 || colIdx === undefined) return { label, labels: [], good: [], reject: [] };

    const map = new Map();
    rows.forEach(r => {
      const val = cell(r, colIdx).trim() || 'Lainnya / Standar';
      const e = map.get(val) || { good: 0, reject: 0 };
      e.good += num(r[cfg.i.baik]);
      e.reject += num(r[cfg.i.rusak]);
      map.set(val, e);
    });

    const labels = [...map.keys()];
    return {
      label,
      labels,
      good: labels.map(l => map.get(l).good),
      reject: labels.map(l => map.get(l).reject)
    };
  }, [rows, activeKey, cfg]);

  // Analisis Jenis Kertas (Khusus CTCP & CTP) atau Tebal Plate (Khusus Etching)
  const secondaryParamData = useMemo(() => {
    if (activeKey === 'db_ctcp' || activeKey === 'db_ctp') {
      const map = new Map();
      rows.forEach(r => {
        const paper = cell(r, 6).trim() || 'Standard Paper';
        const e = map.get(paper) || { good: 0, reject: 0 };
        e.good += num(r[cfg.i.baik]);
        e.reject += num(r[cfg.i.rusak]);
        map.set(paper, e);
      });
      const labels = [...map.keys()].slice(0, 6);
      return { title: 'Breakdown Jenis Kertas', labels, good: labels.map(l => map.get(l).good), reject: labels.map(l => map.get(l).reject) };
    }
    if (activeKey === 'db_etching') {
      const map = new Map();
      rows.forEach(r => {
        const tebal = cell(r, cfg?.i?.tebal ?? 6).trim() || 'Standard';
        const e = map.get(tebal) || { good: 0, reject: 0 };
        e.good += num(r[cfg.i.baik]);
        e.reject += num(r[cfg.i.rusak]);
        map.set(tebal, e);
      });
      const labels = [...map.keys()];
      return { title: 'Breakdown Tebal Plate', labels, good: labels.map(l => map.get(l).good), reject: labels.map(l => map.get(l).reject) };
    }
    return null;
  }, [rows, activeKey, cfg]);

  // Evaluasi Berdasarkan Jenis JOP
  const jopData = useMemo(() => {
    const order = JOP_CATS.map(x => x[1]).concat(['Lainnya']);
    const map = new Map(order.map(o => [o, { good: 0, reject: 0 }]));

    rows.forEach(r => {
      const cat = jopCat(cell(r, cfg.i.nojop));
      const e = map.get(cat) || { good: 0, reject: 0 };
      e.good += num(r[cfg.i.baik]);
      e.reject += num(r[cfg.i.rusak]);
      map.set(cat, e);
    });

    const labels = [];
    const good = [];
    const reject = [];

    order.forEach(o => {
      const val = map.get(o);
      if (val && (val.good > 0 || val.reject > 0)) {
        labels.push(o);
        good.push(val.good);
        reject.push(val.reject);
      }
    });

    return { labels, good, reject };
  }, [rows, cfg]);

  // Evaluasi Shift (A / B / C / 1 / 2 / 3)
  const shiftData = useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      let sh = cell(r, cfg.i.shift).toUpperCase().trim();
      if (!sh || sh === '-') sh = 'NON-SHIFT';
      const e = map.get(sh) || { good: 0, reject: 0 };
      e.good += num(r[cfg.i.baik]);
      e.reject += num(r[cfg.i.rusak]);
      map.set(sh, e);
    });

    const labels = [...map.keys()].sort();
    return {
      labels,
      good: labels.map(l => map.get(l).good),
      reject: labels.map(l => map.get(l).reject)
    };
  }, [rows, cfg]);

  // Evaluasi Operator / PO
  const operatorRanking = useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      const op = cell(r, cfg.i.op).trim() || 'Unassigned';
      const po = cell(r, 17).trim();
      const key = po ? `${op} (${po})` : op;

      const e = map.get(key) || { name: key, op, po, good: 0, reject: 0, replace: 0 };
      e.good += num(r[cfg.i.baik]);
      e.reject += num(r[cfg.i.rusak]);
      e.replace += num(r[cfg.i.ganti]);
      map.set(key, e);
    });

    return [...map.values()]
      .map(o => {
        const output = o.good + o.reject;
        const lossRate = output > 0 ? (o.reject / output) * 100 : 0;
        let grade = 'A';
        if (lossRate > 6) grade = 'D';
        else if (lossRate > 4) grade = 'C';
        else if (lossRate > 2) grade = 'B';
        return { ...o, output, lossRate, grade };
      })
      .sort((a, b) => b.output - a.output);
  }, [rows, cfg]);

  const filteredOperators = useMemo(() => {
    if (!searchOp.trim()) return operatorRanking;
    const q = searchOp.toLowerCase();
    return operatorRanking.filter(o => o.name.toLowerCase().includes(q));
  }, [operatorRanking, searchOp]);

  const getGradeBadgeClass = (grade) => {
    if (grade === 'A') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (grade === 'B') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (grade === 'C') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-4 anim-in">
      {/* Header Info Panel */}
      <div className="card p-5 bg-gradient-to-r from-slate-900 to-[#101c36] text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-cyan-400/20 text-cyan-300 font-bold">INTERNAL PREPRESS ANALYTICS</span>
            <span className="text-xs text-slate-400">· {cfg.label} Focus Mode</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl mt-1.5">{cfg.label} Performance & Parameter Control</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Audit mendalam efisiensi mesin, jenis paper/material, kategori JOP, performa shift, dan evaluasi operator/PO.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Rentang Periode</div>
          <div className="font-bold text-sm text-cyan-300 mt-0.5">{fmtPeriodRange(period?.from, period?.to)}</div>
          <div className="text-xs text-slate-400 mt-0.5">{rows.length} Transaksi Teranalisis</div>
        </div>
      </div>

      {/* 5 KPI Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 stagger">
        <div className="card p-4 bg-white border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL OUTPUT</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-slate-800">{kpi.output.toLocaleString('id-ID')}</div>
          <div className="text-[10px] text-slate-400 mt-1">{cfg.unit} diproses</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">GOOD</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-emerald-600">{kpi.good.toLocaleString('id-ID')}</div>
          <div className="text-[10px] text-slate-400 mt-1">{cfg.unit} lolos QC</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">REJECT</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-rose-600">{kpi.reject.toLocaleString('id-ID')}</div>
          <div className="text-[10px] text-slate-400 mt-1">{cfg.unit} rusak / loss</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">REPLACE</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-amber-600">{kpi.replace.toLocaleString('id-ID')}</div>
          <div className="text-[10px] text-slate-400 mt-1">{cfg.unit} diproduksi ulang</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">LOSS RATE</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`mt-2 font-display font-extrabold text-2xl ${kpi.lossRate > 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {kpi.lossRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Target &lt; 3.0%</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">SCORE</span>
            <Award className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-cyan-600">{kpi.perfScore.toFixed(0)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Indeks Kinerja (0-100)</div>
        </div>
      </div>

      {/* Grid Analisis Parameter Spesifik & Jenis JOP */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Parameter Mesin Utama */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="card-title">Breakdown: {paramData.label}</h3>
              <p className="text-xs text-slate-500">Perbandingan Output Good vs Reject per kategori</p>
            </div>
            <span className="badge bg-slate-100 text-slate-600 font-semibold">{paramData.labels.length} Kategori</span>
          </div>
          <div className="h-64">
            <Bar
              data={{
                labels: paramData.labels,
                datasets: [
                  { label: 'Good', data: paramData.good, backgroundColor: '#10b981', borderRadius: 4 },
                  { label: 'Reject', data: paramData.reject, backgroundColor: '#f43f5e', borderRadius: 4 }
                ]
              }}
              options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }}
            />
          </div>
        </div>

        {/* Breakdown Jenis JOP */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="card-title">Evaluasi Kategori JOP</h3>
              <p className="text-xs text-slate-500">Distribusi hasil kerja berdasarkan tipe pekerjaan</p>
            </div>
          </div>
          <div className="h-64">
            <Bar
              data={{
                labels: jopData.labels,
                datasets: [
                  { label: 'Good', data: jopData.good, backgroundColor: '#6366f1', borderRadius: 4 },
                  { label: 'Reject', data: jopData.reject, backgroundColor: '#f43f5e', borderRadius: 4 }
                ]
              }}
              options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }}
            />
          </div>
        </div>

        {/* Parameter Sekunder: Paper Type atau Tebal Plate (Jika Ada) */}
        {secondaryParamData && (
          <div className="card p-5">
            <h3 className="card-title mb-1">{secondaryParamData.title}</h3>
            <p className="text-xs text-slate-500 mb-3">Audit kualitas material pada lini {cfg.label}</p>
            <div className="h-64">
              <Bar
                data={{
                  labels: secondaryParamData.labels,
                  datasets: [
                    { label: 'Good', data: secondaryParamData.good, backgroundColor: '#06b6d4', borderRadius: 4 },
                    { label: 'Reject', data: secondaryParamData.reject, backgroundColor: '#f43f5e', borderRadius: 4 }
                  ]
                }}
                options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }}
              />
            </div>
          </div>
        )}

        {/* Breakdown Shift */}
        <div className={`card p-5 ${secondaryParamData ? '' : 'md:col-span-2'}`}>
          <h3 className="card-title mb-1">Performa Shift</h3>
          <p className="text-xs text-slate-500 mb-3">Tingkat output dan reject antar giliran kerja</p>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={{
                labels: shiftData.labels,
                datasets: [
                  {
                    data: shiftData.good,
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b']
                  }
                ]
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Operator & PO Performance Leaderboard */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="card-title">Leaderboard Performa Operator & PO</h3>
            </div>
            <p className="text-xs text-slate-500">Evaluasi produktivitas, rasio reject, dan grading individu</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Operator / PO..."
              value={searchOp}
              onChange={e => setSearchOp(e.target.value)}
              className="bg-transparent text-xs outline-none w-full text-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Nama Operator / PO</th>
                <th className="py-2.5 px-3">Total Output</th>
                <th className="py-2.5 px-3">Good</th>
                <th className="py-2.5 px-3">Reject</th>
                <th className="py-2.5 px-3">Replace</th>
                <th className="py-2.5 px-3">Loss Rate</th>
                <th className="py-2.5 px-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOperators.map((o, idx) => (
                <tr key={o.name} className="hover:bg-slate-50/80 transition">
                  <td className="py-2 px-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{o.name}</td>
                  <td className="py-2 px-3 font-bold">{o.output.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 text-emerald-600 font-semibold">{o.good.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 text-rose-600 font-semibold">{o.reject.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 text-amber-600">{o.replace.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 font-bold">{o.lossRate.toFixed(1)}%</td>
                  <td className="py-2 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold border ${getGradeBadgeClass(o.grade)}`}>
                      {o.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}