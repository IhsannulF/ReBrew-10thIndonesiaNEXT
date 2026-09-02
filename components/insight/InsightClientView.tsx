"use client";

import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useAiInsight } from "@/hooks/useAiInsight";
import { AiScoreOverviewCard } from "@/components/insight/AiScoreOverviewCard";
import { AiRecommendationsList } from "@/components/insight/AiRecommendationsList";
import { AiInsightReportCard } from "@/components/insight/AiInsightReportCard";
import { UserAiInsightData } from "@/app/actions/insight";

interface InsightClientViewProps {
  initialData: UserAiInsightData;
}

export function InsightClientView({ initialData }: InsightClientViewProps) {
  const {
    ecoMetrics,
    projection,
    diagnostic,
    recommendations,
    allRecommendationsCount,
    selectedCategory,
    setSelectedCategory,
    isGenerating,
    generationStep,
    generationStepIndex,
    refreshSuccess,
    handleRefreshAi,
  } = useAiInsight({ initialData });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#006c49] mb-1">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#6c7a71]">AI Insight & Analisis</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>Analisis Sirkularitas & Rekomendasi AI</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#eff4ff] text-[#006c49] border border-[#adedd3] px-3 py-1 rounded-full shadow-2xs">
              <GoogleIcon name="auto_awesome" size={14} />
              Powered by Google Gemini 2.5 Pro
            </span>
          </h1>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRefreshAi}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#eff4ff] text-[#006c49] border border-[#adedd3] px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs hover:bg-[#dce9ff] transition-all cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon name="refresh" size={16} className={isGenerating ? "animate-spin" : ""} />
            <span>{isGenerating ? "Menganalisis Gemini..." : "Generate Analisis Baru"}</span>
          </button>

          <Link
            href="/dashboard/setor"
            className="flex items-center gap-2 bg-[#006c49] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs hover:bg-[#005237] transition-all"
          >
            <GoogleIcon name="recycling" size={18} />
            <span>Setor Sampah</span>
          </Link>
        </div>
      </div>

      {/* Success Toast */}
      {refreshSuccess && (
        <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#006c49]/30 text-xs text-[#006c49] font-bold flex items-center gap-2.5 shadow-2xs animate-fade-in">
          <GoogleIcon name="check_circle" size={20} />
          <span>{refreshSuccess}</span>
        </div>
      )}

      {/* 1. Skor Efisiensi Circularity & Diagnostik Analisis AI ReBrew */}
      <AiScoreOverviewCard
        ecoMetrics={ecoMetrics}
        projection={projection}
        diagnostic={diagnostic}
        isGenerating={isGenerating}
        generationStep={generationStep}
        generationStepIndex={generationStepIndex}
        onRefreshAi={handleRefreshAi}
      />

      {/* 2. Rekomendasi Strategis AI dengan Kategori */}
      <AiRecommendationsList
        recommendations={recommendations}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalCount={allRecommendationsCount}
      />

      {/* 3. Download Laporan Strategis & Diagnostik AI */}
      <AiInsightReportCard
        cafeName={initialData.cafeName}
        ecoMetrics={ecoMetrics}
        diagnostic={diagnostic}
        recommendations={recommendations}
      />
    </div>
  );
}
