import React from 'react';
import { FORMS, SHEETS, PROD_KEYS } from '../../constants/schema';
import { FileText, ExternalLink, Send } from 'lucide-react';

export default function FormsView({ onToast }) {
  const formList = [
    {
      key: 'db_ctcp',
      title: 'Form Permintaan Plate CTCP Offset',
      desc: 'Formulir input permintaan pembuatan plate CTCP mesin offset',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-CTCP/viewform',
      color: 'border-l-purple-500'
    },
    {
      key: 'db_ctp',
      title: 'Form Permintaan Plate CTP Thermal',
      desc: 'Formulir input permintaan pembuatan plate CTP Thermal',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-CTP/viewform',
      color: 'border-l-emerald-500'
    },
    {
      key: 'db_screen',
      title: 'Form Permintaan Screen Printing',
      desc: 'Formulir input permintaan afdruk & pembuatan screen sablon',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-SCREEN/viewform',
      color: 'border-l-cyan-500'
    },
    {
      key: 'db_flexo',
      title: 'Form Permintaan Plate Flexography',
      desc: 'Formulir input pembuatan plate polymer cetak flexo',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-FLEXO/viewform',
      color: 'border-l-indigo-500'
    },
    {
      key: 'db_etching',
      title: 'Form Permintaan Etching Plate',
      desc: 'Formulir input permintaan proses pembuatan etching plate',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-ETCHING/viewform',
      color: 'border-l-amber-500'
    }
  ];

  return (
    <div className="space-y-5 anim-in">
      <div className="card p-5 bg-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge bg-blue-500/10 text-blue-600 font-bold">PORTAL FORMULIR</span>
            <span className="text-xs text-slate-400">· Input Online Prepress</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 mt-1">
            Formulir Permintaan Produksi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih formulir divisi di bawah untuk membuka input permintaan kerja ke Prepress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formList.map((f) => (
          <div
            key={f.key}
            className={`card p-5 bg-white border-l-4 ${f.color} flex flex-col justify-between hover:shadow-md transition`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {SHEETS[f.key]?.unit || 'Unit'}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-800">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary text-xs !py-1.5 !px-3 font-semibold flex items-center gap-1.5"
              >
                <span>Buka Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
