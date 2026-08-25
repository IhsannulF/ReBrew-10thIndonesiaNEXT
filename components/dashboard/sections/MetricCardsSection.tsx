import React from "react";
import Link from "next/link";
import { MetricCard } from "./MetricCard";
import { DashboardStats } from "@/types/dashboard";
import { formatCurrency, formatNumber } from "@/lib/dashboard-utils";

interface MetricCardsSectionProps {
  stats: DashboardStats;
}

export const MetricCardsSection: React.FC<MetricCardsSectionProps> = ({ stats }) => {
  const targetKg = stats.targetKgThisMonth > 0 ? stats.targetKgThisMonth : 25;
  const targetPercent = Math.min(
    100,
    Math.round((stats.wasteKgThisMonth / targetKg) * 100)
  );

  // Dynamic tree equivalent calculation (1 tree absorbs ~3.5kg CO2 per cycle)
  const treesEquivalent = stats.co2SavedKg > 0 ? Math.max(1, Math.round(stats.co2SavedKg / 3.5)) : 0;

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
        badgeText={stats.totalCoins > 0 ? `+${formatNumber(stats.totalCoins)} Aktif` : "0 Koin"}
        badgeColor={
          stats.totalCoins > 0
            ? "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]"
            : "bg-[#eff4ff] text-[#6c7a71] border border-[#bbcabf]/40"
        }
        footerText={
          <span className="text-[#3c4a42]">
            {stats.totalCoins > 0 ? "Siap ditukar saldo kas" : "Kumpulkan koin dari setor sampah"}
          </span>
        }
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
          stats.balanceIdr > 0 ? (
            <Link
              href="/dashboard/saldo"
              className="font-bold text-[#006c49] hover:underline inline-flex items-center gap-1"
            >
              <span>Tarik Kas</span>
              <span>→</span>
            </Link>
          ) : (
            <span className="text-[#6c7a71]">Bebas biaya admin transfer</span>
          )
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
        badgeColor={
          targetPercent >= 100
            ? "bg-[#eff4ff] text-[#006c49] border border-[#adedd3] font-bold"
            : "bg-[#eff4ff] text-[#2b6954] border border-[#bbcabf]/50"
        }
        footerText={<span className="text-[#3c4a42]">Target {targetKg} kg</span>}
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
        badgeText={treesEquivalent > 0 ? `🌱 ~${treesEquivalent} Pohon` : "🌱 0 Pohon"}
        badgeColor="bg-[#ccfbf1] text-[#006c49] border border-[#99f6e4]"
        footerText={
          <span className="text-[#3c4a42]">
            {stats.co2SavedKg > 0 ? "Tereduksi terverifikasi" : "Mulai pilah untuk kurangi emisi"}
          </span>
        }
      />
    </section>
  );
};
