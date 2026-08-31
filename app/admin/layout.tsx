import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { autoRejectExpiredPickups } from "@/app/actions/transactions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Check admin role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, city")
    .eq("id", user.id)
    .maybeSingle();

  const userEmail = (user.email || profile?.email || "").toLowerCase();
  const isAdminEmail = userEmail === "ihsanulfikri3176@gmail.com";

  // Security guard: If user is not admin, redirect to partner dashboard
  const userRole = isAdminEmail ? "admin" : (profile?.role || user.user_metadata?.role || "mitra");
  if (userRole !== "admin") {
    redirect("/dashboard");
  }

  // Auto-reject expired pickups
  await autoRejectExpiredPickups(supabase);

  // Fetch pending notifications counts
  const { count: pendingTxCount } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: pendingPayoutCount } = await supabase
    .from("payouts")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "processing"]);

  const adminProfile = {
    name: profile?.full_name || (isAdminEmail ? "Fathiyah Nurul Izzah" : (user.user_metadata?.full_name || "Fathiyah Nurul Izzah")),
    email: profile?.email || user.email || "ihsanulfikri3176@gmail.com",
    role: "admin",
    hubLocation: profile?.city ? `${profile.city} (Melawai)` : "Jakarta Selatan (Melawai)",
    address: "Jl. Iskandarsyah Raya No.65, Melawai, Jakarta Selatan",
  };

  const notificationCounts = {
    pendingTickets: pendingTxCount || 0,
    pendingPayouts: pendingPayoutCount || 0,
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f4f7fb] text-[#0b1c30]">
      {/* Left Persistent Desktop Admin Sidebar */}
      <div className="hidden md:flex shrink-0 w-[240px] sticky top-0 h-screen z-40">
        <AdminSidebar admin={adminProfile} notifications={notificationCounts} />
      </div>

      {/* Main Content & Admin Header */}
      <div className="flex flex-1 flex-col min-w-0 w-full overflow-x-hidden">
        <AdminHeader admin={adminProfile} notifications={notificationCounts} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full">
          <div className="mx-auto max-w-7xl w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
