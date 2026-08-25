"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { COIN_RATE } from "@/constants/payoutData";

interface BalanceOverviewCardProps {
  balancePoints: number;
  maxCashIdr: number;
}

export const BalanceOverviewCard: React.FC<BalanceOverviewCardProps> = ({
  balancePoints,
  maxCashIdr,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
      {/* 1. Main Emerald Gradient Balance Card */}
      <div className="md:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#006c49] via-[#005a3c] to-[#00422b] p-6 sm:p-7 text-white shadow-md">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-20 -top-12 h-32 w-32 rounded-full bg-[#10b981]/15 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full gap-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-[#6ffbbe] shadow-2xs">
                <GoogleIcon name="payments" size={20} />
              </span>
              <span className="text-xs uppercase tracking-widest font-bold text-[#b0f0d6]">
                Saldo Kas Siap Tarik
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[#6ffbbe]">
              <span className="h-2 w-2 rounded-full bg-[#4edea3] animate-pulse" />
              Aktif Real-Time
            </span>
          </div>

          {/* Balance Amount Row */}
          <div>
            <div className="text-xs font-medium text-white/80 mb-1">Total Nilai Rupiah:</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
                Rp {maxCashIdr.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#b0f0d6]">
              <span className="flex items-center gap-1 font-bold">
                <GoogleIcon name="monetization_on" size={15} filled className="text-[#ffd54f]" />
                {balancePoints.toLocaleString("id-ID")} Poin ReBrew
              </span>
              <span>•</span>
              <span className="opacity-90">1 Poin = Rp {COIN_RATE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side Info Rate & Benefit Card */}
      <div className="md:col-span-4 flex flex-col justify-between p-6 rounded-3xl border border-[#bbcabf]/30 bg-white shadow-xs">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 text-[#006c49]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="verified_user" size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0b1c30]">
              Pencairan Terproteksi
            </span>
          </div>
          <p className="text-xs text-[#3c4a42] leading-relaxed">
            Poin daur ulang dapat dicairkan langsung ke rekening bank lokal (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, DANA, OVO, ShopeePay) tanpa potongan biaya admin.
          </p>
        </div>

        <div className="pt-3 border-t border-[#bbcabf]/20 flex items-center justify-between text-xs">
          <span className="text-[#6c7a71]">Biaya Penarikan:</span>
          <span className="font-bold text-[#006c49] bg-[#eff4ff] px-2.5 py-0.5 rounded-md border border-[#adedd3]">
            GRATIS (Rp 0)
          </span>
        </div>
      </div>
    </div>
  );
};
