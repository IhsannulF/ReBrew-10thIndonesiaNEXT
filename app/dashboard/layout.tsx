import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect("/login");
  }

  // Check role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, cafe_name, tier, saldo_poin, total_kg, role")
    .eq("id", user.id)
    .maybeSingle();

  const userRole = profile?.role || user.user_metadata?.role || "mitra";

  // Role Security Guard: Admin must NOT view or access the user dashboard
  if (userRole === "admin") {
    redirect("/admin");
  }

  // Default fallback
  let userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Mitra ReBrew";
  let cafeName = profile?.cafe_name || user.user_metadata?.cafe_name || "Kedai Kopi Mitra";
  let tierName = "";
  let saldoPoin = Number(profile?.saldo_poin || 0);

  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("badge_id, eco_badges(name)")
    .eq("user_id", user.id);

  const badgeIds = (userBadges || []).map((b: any) => b.badge_id);

  if (profile) {
    if (profile.tier === "enterprise") {
      tierName = "Enterprise 🏆";
    } else if (badgeIds.includes("bdg-4")) {
      tierName = "Zero Waste Hero 🏆";
    } else if (badgeIds.includes("bdg-3")) {
      tierName = "Plastic Warrior 🛡️";
    } else if (badgeIds.includes("bdg-2")) {
      tierName = "1 Ton Club Contender ⭐";
    } else if (badgeIds.includes("bdg-1")) {
      tierName = "Eco Partner ⭐";
    } else {
      tierName = "";
    }
  }

  const userProfile = {
    name: userName,
    email: user.email || "mitra@rebrew.id",
    cafeName: cafeName,
    tier: tierName,
    balanceCoins: saldoPoin,
    balanceIdr: saldoPoin * 35,
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f8f9ff] text-[#0b1c30]">
      {/* Left Persistent Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 w-[230px] sticky top-0 h-screen bg-white z-40 border-r border-[#bbcabf]/40">
        <DashboardSidebar user={userProfile} />
      </div>

      {/* Main Content & Header Area */}
      <div className="flex flex-1 flex-col min-w-0 w-full overflow-x-hidden">
        <DashboardHeader user={userProfile} />
        
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full">
          <div className="mx-auto max-w-7xl w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
