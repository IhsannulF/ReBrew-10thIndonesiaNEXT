"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    cafeName?: string | null;
    tier?: string | null;
    balanceCoins?: number;
    balanceIdr?: number;
  } | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const balanceCoins = user?.balanceCoins ?? 1480;
  const balanceIdr = user?.balanceIdr ?? balanceCoins * 50;

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-[68px] w-full items-center justify-between border-b border-[#bbcabf]/30 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
        {/* Mobile Left: Menu Toggle & Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka menu navigasi"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0b1c30] transition-colors hover:bg-[#eff4ff]"
          >
            <GoogleIcon name="menu" size={24} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="ReBrew"
              width={96}
              height={28}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Left: Portal Title & Live Badge */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm font-bold text-[#0b1c30]">
            Portal Mitra Kafe
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff4ff] border border-[#adedd3] px-3 py-1 text-xs font-bold text-[#006c49]">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Right Section: Saldo & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Balance Pill */}
          <Link
            href="/dashboard/saldo"
            className="flex items-center gap-2.5 rounded-full border border-[#bbcabf]/40 bg-[#f8f9ff] px-4 py-2 transition-all hover:border-[#006c49] hover:bg-[#eff4ff] shadow-2xs"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#006c49] text-white">
              <GoogleIcon name="monetization_on" size={14} filled />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-extrabold text-[#0b1c30]">
                {balanceCoins.toLocaleString("id-ID")}
              </span>
              <span className="text-[11px] font-medium text-[#3c4a42]">
                (Rp {balanceIdr.toLocaleString("id-ID")})
              </span>
            </div>
          </Link>

          {/* Quick Add Button */}
          <Link
            href="/dashboard/setor"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#006c49] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#005236]"
          >
            <GoogleIcon name="add" size={16} />
            <span>Setor</span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 z-50 w-[260px] bg-white shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
            <DashboardSidebar
              user={user}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
