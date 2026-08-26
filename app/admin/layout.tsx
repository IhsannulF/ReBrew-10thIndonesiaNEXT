import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

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

  // Security guard: If user is not admin, redirect to partner dashboard
  const userRole = profile?.role || "mitra";
  if (userRole !== "admin") {
    redirect("/dashboard");
  }

  const adminProfile = {
    name: profile?.full_name || user.user_metadata?.full_name || "Admin ReBrew",
    email: profile?.email || user.email || "admin@rebrew.id",
    role: "admin",
    hubLocation: "Surabaya Timur",
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f4f7fb] text-[#0b1c30]">
      {/* Left Persistent Desktop Admin Sidebar */}
      <div className="hidden md:flex shrink-0 w-[240px] sticky top-0 h-screen z-40">
        <AdminSidebar admin={adminProfile} />
      </div>

      {/* Main Content & Admin Header */}
      <div className="flex flex-1 flex-col min-w-0 w-full overflow-x-hidden">
        <AdminHeader admin={adminProfile} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full">
          <div className="mx-auto max-w-7xl w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
