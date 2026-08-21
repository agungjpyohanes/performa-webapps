import React from 'react';
import { X } from 'lucide-react';
import { SHEETS } from '../../constants/schema';
import { fmtDate, hexA } from '../../utils/formatters';

export default function Modal({ data, onClose }) {
  if (!data) return null;
  const { key, row } = data;
  const cfg = SHEETS[key];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0b1220]/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[86vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-slate-800 text-base">Detail {row[cfg?.i?.id || 0]}</h3>
            {cfg && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: hexA(cfg.color, 0.15), color: cfg.color }}>
                {cfg.label}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {cfg?.headers.map((h, idx) => {
              const val = idx === cfg.i.date ? fmtDate(row[idx]) : (row[idx] || '—');
              return (
                <div key={h} className="border-b border-slate-100 pb-2">
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{h}</div>
                  <div className="text-sm font-medium text-slate-700 mt-0.5">{val}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}