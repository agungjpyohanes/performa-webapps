export const JOP_CATS = [
  ['0', 'Sticker Flexo'],
  ['1', 'School Supply'],
  ['2', 'Office Supply'],
  ['3', 'Kertas Surat'],
  ['4', 'Envelope'],
  ['5', 'Gift Wrap'],
  ['6', 'Others'],
  ['7', 'Jasa'],
  ['8', 'Export'],
  ['9', 'Carton Box']
];

export const CAT_COLORS = [
  '#06b6d4', '#6366f1', '#f59e0b', '#8b5cf6', '#10b981',
  '#f97316', '#3b82f6', '#84cc16', '#ef4444', '#64748b'
];

export const FORMS = [
  { key: 'db_ctcp', label: 'CTCP', url: 'https://forms.gle/sjXvX1mQLmfconpaA' },
  { key: 'db_ctp', label: 'CTP', url: 'https://forms.gle/Y2iumgVVMk8Ph8Ez8' },
  { key: 'db_screen', label: 'SCREEN', url: 'https://forms.gle/KUBCCpbE90cRKUgC9' },
  { key: 'db_flexo', label: 'FLEXO', url: 'https://forms.gle/yux9WXnftA4isDW77' },
  { key: 'db_etching', label: 'ETCHING', url: 'https://forms.gle/JLu6gVW3qcCv5xvR8' }
];

export const SHEETS = {
  db_ctcp: {
    label: 'CTCP', color: '#8b5cf6', unit: 'Plate', desc: 'Computer-to-Conventional Plate',
    headers: ['id_ctcp','jop_name','no_jop','no_plate','date','mesin_expose','mesin_cetak','jenis_kertas','plate_baru','plate_ganti','plate_baik','plate_rusak','sebab_ganti','permintaan_khusus','sebab_rusak','shift','nama_op','nama_po'],
    i: { id:0, jop:1, nojop:2, date:4, baik:10, rusak:11, ganti:9, penyGanti:12, penyRusak:14, shift:15, op:16 },
    dataCols: [0, 1, 2, 3, 4],
    cards: { baik: 'Total Plate Baik', rusak: 'Total Plate Rusak', ganti: 'Total Plate Ganti', pakai: 'Total Penggunaan Plate' },
    charts: { daily: 'Penggunaan Plate Harian', extra: { kind: 'bar', title: 'Mesin Expose', col: 5 } }
  },
  db_ctp: {
    label: 'CTP', color: '#10b981', unit: 'Plate', desc: 'Computer-to-Plate',
    headers: ['id_ctp','jop_name','no_jop','no_plate','date','mesin_expose','mesin_cetak','jenis_kertas','plate_baru','plate_ganti','plate_baik','plate_rusak','sebab_ganti','permintaan_khusus','sebab_rusak','shift','nama_op'],
    i: { id:0, jop:1, nojop:2, date:4, baik:10, rusak:11, ganti:9, penyGanti:12, penyRusak:14, shift:15, op:16 },
    dataCols: [0, 1, 2, 3, 4],
    cards: { baik: 'Total Plate Baik', rusak: 'Total Plate Rusak', ganti: 'Total Plate Ganti', pakai: 'Total Penggunaan Plate' },
    charts: { daily: 'Penggunaan Plate Harian', extra: null }
  },
  db_screen: {
    label: 'SCREEN', color: '#06b6d4', unit: 'Screen', desc: 'Screen / sablon',
    headers: ['id_screen','jop_name','no_jop','no_b','tipe','status','date','jumlah_screen_bagus','jumlah_screen_rusak','jumlah_screen_ganti','sebab_rusak','sebab_ganti','shift','nama_op'],
    i: { id:0, jop:1, nojop:2, tipe:4, status:5, date:6, baik:7, rusak:8, ganti:9, penyRusak:10, penyGanti:11, shift:12, op:13 },
    dataCols: [0, 1, 2, 3, 4, 6],
    cards: { baik: 'Total Screen Baik', rusak: 'Total Screen Rusak', ganti: 'Total Screen Ganti', pakai: 'Total Produksi Screen' },
    charts: { daily: 'Produksi Screen Harian', extra: { kind: 'donut', title: 'Kategori Jenis Screen', col: 4 } }
  },
  db_flexo: {
    label: 'FLEXO', color: '#6366f1', unit: 'Flexo', desc: 'Flexography',
    headers: ['id_flexo','jop_name','no_jop','no_b','status','date','lpi','tebal_flexo','mesin_cetak','posisi_rip','flexo_bagus','flexo_rusak','flexo_ganti','sebab_rusak','sebab_ganti','shift','nama_op','nama_po'],
    i: { id:0, jop:1, nojop:2, status:4, date:5, lpi:6, tebal:7, baik:10, rusak:11, ganti:12, penyRusak:13, penyGanti:14, shift:15, op:16 },
    dataCols: [0, 1, 2, 3, 5],
    cards: { baik: 'Total Flexo Baik', rusak: 'Total Flexo Rusak', ganti: 'Total Flexo Ganti', pakai: 'Total Produksi Flexo' },
    charts: { daily: 'Produksi Flexo Harian', extra: { kind: 'donut', title: 'Kategori Tebal Flexo', col: 7 } }
  },
  db_etching: {
    label: 'ETCHING', color: '#f59e0b', unit: 'Plate', desc: 'Plate etching',
    headers: ['id_etching','jop_name','no_jop','no_b','tipe','status','date','tebal_plate','plate_baik','plate_rusak','plate_ganti','sebab_rusak','sebab_ganti','shift','nama_op','nama_po'],
    i: { id:0, jop:1, nojop:2, tipe:4, status:5, date:6, tebal:7, baik:8, rusak:9, ganti:10, penyRusak:11, penyGanti:12, shift:13, op:14 },
    dataCols: [0, 1, 2, 3, 4, 6],
    cards: { baik: 'Total Plate Baik', rusak: 'Total Plate Rusak', ganti: 'Total Plate Ganti', pakai: 'Total Produksi Plate' },
    charts: { daily: 'Produksi Plate Harian', extra: { kind: 'donut', title: 'Jenis Plate', col: 4 } }
  }
};

export const PROD_KEYS = ['db_ctcp', 'db_ctp', 'db_screen', 'db_flexo', 'db_etching'];
export const ALL_KEYS = ['db_user', ...PROD_KEYS];
export const OVER_SETS = [
  { key: 'db_screen', label: 'SCREEN', color: '#06b6d4' },
  { key: 'db_flexo', label: 'FLEXO', color: '#6366f1' },
  { key: 'db_etching', label: 'ETCHING', color: '#f59e0b' }
];