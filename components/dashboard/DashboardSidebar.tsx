"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { signout } from "@/app/actions/auth";

interface NavigationItem {
  label: string;
  href: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  { label: "Beranda", href: "/dashboard", icon: "grid_view" },
  { label: "Setor Sampah", href: "/dashboard/setor", icon: "recycling" },
  { label: "Riwayat", href: "/dashboard/riwayat", icon: "receipt_long" },
  { label: "Tarik Uang", href: "/dashboard/saldo", icon: "payments" },
  { label: "AI Insight", href: "/dashboard/insight", icon: "auto_awesome" },
];

interface DashboardSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    cafeName?: string | null;
    tier?: string | null;
  } | null;
  onCloseMobile?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  user,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const userName = user?.name || user?.email?.split("@")[0] || "Mitra Kafe";
  const initial = userName.charAt(0).toUpperCase() || "M";

  return (
    <aside
      className="flex h-full w-[230px] flex-col justify-between border-r border-[#bbcabf]/30 bg-white text-[#0b1c30]"
      aria-label="Navigasi dashboard"
    >
      {/* Top Section: Logo & Nav */}
      <div className="flex flex-col">
        {/* Logo Header */}
        <div className="flex h-[68px] items-center border-b border-[#bbcabf]/30 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label="ReBrew Beranda"
            onClick={onCloseMobile}
          >
            <Image
              src="/logo.png"
              alt="ReBrew"
              width={110}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1.5 px-3.5 py-5 w-full" aria-label="Menu utama">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#006c49] text-white shadow-sm"
                    : "text-[#3c4a42] hover:bg-[#eff4ff] hover:text-[#006c49]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                    isActive ? "text-white" : "text-[#3c4a42]"
                  }`}
                >
                  <GoogleIcon name={item.icon} size={20} filled={isActive} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile Card */}
      <div className="border-t border-[#bbcabf]/30 p-4">
        <div className="flex items-center justify-between rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 p-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Circle */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#006c49] text-xs font-bold text-white shadow-xs">
              {initial}
            </div>

            {/* Name */}
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-bold text-[#0b1c30]">
                {userName}
              </span>
            </div>
          </div>

          {/* Quick Signout */}
          <form action={signout}>
            <button
              type="submit"
              title="Keluar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6c7a71] transition-colors hover:bg-white hover:text-[#ba1a1a] cursor-pointer"
            >
              <GoogleIcon name="logout" size={18} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
};
