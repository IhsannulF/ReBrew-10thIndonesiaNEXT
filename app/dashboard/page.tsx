import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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
      name: "Cup Plastik PP",
      weightKg: 0,
      percentage: 0,
      points: 5,
      color: "#0284c7",
      icon: "coffee",
    },
    {
      key: "kardus",
      name: "Kardus Kemasan",
      weightKg: 0,
      percentage: 0,
      points: 15,
      color: "#d97706",
      icon: "package_2",
    },
    {
      key: "botol_plastik",
      name: "Botol Plastik PET",
      weightKg: 0,
      percentage: 0,
      points: 10,
      color: "#15803d",
      icon: "local_drink",
    },
    {
      key: "kaleng",
      name: "Kaleng Krimer",
      weightKg: 0,
      percentage: 0,
      points: 20,
      color: "#0d9488",
      icon: "inventory_2",
    },
    {
      key: "tutup_cup",
      name: "Tutup Cup & Lid",
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("badge_id, unlocked_at")
        .eq("user_id", user.id);

      const unlockedBadgeMap = new Map(
        (userBadges || []).map((ub: any) => [ub.badge_id, ub.unlocked_at])
      );

      const hasEcoPartnerBadge = unlockedBadgeMap.has("bdg-1");
      const has1TonBadge = unlockedBadgeMap.has("bdg-2");

      const userName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Mitra ReBrew";
      const cafeName =
        profile?.cafe_name ||
        user?.user_metadata?.cafe_name ||
        "Kedai Kopi Mitra";
      const userCity = profile?.city || user?.user_metadata?.city || "Surabaya";
      const userTier = profile?.tier || user?.user_metadata?.tier || "starter";

      const saldoCoins = Number(profile?.saldo_poin ?? 0);
      const totalKg = Number(profile?.total_kg ?? 0.0);
      const streakDays = Number(profile?.active_streak_days ?? 0);

      // If user profile is not yet in public.profiles table, insert it immediately so other users can see it on leaderboard
      if (!profile) {
        try {
          await supabase.from("profiles").upsert({
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
      dashboardData.target.currentKg = totalKg;

      // 2. Fetch Monthly Target from public.monthly_targets
      const { data: targetData } = await supabase
        .from("monthly_targets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

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
      const { data: dbTransactions } = await supabase
        .from("transactions")
        .select(`
          id,
          method,
          pickup_address,
          total_weight_kg,
          total_points,
          total_co2_kg,
          status,
          scale_model,
          collector_name,
          created_at,
          drop_points (
            name,
            address
          ),
          transaction_items (
            category_id,
            weight_kg,
            points_earned,
            co2_saved_kg,
            waste_categories (
              name,
              point_per_kg
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      let lastScaleModel = "ReBrew Smart Scale v2.4 (BLE/WiFi)";
      let nextPickupScheduleDate = "";
      let nextPickupCollector = "ReBrew Micro-Hub Surabaya Timur";

      if (dbTransactions && dbTransactions.length > 0) {
        const mappedTransactions: TransactionItem[] = dbTransactions.map((tx: any) => {
          const firstItem = tx.transaction_items?.[0];
          const rawCatId = (firstItem?.category_id || "").toLowerCase();
          let categoryKey: WasteCategoryKey = "cup_plastik";
          let materialName = firstItem?.waste_categories?.name || "Cup Plastik PP";

          if (rawCatId.includes("botol")) {
            categoryKey = "botol_plastik";
            materialName = "Botol Plastik PET";
          } else if (rawCatId.includes("tutup")) {
            categoryKey = "tutup_cup";
            materialName = "Tutup Cup & Seal";
          } else if (rawCatId.includes("kardus")) {
            categoryKey = "kardus";
            materialName = "Kardus Kemasan";
          } else if (rawCatId.includes("kaleng")) {
            categoryKey = "kaleng";
            materialName = "Kaleng Minuman";
          }

          const dropPointName = tx.drop_points?.name || (tx.method === "dijemput" ? "Armada Jemput" : "ReBrew Hub Gubeng");

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
            weightKg: Number(tx.total_weight_kg || 1.0),
            coins: Number(tx.total_points || 10),
            status: tx.status || "confirmed",
            method: tx.method === "dijemput" ? "dijemput" : "drop_point",
            dropPointName,
          };
        });

        dashboardData.recentTransactions = mappedTransactions;

        // Dynamic Real Notification from latest confirmed transaction
        const latestConfirmedTx = dbTransactions.find((tx: any) => tx.status === "confirmed");
        if (latestConfirmedTx) {
          if (latestConfirmedTx.scale_model) {
            lastScaleModel = latestConfirmedTx.scale_model;
          }
          if (latestConfirmedTx.collector_name) {
            nextPickupCollector = latestConfirmedTx.collector_name;
          } else if ((latestConfirmedTx as any).drop_points?.name) {
            nextPickupCollector = (latestConfirmedTx as any).drop_points.name;
          }

          dashboardData.notification = {
            id: latestConfirmedTx.id,
            message: `Setoran ${latestConfirmedTx.id} Terverifikasi!`,
            detail: `Timbangan ${latestConfirmedTx.scale_model || "Digital Smart Scale"} mencatat ${latestConfirmedTx.total_weight_kg} kg sampah · +${latestConfirmedTx.total_points} Koin ditambahkan ke saldo`,
            coinsEarned: Number(latestConfirmedTx.total_points || 0),
            timestamp: latestConfirmedTx.created_at
              ? new Date(latestConfirmedTx.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Hari ini",
          };
        } else {
          dashboardData.notification = null;
        }

        // Check for pending pickup schedule
        const pendingPickupTx = dbTransactions.find(
          (tx: any) => tx.method === "dijemput" && tx.status === "pending"
        );
        if (pendingPickupTx) {
          nextPickupScheduleDate = "Menunggu Penjemputan Armada";
          nextPickupCollector = pendingPickupTx.collector_name || "ReBrew Driver #04 (Deni)";
        }

        // 4. Calculate Live Waste Composition from transaction_items
        const categoryWeights: Record<string, { weight: number; points: number }> = {
          cup_plastik: { weight: 0, points: 5 },
          kardus: { weight: 0, points: 15 },
          botol_plastik: { weight: 0, points: 10 },
          kaleng: { weight: 0, points: 20 },
          tutup_cup: { weight: 0, points: 3 },
        };

        let totalCalculatedWeight = 0;

        dbTransactions.forEach((tx: any) => {
          if (tx.status === "confirmed" && tx.transaction_items) {
            tx.transaction_items.forEach((item: any) => {
              const w = Number(item.weight_kg || 0);
              const p = Number(item.points_earned || 0);
              const catId = (item.category_id || "").toLowerCase();

              totalCalculatedWeight += w;

              if (catId.includes("cup") && !catId.includes("tutup")) {
                categoryWeights.cup_plastik.weight += w;
              } else if (catId.includes("botol")) {
                categoryWeights.botol_plastik.weight += w;
              } else if (catId.includes("tutup")) {
                categoryWeights.tutup_cup.weight += w;
              } else if (catId.includes("kardus")) {
                categoryWeights.kardus.weight += w;
              } else if (catId.includes("kaleng")) {
                categoryWeights.kaleng.weight += w;
              }
            });
          }
        });

        if (totalCalculatedWeight > 0) {
          const liveComposition: WasteCompositionItem[] = [
            {
              key: "cup_plastik",
              name: "Cup Plastik PP",
              weightKg: Math.round(categoryWeights.cup_plastik.weight * 10) / 10,
              percentage: Math.round((categoryWeights.cup_plastik.weight / totalCalculatedWeight) * 100),
              points: 5,
              color: "#0284c7",
              icon: "coffee",
            },
            {
              key: "kardus",
              name: "Kardus Kemasan",
              weightKg: Math.round(categoryWeights.kardus.weight * 10) / 10,
              percentage: Math.round((categoryWeights.kardus.weight / totalCalculatedWeight) * 100),
              points: 15,
              color: "#d97706",
              icon: "package_2",
            },
            {
              key: "botol_plastik",
              name: "Botol Plastik PET",
              weightKg: Math.round(categoryWeights.botol_plastik.weight * 10) / 10,
              percentage: Math.round((categoryWeights.botol_plastik.weight / totalCalculatedWeight) * 100),
              points: 10,
              color: "#15803d",
              icon: "local_drink",
            },
            {
              key: "kaleng",
              name: "Kaleng Krimer",
              weightKg: Math.round(categoryWeights.kaleng.weight * 10) / 10,
              percentage: Math.round((categoryWeights.kaleng.weight / totalCalculatedWeight) * 100),
              points: 20,
              color: "#0d9488",
              icon: "inventory_2",
            },
            {
              key: "tutup_cup",
              name: "Tutup Cup & Lid",
              weightKg: Math.round(categoryWeights.tutup_cup.weight * 10) / 10,
              percentage: Math.round((categoryWeights.tutup_cup.weight / totalCalculatedWeight) * 100),
              points: 3,
              color: "#7c3aed",
              icon: "takeout_dining",
            },
          ];

          dashboardData.wasteComposition = liveComposition;
        }
      } else {
        dashboardData.recentTransactions = [];
        dashboardData.notification = null;
        dashboardData.wasteComposition = defaultEmptyComposition;
      }

      // 4b. Sync Device & Collector Status from Database
      const liveDeviceStatus: DeviceCollectorStatus = {
        scaleStatus: "online",
        scaleModel: lastScaleModel,
        scaleLastSync: "Terkoneksi (Aktif)",
        nextPickupDate: nextPickupScheduleDate || (totalKg > 0 ? "Kamis, 28 Agu 2026" : "Belum Ada Jadwal"),
        nextPickupTime: nextPickupScheduleDate ? "10:00 WIB" : (totalKg > 0 ? "10:00 WIB" : ""),
        collectorName: nextPickupCollector,
        collectorPhone: "0812-3456-7890",
      };

      dashboardData.deviceStatus = liveDeviceStatus;

      // 5. Fetch Daily Missions from public.daily_missions
      const { data: dbMissions } = await supabase
        .from("daily_missions")
        .select("*")
        .limit(3);

      if (dbMissions && dbMissions.length > 0) {
        dashboardData.dailyMissions = dbMissions.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          targetKg: Number(m.target_kg || 5.0),
          progressKg: Math.min(Number(m.target_kg || 5.0), Math.round((Number(totalKg) * 0.2) * 10) / 10),
          rewardCoins: Number(m.reward_coins || 25),
          completed: totalKg >= Number(m.target_kg || 5.0),
        }));
      }

      // 6. Fetch Eco-Badges & User Unlocked Badges
      const { data: dbBadges } = await supabase.from("eco_badges").select("*");

      if (dbBadges && dbBadges.length > 0) {
        dashboardData.badges = dbBadges.map((b: any) => {
          const isUnlocked = unlockedBadgeMap.has(b.id) || (totalKg >= 25 && b.id === "bdg-2");
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

      // 7. Pure Live Leaderboard (Hanya Menampilkan Mitra Kafe, Akun Admin Dikecualikan)
      const { data: dbProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, cafe_name, city, total_kg, saldo_poin, tier, role")
        .neq("role", "admin")
        .order("total_kg", { ascending: false });

      // Fetch all unlocked badges for all users
      const { data: allUserBadges } = await supabase
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
