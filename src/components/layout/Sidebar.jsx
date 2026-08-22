import React from 'react';
import { SHEETS, PROD_KEYS } from '../../constants/schema';
import {
  Gauge,
  Layers,
  GitCompare,
  Table,
  FileText,
  BarChart2,
  Users,
  ShieldAlert,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ view, onViewChange, user, onLogout, isOpen, onClose }) {
  const userRole = (user?.ROLE || 'GUEST').toUpperCase();
  const isSpvAdmin = ['SPV', 'SUPERVISOR', 'KOORDINATOR', 'ADMIN', 'MANAGER', 'DEVELOPER'].includes(userRole);
  const isOverallView = ['MANAGER', 'DEVELOPER'].includes(userRole);

  const [activeType, activeKey] = view.includes(':') ? view.split(':') : [view, null];

  const navItem = (id, label, icon = null, color = null) => {
    const isAct = view === id;
    return (
      <button
        key={id}
        onClick={() => {
          onViewChange(id);
          onClose?.();
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
          isAct
            ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        {icon ? (
          <span className="w-4 h-4">{icon}</span>
        ) : (
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color || '#64748b' }}></span>
        )}
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-[268px] bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="w-9 h-9 rounded-xl bg-slate-900 p-1.5"
              src="https://drive.google.com/thumbnail?id=1lH4lh1q8CrraoC1fMY1q7tf3B0nezFiJ&sz=w512"
              alt="logo"
            />
            <div>
              <div className="font-display font-bold text-slate-900 text-sm leading-tight">PERFORMA</div>
              <div className="text-[10px] text-slate-400 font-medium">Prepress Analytics System</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Kelompok 1: Publik / Operasional */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
              Operasional Publik
            </div>
            <div className="space-y-0.5">
              {navItem('overview', 'Dashboard Overview', <Gauge className="w-4 h-4" />)}
              {navItem('compare', 'Dashboard Komparasi', <GitCompare className="w-4 h-4" />)}
              {navItem('forms', 'Form Permintaan', <FileText className="w-4 h-4" />)}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
              Produksi Lini Mesin
            </div>
            <div className="space-y-0.5">
              {PROD_KEYS.map(k => navItem(`prod:${k}`, SHEETS[k].label, null, SHEETS[k].color))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
              Data Tabel Transaksi
            </div>
            <div className="space-y-0.5">
              {PROD_KEYS.map(k => navItem(`data:${k}`, `Data ${SHEETS[k].label}`, <Table className="w-4 h-4" />))}
            </div>
          </div>

          {/* Kelompok 2: Internal Prepress (SPV, Koordinator, Admin) */}
          {isSpvAdmin && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 px-3 mb-1">
                Analitik Internal Prepress
              </div>
              <div className="space-y-0.5">
                {PROD_KEYS.map(k =>
                  navItem(`analytics:${k}`, `Analytics ${SHEETS[k].label}`, <BarChart2 className="w-4 h-4" />, SHEETS[k].color)
                )}
                {navItem('operator_shift', 'Evaluasi Operator & Shift', <Users className="w-4 h-4 text-emerald-500" />)}
              </div>
            </div>
          )}

          {/* Kelompok 3: Overall Management (Manager & Developer Only) */}
          {isOverallView && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 px-3 mb-1">
                Management Overall
              </div>
              <div className="space-y-0.5">
                {navItem('executive_overall', 'Executive Dashboard', <ShieldAlert className="w-4 h-4 text-amber-500" />)}
              </div>
            </div>
          )}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{user?.USER || 'User'}</div>
              <span className="inline-block text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                {userRole}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}