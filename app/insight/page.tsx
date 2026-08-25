"use client";

import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useAiInsight } from "@/hooks/useAiInsight";
import { AiScoreOverviewCard } from "@/components/insight/AiScoreOverviewCard";
import { AiRecommendationsList } from "@/components/insight/AiRecommendationsList";
import { AiChatAdvisor } from "@/components/insight/AiChatAdvisor";
import { EsgCertificateCard } from "@/components/insight/EsgCertificateCard";

export default function AiInsightPage() {
  const {
    ecoMetrics,
    projection,
    recommendations,
    allRecommendationsCount,
    selectedCategory,
    setSelectedCategory,
    messages,
    inputQuery,
    setInputQuery,
    isThinking,
    quickPrompts,
    handleSendMessage,
    handleQuickPrompt,
  } = useAiInsight();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#006c49] mb-1">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#6c7a71]">AI Insight & Advisor</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
            AI Eco-Advisor & Prediksi Sirkularitas
          </h1>
          <p className="text-sm text-[#3c4a42] mt-0.5">
            Analisis cerdas pola limbah kafe, rekomendasi optimasi poin, dan sertifikasi ESG otomatis.
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/setor"
            className="flex items-center gap-2 bg-[#006c49] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#2b6954] transition-all"
          >
            <GoogleIcon name="add" size={18} />
            <span>Setor Sampah Sekarang</span>
          </Link>
        </div>
      </div>

      {/* 1. Skor Efisiensi Circularity & Proyeksi AI Hero */}
      <AiScoreOverviewCard
        ecoMetrics={ecoMetrics}
        projection={projection}
      />

      {/* 2. Rekomendasi Strategis AI dengan Kategori */}
      <AiRecommendationsList
        recommendations={recommendations}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalCount={allRecommendationsCount}
      />

      {/* 3. Asisten Chat AI Interaktif */}
      <AiChatAdvisor
        messages={messages}
        inputQuery={inputQuery}
        isThinking={isThinking}
        quickPrompts={quickPrompts}
        onInputChange={setInputQuery}
        onSendMessage={handleSendMessage}
        onQuickPromptClick={handleQuickPrompt}
      />

      {/* 4. Sertifikat Resmi Eco-Partner & Download ESG */}
      <EsgCertificateCard />
    </div>
  );
}
