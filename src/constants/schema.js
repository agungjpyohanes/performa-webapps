export const SHEETS = {
  db_ctcp: {
    label: 'CTCP Offset',
    unit: 'Plate',
    color: '#8b5cf6',
    i: {
      id: 0,
      jop: 1,
      nojop: 2,
      noplate: 3,
      date: 4,
      mesin_expose: 5,
      mesin_cetak: 6,
      kertas: 7,
      baru: 8,
      ganti: 9,
      baik: 10,
      rusak: 11,
      sebab_ganti: 12,
      penyGanti: 12,
      permintaan_khusus: 13,
      sebab_rusak: 14,
      penyRusak: 14,
      shift: 15,
      op: 16,
      po: 17
    },
    cards: {
      baik: 'Total Plate Baik (pcs)',
      rusak: 'Total Plate Rusak (pcs)',
      ganti: 'Total Plate Ganti (pcs)',
      pakai: 'Total Penggunaan Plate (pcs)'
    }
  },
  db_ctp: {
    label: 'CTP Thermal',
    unit: 'Plate',
    color: '#10b981',
    i: {
      id: 0,
      jop: 1,
      nojop: 2,
      noplate: 3,
      date: 4,
      mesin_expose: 5,
      mesin_cetak: 6,
      kertas: 7,
      baru: 8,
      ganti: 9,
      baik: 10,
      rusak: 11,
      sebab_ganti: 12,
      penyGanti: 12,
      permintaan_khusus: 13,
      sebab_rusak: 14,
      penyRusak: 14,
      shift: 15,
      op: 16,
      po: -1
    },
    cards: {
      baik: 'Total Plate Baik (pcs)',
      rusak: 'Total Plate Rusak (pcs)',
      ganti: 'Total Plate Ganti (pcs)',
      pakai: 'Total Penggunaan Plate (pcs)'
    }
  },
  db_screen: {
    label: 'Screen Printing',
    unit: 'Screen',
    color: '#06b6d4',
    i: {
      id: 0,
      jop: 1,
      nojop: 2,
      nob: 3,
      tipe: 4,
      status: 5,
      date: 6,
      baik: 7,
      rusak: 8,
      ganti: 9,
      sebab_rusak: 10,
      penyRusak: 10,
      sebab_ganti: 11,
      penyGanti: 11,
      shift: 12,
      op: 13,
      po: -1
    },
    cards: {
      baik: 'Total Screen Baik (pcs)',
      rusak: 'Total Screen Rusak (pcs)',
      ganti: 'Total Screen Ganti (pcs)',
      pakai: 'Total Penggunaan Screen (pcs)'
    }
  },
  db_flexo: {
    label: 'Flexography',
    unit: 'Plate',
    color: '#6366f1',
    i: {
      id: 0,
      jop: 1,
      nojop: 2,
      nob: 3,
      status: 4,
      date: 5,
      lpi: 6,
      tebal: 7,
      mesin_cetak: 8,
      rip: 9,
      baik: 10,
      rusak: 11,
      ganti: 12,
      sebab_rusak: 13,
      penyRusak: 13,
      sebab_ganti: 14,
      penyGanti: 14,
      shift: 15,
      op: 16,
      po: 17
    },
    cards: {
      baik: 'Total Flexo Baik (pcs)',
      rusak: 'Total Flexo Rusak (pcs)',
      ganti: 'Total Flexo Ganti (pcs)',
      pakai: 'Total Penggunaan Flexo (pcs)'
    }
  },
  db_etching: {
    label: 'Etching Plate',
    unit: 'Plate',
    color: '#f59e0b',
    i: {
      id: 0,
      jop: 1,
      nojop: 2,
      nob: 3,
      tipe: 4,
      status: 5,
      date: 6,
      tebal: 7,
      baik: 8,
      rusak: 9,
      ganti: 10,
      sebab_rusak: 11,
      penyRusak: 11,
      sebab_ganti: 12,
      penyGanti: 12,
      shift: 13,
      op: 14,
      po: 15
    },
    cards: {
      baik: 'Total Etching Baik (pcs)',
      rusak: 'Total Etching Rusak (pcs)',
      ganti: 'Total Etching Ganti (pcs)',
      pakai: 'Total Penggunaan Etching (pcs)'
    }
  }
};

export const OVER_SETS = [
  { key: 'db_ctcp', label: 'CTCP Offset', unit: 'Plate', color: '#8b5cf6' },
  { key: 'db_ctp', label: 'CTP Thermal', unit: 'Plate', color: '#10b981' },
  { key: 'db_screen', label: 'Screen Printing', unit: 'Screen', color: '#06b6d4' },
  { key: 'db_flexo', label: 'Flexography', unit: 'Plate', color: '#6366f1' },
  { key: 'db_etching', label: 'Etching Plate', unit: 'Plate', color: '#f59e0b' }
];

export const FORMS = {
  db_ctcp: { title: 'Form Input CTCP Offset', desc: 'Input laporan harian produksi plate CTCP', url: '' },
  db_ctp: { title: 'Form Input CTP Thermal', desc: 'Input laporan harian produksi plate CTP', url: '' },
  db_screen: { title: 'Form Input Screen Printing', desc: 'Input laporan harian afdruk & pembuatan screen', url: '' },
  db_flexo: { title: 'Form Input Flexography', desc: 'Input laporan harian pembuatan plate flexo', url: '' },
  db_etching: { title: 'Form Input Etching Plate', desc: 'Input laporan harian proses etching plate', url: '' }
};

export const JOP_CATS = [
  ['O', 'Offset'],
  ['F', 'Flexo'],
  ['S', 'Screen'],
  ['E', 'Etching'],
  ['D', 'Digital']
];

export const CAT_COLORS = {
  Offset: '#8b5cf6',
  Flexo: '#6366f1',
  Screen: '#06b6d4',
  Etching: '#f59e0b',
  Digital: '#ec4899',
  Lainnya: '#64748b'
};

export const PROD_KEYS = ['db_ctcp', 'db_ctp', 'db_screen', 'db_flexo', 'db_etching'];
export const ALL_KEYS = ['db_ctcp', 'db_ctp', 'db_screen', 'db_flexo', 'db_etching', 'db_user'];
