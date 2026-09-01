"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { AiRecommendation, RecommendationCategory } from "@/types/insight";

interface AiRecommendationsListProps {
  recommendations: AiRecommendation[];
  selectedCategory: "all" | RecommendationCategory;
  onSelectCategory: (cat: "all" | RecommendationCategory) => void;
  totalCount: number;
}

export const AiRecommendationsList: React.FC<AiRecommendationsListProps> = ({
  recommendations,
  selectedCategory,
  onSelectCategory,
  totalCount,
}) => {
  const [selectedRecForModal, setSelectedRecForModal] = useState<AiRecommendation | null>(null);

  const categoryFilters: { key: "all" | RecommendationCategory; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "sorting_efficiency", label: "Pemilahan" },
    { key: "upcycling_revenue", label: "Upcycling & Kas" },
    { key: "green_branding", label: "Branding Hijau" },
    { key: "logistics_saving", label: "Logistik" },
  ];

  const getActionHref = (rec: AiRecommendation) => {
    if (rec.actionHref) return rec.actionHref;
    if (rec.category === "upcycling_revenue") return "/dashboard/saldo";
    if (rec.category === "sorting_efficiency" || rec.category === "logistics_saving") return "/dashboard/setor";
    return "/dashboard/riwayat";
  };

  return (
    <>
      <div className="flex flex-col gap-5 rounded-3xl border border-[#bbcabf]/30 bg-white p-6 sm:p-7 shadow-xs w-full">
        {/* Header & Filter Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 border-b border-[#bbcabf]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="tips_and_updates" size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b1c30]">
                Rekomendasi Strategis AI
              </h2>
              <p className="text-xs text-[#3c4a42] mt-0.5">
                Langkah aksi nyata rekomendasi Google Gemini untuk mengoptimalkan perolehan koin dan green branding
              </p>
            </div>
          </div>

          {/* Filter Category Chips - Single Line Clean Row */}
          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap overflow-hidden">
            {categoryFilters.map((tab) => {
              const isActive = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onSelectCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#006c49] text-white shadow-2xs"
                      : "bg-[#f8f9ff] text-[#3c4a42] border border-[#bbcabf]/30 hover:bg-[#eff4ff] hover:text-[#006c49]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid of Minimal, User-Focused Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isHighPriority = rec.priority === "high";

            return (
              <div
                key={rec.id}
                onClick={() => setSelectedRecForModal(rec)}
                className="group flex flex-col justify-between p-5 rounded-2xl border border-[#bbcabf]/40 bg-[#f8f9ff] hover:bg-white hover:border-[#006c49] hover:shadow-md transition-all gap-3.5 cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedRecForModal(rec);
                  }
                }}
              >
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49] group-hover:scale-105 transition-transform">
                      <GoogleIcon name={rec.icon || "auto_awesome"} size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-[#006c49] uppercase tracking-wider block">
                        {rec.categoryLabel}
                      </span>
                      <h3 className="text-sm font-bold text-[#0b1c30] mt-0.5 truncate group-hover:text-[#006c49] transition-colors">
                        {rec.title}
                      </h3>
                    </div>
                  </div>

                  {isHighPriority && (
                    <span className="text-[10px] font-bold bg-[#fff8e1] text-[#92400e] border border-[#fde68a] px-2.5 py-0.5 rounded-full shrink-0">
                      Prioritas Tinggi
                    </span>
                  )}
                </div>

                {/* Description Focused on User Narrative */}
                <p className="text-xs text-[#3c4a42] leading-relaxed line-clamp-3">
                  {rec.description}
                </p>

                {/* Footer Impact & Pop-up Trigger */}
                <div className="flex items-center justify-between pt-3 border-t border-[#bbcabf]/20 gap-2">
                  <span className="text-xs font-bold text-[#006c49] flex items-center gap-1">
                    <GoogleIcon name="bolt" size={15} filled />
                    <span>{rec.impactLabel}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006c49] group-hover:translate-x-0.5 transition-transform">
                    <span>Panduan Eksekusi</span>
                    <GoogleIcon name="arrow_forward" size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pop-Up Modal: Langkah Eksekusi di Kafe */}
      {selectedRecForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedRecForModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-[#bbcabf]/40 overflow-hidden animate-in zoom-in-95 duration-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-[#006c49] via-[#005237] to-[#0b1c30] p-6 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#006c49] shadow-sm">
                  <GoogleIcon name={selectedRecForModal.icon || "auto_awesome"} size={24} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] uppercase tracking-wider text-[#6ffbbe] font-bold block">
                    {selectedRecForModal.categoryLabel}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {selectedRecForModal.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecForModal(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Tutup"
              >
                <GoogleIcon name="close" size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-5 text-xs sm:text-sm">
              {/* Strategic Summary */}
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-[#0b1c30] text-xs uppercase tracking-wider text-[#006c49]">
                  Rangkuman Saran AI:
                </span>
                <p className="text-xs text-[#3c4a42] leading-relaxed bg-[#f8f9ff] p-3.5 rounded-2xl border border-[#bbcabf]/30">
                  {selectedRecForModal.description}
                </p>
              </div>

              {/* Impact Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#eff4ff] to-[#f0fdf4] border border-[#adedd3]">
                <div className="flex items-center gap-2">
                  <GoogleIcon name="trending_up" size={20} className="text-[#006c49]" />
                  <span className="font-bold text-[#0b1c30] text-xs">
                    Estimasi Dampak:
                  </span>
                </div>
                <span className="text-xs font-black text-[#006c49] bg-white px-3 py-1 rounded-xl border border-[#adedd3] shadow-2xs">
                  {selectedRecForModal.impactLabel}
                </span>
              </div>

              {/* Step-by-Step Execution Guide */}
              <div className="flex flex-col gap-2.5">
                <span className="font-bold text-[#0b1c30] text-xs flex items-center gap-1.5">
                  <GoogleIcon name="checklist" size={18} className="text-[#006c49]" />
                  <span>Langkah Eksekusi di Kafe:</span>
                </span>

                {selectedRecForModal.actionSteps && selectedRecForModal.actionSteps.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedRecForModal.actionSteps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-[#f8f9ff] border border-[#bbcabf]/20"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#006c49] text-white text-[11px] font-bold">
                          {sIdx + 1}
                        </span>
                        <span className="text-xs text-[#0b1c30] leading-relaxed">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6c7a71] italic">
                    Terapkan arahan strategis di atas secara bertahap dalam operasional harian kafe Anda.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="p-4 sm:p-5 bg-[#f8f9ff] border-t border-[#bbcabf]/30 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedRecForModal(null)}
                className="px-4 py-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-xs font-bold text-[#3c4a42] hover:bg-[#eff4ff] transition cursor-pointer"
              >
                Tutup
              </button>

              <Link
                href={getActionHref(selectedRecForModal)}
                onClick={() => setSelectedRecForModal(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold shadow-sm hover:bg-[#005237] transition"
              >
                <span>{selectedRecForModal.actionText || "Buka Fitur Terkait"}</span>
                <GoogleIcon name="arrow_forward" size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
