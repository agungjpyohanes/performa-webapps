import React from 'react';
import { fmtPeriodRange } from '../../utils/formatters';
import { Menu, RotateCcw, Printer, Calendar } from 'lucide-react';

export default function Header({
  view,
  period,
  onPeriodChange,
  onReset,
  onOpenPrint,
  onToggleSidebar
}) {
  const handleDateChange = (type, val) => {
    if (!onPeriodChange) return;
    onPeriodChange(prev => ({
      ...prev,
      [type]: val ? new Date(val) : null
    }));
  };

  const fromStr = period?.from instanceof Date && !isNaN(period.from.getTime())
    ? period.from.toISOString().split('T')[0]
    : '';

  const toStr = period?.to instanceof Date && !isNaN(period.to.getTime())
    ? period.to.toISOString().split('T')[0]
    : '';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition border border-slate-200"
            title="Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-base lg:text-lg text-slate-900 leading-tight">
              PERFORMA Prepress
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Monitoring & Analytics Dashboard
            </p>
          </div>
        </div>

        {/* Filter Rentang Tanggal & Tombol Aksi */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={fromStr}
              onChange={e => handleDateChange('from', e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-28"
            />
            <span className="text-slate-400 text-xs">s/d</span>
            <input
              type="date"
              value={toStr}
              onChange={e => handleDateChange('to', e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-28"
            />
          </div>

          <button
            onClick={onReset}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition border border-slate-200"
            title="Muat Ulang Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenPrint}
            className="btn bg-slate-900 hover:bg-slate-800 text-white text-xs !py-1.5 !px-3 font-semibold rounded-xl flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
