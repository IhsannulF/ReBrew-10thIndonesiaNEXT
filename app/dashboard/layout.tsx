import React from "react";
import { cookies } from "next/headers";
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

  const userProfile = {
    name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Budi",
    email: user?.email || "budi@gmail.com",
    cafeName: user?.user_metadata?.cafe_name || user?.user_metadata?.full_name || "Kopi Selamat Cafe",
    tier: "Eco Partner ⭐",
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
