import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { RecyclingDashboard } from "@/components/dashboard/RecyclingDashboard";
import { DashboardData, TransactionItem, WasteCategoryKey } from "@/types/dashboard";
import { initialDashboardData } from "@/lib/mock-dashboard-data";
import { calculateCO2Savings, coinsToIdr } from "@/lib/dashboard-utils";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    initialDashboardData.user.name;
  const userEmail = user?.email || initialDashboardData.user.email;
  const cafeName =
    user?.user_metadata?.cafe_name ||
    user?.user_metadata?.full_name ||
    initialDashboardData.user.cafeName;

  // Clone fallback base data
  const dashboardData: DashboardData = JSON.parse(JSON.stringify(initialDashboardData));

  // Override profile info with authenticated user
  dashboardData.user = {
    ...dashboardData.user,
    id: user?.id || dashboardData.user.id,
    name: userName,
    email: userEmail,
    cafeName,
  };

  if (user?.id) {
    try {
      // 1. Fetch user profile / balance if profiles or users table exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.saldo_poin !== undefined && profile.saldo_poin !== null) {
          dashboardData.stats.totalCoins = profile.saldo_poin;
          dashboardData.stats.balanceIdr = coinsToIdr(profile.saldo_poin);
        }
        if (profile.total_kg !== undefined && profile.total_kg !== null) {
          dashboardData.stats.wasteKgThisMonth = profile.total_kg;
          dashboardData.stats.co2SavedKg = calculateCO2Savings(profile.total_kg);
          dashboardData.target.currentKg = profile.total_kg;
        }
        if (profile.tier) {
          dashboardData.user.tier = profile.tier;
        }
      }

      // 2. Fetch latest user transactions from DB if table exists
      const { data: dbTransactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (dbTransactions && dbTransactions.length > 0) {
        const mappedTransactions: TransactionItem[] = dbTransactions.map((tx: any) => {
          const rawMaterial = (tx.material || tx.waste_category || "").toLowerCase();
          let categoryKey: WasteCategoryKey = "botol_plastik";
          let materialName = tx.material || "Botol Plastik PET";

          if (rawMaterial.includes("cup") && !rawMaterial.includes("tutup")) {
            categoryKey = "cup_plastik";
            materialName = "Cup Plastik PP";
          } else if (rawMaterial.includes("tutup") || rawMaterial.includes("lid")) {
            categoryKey = "tutup_cup";
            materialName = "Tutup Cup & Seal";
          } else if (rawMaterial.includes("kardus") || rawMaterial.includes("box") || rawMaterial.includes("karton")) {
            categoryKey = "kardus";
            materialName = "Kardus Kemasan";
          } else if (rawMaterial.includes("kaleng") || rawMaterial.includes("can")) {
            categoryKey = "kaleng";
            materialName = "Kaleng Krimer/Soda";
          }

          return {
            id: tx.id || `RB-${Math.floor(100 + Math.random() * 900)}`,
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
            weightKg: Number(tx.weight_kg || tx.weight || 1.0),
            coins: Number(tx.points_earned || tx.coins || 10),
            status: tx.status || "confirmed",
            method: tx.method === "dijemput" ? "dijemput" : "drop_point",
            dropPointName: tx.drop_point_name || "ReBrew Hub Gubeng",
          };
        });

        dashboardData.recentTransactions = mappedTransactions;
      }
    } catch {
      // Gracefully fall back to initialDashboardData
    }
  }

  return <RecyclingDashboard data={dashboardData} />;
}
