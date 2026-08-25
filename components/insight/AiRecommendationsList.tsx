"use client";

import React from "react";
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
  const categoryFilters: { key: "all" | RecommendationCategory; label: string }[] = [
    { key: "all", label: "Semua Rekomendasi" },
    { key: "sorting_efficiency", label: "Pemilahan" },
    { key: "green_branding", label: "Branding Gen-Z" },
    { key: "logistics_saving", label: "Logistik" },
    { key: "upcycling_revenue", label: "Upcycling" },
  ];

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-[#bbcabf]/30 bg-white p-6 sm:p-7 shadow-xs w-full">
      {/* Header & Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49]">
            <GoogleIcon name="tips_and_updates" size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">
              Rekomendasi Strategis AI
            </h2>
            <p className="text-xs text-[#3c4a42] mt-0.5">
              Langkah aksi nyata untuk menaikkan perolehan koin dan skor green branding
            </p>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categoryFilters.map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectCategory(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
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

      {/* Grid of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const isHighPriority = rec.priority === "high";

          return (
            <div
              key={rec.id}
              className="flex flex-col justify-between p-5 rounded-2xl border border-[#bbcabf]/40 bg-[#f8f9ff] hover:bg-white hover:border-[#006c49]/50 hover:shadow-md transition-all gap-4"
            >
              {/* Header Card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49]">
                    <GoogleIcon name={rec.icon} size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#006c49] uppercase tracking-wider block">
                      {rec.categoryLabel}
                    </span>
                    <h3 className="text-sm font-bold text-[#0b1c30] mt-0.5">
                      {rec.title}
                    </h3>
                  </div>
                </div>

                {isHighPriority && (
                  <span className="text-[10px] font-bold bg-[#fff8e1] text-[#92400e] border border-[#fde68a] px-2 py-0.5 rounded-full shrink-0">
                    Prioritas Tinggi
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#3c4a42] leading-relaxed">
                {rec.description}
              </p>

              {/* Footer Impact & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-[#bbcabf]/20 gap-2">
                <span className="text-xs font-bold text-[#006c49] flex items-center gap-1">
                  <GoogleIcon name="bolt" size={15} filled />
                  <span>{rec.impactLabel}</span>
                </span>

                <Link
                  href="/dashboard/setor"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#006c49] hover:underline"
                >
                  <span>{rec.actionText}</span>
                  <GoogleIcon name="arrow_forward" size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
