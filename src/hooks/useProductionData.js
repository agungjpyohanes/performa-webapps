import { useState, useEffect, useCallback } from 'react';
import { fetchAllRows } from '../services/supabase';
import { ALL_KEYS, PROD_KEYS, SHEETS } from '../constants/schema';
import { parseDateVal } from '../utils/formatters';

export function useProductionData() {
  const [data, setData] = useState({});
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState({ from: null, to: null });

  // Mapping eksplisit per kolom Supabase ke indeks array
  const mapSupabaseRowToMatrix = (row, key) => {
    if (Array.isArray(row)) return row;

    const find = (...keys) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null) return row[k];
      }
      return '';
    };

    if (key === 'db_ctcp') {
      return [
        find('id_ctcp', 'id', 'id_trx'),
        find('jop_name', 'jop', 'nama_jop'),
        find('no_jop', 'nojop'),
        find('no_plate', 'noplate', 'nomor_plate'),
        find('date', 'tanggal', 'tgl', 'created_at'),
        find('mesin_expose', 'mesin'),
        find('mesin_cetak'),
        find('jenis_kertas', 'kertas'),
        find('plate_baru', 'baru', 'jum_baru'),
        find('plate_ganti', 'ganti', 'jum_ganti'),
        find('plate_baik', 'baik', 'jum_baik', 'good'),
        find('plate_rusak', 'rusak', 'jum_rusak', 'reject'),
        find('sebab_ganti', 'penyebab_ganti'),
        find('permintaan_khusus', 'keterangan'),
        find('sebab_rusak', 'penyebab_rusak'),
        find('shift'),
        find('nama_op', 'op', 'operator'),
        find('nama_po', 'po')
      ];
    }

    if (key === 'db_ctp') {
      return [
        find('id_ctp', 'id', 'id_trx'),
        find('jop_name', 'jop', 'nama_jop'),
        find('no_jop', 'nojop'),
        find('no_plate', 'noplate'),
        find('date', 'tanggal', 'tgl', 'created_at'),
        find('mesin_expose', 'mesin'),
        find('mesin_cetak'),
        find('jenis_kertas', 'kertas'),
        find('plate_baru', 'baru'),
        find('plate_ganti', 'ganti'),
        find('plate_baik', 'baik', 'good'),
        find('plate_rusak', 'rusak', 'reject'),
        find('sebab_ganti', 'penyebab_ganti'),
        find('permintaan_khusus', 'keterangan'),
        find('sebab_rusak', 'penyebab_rusak'),
        find('shift'),
        find('nama_op', 'op', 'operator'),
        ''
      ];
    }

    if (key === 'db_screen') {
      return [
        find('id_screen', 'id'),
        find('jop_name', 'jop', 'nama_jop'),
        find('no_jop', 'nojop'),
        find('no_b', 'nob'),
        find('tipe', 'tipe_screen', 'jenis_screen'),
        find('status'),
        find('date', 'tanggal', 'tgl', 'created_at'),
        find('jumlah_screen_bagus', 'screen_bagus', 'screen_baik', 'baik', 'good'),
        find('jumlah_screen_rusak', 'screen_rusak', 'rusak', 'reject'),
        find('jumlah_screen_ganti', 'screen_ganti', 'ganti', 'replace'),
        find('sebab_rusak', 'penyebab_rusak'),
        find('sebab_ganti', 'penyebab_ganti'),
        find('shift'),
        find('nama_op', 'op', 'operator'),
        ''
      ];
    }

    if (key === 'db_flexo') {
      return [
        find('id_flexo', 'id'),
        find('jop_name', 'jop', 'nama_jop'),
        find('no_jop', 'nojop'),
        find('no_b', 'nob'),
        find('status'),
        find('date', 'tanggal', 'tgl', 'created_at'),
        find('lpi'),
        find('tebal_flexo', 'tebal'),
        find('mesin_cetak'),
        find('posisi_rip', 'rip'),
        find('flexo_bagus', 'flexo_baik', 'baik', 'good'),
        find('flexo_rusak', 'rusak', 'reject'),
        find('flexo_ganti', 'ganti', 'replace'),
        find('sebab_rusak', 'penyebab_rusak'),
        find('sebab_ganti', 'penyebab_ganti'),
        find('shift'),
        find('nama_op', 'op', 'operator'),
        find('nama_po', 'po')
      ];
    }

    if (key === 'db_etching') {
      return [
        find('id_etching', 'id'),
        find('jop_name', 'jop', 'nama_jop'),
        find('no_jop', 'nojop'),
        find('no_b', 'nob'),
        find('tipe', 'tipe_plate'),
        find('status'),
        find('date', 'tanggal', 'tgl', 'created_at'),
        find('tebal_plate', 'tebal'),
        find('plate_baik', 'baik', 'good'),
        find('plate_rusak', 'rusak', 'reject'),
        find('plate_ganti', 'ganti', 'replace'),
        find('sebab_rusak', 'penyebab_rusak'),
        find('sebab_ganti', 'penyebab_ganti'),
        find('shift'),
        find('nama_op', 'op', 'operator'),
        find('nama_po', 'po')
      ];
    }

    return Object.values(row);
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
              newData[k] = (rows || []).map((row) => mapSupabaseRowToMatrix(row, k));
            }
            newStatus[k] = newData[k].length ? 'live' : 'empty';
          } catch (e) {
            console.error(`Error loading table ${k}:`, e);
            newData[k] = [];
            newStatus[k] = 'fail';
          }
        })
      );

      setData(newData);
      setStatus(newStatus);

      // Hitung rentang tanggal minimum & maksimum aktual dari database
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return { data, status, loading, period, setPeriod, reload: loadAll };
}
