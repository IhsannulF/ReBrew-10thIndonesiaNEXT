import React from "react";
import Link from "next/link";
import { MetricCard } from "./MetricCard";
import { DashboardStats } from "@/types/dashboard";
import { formatCurrency, formatNumber } from "@/lib/dashboard-utils";

interface MetricCardsSectionProps {
  stats: DashboardStats;
}

export const MetricCardsSection: React.FC<MetricCardsSectionProps> = ({ stats }) => {
  const targetPercent = Math.min(
    100,
    Math.round((stats.wasteKgThisMonth / stats.targetKgThisMonth) * 100)
  );

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full"
      aria-label="Ringkasan metrik utama kafe"
    >
      {/* 1. Total Koin (Warm Gold) */}
      <MetricCard
        label="Total Koin Aktif"
        value={formatNumber(stats.totalCoins)}
        unit="koin"
        iconName="monetization_on"
        iconBgColor="bg-[#fef3c7]"
        iconColor="text-[#d97706]"
        cardBgGradient="bg-gradient-to-br from-[#ffffff] via-[#fffdf5] to-[#fef3c7]/30"
        cardBorderColor="border-[#fde68a]"
        valueColor="text-[#92400e]"
        badgeText="+18 Baru"
        badgeColor="bg-[#fef3c7] text-[#92400e] border border-[#fde68a]"
        footerText={<span className="text-[#3c4a42]">Siap ditukar saldo kas</span>}
      />

      {/* 2. Nilai Saldo Kas (Emerald Mint - Primary) */}
      <MetricCard
        label="Nilai Saldo Kas"
        value={formatCurrency(stats.balanceIdr)}
        iconName="payments"
        iconBgColor="bg-[#adedd3]/50"
        iconColor="text-[#006c49]"
        cardBgGradient="bg-gradient-to-br from-[#ffffff] via-[#f0fdf4] to-[#adedd3]/30"
        cardBorderColor="border-[#adedd3]"
        valueColor="text-[#006c49]"
        badgeText="1 Koin = Rp 50"
        badgeColor="bg-[#eff4ff] text-[#006c49] border border-[#adedd3]"
        footerText={
          <Link
            href="/dashboard/saldo"
            className="font-bold text-[#006c49] hover:underline inline-flex items-center gap-1"
          >
            <span>Tarik Kas</span>
            <span>→</span>
          </Link>
        }
      />

      {/* 3. Sampah Bulan Ini (Forest Green - Secondary) */}
      <MetricCard
        label="Sampah Bulan Ini"
        value={stats.wasteKgThisMonth.toFixed(1)}
        unit="kg tersortir"
        iconName="recycling"
        iconBgColor="bg-[#eff4ff]"
        iconColor="text-[#2b6954]"
        cardBgGradient="bg-gradient-to-br from-[#ffffff] via-[#f8f9ff] to-[#eff4ff]"
        cardBorderColor="border-[#bbcabf]/60"
        valueColor="text-[#2b6954]"
        badgeText={`${targetPercent}% Target`}
        badgeColor="bg-[#eff4ff] text-[#2b6954] border border-[#bbcabf]/50"
        footerText={<span className="text-[#3c4a42]">Target {stats.targetKgThisMonth} kg</span>}
      />

      {/* 4. Reduksi Emisi CO2 (Teal Mint) */}
      <MetricCard
        label="Reduksi Emisi CO₂"
        value={stats.co2SavedKg.toFixed(1)}
        unit="kg CO₂ eq"
        iconName="eco"
        iconBgColor="bg-[#ccfbf1]"
        iconColor="text-[#006c49]"
        cardBgGradient="bg-gradient-to-br from-[#ffffff] via-[#f0fdfa] to-[#ccfbf1]/30"
        cardBorderColor="border-[#99f6e4]"
        valueColor="text-[#006c49]"
        badgeText="🌱 ~2 Pohon"
        badgeColor="bg-[#ccfbf1] text-[#006c49] border border-[#99f6e4]"
        footerText={<span className="text-[#3c4a42]">Tereduksi terverifikasi</span>}
      />
    </section>
  );
};
