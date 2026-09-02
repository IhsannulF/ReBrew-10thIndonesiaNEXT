"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { AiDiagnosticAnalysis, AiRecommendation, EcoScoreMetrics } from "@/types/insight";

interface AiInsightReportCardProps {
  cafeName: string;
  ecoMetrics: EcoScoreMetrics;
  diagnostic?: AiDiagnosticAnalysis;
  recommendations: AiRecommendation[];
}

export const AiInsightReportCard: React.FC<AiInsightReportCardProps> = ({
  cafeName,
  ecoMetrics,
  diagnostic,
  recommendations,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-[#006c49]/30 bg-gradient-to-br from-white via-[#f0fdf4] to-[#eff4ff] p-6 sm:p-7 shadow-xs w-full">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#006c49] text-white shadow-sm">
            <GoogleIcon name="analytics" size={30} filled />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006c49]">
                Laporan Hasil Analisis AI
              </span>
              <span className="text-[10px] font-bold bg-[#eff4ff] text-[#006c49] border border-[#adedd3] px-2 py-0.5 rounded-md">
                Google Gemini Model
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0b1c30] mt-0.5">
              Download Laporan Strategis & Diagnostik AI
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <GoogleIcon name="visibility" size={16} />
            <span>Lihat & Unduh Laporan AI</span>
          </button>
        </div>
      </div>

      {/* Modal Preview Laporan Visual AI */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#bbcabf]/40 overflow-hidden animate-fade-in my-8 print:my-0 print:shadow-none print:border-none print:max-w-none print:w-full">
            {/* Header Modal */}
            <div className="relative bg-gradient-to-br from-[#006c49] via-[#005237] to-[#0b1c30] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#006c49] shadow-sm">
                  <GoogleIcon name="auto_awesome" size={26} />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#6ffbbe] font-bold block">
                    ReBrew AI Intelligence Report
                  </span>
                  <h2 className="text-lg font-black text-white">
                    Laporan Diagnostik & Strategi Sirkular
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer print:hidden"
                title="Tutup"
              >
                <GoogleIcon name="close" size={18} />
              </button>
            </div>

            {/* Printable Report Body */}
            <div className="p-6 sm:p-7 flex flex-col gap-5 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-4 text-xs">
              {/* Meta Info Kafe */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30">
                <div>
                  <span className="text-[10px] text-[#6c7a71] uppercase font-bold block">Mitra Kafe:</span>
                  <span className="text-sm font-bold text-[#0b1c30]">{cafeName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6c7a71] uppercase font-bold block">Status Sirkular:</span>
                  <span className="text-xs font-bold text-[#006c49] bg-[#eff4ff] px-2.5 py-0.5 rounded-full border border-[#adedd3]">
                    {ecoMetrics.scoreLabel} ({ecoMetrics.overallScore}/100)
                  </span>
                </div>
              </div>

              {/* Ringkasan Eksekutif */}
              {diagnostic && (
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-[#bbcabf]/30">
                  <span className="font-bold text-[#0b1c30] text-xs flex items-center gap-1.5">
                    <GoogleIcon name="psychology" size={16} className="text-[#006c49]" />
                    Ringkasan Diagnostik Eksekutif:
                  </span>
                  <p className="text-[#3c4a42] leading-relaxed text-[11px]">
                    {diagnostic.executiveSummary}
                  </p>
                </div>
              )}

              {/* 2 Kolom Poin Kunci & Peluang Cuan */}
              {diagnostic && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/20">
                    <span className="font-bold text-[#006c49] block mb-1.5 text-[11px]">
                      Temuan & Kesiapan:
                    </span>
                    <ul className="flex flex-col gap-1 text-[#3c4a42] text-[10px]">
                      {diagnostic.wasteHighlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-[#006c49] font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#fffdf5] border border-[#fde68a]">
                    <span className="font-bold text-[#d97706] block mb-1.5 text-[11px]">
                      Peluang Monetisasi Kas:
                    </span>
                    <ul className="flex flex-col gap-1 text-[#3c4a42] text-[10px]">
                      {diagnostic.revenueOpportunities.map((r, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-[#d97706] font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 4 Rekomendasi Taktis AI */}
              <div className="flex flex-col gap-2.5 pt-1">
                <span className="font-bold text-[#0b1c30] text-xs uppercase tracking-wider">
                  Rekomendasi Tindakan Strategis:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.slice(0, 4).map((rec, idx) => (
                    <div
                      key={rec.id || idx}
                      className="p-3.5 rounded-2xl border border-[#bbcabf]/30 bg-[#f8f9ff] flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#006c49] uppercase">
                          {rec.categoryLabel}
                        </span>
                        <span className="text-[9px] font-bold bg-[#eff4ff] text-[#006c49] px-2 py-0.5 rounded-full border border-[#adedd3]">
                          {rec.impactLabel}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#0b1c30] text-xs">{rec.title}</h4>
                      <p className="text-[10px] text-[#3c4a42] leading-relaxed">
                        {rec.description}
                      </p>
                      {rec.actionSteps && rec.actionSteps.length > 0 && (
                        <div className="mt-1 pt-1 border-t border-[#bbcabf]/20">
                          <span className="text-[9px] font-bold text-[#6c7a71] block mb-0.5">
                            Langkah Eksekusi:
                          </span>
                          <p className="text-[9px] text-[#3c4a42]">
                            1. {rec.actionSteps[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions (Disembunyikan saat Cetak / Simpan PDF) */}
            <div className="flex items-center gap-3 p-5 bg-[#f8f9ff] border-t border-[#bbcabf]/30 print:hidden">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex-1 py-3 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <GoogleIcon name="print" size={16} />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
