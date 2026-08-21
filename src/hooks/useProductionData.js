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
    const arr = new Array(cfg.headers.length).fill('');
    const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    Object.entries(row).forEach(([colName, val]) => {
      if (colName === 'Sync_Status' || colName === 'created_at' || colName === 'row_hash') return;
      const colClean = clean(colName);
      let idx = cfg.headers.findIndex(h => clean(h) === colClean);

      if (idx === -1) {
        if (colClean.includes('id') && !colClean.includes('penyebab') && !colClean.includes('sebab')) idx = cfg.i.id;
        else if (colClean.includes('nojop') || colClean.includes('no_jop')) idx = cfg.i.nojop;
        else if (colClean.includes('jopname') || colClean.includes('jop_name')) idx = cfg.i.jop;
        else if (['tanggal', 'date', 'tgl', 'created_at'].includes(colClean)) idx = cfg.i.date;
        else if (colClean.includes('baik') || colClean.includes('bagus')) idx = cfg.i.baik;
        else if (colClean.includes('rusak')) idx = cfg.i.rusak;
        else if (colClean.includes('ganti')) idx = cfg.i.ganti;
        else if (colClean.includes('sebabrusak') || colClean.includes('penyebabrusak')) idx = cfg.i.penyRusak;
        else if (colClean.includes('sebabganti') || colClean.includes('penyebabganti')) idx = cfg.i.penyGanti;
        else if (colClean.includes('status')) idx = cfg.i.status !== undefined ? cfg.i.status : -1;
        else if (colClean.includes('shift')) idx = cfg.i.shift;
        else if (colClean.includes('namaop') || colClean.includes('nama_op')) idx = cfg.i.op;
        else if (colClean.includes('tebal')) idx = cfg.i.tebal !== undefined ? cfg.i.tebal : -1;
        else if (colClean.includes('tipe')) idx = cfg.i.tipe !== undefined ? cfg.i.tipe : -1;
      }

      if (idx !== -1 && idx < arr.length) {
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

    await Promise.all(ALL_KEYS.map(async (k) => {
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
          newData[k] = (rows || []).map(row => mapRowToMatrix(row, k));
        }
        newStatus[k] = newData[k].length ? 'live' : 'empty';
      } catch (e) {
        newData[k] = [];
        newStatus[k] = 'fail';
      }
    }));

    setData(newData);
    setStatus(newStatus);
    setLoading(false);

    const allDates = [];
    PROD_KEYS.forEach(k => {
      const cfg = SHEETS[k];
      (newData[k] || []).forEach(r => {
        const d = parseDateVal(r[cfg.i.date]);
        if (d) allDates.push(d);
      });
    });

    if (allDates.length > 0) {
      const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const startOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      setPeriod({
        from: startOfMonth < minDate ? minDate : startOfMonth,
        to: maxDate
      });
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return { data, status, loading, period, setPeriod, reload: loadAll };
}