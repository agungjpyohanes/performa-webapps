import React, { useState } from 'react';
import { useProductionData } from './hooks/useProductionData';
import { useIdleTimer } from './hooks/useIdleTimer';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AuthView from './components/views/AuthView';
import OverviewView from './components/views/OverviewView';
import ProductionView from './components/views/ProductionView';
import CompareView from './components/views/CompareView';
import DataTableView from './components/views/DataTableView';
import FormsView from './components/views/FormsView';
import Modal from './components/common/Modal';

export default function App() {
  const { data, status, loading, period, setPeriod, reload } = useProductionData();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('pf_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  useIdleTimer({
    active: !!currentUser,
    onWarn: () => addToast('⚠ Sesi akan berakhir dalam 2 menit karena tidak ada aktivitas', 'warn'),
    onTimeout: () => {
      addToast('⏱ Sesi berakhir karena idle 15 menit', 'warn');
      handleLogout();
    }
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
    sessionStorage.setItem('pf_session', JSON.stringify(user));
    addToast(`Selamat datang, ${user.USER} 👋`, 'ok');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pf_session');
    setCurrentUser(null);
    addToast('Anda telah keluar', 'info');
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

  const [viewType, viewKey] = view.includes(':') ? view.split(':') : [view, null];

  return (
    <div className="min-h-screen bg-[#f2f5fb]">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium text-white shadow-xl pointer-events-auto transition-all ${
              t.type === 'ok' ? 'bg-emerald-600' : t.type === 'err' ? 'bg-rose-600' : t.type === 'warn' ? 'bg-amber-600' : 'bg-slate-900'
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      <Sidebar
        view={view}
        onViewChange={setView}
        user={currentUser}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[268px] flex flex-col min-h-screen">
        <Header
          view={view}
          period={period}
          onPeriodChange={setPeriod}
          onReset={reload}
          onPrint={() => window.print()}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 lg:p-6 flex-1">
          {loading ? (
            <div className="text-center py-24 text-slate-400 text-sm">Menghubungkan ke Database Supabase...</div>
          ) : (
            <>
              {viewType === 'overview' && (
                <OverviewView
                  data={data}
                  onSelectRow={(key, row) => setModalData({ key, row })}
                />
              )}

              {viewType === 'prod' && (
                <ProductionView
                  tabKey={viewKey}
                  data={data}
                  period={period}
                  onSelectRow={(key, row) => setModalData({ key, row })}
                  onGoToData={(key) => setView(`data:${key}`)}
                />
              )}

              {viewType === 'compare' && (
                <CompareView data={data} />
              )}

              {viewType === 'data' && (
                <DataTableView
                  tabKey={viewKey}
                  data={data}
                  period={period}
                  onSelectRow={(key, row) => setModalData({ key, row })}
                />
              )}

              {viewType === 'forms' && (
                <FormsView onToast={addToast} />
              )}
            </>
          )}
        </main>
      </div>

      {modalData && (
        <Modal
          data={modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}