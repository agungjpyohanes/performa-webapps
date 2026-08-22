import React from 'react';
import { SHEETS, PROD_KEYS } from '../../constants/schema';
import {
  Gauge,
  Layers,
  Table,
  GitCompare,
  FileText,
  BarChart2,
  Users,
  Clock,
  ShieldAlert,
  Bell,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ view, onViewChange, user, onLogout, isOpen, onClose }) {
  const currentView = view || 'overview';
  const userRole = (user?.ROLE || 'GUEST').toUpperCase();

  // Pengaturan Hak Akses RBAC
  const isSpvAdmin = ['SPV', 'KOORDINATOR', 'ADMIN', 'MANAGER', 'DEVELOPER'].includes(userRole);
  const isOverallView = ['MANAGER', 'DEVELOPER'].includes(userRole);

  const handleNav = (v) => {
    onViewChange(v);
    if (onClose) onClose();
  };

  const navItemClass = (isActive) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
      isActive
        ? 'bg-emerald-500/10 text-emerald-600 font-bold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                className="w-8 h-8 rounded-lg bg-emerald-50 p-1 border border-emerald-200"
                src="https://drive.google.com/thumbnail?id=1lH4lh1q8CrraoC1fMY1q7tf3B0nezFiJ&sz=w512"
                alt="logo"
              />
              <div>
                <div className="font-display font-extrabold text-slate-800 text-sm tracking-wide">
                  PERFORMA
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">V 1.0 · PREPRESS</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ===== KELOMPOK 1: OPERASIONAL PUBLIK (PUBLIC VIEW) ===== */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Operasional Publik
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('overview')}
                className={`w-full ${navItemClass(currentView === 'overview')}`}
              >
                <Gauge className="w-4 h-4 text-emerald-500" />
                <span>Dashboard Overview</span>
              </button>

              {PROD_KEYS.map((k) => (
                <button
                  key={`prod-${k}`}
                  onClick={() => handleNav(`prod:${k}`)}
                  className={`w-full ${navItemClass(currentView === `prod:${k}`)}`}
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>{SHEETS[k]?.label || k}</span>
                </button>
              ))}

              <button
                onClick={() => handleNav('compare')}
                className={`w-full ${navItemClass(currentView === 'compare')}`}
              >
                <GitCompare className="w-4 h-4 text-amber-500" />
                <span>Dashboard Komparasi</span>
              </button>

              {PROD_KEYS.map((k) => (
                <button
                  key={`data-${k}`}
                  onClick={() => handleNav(`data:${k}`)}
                  className={`w-full ${navItemClass(currentView === `data:${k}`)}`}
                >
                  <Table className="w-4 h-4 text-slate-400" />
                  <span>Data {SHEETS[k]?.label || k}</span>
                </button>
              ))}

              <button
                onClick={() => handleNav('forms')}
                className={`w-full ${navItemClass(currentView === 'forms')}`}
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Form Permintaan</span>
              </button>
            </div>
          </div>

          {/* ===== KELOMPOK 2: ANALITIK PER-PROSES (SPV, KOORDINATOR, ADMIN) ===== */}
          {isSpvAdmin && (
            <div>
              <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider px-3 mb-2">
                Analitik Prepress (Per-Proses)
              </div>
              <div className="space-y-1">
                {PROD_KEYS.map((k) => (
                  <button
                    key={`analytics-${k}`}
                    onClick={() => handleNav(`analytics:${k}`)}
                    className={`w-full ${navItemClass(currentView === `analytics:${k}`)}`}
                  >
                    <BarChart2 className="w-4 h-4 text-cyan-500" />
                    <span>Analytics {SHEETS[k]?.label || k}</span>
                  </button>
                ))}

                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider px-3 pt-3 mb-1">
                  Pengawasan Tim
                </div>
                <button
                  onClick={() => handleNav('operator_shift')}
                  className={`w-full ${navItemClass(currentView === 'operator_shift')}`}
                >
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Evaluasi Operator & PO</span>
                </button>
              </div>
            </div>
          )}

          {/* ===== KELOMPOK 3: OVERALL MANAGEMENT (MANAGER & DEVELOPER ONLY) ===== */}
          {isOverallView && (
            <div>
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider px-3 mb-2">
                Management Overall
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('executive_overall')}
                  className={`w-full ${navItemClass(currentView === 'executive_overall')}`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Executive Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white grid place-items-center font-bold text-xs shrink-0">
                {(user?.USER || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {user?.USER || 'User'}
                </div>
                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-slate-200 text-slate-700">
                  {userRole}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
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
