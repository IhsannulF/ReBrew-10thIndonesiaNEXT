"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { EcoScoreMetrics, WasteProjection } from "@/types/insight";

interface AiScoreOverviewCardProps {
  ecoMetrics: EcoScoreMetrics;
  projection: WasteProjection;
}

export const AiScoreOverviewCard: React.FC<AiScoreOverviewCardProps> = ({
  ecoMetrics,
  projection,
}) => {
  return (
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
              <span className="font-bold text-[#6ffbbe]">{ecoMetrics.sortedRatioPercent}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/70">Tingkat Kebersihan:</span>
              <span className="font-bold text-[#4edea3]">{ecoMetrics.cleanlinessScore}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/70">Efisiensi Armada:</span>
              <span className="font-bold text-[#b0f0d6]">{ecoMetrics.pickupEfficiencyScore}%</span>
            </div>
          </div>
        </div>

        {/* AI Key Takeaway */}
        <div className="relative z-10 pt-3 border-t border-white/15 text-xs text-white/90 leading-relaxed flex items-center gap-2">
          <GoogleIcon name="lightbulb" size={16} className="text-[#ffd54f] shrink-0" />
          <span>
            Pemisahan cup & lid di kafe Anda melampaui <strong>88% rata-rata kafe</strong> di Surabaya.
          </span>
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
            +{projection.trendPercentage}% vs Bulan Lalu
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30">
            <span className="text-[11px] text-[#6c7a71] block">Proyeksi Total:</span>
            <span className="text-xl font-black text-[#006c49] font-mono">
              {projection.projectedKg} <span className="text-xs font-semibold">kg</span>
            </span>
            <span className="text-[10px] text-[#306d58] block mt-0.5">
              Target: {projection.targetKg} kg (Tercapai ✔)
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
            <strong>{projection.peakDays}</strong>, pukul <strong>{projection.peakHours}</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
