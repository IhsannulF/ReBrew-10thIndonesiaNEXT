"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export const EsgCertificateCard: React.FC = () => {
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleDownload = () => {
    setIsDownloaded(true);
    setTimeout(() => {
      window.print();
      setIsDownloaded(false);
    }, 500);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-[#adedd3] bg-gradient-to-br from-white via-[#f0fdf4] to-[#adedd3]/30 p-6 sm:p-7 shadow-xs w-full">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#006c49] text-white shadow-sm">
          <GoogleIcon name="workspace_premium" size={32} filled />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006c49]">
              Sertifikasi Resmi ReBrew 2026
            </span>
            <span className="text-[10px] font-bold bg-[#eff4ff] text-[#006c49] border border-[#adedd3] px-2 py-0.5 rounded-md">
              Terverifikasi AI
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#0b1c30] mt-0.5">
            Sertifikat Eco-Partner & Laporan Dampak ESG
          </h3>
          <p className="text-xs text-[#3c4a42] mt-1 max-w-xl leading-relaxed">
            Kafe Anda telah memenuhi kriteria kepatuhan daur ulang Permen LHK No. 75/2019 dan siap dipublikasikan sebagai materi branding hijau ke konsumen Gen-Z.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloaded}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#2b6954] transition-all shadow-sm active:scale-95"
        >
          <GoogleIcon name="download" size={16} />
          <span>{isDownloaded ? "Menyiapkan PDF..." : "Unduh Sertifikat PDF"}</span>
        </button>
      </div>
    </div>
  );
};
