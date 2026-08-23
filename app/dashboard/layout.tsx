import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

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

  const userProfile = {
    name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Budi",
    email: user?.email || "budi@gmail.com",
    cafeName: user?.user_metadata?.cafe_name || user?.user_metadata?.full_name || "Kopi Selamat Cafe",
    tier: "Eco Partner ⭐",
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f5f4ef] text-[#1a2a1b]">
      {/* Left Persistent Sidebar */}
      <div className="hidden md:flex shrink-0 w-[220px] sticky top-0 h-screen bg-white">
        <DashboardSidebar user={userProfile} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-[1060px]">{children}</div>
      </main>
    </div>
  );
}
