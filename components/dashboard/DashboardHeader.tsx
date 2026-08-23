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

  const balanceCoins = user?.balanceCoins ?? 1250;
  const balanceIdr = user?.balanceIdr ?? balanceCoins * 50;

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-[68px] w-full items-center justify-between border-b border-[#d8e6d9] bg-white px-4 sm:px-6 backdrop-blur-sm">
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
              width={100}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Left: Portal Title / Welcome */}
        <div className="hidden md:flex items-center gap-2.5">
          <h1 className="text-base font-bold text-[#0b1c30]">
            Portal Mitra Kafe
          </h1>
          <span className="rounded-full bg-[#eff4ff] px-2.5 py-0.5 text-xs font-semibold text-[#006c49]">
            Real-Time Monitor
          </span>
        </div>

        {/* Right Section: Saldo & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Balance Pill */}
          <Link
            href="/dashboard/saldo"
            className="flex items-center gap-2 rounded-full border border-[#d8e6d9] bg-[#f8f9ff] px-3.5 py-1.5 transition-colors hover:border-[#006c49] hover:bg-[#eff4ff]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#006c49] text-white">
              <GoogleIcon name="toll" size={14} filled />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-[#0b1c30]">
                {balanceCoins.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] text-[#3c4a42]">
                (Rp {balanceIdr.toLocaleString("id-ID")})
              </span>
            </div>
          </Link>

          {/* Notifications Button */}
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#3c4a42] transition-colors hover:bg-[#eff4ff] hover:text-[#006c49]"
          >
            <GoogleIcon name="notifications" size={22} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f43f5e]" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
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
