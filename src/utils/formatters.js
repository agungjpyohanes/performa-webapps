// Konversi aman nilai ke angka
export const num = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  const cleaned = String(v).replace(/[^0-9.-]+/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

// Ambil teks sel matriks dengan aman
export const cell = (row, idx) => {
  if (!row || !Array.isArray(row) || idx === undefined || idx < 0 || idx >= row.length) {
    return '';
  }
  const val = row[idx];
  return val === null || val === undefined ? '' : String(val);
};

// Parser Tanggal Universal (Mendukung Supabase ISO, Timestamp, & String)
export const parseDateVal = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  // Jika string format ISO atau Timestamp (YYYY-MM-DD...)
  if (typeof val === 'string') {
    const s = val.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const parts = s.substring(0, 10).split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return isNaN(d.getTime()) ? null : d;
    }
    // Jika format DD/MM/YYYY atau DD-MM-YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(s)) {
      const parts = s.split(/[\/\-]/);
      const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // Jika epoch timestamp
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

// Normalisasi ke awal hari (00:00:00.000)
export const startOfDay = (d) => {
  if (!d) return null;
  const dateObj = d instanceof Date ? new Date(d) : parseDateVal(d);
  if (!dateObj || isNaN(dateObj.getTime())) return null;
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

// Normalisasi ke akhir hari (23:59:59.999)
export const endOfDay = (d) => {
  if (!d) return null;
  const dateObj = d instanceof Date ? new Date(d) : parseDateVal(d);
  if (!dateObj || isNaN(dateObj.getTime())) return null;
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

// Format tanggal tampilan Indonesia (Contoh: 22 Agu 2026)
export const fmtDate = (d) => {
  const parsed = parseDateVal(d);
  if (!parsed) return '-';
  return parsed.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Format rentang periode tampilan
export const fmtPeriodRange = (from, to) => {
  if (!from && !to) return 'Semua Periode';
  const f = parseDateVal(from);
  const t = parseDateVal(to);
  if (f && t) return `${fmtDate(f)} — ${fmtDate(t)}`;
  if (f) return `Sejak ${fmtDate(f)}`;
  if (t) return `Hingga ${fmtDate(t)}`;
  return 'Semua Periode';
};
