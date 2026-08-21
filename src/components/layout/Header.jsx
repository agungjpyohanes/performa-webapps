import React from 'react';
import { Menu, Calendar as CalendarIcon, RotateCcw, Printer } from 'lucide-react';
import { SHEETS } from '../../constants/schema';

export default function Header({ view, period, onPeriodChange, onReset, onPrint, onToggleSidebar }) {
  const [type, key] = view.includes(':') ? view.split(':') : [view, null];

  const getTitle = () => {
    if (type === 'overview') return 'Dashboard Overview';
    if (type === 'prod') return `Dashboard Produksi — ${SHEETS[key]?.label}`;
    if (type === 'data') return `Data Produksi — ${SHEETS[key]?.label}`;
    if (type === 'compare') return 'Dashboard Komparasi';
    return 'Form Permintaan';
  };

  const getSub = () => {
    if (type === 'overview') return 'Ringkasan SCREEN · FLEXO · ETCHING';
    if (type === 'compare') return 'Bandingkan capaian antar periode';
    if (type === 'forms') return 'Terhubung langsung ke Google Form';
    return SHEETS[key]?.desc || '';
  };

  const iso = d => d ? (d instanceof Date ? d.toISOString().split('T')[0] : String(d).split('T')[0]) : '';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur px-4 lg:px-6 py-3 flex flex-wrap items-center gap-3">
      <button onClick={onToggleSidebar} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
        <Menu className="w-4 h-4" />
      </button>

      <div className="min-w-0">
        <h1 className="font-display font-bold text-slate-900 text-base lg:text-lg leading-tight truncate">{getTitle()}</h1>
        <p className="text-[11px] text-slate-500 truncate">{getSub()}</p>
      </div>

      {type !== 'compare' && (
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={iso(period?.from)}
              onChange={e => onPeriodChange({ ...period, from: new Date(e.target.value) })}
              className="bg-transparent outline-none text-xs"
            />
            <span className="text-slate-400">–</span>
            <input
              type="date"
              value={iso(period?.to)}
              onChange={e => onPeriodChange({ ...period, to: new Date(e.target.value) })}
              className="bg-transparent outline-none text-xs"
            />
          </div>

          <button onClick={onReset} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600" title="Reset filter">
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button onClick={onPrint} className="flex items-center gap-1.5 px-3 py-2 bg-[#0c1424] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold">
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>
      )}
    </header>
  );
}