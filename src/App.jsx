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
import ProcessAnalyticsView from './components/views/ProcessAnalyticsView';
import OperatorShiftView from './components/views/OperatorShiftView';
import ExecutiveOverallView from './components/views/ExecutiveOverallView';
import Modal from './components/common/Modal';

export default function App() {
  const { data, status, loading, period, setPeriod, reload } = useProductionData();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = sessionStorage.getItem('pf_session');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
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
    onWarn: () => addToast('⚠ Sesi akan berakhir dalam 2 menit', 'warn'),
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
    const cfg = SHEETS[key] || { i: { id: 0 } };
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
      rows: rows || [],
      subtitle: subtitle || `${(rows || []).length} baris · klik baris untuk detail lengkap`
    };
    setModalBack(stateObj);
    setModalState(stateObj);
  };

  const openMetricModal = (key, metric, rows) => {
    const cfg = SHEETS[key] || { unit: 'Unit', cards: {}, i: { baik: 10, rusak: 11, ganti: 9 } };
    let list = [], valFn = null, causeIdx = null, valLabel = '';

    if (metric === 'baik') {
      list = rows.filter(r => num(r[cfg.i.baik]) > 0);
      valFn = r => num(r[cfg.i.baik]);
      valLabel = (cfg.unit || 'Unit') + ' Good';
    } else if (metric === 'rusak') {
      list = rows.filter(r => num(r[cfg.i.rusak]) > 0);
      valFn = r => num(r[cfg.i.rusak]);
      valLabel = (cfg.unit || 'Unit') + ' Reject';
      causeIdx = cfg.i.penyRusak;
    } else if (metric === 'ganti') {
      list = rows.filter(r => num(r[cfg.i.ganti]) > 0);
      valFn = r => num(r[cfg.i.ganti]);
      valLabel = (cfg.unit || 'Unit') + ' Replace';
      causeIdx = cfg.i.penyGanti;
    } else {
      list = rows;
      valFn = r => num(r[cfg.i.baik]) + num(r[cfg.i.rusak]);
      valLabel = 'Output (Good + Reject)';
    }

    const stateObj = {
      type: 'metric',
      title: cfg.cards?.[metric] || metric.toUpperCase(),
      key,
      rows: list,
      metric,
      valFn,
      valLabel,
      causeIdx,
      subtitle: `Total ${list.reduce((s, r) => s + valFn(r), 0).toLocaleString('id-ID')} · klik baris untuk detail`
    };
    setModalBack(null);
    setModalState(stateObj);
  };

  const openDayModal = (key, ts) => {
    const cfg = SHEETS[key];
    if (!cfg) return;
    const day = new Date(ts);
    const rows = (data[key] || []).filter(r => {
      const d = parseDateVal(r[cfg.i.date]);
      return d && startOfDay(d).getTime() === ts;
    });
    openRecordList(`Rekap ${cfg.label} — ${fmtDate(day)}`, key, rows, `Data tanggal ${fmtDate(day)}`);
  };

  // Parsing aman route view & subKey
  let viewType = view;
  let viewKey = 'db_ctcp';
  if (view.includes(':')) {
    const parts = view.split(':');
    viewType = parts[0];
    viewKey = parts[1];
  }

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
      <div id="toasts" className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type} pointer-events-auto`} dangerouslySetInnerHTML={{ __html: t.msg }} />
        ))}
      </div>

      <Sidebar
        view={view}
        onViewChange={(v) => {
          setView(v);
          setSidebarOpen(false);
        }}
        user={currentUser}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div id="mainWrap" className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          view={view}
          period={period}
          onPeriodChange={setPeriod}
          onReset={reload}
          onOpenPrint={() => window.print()}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main id="mainContent" className="p-4 lg:p-6 space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-24 text-slate-400 text-sm font-semibold">
              Memuat data database...
            </div>
          ) : (
            <>
              {viewType === 'overview' && (
                <OverviewView
                  data={data}
                  period={period}
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
                <CompareView data={data} period={period} onToast={addToast} />
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
                  onOpenList={openRecordList}
                  onSelectRow={openDetail}
                />
              )}

              {viewType === 'operator_shift' && (
                <OperatorShiftView
                  data={data}
                  period={period}
                  onOpenList={openRecordList}
                />
              )}

              {viewType === 'executive_overall' && (
                <ExecutiveOverallView
                  data={data}
                  period={period}
                  onOpenList={openRecordList}
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
