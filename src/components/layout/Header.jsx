import React, { useState, useEffect } from 'react';
import { Menu, Calendar as CalendarIcon, RotateCcw, Printer } from 'lucide-react';
import { SHEETS } from '../../constants/schema';
import { iso } from '../../utils/formatters';

export default function Header({ view, period, onPeriodChange, onReset, onOpenPrint, onToggleSidebar }) {
  const [type, key] = view.includes(':') ? view.split(':') : [view, null];
  const [clock, setClock] = useState('');

  useEffect(() => {
    const updateClock = () => {
      setClock(new Date().toLocaleString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <header id="topbar" className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur no-print">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 lg:px-6 py-3">
        <button onClick={onToggleSidebar} className="icon-btn" title="Sembunyikan / tampilkan menu">
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <h1 className="font-display font-bold text-slate-900 text-base lg:text-lg leading-tight truncate">{getTitle()}</h1>
          <p className="text-[11px] text-slate-500 truncate">{getSub()}</p>
        </div>

        {type !== 'compare' && (
          <div id="topbarTools" className="ml-auto flex flex-wrap items-center gap-2">
            <span className="hidden 2xl:inline text-xs text-slate-500 mr-1">{clock}</span>
            
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5" title="Filter periode">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={iso(period?.from)}
                onChange={e => onPeriodChange({ ...period, from: e.target.value ? new Date(e.target.value) : null })}
                className="text-xs outline-none bg-transparent w-[122px]"
              />
              <span className="text-slate-400 text-xs">–</span>
              <input
                type="date"
                value={iso(period?.to)}
                onChange={e => onPeriodChange({ ...period, to: e.target.value ? new Date(e.target.value) : null })}
                className="text-xs outline-none bg-transparent w-[122px]"
              />
            </div>

            <button onClick={onReset} className="icon-btn" title="Reset filter ke periode data">
              <RotateCcw className="w-4 h-4" />
            </button>

            <button onClick={onOpenPrint} className="btn btn-primary !py-2 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
          </div>
        )}
      </div>
    </header>
  );
}