import React, { useMemo } from 'react';
import { OVER_SETS, SHEETS } from '../../constants/schema';
import { num, cell, parseDateVal } from '../../utils/formatters';
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
import { Layers, CheckCircle2, AlertTriangle, RotateCcw, Percent } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function OverviewView({ data = {}, onOpenList, onSelectRow }) {
  const sets = OVER_SETS || [];

  const metrics = useMemo(() => {
    return sets.map(s => {
      const cfg = SHEETS[s.key] || { i: { baik: 0, rusak: 0, ganti: 0, id: 0, jop: 1, nojop: 2, date: 4 } };
      const rows = data[s.key] || [];

      let good = 0, reject = 0, replace = 0;
      rows.forEach(r => {
        good += num(r[cfg.i.baik]);
        reject += num(r[cfg.i.rusak]);
        replace += num(r[cfg.i.ganti]);
      });

      const output = good + reject;
      const lossRate = output > 0 ? (reject / output) * 100 : 0;

      return {
        ...s,
        rows,
        good,
        reject,
        replace,
        output,
        lossRate
      };
    });
  }, [data, sets]);

  const totalOutputGlobal = metrics.reduce((a, b) => a + b.output, 0);
  const totalGoodGlobal = metrics.reduce((a, b) => a + b.good, 0);
  const totalRejectGlobal = metrics.reduce((a, b) => a + b.reject, 0);
  const totalReplaceGlobal = metrics.reduce((a, b) => a + b.replace, 0);
  const avgLossRateGlobal = totalOutputGlobal > 0 ? (totalRejectGlobal / totalOutputGlobal) * 100 : 0;

  return (
    <div className="space-y-5 anim-in">
      {/* 5 Kartu Summary Global */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 stagger">
        <div className="card p-4 bg-white border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL OUTPUT</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-slate-800">
            {totalOutputGlobal.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Gabungan seluruh lini</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL GOOD</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-emerald-600">
            {totalGoodGlobal.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Lolos standar QC</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL REJECT</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-rose-600">
            {totalRejectGlobal.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Plate/Screen rusak</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL REPLACE</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-amber-600">
            {totalReplaceGlobal.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Ganti / proses ulang</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-purple-500 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">AVG LOSS RATE</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`mt-2 font-display font-extrabold text-2xl ${avgLossRateGlobal > 1 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {avgLossRateGlobal.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Rata-rata afval</div>
        </div>
      </div>

      {/* Grid Komparasi Visual Output Tiap Lini */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="card-title mb-3">Volume Output Berdasarkan Lini</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: metrics.map(m => m.label),
                datasets: [
                  { label: 'Good', data: metrics.map(m => m.good), backgroundColor: '#10b981', borderRadius: 4 },
                  { label: 'Reject', data: metrics.map(m => m.reject), backgroundColor: '#f43f5e', borderRadius: 4 }
                ]
              }}
              options={{ maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }}
            />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="card-title mb-3">Porsi Output Lini Produksi</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={{
                labels: metrics.map(m => m.label),
                datasets: [
                  {
                    data: metrics.map(m => m.output),
                    backgroundColor: metrics.map(m => m.color || '#3b82f6')
                  }
                ]
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Tabel Ringkasan Tiap Lini */}
      <div className="card p-5">
        <h3 className="card-title mb-1">Rincian Efisiensi Tiap Lini Produksi</h3>
        <p className="text-xs text-slate-500 mb-4">Klik nama lini untuk membuka daftar transaksi detail</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Lini Proses</th>
                <th className="py-2.5 px-3">Satuan</th>
                <th className="py-2.5 px-3">Total Output</th>
                <th className="py-2.5 px-3">Good</th>
                <th className="py-2.5 px-3">Reject</th>
                <th className="py-2.5 px-3">Replace</th>
                <th className="py-2.5 px-3">Loss Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.map(m => (
                <tr
                  key={m.key}
                  onClick={() => onOpenList?.(`Rekap Transaksi ${m.label}`, m.key, m.rows)}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }}></span>
                    {m.label}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{m.unit}</td>
                  <td className="py-2.5 px-3 font-bold">{m.output.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">{m.good.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">{m.reject.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-amber-600">{m.replace.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 font-bold">{m.lossRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
