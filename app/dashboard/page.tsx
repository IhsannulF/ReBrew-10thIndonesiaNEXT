import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { RecyclingDashboard } from "@/components/dashboard/RecyclingDashboard";
import {
  DashboardData,
  TransactionItem,
  WasteCategoryKey,
  WasteCompositionItem,
  LeaderboardEntry,
  DeviceCollectorStatus,
} from "@/types/dashboard";
import { initialDashboardData } from "@/lib/mock-dashboard-data";
import { calculateCO2Savings, coinsToIdr } from "@/lib/dashboard-utils";
import { autoRejectExpiredPickups } from "@/app/actions/transactions";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const db = createAdminClient();
  
  // Auto-reject any expired pickups across the platform
  await autoRejectExpiredPickups(db);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Clone fallback base data
  const dashboardData: DashboardData = JSON.parse(JSON.stringify(initialDashboardData));

  // Reset notification by default to ensure no phantom dummy banner
  dashboardData.notification = null;

  // Default empty 5-category composition
  const defaultEmptyComposition: WasteCompositionItem[] = [
    {
      key: "cup_plastik",
      name: "Plastic Cup",
      weightKg: 0,
      percentage: 0,
      points: 5,
      color: "#0284c7",
      icon: "coffee",
    },
    {
      key: "botol_plastik",
      name: "Botol Plastik",
      weightKg: 0,
      percentage: 0,
      points: 10,
      color: "#15803d",
      icon: "local_drink",
    },
    {
      key: "tutup_cup",
      name: "Tutup Cup",
      weightKg: 0,
      percentage: 0,
      points: 3,
      color: "#7c3aed",
      icon: "takeout_dining",
    },
  ];

  dashboardData.wasteComposition = defaultEmptyComposition;

  if (user?.id) {
    try {
      // 1. Fetch User Profile & Badges from Supabase
      let { data: profile } = await db
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        const res = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        profile = res.data;
      }

      let { data: userBadges } = await db
        .from("user_badges")
        .select("badge_id, unlocked_at")
        .eq("user_id", user.id);

      if (!userBadges) {
        const res = await supabase
          .from("user_badges")
          .select("badge_id, unlocked_at")
          .eq("user_id", user.id);
        userBadges = res.data;
      }

      const unlockedBadgeMap = new Map(
        (userBadges || []).map((ub: any) => [ub.badge_id, ub.unlocked_at])
      );

      const userName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Mitra ReBrew";
      const cafeName =
        profile?.cafe_name ||
        user?.user_metadata?.cafe_name ||
        "Kedai Kopi Mitra";
      const userCity = profile?.city || user?.user_metadata?.city || "Jakarta Selatan";
      const userTier = profile?.tier || user?.user_metadata?.tier || "starter";

      const saldoCoins = Number(profile?.saldo_poin ?? 0);
      const totalKg = Number(profile?.total_kg ?? 0.0);
      const streakDays = Number(profile?.active_streak_days ?? (totalKg > 0 ? 3 : 0));

      // If user profile is not yet in public.profiles table, insert it immediately so other users can see it on leaderboard
      if (!profile) {
        try {
          await db.from("profiles").upsert({
            id: user.id,
            email: user.email,
            full_name: userName,
            cafe_name: cafeName,
            city: userCity,
            role: "mitra",
            tier: userTier,
            saldo_poin: saldoCoins,
            total_kg: totalKg,
            active_streak_days: streakDays,
          });
        } catch {}
      }

      let resolvedTierLabel = "";
      if (userTier === "enterprise") {
        resolvedTierLabel = "Enterprise 🏆";
      } else if (unlockedBadgeMap.has("bdg-4")) {
        resolvedTierLabel = "Zero Waste Hero 🏆";
      } else if (unlockedBadgeMap.has("bdg-3")) {
        resolvedTierLabel = "Plastic Warrior 🛡️";
      } else if (unlockedBadgeMap.has("bdg-2")) {
        resolvedTierLabel = "1 Ton Club Contender ⭐";
      } else if (unlockedBadgeMap.has("bdg-1")) {
        resolvedTierLabel = "Eco Partner ⭐";
      } else {
        resolvedTierLabel = ""; // Belum mendapatkan badge -> tidak ada badge
      }

      dashboardData.user = {
        ...dashboardData.user,
        id: user.id,
        name: userName,
        email: user.email || profile?.email || "mitra@rebrew.id",
        cafeName,
        city: userCity,
        tier: userTier,
        tierLabel: resolvedTierLabel,
      };

      dashboardData.stats.totalCoins = saldoCoins;
      dashboardData.stats.balanceIdr = coinsToIdr(saldoCoins);
      dashboardData.stats.wasteKgThisMonth = totalKg;
      dashboardData.stats.co2SavedKg = calculateCO2Savings(totalKg);
      dashboardData.stats.activeStreakDays = streakDays;
      
      // 2. Fetch Monthly Target from public.monthly_targets
      let { data: targetData } = await db
        .from("monthly_targets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!targetData) {
        const res = await supabase
          .from("monthly_targets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        targetData = res.data;
      }

      if (targetData) {
        dashboardData.target = {
          currentKg: Number(targetData.current_kg ?? dashboardData.stats.wasteKgThisMonth),
          targetKg: Number(targetData.target_kg ?? 25.0),
          monthName: targetData.month_name || "Agustus 2026",
          rewardBonusCoins: Number(targetData.reward_coins ?? 150),
          rewardBadgeName: targetData.reward_badge_name || "1 Ton Club Contender",
        };
        dashboardData.stats.targetKgThisMonth = dashboardData.target.targetKg;
      } else {
        dashboardData.stats.targetKgThisMonth = 25.0;
        dashboardData.target.targetKg = 25.0;
      }

      // 3. Fetch Transactions from public.transactions
      let { data: dbTransactions } = await db
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!dbTransactions || dbTransactions.length === 0) {
        const res = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);
        if (res.data) dbTransactions = res.data;
      }

      let lastScaleModel = "ReBrew Smart Scale v2.4 (BLE/WiFi)";
      let nextPickupScheduleDate = "";
      let nextPickupScheduleTime = "";
      let nextPickupCollector = "ReBrew Central Hub - Jakarta Selatan (Melawai)";

      if (dbTransactions && dbTransactions.length > 0) {
        const mappedTransactions: TransactionItem[] = dbTransactions.map((tx: any) => {
          const rawCatId = (tx.category || "").toLowerCase();
          let categoryKey: WasteCategoryKey = "cup_plastik";
          let materialName = (tx.category || "Plastic Cup").replace(/\s*\([^)]*\)/g, "").trim();

          if (rawCatId.includes("botol")) {
            categoryKey = "botol_plastik";
            materialName = "Botol Plastik";
          } else if (rawCatId.includes("tutup")) {
            categoryKey = "tutup_cup";
            materialName = "Tutup Cup";
          } else if (rawCatId.includes("ampas")) {
            categoryKey = "cup_plastik";
            materialName = "Ampas Kopi";
          }

          const dropPointName = tx.method === "dijemput" ? "Armada Jemput ReBrew" : "ReBrew Central Hub Melawai";

          return {
            id: tx.id,
            categoryKey,
            material: materialName,
            date: tx.created_at
              ? new Date(tx.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Hari ini",
            weightKg: Number(tx.actual_weight || tx.total_weight_kg || 1.0),
            coins: Number(tx.total_points || 10),
            status: (
              tx.status === "confirmed" ||
              tx.status === "verified" ||
              Boolean(tx.verified_at) ||
              (tx.notes && tx.notes.toLowerCase().includes("diverifikasi"))
            ) ? "confirmed" : (tx.status === "rejected" ? "rejected" : "pending"),
            method: tx.method === "dijemput" ? "dijemput" : "drop_point",
            dropPointName,
          };
        });

        dashboardData.recentTransactions = mappedTransactions;

        const latestTx = dbTransactions[0];
        if (latestTx?.scale_model) {
          lastScaleModel = latestTx.scale_model;
        }

        const pendingPickupTx = dbTransactions.find(
          (t: any) => t.status === "pending" && (t.method === "dijemput" || (t.notes && t.notes.includes("Jadwal Jemput")))
        );

        if (pendingPickupTx && pendingPickupTx.notes) {
          const scheduleMatch = pendingPickupTx.notes.match(/Jadwal Jemput:\s*([^\s(]+)\s*\(([^)]+)\)/);
          if (scheduleMatch) {
            nextPickupScheduleDate = scheduleMatch[1];
            nextPickupScheduleTime = scheduleMatch[2].trim();
          }
          nextPickupCollector = pendingPickupTx.collector_name || "Armada ReBrew (Driver Penjemput)";
        }

        // 4. Calculate Live Waste Composition
        const categoryWeights: Record<string, { weight: number; points: number }> = {
          cup_plastik: { weight: 0, points: 5 },
          botol_plastik: { weight: 0, points: 10 },
          tutup_cup: { weight: 0, points: 3 },
        };

        let totalCalculatedWeight = 0;

        dbTransactions.forEach((tx: any) => {
          const isTxConfirmed =
            tx.status === "confirmed" ||
            tx.status === "verified" ||
            Boolean(tx.verified_at) ||
            (tx.notes && tx.notes.toLowerCase().includes("diverifikasi"));

          if (isTxConfirmed) {
            const w = Number(tx.actual_weight || tx.total_weight_kg || 0);
            const catId = (tx.category || "").toLowerCase();

            totalCalculatedWeight += w;

            if (catId.includes("cup") && !catId.includes("tutup")) {
              categoryWeights.cup_plastik.weight += w;
            } else if (catId.includes("botol")) {
              categoryWeights.botol_plastik.weight += w;
            } else if (catId.includes("tutup")) {
              categoryWeights.tutup_cup.weight += w;
            } else {
              categoryWeights.cup_plastik.weight += w;
            }
          }
        });

        if (totalCalculatedWeight > 0) {
          dashboardData.wasteComposition = [
            {
              key: "cup_plastik",
              name: "Plastic Cup",
              weightKg: Math.round(categoryWeights.cup_plastik.weight * 10) / 10,
              percentage: Math.round((categoryWeights.cup_plastik.weight / totalCalculatedWeight) * 100),
              points: 5,
              color: "#0284c7",
              icon: "coffee",
            },
            {
              key: "botol_plastik",
              name: "Botol Plastik",
              weightKg: Math.round(categoryWeights.botol_plastik.weight * 10) / 10,
              percentage: Math.round((categoryWeights.botol_plastik.weight / totalCalculatedWeight) * 100),
              points: 10,
              color: "#15803d",
              icon: "local_drink",
            },
            {
              key: "tutup_cup",
              name: "Tutup Cup",
              weightKg: Math.round(categoryWeights.tutup_cup.weight * 10) / 10,
              percentage: Math.round((categoryWeights.tutup_cup.weight / totalCalculatedWeight) * 100),
              points: 3,
              color: "#7c3aed",
              icon: "takeout_dining",
            },
          ];
        }
      }

      // 4b. Sync Device & Collector Status
      const liveDeviceStatus: DeviceCollectorStatus = {
        scaleStatus: "online",
        scaleModel: lastScaleModel,
        scaleLastSync: "Terkoneksi (Aktif)",
        nextPickupDate: nextPickupScheduleDate || "Belum Ada Jadwal",
        nextPickupTime: nextPickupScheduleTime,
        collectorName: nextPickupCollector,
        collectorPhone: "0812-3456-7890",
      };

      dashboardData.deviceStatus = liveDeviceStatus;

      // 5. Fetch Daily Missions
      let { data: dbMissions } = await db
        .from("daily_missions")
        .select("*")
        .limit(3);

      if (!dbMissions || dbMissions.length === 0) {
        const res = await supabase.from("daily_missions").select("*").limit(3);
        if (res.data) dbMissions = res.data;
      }

      if (dbMissions && dbMissions.length > 0) {
        dashboardData.dailyMissions = dbMissions.map((m: any) => {
          const target = Number(m.target_kg || 5.0);
          const currentProgress = totalKg > 0 ? Math.min(target, totalKg) : 0;
          return {
            id: m.id,
            title: m.title,
            description: m.description,
            targetKg: target,
            progressKg: Math.round(currentProgress * 10) / 10,
            rewardCoins: Number(m.reward_coins || 25),
            completed: totalKg >= target,
          };
        });
      }

      // 6. Fetch Eco-Badges
      let { data: dbBadges } = await db.from("eco_badges").select("*");
      if (!dbBadges || dbBadges.length === 0) {
        const res = await supabase.from("eco_badges").select("*");
        if (res.data) dbBadges = res.data;
      }

      if (dbBadges && dbBadges.length > 0) {
        dashboardData.badges = dbBadges.map((b: any) => {
          const isUnlocked = unlockedBadgeMap.has(b.id) || (totalKg >= 5 && b.id === "bdg-1") || (totalKg >= 25 && b.id === "bdg-2");
          return {
            id: b.id,
            name: b.name,
            description: b.description,
            icon: b.icon || "military_tech",
            unlocked: isUnlocked,
            unlockedAt: isUnlocked ? "Terbuka" : undefined,
            rarity: (b.rarity as any) || "common",
          };
        });
      }

      // 7. Pure Live Leaderboard
      let { data: dbProfiles } = await db
        .from("profiles")
        .select("id, full_name, cafe_name, city, total_kg, saldo_poin, tier, role")
        .neq("role", "admin")
        .order("total_kg", { ascending: false });

      if (!dbProfiles || dbProfiles.length === 0) {
        const res = await supabase
          .from("profiles")
          .select("id, full_name, cafe_name, city, total_kg, saldo_poin, tier, role")
          .neq("role", "admin")
          .order("total_kg", { ascending: false });
        if (res.data) dbProfiles = res.data;
      }

      const { data: allUserBadges } = await db
        .from("user_badges")
        .select("user_id, badge_id");

      const userBadgeMap = new Map<string, string[]>();
      (allUserBadges || []).forEach((ub: any) => {
        const list = userBadgeMap.get(ub.user_id) || [];
        list.push(ub.badge_id);
        userBadgeMap.set(ub.user_id, list);
      });

      let profileList = dbProfiles ? dbProfiles.filter((p: any) => p.role !== "admin") : [];

      // Ensure current logged-in profile exists in list if they are a partner/mitra
      if (profile?.role !== "admin" && !profileList.some((p: any) => p.id === user.id)) {
        profileList.push({
          id: user.id,
          full_name: userName,
          cafe_name: cafeName,
          city: userCity,
          total_kg: totalKg,
          saldo_poin: saldoCoins,
          tier: userTier,
          role: "mitra",
        });
      }

      // Sort by total_kg descending
      profileList.sort((a: any, b: any) => Number(b.total_kg || 0) - Number(a.total_kg || 0));

      let currentUserRank = 1;
      const pureLeaderboard: LeaderboardEntry[] = profileList.map((p: any, idx: number) => {
        const isSelf = p.id === user.id;
        if (isSelf) {
          currentUserRank = idx + 1;
        }

        const badges = userBadgeMap.get(p.id) || [];
        let cafeBadgeLabel = "";
        if (p.tier === "enterprise") {
          cafeBadgeLabel = "Enterprise 🏆";
        } else if (badges.includes("bdg-4")) {
          cafeBadgeLabel = "Zero Waste Hero 🏆";
        } else if (badges.includes("bdg-3")) {
          cafeBadgeLabel = "Plastic Warrior 🛡️";
        } else if (badges.includes("bdg-2")) {
          cafeBadgeLabel = "1 Ton Club Contender ⭐";
        } else if (badges.includes("bdg-1")) {
          cafeBadgeLabel = "Eco Partner ⭐";
        } else {
          cafeBadgeLabel = ""; // Belum mendapatkan badge -> tidak ada badge
        }

        const name = p.cafe_name || p.full_name || "Kedai Kopi Mitra";
        return {
          id: p.id,
          rank: idx + 1,
          cafeName: name,
          city: p.city || "Surabaya",
          totalKg: Number(p.total_kg || 0),
          totalPoints: Number(p.saldo_poin || 0),
          tierLabel: cafeBadgeLabel,
          isCurrentCafe: isSelf,
          avatarInitial: name.charAt(0).toUpperCase(),
        };
      });

      dashboardData.leaderboard = pureLeaderboard;
      dashboardData.user.rankInCity = currentUserRank;
      dashboardData.user.totalCafesInCity = pureLeaderboard.length;
    } catch {
      // Gracefully fall back to initialDashboardData if tables are initializing
    }
  }

  return <RecyclingDashboard data={dashboardData} />;
}
