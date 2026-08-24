"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DashboardData, CafeProfile } from "@/types/dashboard";
import { initialDashboardData } from "@/lib/mock-dashboard-data";
import { MetricCardsSection } from "./sections/MetricCardsSection";
import { RecentTransactionsSection } from "./sections/RecentTransactionsSection";
import { WasteCompositionSection } from "./sections/WasteCompositionSection";
import { MonthlyTargetSection } from "./sections/MonthlyTargetSection";
import { QuickActionsSection } from "./sections/QuickActionsSection";
import { DeviceCollectorStatusSection } from "./sections/DeviceCollectorStatusSection";
import { CafeLeaderboardSection } from "./sections/CafeLeaderboardSection";
import { GamificationSection } from "./sections/GamificationSection";
import { ShareImpactModal } from "./sections/ShareImpactModal";

interface RecyclingDashboardProps {
  data?: DashboardData;
  user?: Partial<CafeProfile> | null;
}

export const RecyclingDashboard: React.FC<RecyclingDashboardProps> = ({
  data,
  user: userProp,
}) => {
  // Use data prop or fallback to initialDashboardData
  const activeData: DashboardData = data || initialDashboardData;
  
  const [isNotificationVisible, setIsNotificationVisible] = useState(
    Boolean(activeData.notification)
  );
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard_gamification">("overview");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Profile resolution with priority
  const profile: CafeProfile = {
    ...activeData.user,
    name: userProp?.name || activeData.user.name,
    email: userProp?.email || activeData.user.email,
    cafeName: userProp?.cafeName || activeData.user.cafeName,
    tierLabel: userProp?.tierLabel || activeData.user.tierLabel,
  };

  const isScaleOnline = activeData.deviceStatus.scaleStatus === "online";

  return (
    <div className="w-full flex flex-col gap-6 pb-12 text-[#0b1c30]">
      {/* 1. Header & Welcome Area */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff4ff] border border-[#adedd3] px-3.5 py-1 text-xs font-bold text-[#006c49]">
              <GoogleIcon name="storefront" size={15} />
              <span className="truncate max-w-[200px] sm:max-w-none">{profile.cafeName}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] border border-[#fde68a] px-3 py-1 text-xs font-bold text-[#92400e]">
              {profile.tierLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isScaleOnline
                  ? "bg-[#eff4ff] border-[#adedd3] text-[#006c49]"
                  : "bg-[#ffe4e8] border-[#f43f5e]/30 text-[#8a0f2c]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isScaleOnline ? "bg-[#10b981] animate-pulse" : "bg-[#f43f5e]"
                }`}
              />
              {isScaleOnline ? "IoT Timbangan Aktif" : "Timbangan Offline"}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1c30]"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Selamat Datang, {profile.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#3c4a42] leading-relaxed">
            Pantau aktivitas penimbangan 5 kategori limbah kafe, perolehan koin, dan peringkat leaderboard Anda.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#bbcabf]/50 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#006c49] shadow-2xs transition-all hover:bg-[#eff4ff] hover:border-[#006c49]"
          >
            <GoogleIcon name="share" size={17} />
            <span className="hidden sm:inline">Bagikan</span>
          </button>

          <Link
            href="/dashboard/saldo"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#bbcabf]/50 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#006c49] shadow-2xs transition-all hover:bg-[#eff4ff] hover:border-[#006c49]"
          >
            <GoogleIcon name="account_balance_wallet" size={18} />
            <span>Tarik Saldo</span>
          </Link>

          <Link
            href="/dashboard/setor"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006c49] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:bg-[#005236] active:scale-95"
          >
            <GoogleIcon name="add_circle" size={18} />
            <span>Setor Sampah</span>
          </Link>
        </div>
      </header>

      {/* 2. Notification Banner */}
      {isNotificationVisible && activeData.notification && (
        <section
          className="relative flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-[#adedd3] bg-gradient-to-r from-[#eff4ff] via-[#f0fdf4] to-[#eff4ff] p-4 sm:px-6 sm:py-4 shadow-xs"
          aria-label="Notifikasi transaksi IoT"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#006c49] text-white shadow-xs">
              <GoogleIcon name="check_circle" size={22} filled />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#006c49] truncate">
                  {activeData.notification.message}
                </span>
                <span className="hidden sm:inline-block rounded-full bg-[#adedd3] px-2 py-0.5 text-[10px] font-bold text-[#00422b]">
                  IoT Sync
                </span>
              </div>
              <p className="text-xs text-[#3c4a42] mt-0.5">
                {activeData.notification.detail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNotificationVisible(false)}
            className="self-end sm:self-center flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg text-[#6c7a71] transition-colors hover:bg-black/5 hover:text-[#0b1c30]"
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </section>
      )}

      {/* 3. 4 Top Metric Cards Grid */}
      <MetricCardsSection stats={activeData.stats} />

      {/* 4. Dashboard View Navigation Tabs */}
      <nav className="flex items-center gap-2 border-b border-[#bbcabf]/30 pb-2.5 w-full" aria-label="Tab dashboard">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === "overview"
              ? "bg-[#006c49] text-white shadow-sm"
              : "text-[#3c4a42] hover:bg-[#eff4ff] hover:text-[#006c49]"
          }`}
        >
          <GoogleIcon name="dashboard" size={18} filled={activeTab === "overview"} />
          <span>Ringkasan & Aktivitas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leaderboard_gamification")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === "leaderboard_gamification"
              ? "bg-[#006c49] text-white shadow-sm"
              : "text-[#3c4a42] hover:bg-[#eff4ff] hover:text-[#006c49]"
          }`}
        >
          <GoogleIcon name="leaderboard" size={18} filled={activeTab === "leaderboard_gamification"} />
          <span>Leaderboard & Gamifikasi</span>
          <span className="hidden sm:inline-block rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-extrabold text-[#92400e]">
            Rank #{profile.rankInCity || 2}
          </span>
        </button>
      </nav>

      {/* 5. Main Dynamic Layout Content */}
      {activeTab === "overview" ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full min-w-0">
          {/* Left Main Area: Recent Transactions & Waste Breakdown */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
            <RecentTransactionsSection transactions={activeData.recentTransactions} />
            <WasteCompositionSection
              composition={activeData.wasteComposition}
              totalWasteKg={activeData.stats.wasteKgThisMonth}
            />
          </div>

          {/* Right Sidebar Area: Target, Quick Actions & IoT Scale Status */}
          <div className="w-full lg:w-[330px] xl:w-[350px] shrink-0 flex flex-col gap-6">
            <MonthlyTargetSection target={activeData.target} />
            <QuickActionsSection onOpenShareModal={() => setIsShareModalOpen(true)} />
            <DeviceCollectorStatusSection deviceStatus={activeData.deviceStatus} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full min-w-0">
          {/* Left Main Area (Wider Space): Gamification Missions & Eco-Badges */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
            <GamificationSection
              missions={activeData.dailyMissions}
              badges={activeData.badges}
              streakDays={activeData.stats.activeStreakDays}
            />
          </div>

          {/* Right Sidebar Area: Leaderboard Eco-Cafe */}
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 flex flex-col gap-6">
            <CafeLeaderboardSection
              entries={activeData.leaderboard}
              currentCity={profile.city}
            />
          </div>
        </div>
      )}

      {/* 6. Social Share Impact Modal */}
      <ShareImpactModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        user={profile}
        stats={activeData.stats}
      />
    </div>
  );
};
