import React from 'react';
import { PROD_KEYS, SHEETS } from '../../constants/schema';
import { LayoutDashboard, GitCompare, FileSpreadsheet, LogOut, Database, X } from 'lucide-react';

export default function Sidebar({ view, onViewChange, user, onLogout, isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[268px] bg-[#0c1424] text-slate-300 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <img
            className="w-10 h-10 rounded-xl bg-white p-1"
            src="https://drive.google.com/thumbnail?id=1lH4lh1q8CrraoC1fMY1q7tf3B0nezFiJ&sz=w512"
            alt="Logo"
          />
          <div>
            <div className="font-display font-extrabold text-white leading-tight">PERFORMA</div>
            <div className="text-[10px] tracking-[.22em] text-slate-400 font-semibold uppercase">© 2026 AETHER CODE</div>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CMYK Bar */}
        <div className="flex h-1 mx-5 rounded overflow-hidden">
          <span className="flex-1 bg-[#00aeef]"></span>
          <span className="flex-1 bg-[#ec008c]"></span>
          <span className="flex-1 bg-[#ffd400]"></span>
          <span className="flex-1 bg-[#111111]"></span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-[0.84rem]">
          <div className="text-[0.6rem] tracking-[0.16em] font-bold text-[#5b6b85] px-3 pt-3 pb-1 uppercase">Ringkasan</div>
          <button
            onClick={() => { onViewChange('overview'); onClose?.(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
              view === 'overview' ? 'bg-blue-600/20 text-white border-l-4 border-blue-500 rounded-l-none' : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            Dashboard Overview
          </button>

          <div className="text-[0.6rem] tracking-[0.16em] font-bold text-[#5b6b85] px-3 pt-4 pb-1 uppercase">Dashboard Produksi</div>
          {PROD_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => { onViewChange(`prod:${k}`); onClose?.(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
                view === `prod:${k}` ? 'bg-blue-600/20 text-white border-l-4 border-blue-500 rounded-l-none' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: SHEETS[k].color }}></span>
              {SHEETS[k].label}
            </button>
          ))}

          <div className="text-[0.6rem] tracking-[0.16em] font-bold text-[#5b6b85] px-3 pt-4 pb-1 uppercase">Analisis</div>
          <button
            onClick={() => { onViewChange('compare'); onClose?.(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
              view === 'compare' ? 'bg-blue-600/20 text-white border-l-4 border-blue-500 rounded-l-none' : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <GitCompare className="w-4 h-4 text-indigo-400" />
            Dashboard Komparasi
          </button>

          <div className="text-[0.6rem] tracking-[0.16em] font-bold text-[#5b6b85] px-3 pt-4 pb-1 uppercase">Data Produksi</div>
          {PROD_KEYS.map((k) => (
            <button
              key={`data-${k}`}
              onClick={() => { onViewChange(`data:${k}`); onClose?.(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
                view === `data:${k}` ? 'bg-blue-600/20 text-white border-l-4 border-blue-500 rounded-l-none' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 text-slate-400" />
              Data {SHEETS[k].label}
            </button>
          ))}

          <div className="text-[0.6rem] tracking-[0.16em] font-bold text-[#5b6b85] px-3 pt-4 pb-1 uppercase">Permintaan</div>
          <button
            onClick={() => { onViewChange('forms'); onClose?.(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${
              view === 'forms' ? 'bg-blue-600/20 text-white border-l-4 border-blue-500 rounded-l-none' : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            Form Permintaan
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white font-bold grid place-items-center">
            {(user?.USER?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">{user?.USER}</div>
            <div className="text-[11px] text-slate-400 truncate">{user?.ROLE} {user?.demo ? '· DEMO' : ''}</div>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-white p-1" title="Keluar">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}