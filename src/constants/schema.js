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

// Kategori JOP
export const JOP_CATS = [
  ['O', 'Offset'],
  ['F', 'Flexo'],
  ['S', 'Screen'],
  ['E', 'Etching'],
  ['D', 'Digital']
];

// Kunci Lini Produksi
export const PROD_KEYS = [
  'db_ctcp',
  'db_ctp',
  'db_screen',
  'db_flexo',
  'db_etching'
];

// Semua Kunci Sheet Termasuk Transaksi Database
export const ALL_KEYS = [
  'db_ctcp',
  'db_ctp',
  'db_screen',
  'db_flexo',
  'db_etching'
];