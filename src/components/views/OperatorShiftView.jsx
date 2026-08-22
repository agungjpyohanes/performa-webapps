import React, { useState, useMemo } from 'react';
import { SHEETS, PROD_KEYS } from '../../constants/schema';
import { num, cell, parseDateVal, startOfDay, endOfDay, fmtPeriodRange } from '../../utils/formatters';
import { Users, UserCheck, Clock, Filter } from 'lucide-react';

export default function OperatorShiftView({ data = {}, period, onOpenList }) {
  const [selectedKey, setSelectedKey] = useState('ALL');
  const [activeTab, setActiveTab] = useState('operator'); // 'operator' | 'po'

  // Filter baris data berdasarkan tanggal dan pilihan lini proses
  const filteredItems = useMemo(() => {
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

        const opName = cell(r, cfg.i.op).trim() || 'Tanpa Nama';
        const poName = cfg.i.po !== -1 ? cell(r, cfg.i.po).trim() : '';

        list.push({
          key: k,
          label: cfg.label,
          unit: cfg.unit,
          row: r,
          op: opName,
          po: poName || 'Tidak Ada PO',
          hasPo: Boolean(poName),
          shift: cell(r, cfg.i.shift).trim() || 'Shift 1',
          good: num(r[cfg.i.baik]),
          reject: num(r[cfg.i.rusak]),
          replace: num(r[cfg.i.ganti])
        });
      });
    });
    return list;
  }, [data, selectedKey, period]);

  // Agregasi Data Operator
  const operatorStats = useMemo(() => {
    const map = new Map();
    filteredItems.forEach((item) => {
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

    return Array.from(map.values())
      .map((op) => {
        const output = op.good + op.reject;
        const lossRate = output > 0 ? (op.reject / output) * 100 : 0;
        return { ...op, output, lossRate };
      })
      .sort((a, b) => b.output - a.output);
  }, [filteredItems]);

  // Agregasi Data PO (Pembuat Order)
  const poStats = useMemo(() => {
    const map = new Map();
    filteredItems.forEach((item) => {
      if (!item.hasPo) return;
      const name = item.po;
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

    return Array.from(map.values())
      .map((po) => {
        const output = po.good + po.reject;
        const lossRate = output > 0 ? (po.reject / output) * 100 : 0;
        return { ...po, output, lossRate };
      })
      .sort((a, b) => b.output - a.output);
  }, [filteredItems]);

  // Agregasi Data Shift
  const shiftStats = useMemo(() => {
    const map = new Map();
    filteredItems.forEach((item) => {
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

    return Array.from(map.values())
      .map((sh) => {
        const output = sh.good + sh.reject;
        const lossRate = output > 0 ? (sh.reject / output) * 100 : 0;
        return { ...sh, output, lossRate };
      })
      .sort((a, b) => a.shift.localeCompare(b.shift));
  }, [filteredItems]);

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
            Performa Operator, PO & Distribusi Shift
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

      {/* Ringkasan Distribusi Shift */}
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
              <div className={`text-sm font-bold ${sh.lossRate > 1.0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                Loss {sh.lossRate.toFixed(2)}%
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex justify-between border-t border-slate-100 pt-2">
              <span>Good: <b>{sh.good.toLocaleString('id-ID')}</b></span>
              <span>Reject: <b>{sh.reject.toLocaleString('id-ID')}</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Pilihan Tab Operator vs PO */}
      <div className="card p-5 bg-white space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('operator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'operator'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Ranking Operator ({operatorStats.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('po')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'po'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Ranking PO ({poStats.length})</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-400">Klik baris untuk audit transaksi</span>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">{activeTab === 'operator' ? 'Nama Operator' : 'Nama PO'}</th>
                <th className="py-2.5 px-3">Total Output</th>
                <th className="py-2.5 px-3">Good</th>
                <th className="py-2.5 px-3">Reject</th>
                <th className="py-2.5 px-3">Replace</th>
                <th className="py-2.5 px-3">Loss Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'operator' ? operatorStats : poStats).map((item, idx) => (
                <tr
                  key={item.name}
                  onClick={() => onOpenList?.(`Rekap ${activeTab === 'operator' ? 'Operator' : 'PO'}: ${item.name}`, selectedKey === 'ALL' ? 'db_ctcp' : selectedKey, item.rawRows)}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{item.name}</td>
                  <td className="py-2.5 px-3 font-semibold">{item.output.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">{item.good.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">{item.reject.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-amber-600">{item.replace.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 font-bold">{item.lossRate.toFixed(2)}%</td>
                </tr>
              ))}
              {(activeTab === 'operator' ? operatorStats : poStats).length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Tidak ada data {activeTab === 'operator' ? 'Operator' : 'PO'} pada rentang tanggal ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
