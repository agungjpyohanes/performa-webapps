import { useState, useEffect, useCallback } from 'react';
import { fetchAllRows } from '../services/supabase';
import { ALL_KEYS, PROD_KEYS, SHEETS } from '../constants/schema';
import { parseDateVal, startOfDay, endOfDay } from '../utils/formatters';

export function useProductionData() {
  const [data, setData] = useState({});
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState({ from: null, to: null });

  // Mapping baris objek Supabase ke dalam index array schema
  const mapRowToMatrix = (row, key) => {
    const cfg = SHEETS[key];
    if (!cfg || !cfg.headers) return [];

    const arr = new Array(cfg.headers.length).fill('');
    const clean = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Cari nilai berdasarkan kecocokan key kolom database Supabase
    Object.entries(row).forEach(([colName, val]) => {
      const colClean = clean(colName);
      let idx = cfg.headers.findIndex((h) => clean(h) === colClean);

      if (idx === -1 && cfg.i) {
        if (colClean.includes('id') && !colClean.includes('penyebab') && !colClean.includes('sebab')) idx = cfg.i.id;
        else if (colClean.includes('nojop') || colClean.includes('no_jop')) idx = cfg.i.nojop;
        else if (colClean.includes('jopname') || colClean.includes('jop_name') || colClean === 'jop') idx = cfg.i.jop;
        else if (['tanggal', 'date', 'tgl', 'created_at', 'tglexpose'].some((t) => colClean.includes(t))) idx = cfg.i.date;
        else if (colClean.includes('baik') || colClean.includes('bagus') || colClean === 'good') idx = cfg.i.baik;
        else if (colClean.includes('rusak') || colClean === 'reject') idx = cfg.i.rusak;
        else if (colClean.includes('ganti') || colClean === 'replace') idx = cfg.i.ganti;
        else if (colClean.includes('sebabrusak') || colClean.includes('penyebabrusak')) idx = cfg.i.penyRusak;
        else if (colClean.includes('sebabganti') || colClean.includes('penyebabganti')) idx = cfg.i.penyGanti;
        else if (colClean.includes('status')) idx = cfg.i.status !== undefined ? cfg.i.status : -1;
        else if (colClean.includes('shift')) idx = cfg.i.shift;
        else if (colClean.includes('namaop') || colClean.includes('nama_op') || colClean === 'op') idx = cfg.i.op;
        else if (colClean.includes('namapo') || colClean.includes('nama_po') || colClean === 'po') idx = cfg.i.po !== undefined ? cfg.i.po : -1;
        else if (colClean.includes('tebal')) idx = cfg.i.tebal !== undefined ? cfg.i.tebal : -1;
        else if (colClean.includes('tipe')) idx = cfg.i.tipe !== undefined ? cfg.i.tipe : -1;
      }

      if (idx !== -1 && idx < arr.length) {
        arr[idx] = val;
      }
    });

    if (cfg.i && !arr[cfg.i.id]) {
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
              newData[k] = (rows || []).map((r) => [
                String(r.username || r.user || '').trim(),
                String(r.role || 'USER').trim(),
                String(r.password || '').trim(),
                String(r.id_user || r.id || '').trim()
              ]);
            } else {
              newData[k] = (rows || []).map((row) => mapRowToMatrix(row, k));
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

      // Hitung tanggal minimum dan maksimum aktual dari seluruh data
      const allTimestamps = [];
      PROD_KEYS.forEach((k) => {
        const cfg = SHEETS[k];
        if (cfg && cfg.i && newData[k]) {
          newData[k].forEach((r) => {
            const d = parseDateVal(r[cfg.i.date]);
            if (d && !isNaN(d.getTime())) {
              allTimestamps.push(d.getTime());
            }
          });
        }
      });

      if (allTimestamps.length > 0) {
        const maxDate = new Date(Math.max(...allTimestamps));
        const minDate = new Date(Math.min(...allTimestamps));
        const startOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

        setPeriod({
          from: startOfMonth < minDate ? minDate : startOfMonth,
          to: maxDate
        });
      }
    } catch (err) {
      console.error('Fatal load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return { data, status, loading, period, setPeriod, reload: loadAll };
}
