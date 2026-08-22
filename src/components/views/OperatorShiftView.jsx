import React, { useState, useMemo } from 'react';
import { SHEETS, PROD_KEYS } from '../../constants/schema';
import { num, cell, parseDateVal, startOfDay, endOfDay, fmtPeriodRange } from '../../utils/formatters';
import { Users, Clock, Award, Filter } from 'lucide-react';

export default function OperatorShiftView({ data = {}, period, onOpenList }) {
  const [selectedKey, setSelectedKey] = useState('ALL');

  // Filter baris berdasarkan tanggal dan opsi lini
  const filteredRows = useMemo(() => {
    const keys = selectedKey === 'ALL' ? PROD_KEYS : [selectedKey];
    const fromTime = period?.from ? startOfDay(period.from).getTime() : null;
    const toTime = period?.to ? endOfDay(period.to).getTime() : null;

    const list = [];
    keys.forEach((k) => {
      const cfg = SHEETS[k];
      if (!cfg || !cfg.i) return;
      const rows = data[k] || [];

      rows.forEach((r) => {
        const idVal = cell(r, cfg.i.id).trim();
        if (!idVal) return;

        const d = parseDateVal(r[cfg.i.date]);
        if (d) {
          const t = d.getTime();
          if (fromTime && t < fromTime) return;
          if (toTime && t > toTime) return;
        }

        list.push({
          key: k,
          label: cfg.label,
          unit: cfg.unit,
          row: r,
          op: cell(r, cfg.i.op).trim() || 'Tanpa Nama',
          shift: cell(r, cfg.i.shift).trim() || 'Shift 1',
          good: num(r[cfg.i.baik]),
          reject: num(r[cfg.i.rusak]),
          replace: num(r[cfg.i.ganti])
        });
      });
    });
    return list;
  }, [data, selectedKey, period]);

  // Agregasi Per Operator
  const operatorStats = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((item) => {
      const name = item.op;
      if (!map.has(name)) {
        map.set(name, { name, good: 0, reject: 0, replace: 0, count: 0, rawRows: [] });
      }
      const cur = map.get(name);
      cur.good += item.good;
      cur.reject += item.reject;
      cur.replace += item.replace;
      cur.count += 1;
      cur.rawRows.push(item.row);
    });

    return Array.from(map.values()).map((op) => {
      const output = op.good + op.reject;
      const lossRate = output > 0 ? (op.reject / output) * 100 : 0;
      let grade = 'Grade A';
      let gradeColor = 'bg-emerald-100 text-emerald-700';

      if (lossRate > 6.0) {
        grade = 'Grade D';
        gradeColor = 'bg-rose-100 text-rose-700';
      } else if (lossRate > 4.0) {
        grade = 'Grade C';
        gradeColor = 'bg-amber-100 text-amber-700';
      } else if (lossRate > 2.0) {
        grade = 'Grade B';
        gradeColor = 'bg-blue-100 text-blue-700';
      }

      return { ...op, output, lossRate, grade, gradeColor };
    }).sort((a, b) => a.lossRate - b.lossRate);
  }, [filteredRows]);

  // Agregasi Per Shift
  const shiftStats = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((item) => {
      const sh = item.shift;
      if (!map.has(sh)) {
        map.set(sh, { shift: sh, good: 0, reject: 0, replace: 0, count: 0 });
      }
      const cur = map.get(sh);
      cur.good += item.good;
      cur.reject += item.reject;
      cur.replace += item.replace;
      cur.count += 1;
    });

    return Array.from(map.values()).map((sh) => {
      const output = sh.good + sh.reject;
      const lossRate = output > 0 ? (sh.reject / output) * 100 : 0;
      return { ...sh, output, lossRate };
    }).sort((a, b) => a.shift.localeCompare(b.shift));
  }, [filteredRows]);

  return (
    <div className="space-y-5 anim-in">
      {/* Header & Filter Lini */}
      <div className="card p-5 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-emerald-100 text-emerald-800 font-bold">PENGAWASAN TIM</span>
            <span className="text-xs text-slate-400">· Evaluasi Operator & Shift</span>
          </div>
          <h2 className="font-display font-extrabold text-xl mt-1 text-slate-800">
            Performa Operator & Distribusi Shift
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periode: <b>{fmtPeriodRange(period?.from, period?.to)}</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="inp text-xs font-semibold py-1.5 px-3"
          >
            <option value="ALL">Semua Lini Mesin</option>
            {PROD_KEYS.map((k) => (
              <option key={k} value={k}>
                {SHEETS[k]?.label || k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ringkasan Shift */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {shiftStats.map((sh) => (
          <div key={sh.shift} className="card p-4 bg-white border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">{sh.shift}</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="font-display font-extrabold text-2xl text-slate-800">
                {sh.output.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">unit</span>
              </div>
              <div className={`text-sm font-bold ${sh.lossRate > 2 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Loss {sh.lossRate.toFixed(1)}%
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex justify-between border-t border-slate-100 pt-2">
              <span>Good: <b>{sh.good.toLocaleString('id-ID')}</b></span>
              <span>Reject: <b>{sh.reject.toLocaleString('id-ID')}</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Ranking Operator */}
      <div className="card p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="card-title">Ranking Kinerja Operator</h3>
          <span className="text-xs text-slate-400">{operatorStats.length} Operator terdata</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Nama Operator</th>
                <th className="py-2.5 px-3">Total Output</th>
                <th className="py-2.5 px-3">Good</th>
                <th className="py-2.5 px-3">Reject</th>
                <th className="py-2.5 px-3">Loss Rate</th>
                <th className="py-2.5 px-3">Grade Kinerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operatorStats.map((op, idx) => (
                <tr
                  key={op.name}
                  onClick={() => onOpenList?.(`Rekap Operator: ${op.name}`, selectedKey === 'ALL' ? 'db_ctcp' : selectedKey, op.rawRows)}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-500">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{op.name}</td>
                  <td className="py-2.5 px-3 font-semibold">{op.output.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">{op.good.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">{op.reject.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 font-bold">{op.lossRate.toFixed(1)}%</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${op.gradeColor}`}>
                      {op.grade}
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
