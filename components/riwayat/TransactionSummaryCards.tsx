"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { TransactionSummaryStats } from "@/hooks/useTransactionHistory";

interface TransactionSummaryCardsProps {
  stats: TransactionSummaryStats;
}

export const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Total Sampah Terkelola */}
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#bbcabf]/30 bg-white shadow-xs transition-all hover:shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#006c49] shadow-2xs">
          <GoogleIcon name="scale" size={24} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-[#6c7a71] uppercase tracking-wider truncate">
            Sampah Terverifikasi
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-[#0b1c30]">
              {stats.totalConfirmedKg}
            </span>
            <span className="text-xs font-medium text-[#3c4a42]">kg</span>
          </div>
          <span className="text-[11px] text-[#306d58] font-medium mt-0.5">
            Dari {stats.totalCount} transaksi
          </span>
        </div>
      </div>

      {/* 2. Total Poin Diperoleh */}
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#fde68a] bg-gradient-to-br from-white via-[#fffdf5] to-[#fef3c7]/30 shadow-xs transition-all hover:shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fef3c7] text-[#d97706] shadow-2xs">
          <GoogleIcon name="monetization_on" size={24} filled />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-[#92400e] uppercase tracking-wider truncate">
            Poin Terkumpul
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-[#92400e]">
              +{stats.totalPointsEarned}
            </span>
            <span className="text-xs font-medium text-[#78350f]">pt</span>
          </div>
          <span className="text-[11px] text-[#b45309] font-medium mt-0.5">
            ≈ Rp {(stats.totalPointsEarned * 35).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* 3. Estimasi CO2 Dicegah */}
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#adedd3] bg-gradient-to-br from-white via-[#f0fdf4] to-[#adedd3]/30 shadow-xs transition-all hover:shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#006c49] text-white shadow-2xs">
          <GoogleIcon name="eco" size={24} filled />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-[#306d58] uppercase tracking-wider truncate">
            Mencegah CO₂
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-[#006c49]">
              {stats.totalCo2Saved}
            </span>
            <span className="text-xs font-medium text-[#306d58]">kg CO₂e</span>
          </div>
          <span className="text-[11px] text-[#00422b] font-medium mt-0.5">
            Dampak positif iklim
          </span>
        </div>
      </div>

      {/* 4. Tiket Pending / Menunggu Timbang */}
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#bbcabf]/30 bg-white shadow-xs transition-all hover:shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#2b6954] shadow-2xs">
          <GoogleIcon name="receipt_long" size={24} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-[#6c7a71] uppercase tracking-wider truncate">
            Status Penyetoran
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-[#0b1c30]">
              {stats.pendingCount}
            </span>
            <span className="text-xs font-medium text-[#3c4a42]">tiket pending</span>
          </div>
          <span className="text-[11px] text-[#6c7a71] mt-0.5">
            {stats.totalCount - stats.pendingCount} transaksi selesai
          </span>
        </div>
      </div>
    </div>
  );
};
