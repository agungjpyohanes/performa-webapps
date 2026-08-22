import { useState, useEffect, useCallback } from 'react';
import { fetchAllRows } from '../services/supabase';
import { ALL_KEYS, PROD_KEYS, SHEETS } from '../constants/schema';
import { parseDateVal } from '../utils/formatters';

export function useProductionData() {
  const [data, setData] = useState({});
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState({ from: null, to: null });

  const mapRowToMatrix = (row, key) => {
    const cfg = SHEETS[key];
    if (!cfg || !cfg.headers) return Object.values(row);

    const arr = new Array(cfg.headers.length).fill('');
    const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    Object.entries(row).forEach(([colName, val]) => {
      if (colName === 'Sync_Status' || colName === 'created_at' || colName === 'row_hash') return;
      const colClean = clean(colName);
      const idx = cfg.headers.findIndex(h => clean(h) === colClean);
      if (idx !== -1) {
        arr[idx] = val;
      }
    });

    if (!arr[cfg.i.id]) {
      arr[cfg.i.id] = row.id || row.id_ctp || row.id_ctcp || row.id_screen || row.id_flexo || row.id_etching || '-';
    }
    return arr;
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    const newData = {};
    const newStatus = {};

    try {
      await Promise.all(
        ALL_KEYS.map(async (k) => {
          try {
            const rows = await fetchAllRows(k);
            if (k === 'db_user') {
              newData[k] = (rows || []).map(r => [
                String(r.username || r.user || '').trim(),
                String(r.role || 'USER').trim(),
                String(r.password || '').trim(),
                String(r.id_user || r.id || '').trim()
              ]);
            } else {
              newData[k] = (rows || []).map(row => (Array.isArray(row) ? row : mapRowToMatrix(row, k)));
            }
            newStatus[k] = newData[k].length ? 'live' : 'empty';
          } catch (e) {
            newData[k] = [];
            newStatus[k] = 'fail';
          }
        })
      );

      setData(newData);
      setStatus(newStatus);

      // Inisialisasi Periode Tanggal Berdasarkan Transaksi Terakhir
      const allTimestamps = [];
      PROD_KEYS.forEach(k => {
        const cfg = SHEETS[k];
        if (cfg && cfg.i && newData[k]) {
          newData[k].forEach(r => {
            const d = parseDateVal(r[cfg.i.date]);
            if (d && !isNaN(d.getTime())) {
              allTimestamps.push(d.getTime());
            }
          });
        }
      });

      if (allTimestamps.length > 0) {
        const maxTime = Math.max(...allTimestamps);
        const minTime = Math.min(...allTimestamps);
        const maxDate = new Date(maxTime);
        const minDate = new Date(minTime);
        const startOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

        setPeriod({
          from: startOfMonth < minDate ? minDate : startOfMonth,
          to: maxDate
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return { data, status, loading, period, setPeriod, reload: loadAll };
}
