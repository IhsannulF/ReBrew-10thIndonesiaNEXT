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

  const userName = user?.name || user?.email?.split("@")[0] || "Budi Santoso";
  const tierName = user?.tier || "Eco Partner ⭐";
  const initial = userName.charAt(0).toUpperCase() || "B";

  return (
    <aside
      className="flex h-full w-[220px] flex-col justify-between border-r border-[#d8e6d9] bg-white text-[#1a2a1b]"
      aria-label="Navigasi dashboard"
    >
      {/* Top Section: Logo & Nav */}
      <div className="flex flex-col">
        {/* Logo Header */}
        <div className="flex h-[76px] items-center border-b border-[#d8e6d9] px-5 py-4">
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
        <nav className="flex flex-col gap-1 px-3 py-4 w-full" aria-label="Menu utama">
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
                className={`flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "bg-[#2e7d32] text-white shadow-sm"
                    : "text-[#4a6a4c] hover:bg-[#f5f4ef] hover:text-[#2e7d32]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                    isActive ? "text-white" : "text-[#4a6a4c]"
                  }`}
                >
                  <GoogleIcon name={item.icon} size={18} filled={isActive} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile Card */}
      <div className="border-t border-[#d8e6d9] p-3">
        <div className="flex items-center justify-between rounded-[10px] bg-[#f5f4ef] p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar Circle */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#66bb6a] text-xs font-bold text-white shadow-sm">
              {initial}
            </div>

            {/* Name & Tier */}
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-bold text-[#1a2a1b]">
                {userName}
              </span>
              <span className="truncate text-[11px] font-normal text-[#6b7c6f]">
                {tierName}
              </span>
            </div>
          </div>

          {/* Quick Signout */}
          <form action={signout}>
            <button
              type="submit"
              title="Keluar"
              className="flex h-7 w-7 items-center justify-center rounded text-[#6b7c6f] transition-colors hover:bg-white hover:text-[#93000a]"
            >
              <GoogleIcon name="logout" size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
};
