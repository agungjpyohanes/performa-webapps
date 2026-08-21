import React, { useMemo } from 'react';
import { OVER_SETS, SHEETS } from '../../constants/schema';
import { parseDateVal, fmtDate, isDone, hexA, cell, startOfDay, endOfDay } from '../../utils/formatters';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OverviewView({ data, onOpenList, onSelectRow, onOpenDayModal }) {
  const t0 = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => {
    const d = new Date(t0);
    d.setDate(d.getDate() - 2);
    return d;
  }, [t0]);

  const sets = useMemo(() => {
    return OVER_SETS.map(s => {
      const cfg = SHEETS[s.key];
      const rawRows = data[s.key] || [];
      const un = [];
      const done = [];

      rawRows.forEach((r, ix) => {
        const idVal = cell(r, cfg.i.id).trim();
        const jopVal = cell(r, cfg.i.jop).trim();
        const noJopVal = cell(r, cfg.i.nojop).trim();
        if (!idVal || (!jopVal && !noJopVal)) return;

        if (!isDone(cell(r, cfg.i.status))) {
          un.push({ key: s.key, cfg, ix, r });
        } else {
          const d = parseDateVal(r[cfg.i.date]);
          if (d && d >= minDate && d <= endOfDay(t0)) {
            done.push({ key: s.key, cfg, ix, r });
          }
        }
      });
      return { ...s, cfg, un, done };
    });
  }, [data, minDate, t0]);

  const totalUn = sets.reduce((a, s) => a + s.un.length, 0);
  const totalDone = sets.reduce((a, s) => a + s.done.length, 0);

  const pieChartData = {
    labels: sets.map(s => s.label),
    datasets: [{
      data: sets.map(s => s.un.length),
      backgroundColor: sets.map(s => s.color),
      borderWidth: 3,
      borderColor: '#fff',
      hoverOffset: 10
    }]
  };

  const pieOptions = {
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { family: 'Inter' } } }
    },
    onClick: (e, els) => {
      if (!els.length) return;
      const s = sets[els[0].index];
      onOpenList(`Pekerjaan ${s.label} — Belum Selesai`, s.key, s.un.map(x => x.r), 'Status belum SELESAI · Kolom 1-7');
    }
  };

  const renderTable = (items) => {
    if (!items.length) {
      return <div className="text-center py-10 text-slate-400 text-xs">Tidak ada data</div>;
    }
    const head = ['Jenis', 'ID', 'JOP Name', 'No JOP', 'No B/Plate', 'Tipe/Status', 'Status/Date', 'Tanggal/Shift'];
    return (
      <table className="tbl">
        <thead>
          <tr>
            {head.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => {
            const c = it.cfg;
            const r = it.r;
            const d = parseDateVal(r[c.i.date]);
            const st = cell(r, c.i.status);
            return (
              <tr key={idx} onClick={() => onSelectRow(it.key, r)}>
                <td>
                  <span className="badge" style={{ background: hexA(SHEETS[it.key].color, 0.12), color: SHEETS[it.key].color }}>
                    {SHEETS[it.key].label}
                  </span>
                </td>
                <td className="font-semibold text-slate-700">{cell(r, 0)}</td>
                <td>{cell(r, 1)}</td>
                <td>{cell(r, 2)}</td>
                <td>{cell(r, 3)}</td>
                <td>{cell(r, 4)}</td>
                <td>
                  <span className={`badge ${isDone(st) ? 'bg-emerald-50 text-emerald-700' : st.includes('PROSES') ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {st || '—'}
                  </span>
                </td>
                <td
                  onClick={(e) => { e.stopPropagation(); if (d) onOpenDayModal(it.key, startOfDay(d).getTime()); }}
                  className="!cursor-pointer text-blue-600 underline decoration-dotted underline-offset-2"
                >
                  {fmtDate(d)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-4 anim-in">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 flex flex-col gap-3">
          <h3 className="card-title">Pekerjaan Dalam Proses</h3>
          <div className="space-y-2">
            {sets.map(s => (
              <button
                key={s.key}
                onClick={() => onOpenList(`Pekerjaan ${s.label} — Belum Selesai`, s.key, s.un.map(x => x.r), 'Status belum SELESAI')}
                className="w-full card-h flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left bg-white"
              >
                <span className="w-10 h-10 rounded-lg grid place-items-center text-white font-display font-bold" style={{ background: s.color }}>
                  {s.un.length}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-700">{s.label}</span>
                  <span className="block text-[11px] text-slate-400">belum SELESAI · klik untuk detail</span>
                </span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}></span>
              </button>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Total dalam proses</span>
            <span className="font-display font-bold text-slate-800 text-base">{totalUn}</span>
          </div>
        </div>

        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="card-title">Pie Chart — Pekerjaan Dalam Proses</h3>
            <span className="text-[11px] text-slate-400">klik segmen untuk detail</span>
          </div>
          <div className="h-72 relative flex items-center justify-center">
            {totalUn ? <Doughnut data={pieChartData} options={pieOptions} /> : <p className="text-xs text-slate-400">Tidak ada pekerjaan dalam proses</p>}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-wrap gap-2">
          <h3 className="card-title">Pekerjaan Belum Selesai (Kolom 1-7)</h3>
          <span className="badge bg-amber-50 text-amber-700">{totalUn} baris</span>
        </div>
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '420px' }}>
          {renderTable(sets.flatMap(s => s.un))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-wrap gap-2">
          <h3 className="card-title">Pekerjaan Selesai (H-2 s/d Hari Ini)</h3>
          <span className="badge bg-emerald-50 text-emerald-700">{totalDone} baris · {fmtDate(minDate)} – {fmtDate(t0)}</span>
        </div>
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '420px' }}>
          {renderTable(sets.flatMap(s => s.done))}
        </div>
      </div>
    </div>
  );
}