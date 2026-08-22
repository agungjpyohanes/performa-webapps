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
      ganti: 9,      // plate_ganti (kuantiti)
      baik: 10,     // plate_baik (good)
      rusak: 11,    // plate_rusak (reject)
      shift: 15,
      op: 16,       // nama_op
      po: 17        // nama_po
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
      ganti: 9,      // plate_ganti
      baik: 10,     // plate_baik
      rusak: 11,    // plate_rusak
      shift: 15,
      op: 16,       // nama_op
      po: -1        // CTP tidak memiliki kolom nama_po
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
      baik: 7,      // jumlah_screen_bagus
      rusak: 8,     // jumlah_screen_rusak
      ganti: 9,     // jumlah_screen_ganti
      shift: 12,
      op: 13,       // nama_op
      po: -1        // Screen tidak memiliki kolom nama_po
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
      tebal: 7,     // tebal_flexo
      mesin_cetak: 8,
      rip: 9,
      baik: 10,     // flexo_bagus
      rusak: 11,    // flexo_rusak
      ganti: 12,    // flexo_ganti
      shift: 15,
      op: 16,       // nama_op
      po: 17        // nama_po
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
      tebal: 7,     // tebal_plate
      baik: 8,      // plate_baik
      rusak: 9,     // plate_rusak
      ganti: 10,    // plate_ganti
      shift: 13,
      op: 14,       // nama_op
      po: 15        // nama_po
    }
  }
};