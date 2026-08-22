import React, { useState, useMemo } from 'react';
import { SHEETS } from '../../constants/schema';
import { cell, parseDateVal, startOfDay, endOfDay, fmtDate } from '../../utils/formatters';
import { Search, Download } from 'lucide-react';

export default function DataTableView({ tabKey = 'db_ctcp', data = {}, period, onSelectRow }) {
  const [search, setSearch] = useState('');
  const cfg = SHEETS[tabKey] || { label: tabKey, headers: [], i: { id: 0, jop: 1, nojop: 2, date: 4 } };

  const filtered = useMemo(() => {
    const raw = data[tabKey] || [];
    const fromTime = period?.from ? startOfDay(period.from).getTime() : null;
    const toTime = period?.to ? endOfDay(period.to).getTime() : null;
    const q = search.trim().toLowerCase();

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

      if (q) {
        return r.some((c) => String(c || '').toLowerCase().includes(q));
      }
      return true;
    });
  }, [data, tabKey, period, search, cfg]);

  const headers = cfg.headers && cfg.headers.length > 0 
    ? cfg.headers 
    : ['ID', 'JOP Name', 'No JOP', 'No Plate/B', 'Date', 'Param 1', 'Param 2', 'Param 3', 'Baru', 'Ganti', 'Baik', 'Rusak', 'Sebab Ganti', 'Ket', 'Sebab Rusak', 'Shift', 'Operator', 'PO'];

  return (
    <div className="card p-5 bg-white space-y-4 anim-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-lg text-slate-800">
            Database Transaksi — {cfg.label}
          </h2>
          <p className="text-xs text-slate-500">
            Menampilkan <b>{filtered.length.toLocaleString('id-ID')} baris</b> data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID, JOP, Operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="inp !pl-8 text-xs py-1.5 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[600px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-100 z-10">
            <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">No</th>
              {headers.map((h, i) => (
                <th key={i} className="py-2.5 px-3 whitespace-nowrap">{h.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.slice(0, 200).map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onSelectRow?.(tabKey, row)}
                className="hover:bg-slate-50 transition cursor-pointer"
              >
                <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                {headers.map((_, colIdx) => (
                  <td key={colIdx} className="py-2 px-3 whitespace-nowrap text-slate-700">
                    {colIdx === cfg.i.date ? fmtDate(row[colIdx]) : (row[colIdx] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 200 && (
        <p className="text-center text-[11px] text-slate-400">
          Menampilkan 200 baris pertama. Gunakan kolom pencarian di atas untuk menyaring data spesifik.
        </p>
      )}
    </div>
  );
}
