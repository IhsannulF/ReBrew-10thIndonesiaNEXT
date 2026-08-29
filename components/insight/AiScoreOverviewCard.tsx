"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { EcoScoreMetrics, WasteProjection, AiDiagnosticAnalysis } from "@/types/insight";

interface AiScoreOverviewCardProps {
  ecoMetrics: EcoScoreMetrics;
  projection: WasteProjection;
  diagnostic?: AiDiagnosticAnalysis;
  isGenerating?: boolean;
  onRefreshAi?: () => void;
}

export const AiScoreOverviewCard: React.FC<AiScoreOverviewCardProps> = ({
  ecoMetrics,
  projection,
  diagnostic,
  isGenerating = false,
  onRefreshAi,
}) => {
  const isNewAccount = (projection.currentKg ?? 0) === 0;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Grid: Circularity Score + Monthly Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        {/* 1. Eco Circularity Score Hero (7 Cols) */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#006c49] via-[#005236] to-[#0b1c30] p-6 sm:p-7 text-white shadow-md flex flex-col justify-between">
          {/* Glow decoration */}
          <div className="absolute right-0 top-0 h-64 w-64 bg-[#10b981]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-[#6ffbbe] shadow-2xs">
                <GoogleIcon name="auto_awesome" size={20} />
              </span>
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#b0f0d6] block">
                  Analisis AI ReBrew
                </span>
                <span className="text-xs text-white/80">
                  Skor Efisiensi Sirkular Kafe
                </span>
              </div>
            </div>

            <span className="text-xs font-bold bg-[#10b981]/25 border border-[#4edea3]/40 text-[#6ffbbe] px-3 py-1 rounded-full">
              {ecoMetrics.rankingCityText}
            </span>
          </div>

          {/* Score Display */}
          <div className="relative z-10 my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {ecoMetrics.overallScore}
                </span>
                <span className="text-xl font-bold text-[#6ffbbe]">/100</span>
              </div>
              <div className="text-sm font-bold text-[#4edea3] mt-1">
                {ecoMetrics.scoreLabel}
              </div>
            </div>

            {/* Submetrics Mini Grid */}
            <div className="flex flex-col gap-2 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Rasio Terpilah:</span>
                <span className="font-bold text-[#6ffbbe]">
                  {isNewAccount ? "0%" : `${ecoMetrics.sortedRatioPercent}%`}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Tingkat Kebersihan:</span>
                <span className="font-bold text-[#4edea3]">
                  {isNewAccount ? "0%" : `${ecoMetrics.cleanlinessScore}%`}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Efisiensi Armada:</span>
                <span className="font-bold text-[#b0f0d6]">
                  {isNewAccount ? "0%" : `${ecoMetrics.pickupEfficiencyScore}%`}
                </span>
              </div>
            </div>
          </div>

          {/* AI Key Takeaway */}
          <div className="relative z-10 pt-3 border-t border-white/15 text-xs text-white/90 leading-relaxed flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GoogleIcon name="lightbulb" size={16} className="text-[#ffd54f] shrink-0" />
              <span>
                {isNewAccount
                  ? "Lakukan setoran sampah pertama untuk mengaktifkan penilaian cerdas AI dan mendongkrak peringkat kafe Anda."
                  : `Pemisahan limbah di kafe Anda mencapai efisiensi ${ecoMetrics.sortedRatioPercent}%.`}
              </span>
            </div>

            {onRefreshAi && (
              <button
                type="button"
                onClick={onRefreshAi}
                disabled={isGenerating}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold text-white transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                <GoogleIcon name="refresh" size={14} className={isGenerating ? "animate-spin" : ""} />
                <span>{isGenerating ? "Menganalisis..." : "Update Analisis AI"}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Predictive Analytics & Busy Hours (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-3xl border border-[#bbcabf]/30 bg-white shadow-xs gap-5">
          <div className="flex items-center justify-between border-b border-[#bbcabf]/20 pb-3">
            <div className="flex items-center gap-2 text-[#006c49]">
              <GoogleIcon name="trending_up" size={20} />
              <h3 className="text-sm font-bold text-[#0b1c30]">
                Proyeksi Akhir Bulan (AI)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#006c49] bg-[#eff4ff] px-2.5 py-0.5 rounded-md border border-[#adedd3]">
              {isNewAccount ? "Akun Baru" : `+${projection.trendPercentage}% vs Bulan Lalu`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30">
              <span className="text-[11px] text-[#6c7a71] block">Proyeksi Total:</span>
              <span className="text-xl font-black text-[#006c49] font-mono">
                {projection.projectedKg} <span className="text-xs font-semibold">kg</span>
              </span>
              <span className="text-[10px] text-[#306d58] block mt-0.5">
                {isNewAccount
                  ? `Target: ${projection.targetKg} kg (Mulai Setor)`
                  : `Target: ${projection.targetKg} kg (${projection.currentKg >= projection.targetKg ? "Tercapai ✔" : "Sedang Berjalan"})`}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#fffdf5] border border-[#fde68a]">
              <span className="text-[11px] text-[#92400e] block">Estimasi Poin:</span>
              <span className="text-xl font-black text-[#d97706] font-mono">
                +{projection.projectedPoints} <span className="text-xs font-semibold">pt</span>
              </span>
              <span className="text-[10px] text-[#b45309] block mt-0.5">
                ≈ Rp {(projection.projectedPoints * 50).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Peak Hours Info */}
          <div className="rounded-2xl border border-[#bbcabf]/30 bg-[#f8f9ff] p-3.5 flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
              <GoogleIcon name="schedule" size={15} className="text-[#006c49]" />
              <span>Puncak Timbulan Cup Takeaway:</span>
            </div>
            <div className="text-[#3c4a42] pl-5">
              {isNewAccount ? (
                <span>Belum ada riwayat transaksi setor sampah.</span>
              ) : (
                <>
                  <strong>{projection.peakDays}</strong>, pukul <strong>{projection.peakHours}</strong>.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full Diagnostic Banner: Deep AI Diagnostic & Insights */}
      {diagnostic && (
        <div className="flex flex-col gap-4 rounded-3xl border border-[#006c49]/30 bg-gradient-to-br from-[#f0fdf4] via-white to-[#f8f9ff] p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bbcabf]/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#006c49] text-white shadow-2xs">
                <GoogleIcon name="psychology" size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-[#0b1c30]">
                    Diagnostik Cerdas Operasional Kafe
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eff4ff] text-[#006c49] border border-[#adedd3]">
                    <GoogleIcon name="verified" size={12} />
                    Gemini AI Model
                  </span>
                </div>
                <p className="text-xs text-[#3c4a42] mt-0.5">
                  Hasil telaah pola limbah dan potensi monetisasi sirkular kafe Anda
                </p>
              </div>
            </div>

            {diagnostic.lastGeneratedAt && (
              <span className="text-[11px] text-[#6c7a71] self-start sm:self-center font-medium">
                Dianalisis: <strong>{diagnostic.lastGeneratedAt}</strong>
              </span>
            )}
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-white border border-[#bbcabf]/30 text-xs sm:text-sm text-[#0b1c30] leading-relaxed font-medium shadow-2xs">
            <p>{diagnostic.executiveSummary}</p>
          </div>

          {/* 2 Column Highlights & Revenue Opps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
            {/* Highlights */}
            <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white border border-[#bbcabf]/30">
              <span className="font-bold text-[#006c49] flex items-center gap-1.5 text-xs">
                <GoogleIcon name="check_circle" size={16} />
                Poin Status & Kesiapan:
              </span>
              <ul className="flex flex-col gap-2 text-[#3c4a42]">
                {diagnostic.wasteHighlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#006c49] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white border border-[#bbcabf]/30">
              <span className="font-bold text-[#d97706] flex items-center gap-1.5 text-xs">
                <GoogleIcon name="monetization_on" size={16} filled />
                Peluang Monetisasi & Poin Kas:
              </span>
              <ul className="flex flex-col gap-2 text-[#3c4a42]">
                {diagnostic.revenueOpportunities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d97706] mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
