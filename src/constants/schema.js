// Konfigurasi Skema & Indeks Kolom Database Prepress
export const SHEETS = {
  db_ctcp: {
    label: 'CTCP Offset',
    unit: 'Plate',
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
      permintaan_khusus: 13,
      sebab_rusak: 14,
      shift: 15,
      op: 16,
      po: 17
    }
  },
  db_ctp: {
    label: 'CTP Thermal',
    unit: 'Plate',
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
      permintaan_khusus: 13,
      sebab_rusak: 14,
      shift: 15,
      op: 16,
      po: -1
    }
  },
  db_screen: {
    label: 'Screen Printing',
    unit: 'Screen',
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
      sebab_ganti: 11,
      shift: 12,
      op: 13,
      po: -1
    }
  },
  db_flexo: {
    label: 'Flexography',
    unit: 'Plate',
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
      sebab_ganti: 14,
      shift: 15,
      op: 16,
      po: 17
    }
  },
  db_etching: {
    label: 'Etching Plate',
    unit: 'Plate',
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
      sebab_ganti: 12,
      shift: 13,
      op: 14,
      po: 15
    }
  }
};

// Konfigurasi Overview Sets untuk Ringkasan Global
export const OVER_SETS = [
  { key: 'db_ctcp', label: 'CTCP Offset', unit: 'Plate', color: '#3b82f6' },
  { key: 'db_ctp', label: 'CTP Thermal', unit: 'Plate', color: '#06b6d4' },
  { key: 'db_screen', label: 'Screen Printing', unit: 'Screen', color: '#f59e0b' },
  { key: 'db_flexo', label: 'Flexography', unit: 'Plate', color: '#10b981' },
  { key: 'db_etching', label: 'Etching Plate', unit: 'Plate', color: '#8b5cf6' }
];

// Konfigurasi Link/Form Input Entry Data
export const FORMS = {
  db_ctcp: {
    title: 'Form Input CTCP Offset',
    desc: 'Input laporan harian produksi plate CTCP',
    url: ''
  },
  db_ctp: {
    title: 'Form Input CTP Thermal',
    desc: 'Input laporan harian produksi plate CTP',
    url: ''
  },
  db_screen: {
    title: 'Form Input Screen Printing',
    desc: 'Input laporan harian afdruk & pembuatan screen',
    url: ''
  },
  db_flexo: {
    title: 'Form Input Flexography',
    desc: 'Input laporan harian pembuatan plate flexo',
    url: ''
  },
  db_etching: {
    title: 'Form Input Etching Plate',
    desc: 'Input laporan harian proses etching plate',
    url: ''
  }
};

// Kategori JOP
export const JOP_CATS = [
  ['O', 'Offset'],
  ['F', 'Flexo'],
  ['S', 'Screen'],
  ['E', 'Etching'],
  ['D', 'Digital']
];

// Warna Palette Kategori untuk Visualisasi / Chart
export const CAT_COLORS = {
  Offset: '#3b82f6',
  Flexo: '#10b981',
  Screen: '#f59e0b',
  Etching: '#8b5cf6',
  Digital: '#ec4899',
  Lainnya: '#64748b'
};

// Kunci Lini Produksi
export const PROD_KEYS = [
  'db_ctcp',
  'db_ctp',
  'db_screen',
  'db_flexo',
  'db_etching'
];

// Semua Kunci Sheet
export const ALL_KEYS = [
  'db_ctcp',
  'db_ctp',
  'db_screen',
  'db_flexo',
  'db_etching'
];