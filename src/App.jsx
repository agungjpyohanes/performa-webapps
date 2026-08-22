import React, { useState } from 'react';
import { useProductionData } from './hooks/useProductionData';
import { useIdleTimer } from './hooks/useIdleTimer';
import { SHEETS } from './constants/schema';
import { fmtDate, num, cell, fmtPeriodRange, startOfDay, parseDateVal } from './utils/formatters';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AuthView from './components/views/AuthView';
import OverviewView from './components/views/OverviewView';
import ProductionView from './components/views/ProductionView';
import CompareView from './components/views/CompareView';
import DataTableView from './components/views/DataTableView';
import FormsView from './components/views/FormsView';

// Modul Baru Internal Prepress & Management
import ProcessAnalyticsView from './components/views/ProcessAnalyticsView';
import OperatorShiftView from './components/views/OperatorShiftView';
import ExecutiveOverallView from './components/views/ExecutiveOverallView';

import Modal from './components/common/Modal';

export default function App() {
  const { data, status, loading, period, setPeriod, reload } = useProductionData();
  const [currentUser, setCurrentUser] = useState(() => {
    const s = sessionStorage.getItem('pf_session');
    return s ? JSON.parse(s) : null;
  });

  const [view, setView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [modalState, setModalState] = useState(null);
  const [modalBack, setModalBack] = useState(null);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3600);
  };

  useIdleTimer({
    active: !!currentUser,
    onWarn: () => addToast('⚠ Sesi akan berakhir dalam 2 menit — lakukan aktivitas untuk melanjutkan', 'warn'),
    onTimeout: () => {
      addToast('⏱ Sesi berakhir karena idle 15 menit', 'warn');
      handleLogout();
    }
  });

  const handleLogin = (u) => {
    setCurrentUser(u);
    sessionStorage.setItem('pf_session', JSON.stringify(u));
    addToast(`Selamat datang, ${u.USER} 👋`, 'ok');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pf_session');
    setCurrentUser(null);
    addToast('Anda telah keluar', 'info');
  };

  const openDetail = (key, row, withBack = false) => {
    const cfg = SHEETS[key];
    setModalState({
      type: 'detail',
      title: `Detail ${cell(row, cfg.i.id)}`,
      key,
      row,
      withBack
    });
  };

  const openRecordList = (title, key, rows, subtitle = '') => {
    const stateObj = {
      type: 'list',
      title,
      key,
      rows,
      subtitle: subtitle || `${rows.length} baris · klik baris untuk detail lengkap`
    };
    setModalBack(stateObj);
    setModalState(stateObj);
  };

  const openMetricModal = (key, metric, rows) => {
    const cfg = SHEETS[key];
    let list = [], valFn = null, causeIdx = null, valLabel = '';

    if (metric === 'baik') {
      list = rows.filter(r => num(r[cfg.i.baik]) > 0);
      valFn = r => num(r[cfg.i.baik]);
      valLabel = cfg.unit + ' Good';
    } else if (metric === 'rusak') {
      list = rows.filter(r => num(r[cfg.i.rusak]) > 0);
      valFn = r => num(r[cfg.i.rusak]);
      valLabel = cfg.unit + ' Reject';
      causeIdx = cfg.i.penyRusak;
    } else if (metric === 'ganti') {
      list = rows.filter(r => num(r[cfg.i.ganti]) > 0);
      valFn = r => num(r[cfg.i.ganti]);
      valLabel = cfg.unit + ' Replace';
      causeIdx = cfg.i.penyGanti;
    } else if (metric === 'pakai') {
      list = rows;
      valFn = r => num(r[cfg.i.baik]) + num(r[cfg.i.rusak]);
      valLabel = 'Output (Good + Reject)';
    } else {
      list = rows.filter(r => num(r[cfg.i.rusak]) > 0);
      valFn = r => {
        const b = num(r[cfg.i.baik]), rk = num(r[cfg.i.rusak]);
        return (b + rk) > 0 ? (rk / (b + rk) * 100) : 0;
      };
      valLabel = '% Loss Rate';
    }

    const stateObj = {
      type: 'metric',
      title: metric === 'pct' ? `Total Loss Rate (%)` : cfg.cards[metric],
      key,
      rows: list,
      metric,
      valFn,
      valLabel,
      causeIdx,
      subtitle: `Periode ${fmtPeriodRange(period.from, period.to)} · total ${list.reduce((s, r) => s + valFn(r), 0).toLocaleString('id-ID')} · klik baris untuk detail`
    };
    setModalBack(null);
    setModalState(stateObj);
  };

  const openDayModal = (key, ts) => {
    const cfg = SHEETS[key];
    const day = new Date(ts);
    const rows = (data[key] || []).filter(r => {
      if (!cell(r, cfg.i.id).trim() || (!cell(r, cfg.i.jop).trim() && !cell(r, cfg.i.nojop).trim())) return false;
      const d = parseDateVal(r[cfg.i.date]);
      return d && startOfDay(d).getTime() === ts;
    });
    openRecordList(`Rekap ${cfg.label} — ${fmtDate(day)}`, key, rows, `Semua data pada tanggal ${fmtDate(day)}`);
  };

  const [viewType, viewKey] = view.includes(':') ? view.split(':') : [view, null];

  const viewTitle = () => {
    if (viewType === 'overview') return 'Dashboard Overview';
    if (viewType === 'prod') return `Dashboard Produksi — ${SHEETS[viewKey]?.label}`;
    if (viewType === 'data') return `Data Produksi — ${SHEETS[viewKey]?.label}`;
    if (viewType === 'compare') return 'Dashboard Komparasi';
    if (viewType === 'analytics') return `Analytics ${SHEETS[viewKey]?.label}`;
    if (viewType === 'operator_shift') return 'Evaluasi Operator & Shift';
    if (viewType === 'executive_overall') return 'Executive Dashboard';
    return 'Form Permintaan';
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentUser) {
    return (
      <AuthView
        usersData={data.db_user}
        onLoginSuccess={handleLogin}
        onToast={addToast}
        serverStatus={status}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f5fb] text-slate-800">
      {/* Toast Notification */}
      <div id="toasts" className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast ${t.type} pointer-events-auto`}
            dangerouslySetInnerHTML={{ __html: t.msg }}
          />
        ))}
      </div>

      {/* Header Khusus Print */}
      <div id="printHead">
        <div className="flex items-center gap-3">
          <img className="w-10 h-10" src="https://drive.google.com/thumbnail?id=1lH4lh1q8CrraoC1fMY1q7tf3B0nezFiJ&sz=w512" alt="print logo" />
          <div>
            <div className="font-display font-extrabold text-lg text-slate-900">PERFORMA <span className="text-xs font-semibold text-slate-500">V 1.0</span></div>
            <div className="text-[11px] text-slate-600">
              {viewTitle()} · Periode: {fmtPeriodRange(period.from, period.to)} · Dicetak: {new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} · User: {currentUser?.USER || '-'}
            </div>
          </div>
        </div>
        <div className="flex h-1 mt-3 rounded overflow-hidden">
          <span className="flex-1" style={{ background: '#00aeef' }}></span>
          <span className="flex-1" style={{ background: '#ec008c' }}></span>
          <span className="flex-1" style={{ background: '#ffd400' }}></span>
          <span className="flex-1" style={{ background: '#111' }}></span>
        </div>
      </div>

      <Sidebar
        view={view}
        onViewChange={setView}
        user={currentUser}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div id="mainWrap" className="lg:pl-[268px] flex flex-col min-h-screen">
        <Header
          view={view}
          period={period}
          onPeriodChange={setPeriod}
          onReset={reload}
          onOpenPrint={handlePrint}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main id="mainContent" className="p-4 lg:p-6 space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-24 text-slate-400 text-sm">Menghubungkan ke Database Supabase...</div>
          ) : (
            <>
              {viewType === 'overview' && (
                <OverviewView
                  data={data}
                  onOpenList={openRecordList}
                  onSelectRow={openDetail}
                  onOpenDayModal={openDayModal}
                />
              )}

              {viewType === 'prod' && (
                <ProductionView
                  tabKey={viewKey}
                  data={data}
                  period={period}
                  onSelectRow={openDetail}
                  onOpenList={openRecordList}
                  onOpenMetric={openMetricModal}
                  onOpenDayModal={openDayModal}
                  onGoToData={(k) => setView(`data:${k}`)}
                />
              )}

              {viewType === 'compare' && (
                <CompareView data={data} onToast={addToast} />
              )}

              {viewType === 'data' && (
                <DataTableView
                  tabKey={viewKey}
                  data={data}
                  period={period}
                  onSelectRow={openDetail}
                />
              )}

              {viewType === 'analytics' && (
                <ProcessAnalyticsView
                  tabKey={viewKey}
                  data={data}
                  period={period}
                />
              )}

              {viewType === 'operator_shift' && (
                <OperatorShiftView
                  data={data}
                  period={period}
                />
              )}

              {viewType === 'executive_overall' && (
                <ExecutiveOverallView
                  data={data}
                  period={period}
                />
              )}

              {viewType === 'forms' && (
                <FormsView onToast={addToast} />
              )}
            </>
          )}
        </main>
      </div>

      {modalState && (
        <Modal
          modalState={modalState}
          onClose={() => setModalState(null)}
          onSelectRow={(k, r) => openDetail(k, r, true)}
          onBack={modalBack ? () => setModalState(modalBack) : null}
        />
      )}
    </div>
  );
}