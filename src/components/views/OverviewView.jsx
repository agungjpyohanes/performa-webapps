import React, { useMemo } from 'react';
import { OVER_SETS, SHEETS } from '../../constants/schema';
import { parseDateVal, fmtDate, isDone, hexA } from '../../utils/formatters';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OverviewView({ data, onSelectRow }) {
  const t0 = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

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
        const idVal = String(r[cfg.i.id] || '').trim();
        const jopVal = String(r[cfg.i.jop] || '').trim();
        const noJopVal = String(r[cfg.i.nojop] || '').trim();

        // Validasi anti-ghost row
        if (!idVal || (!jopVal && !noJopVal)) return;

        if (!isDone(r[cfg.i.status])) {
          un.push({ key: s.key, cfg, ix, r });
        } else {
          const d = parseDateVal(r[cfg.i.date]);
          if (d && d >= minDate && d <= new Date(t0.getTime() + 86399999)) {
            done.push({ key: s.key, cfg, ix, r });
          }
        }
      });

      return { ...s, cfg, un, done };
    });
  }, [data, minDate, t0]);

  const totalUn = sets.reduce((a, s) => a + s.un.length, 0);
  const totalDone = sets.reduce((a, s) => a + s.done.length, 0);

  const chartData = {
    labels: sets.map(s => s.label),
    datasets: [
      {
        data: sets.map(s => s.un.length),
        backgroundColor: sets.map(s => s.color),
        borderWidth: 3,
        borderColor: '#fff'
      }
    ]
  };

  return (
    <div className="space-y-4">
      {/* Cards & Pie Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 flex flex-col gap-3">
          <h3 className="card-title font-display font-bold text-slate-800">Pekerjaan Dalam Proses</h3>
          <div className="space-y-2 flex-1">
            {sets.map(s => (
              <div key={s.key} className="card-h flex items-center gap-3 rounded-xl border border-slate-200 p-3 bg-white">
                <span className="w-10 h-10 rounded-lg grid place-items-center text-white font-display font-bold" style={{ background: s.color }}>
                  {s.un.length}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-700">{s.label}</div>
                  <div className="text-[11px] text-slate-400">belum SELESAI</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}></span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Total dalam proses</span>
            <span className="font-display font-bold text-slate-800 text-base">{totalUn}</span>
          </div>
        </div>

        <div className="card p-4 lg:col-span-2">
          <h3 className="card-title font-display font-bold text-slate-800 mb-2">Pie Chart — Pekerjaan Dalam Proses</h3>
          <div className="h-64 relative flex items-center justify-center">
            {totalUn > 0 ? (
              <Doughnut data={chartData} options={{ maintainAspectRatio: false, cutout: '60%' }} />
            ) : (
              <p className="text-xs text-slate-400">Tidak ada pekerjaan dalam proses.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Pekerjaan Belum Selesai */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="card-title font-display font-bold text-slate-800">Pekerjaan Belum Selesai</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">{totalUn} baris</span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="tbl">
            <thead>
              <tr>
                <th>Jenis</th>
                <th>ID</th>
                <th>JOP Name</th>
                <th>No JOP</th>
                <th>No B/Plate</th>
                <th>Tipe/Status</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {sets.flatMap(s => s.un).map((it, idx) => (
                <tr key={idx} onClick={() => onSelectRow(it.key, it.r)}>
                  <td>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: hexA(it.cfg.color, 0.15), color: it.cfg.color }}>
                      {it.cfg.label}
                    </span>
                  </td>
                  <td className="font-semibold text-slate-700">{it.r[0]}</td>
                  <td>{it.r[1] || '—'}</td>
                  <td>{it.r[2] || '—'}</td>
                  <td>{it.r[3] || '—'}</td>
                  <td>{it.r[4] || '—'}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                      {it.r[it.cfg.i.status] || 'PROSES'}
                    </span>
                  </td>
                  <td className="text-blue-600">{fmtDate(it.r[it.cfg.i.date])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}