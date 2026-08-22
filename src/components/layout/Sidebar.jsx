import React from 'react';
import { SHEETS, PROD_KEYS } from '../../constants/schema';
import {
  LayoutDashboard,
  Layers,
  Table,
  BarChart3,
  Users,
  LineChart,
  LogOut,
  X,
  FileText
} from 'lucide-react';

export default function Sidebar({ view, onViewChange, user, onLogout, isOpen, onClose }) {
  const currentView = view || 'overview';

  const navItemClass = (isActive) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
      isActive
        ? 'bg-emerald-500/10 text-emerald-600 font-bold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const handleNav = (v) => {
    onViewChange(v);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay Backdrop Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-6">
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
                <div className="text-[10px] text-slate-400 font-medium">Prepress Analytics</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            {/* Utama */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Menu Utama
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('overview')}
                  className={`w-full ${navItemClass(currentView === 'overview')}`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                  <span>Overview Global</span>
                </button>

                <button
                  onClick={() => handleNav('executive_overall')}
                  className={`w-full ${navItemClass(currentView === 'executive_overall')}`}
                >
                  <LineChart className="w-4 h-4 text-cyan-500" />
                  <span>Executive Overall</span>
                </button>

                <button
                  onClick={() => handleNav('operator_shift')}
                  className={`w-full ${navItemClass(currentView === 'operator_shift')}`}
                >
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Evaluasi Operator & PO</span>
                </button>

                <button
                  onClick={() => handleNav('compare')}
                  className={`w-full ${navItemClass(currentView === 'compare')}`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span>Komparasi Lini</span>
                </button>
              </div>
            </div>

            {/* Lini Produksi */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Analisis Lini Produksi
              </div>
              <div className="space-y-1">
                {PROD_KEYS.map((k) => {
                  const cfg = SHEETS[k] || { label: k };
                  return (
                    <button
                      key={k}
                      onClick={() => handleNav(`analytics:${k}`)}
                      className={`w-full ${navItemClass(currentView === `analytics:${k}`)}`}
                    >
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data & Form */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Database & Formulir
              </div>
              <div className="space-y-1">
                {PROD_KEYS.map((k) => {
                  const cfg = SHEETS[k] || { label: k };
                  return (
                    <button
                      key={`data-${k}`}
                      onClick={() => handleNav(`data:${k}`)}
                      className={`w-full ${navItemClass(currentView === `data:${k}`)}`}
                    >
                      <Table className="w-4 h-4 text-slate-400" />
                      <span>Data {cfg.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => handleNav('forms')}
                  className={`w-full ${navItemClass(currentView === 'forms')}`}
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Form Permintaan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center font-bold text-xs shrink-0">
                {(user?.USER || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {user?.USER || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.ROLE || 'OPERATOR'}
                </div>
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
