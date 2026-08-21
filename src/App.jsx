// Tambahkan handler print preview di dalam App()
const [printPreviewOpen, setPrintPreviewOpen] = useState(false);

const handleExecutePrint = () => {
  setPrintPreviewOpen(false);
  setTimeout(() => window.print(), 250);
};

// Pasang #printHead di atas layout <Header/>:
<div id="printHead">
  <div className="flex items-center gap-3">
    <img className="w-10 h-10" src="https://drive.google.com/thumbnail?id=1lH4lh1q8CrraoC1fMY1q7tf3B0nezFiJ&sz=w512" alt="print logo" />
    <div>
      <div className="font-display font-extrabold text-lg text-slate-900">PERFORMA <span className="text-xs font-semibold text-slate-500">V 1.0</span></div>
      <div className="text-[11px] text-slate-600">
        {viewTitle()} · Periode: {fmtPeriodRange(period.from, period.to)} · Dicetak: {new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} · User: {currentUser?.USER || '-'}
      </div>
    </div>
  </div>
  <div className="flex h-1 mt-3 rounded overflow-hidden">
    <span className="flex-1" style={{ background: '#00aeef' }}></span>
    <span className="flex-1" style={{ background: '#ec008c' }}></span>
    <span className="flex-1" style={{ background: '#ffd400' }}></span>
    <span className="flex-1" style={{ background: '#111' }}></span>
  </div>
</div>