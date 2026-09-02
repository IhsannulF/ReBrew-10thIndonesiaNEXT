"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DashboardData, CafeProfile, DashboardNotification } from "@/types/dashboard";
import { initialDashboardData } from "@/lib/mock-dashboard-data";
import { createClient } from "@/utils/supabase/client";
import { MetricCardsSection } from "./sections/MetricCardsSection";
import { RecentTransactionsSection } from "./sections/RecentTransactionsSection";
import { WasteCompositionSection } from "./sections/WasteCompositionSection";
import { MonthlyTargetSection } from "./sections/MonthlyTargetSection";
import { CafeLeaderboardSection } from "./sections/CafeLeaderboardSection";
import { GamificationSection } from "./sections/GamificationSection";
import { ShareImpactModal } from "./sections/ShareImpactModal";
import { EcoCertificateLevelSection } from "./sections/EcoCertificateLevelSection";

interface RecyclingDashboardProps {
  data?: DashboardData;
  user?: Partial<CafeProfile> | null;
}

export const RecyclingDashboard: React.FC<RecyclingDashboardProps> = ({
  data,
  user: userProp,
}) => {
  const router = useRouter();

  // Use data prop or fallback to initialDashboardData
  const activeData: DashboardData = data || initialDashboardData;
  
  // Real-time Live Notification State
  const [liveNotification, setLiveNotification] = useState<DashboardNotification | undefined | null>(
    activeData.notification
  );
  const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(
    Boolean(activeData.notification)
  );
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard_gamification">("overview");
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Profile resolution with priority
  const profile: CafeProfile = {
    ...activeData.user,
    name: userProp?.name || activeData.user.name,
    email: userProp?.email || activeData.user.email,
    cafeName: userProp?.cafeName || activeData.user.cafeName,
    tierLabel: userProp?.tierLabel || activeData.user.tierLabel,
  };

  // 1. Auto-refresh when returning to tab and every 4 seconds to sync live verified points/tasks
  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };

    window.addEventListener("focus", handleFocus);
    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [router]);

  // 2. Supabase Real-Time Listener for Instant IoT Transaction Alerts
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime-tx-alerts-live`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        (payload: any) => {
          const tx = payload.new;
          if (tx && tx.status === "confirmed") {
            setLiveNotification({
              id: tx.id,
              message: `Setoran ${tx.id} Terverifikasi!`,
              detail: `Timbangan ${tx.scale_model || "Digital IoT"} mencatat ${tx.total_weight_kg || tx.actual_weight} kg · +${tx.total_points} Koin ditambahkan`,
              coinsEarned: Number(tx.total_points || 0),
              timestamp: "Baru saja",
            });
            setIsNotificationVisible(true);
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const isScaleOnline = activeData.deviceStatus.scaleStatus === "online";

  return (
    <div className="w-full flex flex-col gap-6 pb-12 text-[#0b1c30]">
      {/* 1. Header & Welcome Area */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
        <div className="flex flex-col gap-1 min-w-0">
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1c30]"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Selamat Datang, {profile.name} 👋
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#bbcabf]/50 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#006c49] shadow-2xs transition-all hover:bg-[#eff4ff] hover:border-[#006c49] cursor-pointer"
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

      {/* 2. Real-Time Dynamic Notification Banner */}
      {isNotificationVisible && liveNotification && (
        <section
          className="relative flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-[#adedd3] bg-gradient-to-r from-[#eff4ff] via-[#f0fdf4] to-[#eff4ff] p-4 sm:px-6 sm:py-4 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300"
          aria-label="Notifikasi transaksi IoT"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#006c49] text-white shadow-xs">
              <GoogleIcon name="check_circle" size={22} filled />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#006c49] truncate">
                  {liveNotification.message}
                </span>
                <span className="hidden sm:inline-block rounded-full bg-[#adedd3] px-2 py-0.5 text-[10px] font-bold text-[#00422b]">
                  IoT Sync Live
                </span>
                <span className="text-[11px] text-[#6c7a71]">
                  ({liveNotification.timestamp})
                </span>
              </div>
              <p className="text-xs text-[#3c4a42] mt-0.5">
                {liveNotification.detail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <Link
              href="/dashboard/riwayat"
              className="text-xs font-bold text-[#006c49] hover:underline bg-white px-3 py-1.5 rounded-lg border border-[#adedd3] shadow-2xs"
            >
              Lihat Tiket
            </Link>
            <button
              type="button"
              onClick={() => setIsNotificationVisible(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg text-[#6c7a71] transition-colors hover:bg-black/5 hover:text-[#0b1c30] cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              ×
            </button>
          </div>
        </section>
      )}

      {/* 3. 4 Top Metric Cards Grid */}
      <MetricCardsSection stats={activeData.stats} />

      {/* 4. Dashboard View Navigation Tabs */}
      <nav className="flex items-center gap-2 border-b border-[#bbcabf]/30 pb-2.5 w-full" aria-label="Tab dashboard">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
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
          className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "leaderboard_gamification"
              ? "bg-[#006c49] text-white shadow-sm"
              : "text-[#3c4a42] hover:bg-[#eff4ff] hover:text-[#006c49]"
          }`}
        >
          <GoogleIcon name="leaderboard" size={18} filled={activeTab === "leaderboard_gamification"} />
          <span>Leaderboard & Gamifikasi</span>
          <span className="hidden sm:inline-block rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[10px] font-extrabold text-[#92400e]">
            Rank #{profile.rankInCity || 1}
          </span>
        </button>
      </nav>

      {/* 5. Main Dynamic Layout Content */}
      {activeTab === "overview" ? (
        <div className="flex flex-col gap-6 w-full min-w-0">
          <div className="flex flex-col lg:flex-row gap-6 items-start w-full min-w-0">
            {/* Left Main Area: Recent Transactions & Sertifikat Eco-Partner */}
            <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
              <RecentTransactionsSection transactions={activeData.recentTransactions} />
              
              {/* Sertifikat Eco-Partner Berlevel Section */}
              <EcoCertificateLevelSection
                cafeName={profile.cafeName}
                city={profile.city || "Surabaya"}
                totalKg={activeData.stats.wasteKgThisMonth}
              />
            </div>

            {/* Right Sidebar Area: Target & Komposisi Sampah */}
            <div className="w-full lg:w-[340px] xl:w-[370px] shrink-0 flex flex-col gap-6">
              <MonthlyTargetSection target={activeData.target} />
              <WasteCompositionSection
                composition={activeData.wasteComposition}
                totalWasteKg={activeData.stats.wasteKgThisMonth}
              />
            </div>
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
