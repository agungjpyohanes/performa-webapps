import React, { useMemo } from 'react';
import { SHEETS, PROD_KEYS } from '../../constants/schema';
import { num, cell, fmtPeriodRange, parseDateVal, startOfDay } from '../../utils/formatters';
import { Layers, CheckCircle2, AlertTriangle, Percent, ShieldAlert } from 'lucide-react';

export default function ExecutiveOverallView({ data = {}, period, onOpenList }) {
  // Filter baris transaksi per-lini berdasarkan rentang tanggal
  const lineMetrics = useMemo(() => {
    return PROD_KEYS.map((k) => {
      const cfg = SHEETS[k] || { label: k, unit: 'Unit', i: { baik: 0, rusak: 0, ganti: 0, date: 4, id: 0, jop: 1, nojop: 2 } };
      const rawRows = data[k] || [];

      // Filter tanggal
      const filteredRows = rawRows.filter((r) => {
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

      let good = 0, reject = 0, replace = 0;
      filteredRows.forEach((r) => {
        good += num(r[cfg.i.baik]);
        reject += num(r[cfg.i.rusak]);
        replace += num(r[cfg.i.ganti]);
      });

      const output = good + reject;
      const lossRate = output > 0 ? (reject / output) * 100 : 0;
      const targetLoss = 1.0;

      return {
        key: k,
        label: cfg.label,
        unit: cfg.unit,
        rows: filteredRows,
        good,
        reject,
        replace,
        output,
        lossRate,
        isCritical: lossRate > targetLoss
      };
    });
  }, [data, period]);

  // Ringkasan Global
  const totalOutput = lineMetrics.reduce((a, b) => a + b.output, 0);
  const totalGood = lineMetrics.reduce((a, b) => a + b.good, 0);
  const totalReject = lineMetrics.reduce((a, b) => a + b.reject, 0);
  const totalReplace = lineMetrics.reduce((a, b) => a + b.replace, 0);
  const overallLossRate = totalOutput > 0 ? (totalReject / totalOutput) * 100 : 0;

  const criticalLines = lineMetrics.filter((m) => m.isCritical && m.output > 0);

  return (
    <div className="space-y-4 anim-in">
      {/* Header Banner */}
      <div className="card p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-amber-400/20 text-amber-300 font-bold">MANAGEMENT EXECUTIVE</span>
            <span className="text-xs text-slate-400">· Overall Plant Control</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl mt-1.5">Executive Dashboard Overall</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Pemantauan makro seluruh performa lintas divisi Prepress, matriks komparasi efisiensi, dan deteksi deviasi kerugian (Alert Center).
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Periode Evaluasi</div>
          <div className="font-bold text-sm text-amber-300 mt-0.5">{fmtPeriodRange(period?.from, period?.to)}</div>
        </div>
      </div>

      {/* KPI Global Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-white border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL PLANT OUTPUT</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-slate-800">
            {totalOutput.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Akumulasi sesuai tanggal</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL GOOD OUTPUT</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-emerald-600">
            {totalGood.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Siap cetak di mesin</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL REJECT / LOSS</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 font-display font-extrabold text-2xl text-rose-600">
            {totalReject.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Unit rusak / cacat</div>
        </div>

        <div className="card p-4 bg-white border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">OVERALL LOSS RATE</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`mt-2 font-display font-extrabold text-2xl ${overallLossRate > 1.0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {overallLossRate.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Target Toleransi &le; 1.00%</div>
        </div>
      </div>

      {/* Alert Center Section */}
      <div className="card p-5 border-l-4 border-l-amber-500">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="card-title">Alert Center & Target Deviation</h3>
        </div>

        {criticalLines.length === 0 ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Seluruh lini proses beroperasi normal dalam batas toleransi target (&le; 1.0%).</span>
          </div>
        ) : (
          <div className="space-y-2">
            {criticalLines.map((m) => (
              <div
                key={m.key}
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 text-rose-800 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    🔴 <b>Kritis:</b> Lini {m.label} memiliki Loss Rate sebesar{' '}
                    <b>{m.lossRate.toFixed(1)}%</b> (Melebihi target 1.0%).
                  </span>
                </div>
                <button
                  onClick={() => onOpenList?.(`Audit Kritis: ${m.label}`, m.key, m.rows)}
                  className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-[11px]"
                >
                  Investigasi Data
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cross-Process Matrix Comparison Table */}
      <div className="card p-5">
        <h3 className="card-title mb-1">Comparison Matrix Per-Lini Prepress</h3>
        <p className="text-xs text-slate-500 mb-4">Evaluasi efisiensi komparatif lintas unit kerja</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Lini Proses</th>
                <th className="py-2.5 px-3">Satuan</th>
                <th className="py-2.5 px-3">Output</th>
                <th className="py-2.5 px-3">Good</th>
                <th className="py-2.5 px-3">Reject</th>
                <th className="py-2.5 px-3">Replace</th>
                <th className="py-2.5 px-3">Loss Rate</th>
                <th className="py-2.5 px-3">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineMetrics.map((m) => (
                <tr key={m.key} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 font-bold text-slate-800">{m.label}</td>
                  <td className="py-2 px-3 text-slate-500">{m.unit}</td>
                  <td className="py-2 px-3 font-bold">{m.output.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 text-emerald-600 font-semibold">{m.good.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 text-rose-600 font-semibold">{m.reject.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 text-amber-600">{m.replace.toLocaleString('id-ID')}</td>
                  <td className="py-2 px-3 font-bold">{m.lossRate.toFixed(1)}%</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        m.isCritical
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {m.isCritical ? 'PERLU EVALUASI' : 'OPTIMAL'}
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
