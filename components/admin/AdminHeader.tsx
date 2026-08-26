"use client";

import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export interface AdminHeaderProps {
  admin: {
    name: string;
    email: string;
    role: string;
  };
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ admin }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#bbcabf]/30 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Title & Status indicator */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#006c49] uppercase tracking-wider hidden sm:inline">
            Admin Live Operation
          </span>
        </div>
        <span className="text-gray-300 hidden sm:inline">|</span>
        <div className="text-xs text-[#6c7a71] truncate">
          Micro-Hub Surabaya Timur (Jl. Raya Gn. Anyar Sawah No.15)
        </div>
      </div>

      {/* Right: Quick actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Switch to Cafe View Link */}
        <Link
          href="/dashboard"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#006c49] transition-colors"
        >
          <GoogleIcon name="store" size={15} />
          <span>Lihat Tampilan Kafe</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#bbcabf]/40 bg-white text-[#3c4a42] hover:bg-[#f8f9ff] transition-colors"
            aria-label="Notifikasi"
          >
            <GoogleIcon name="notifications" size={18} />
          </button>
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-[#006c49]" />
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#bbcabf]/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006c49] text-white text-xs font-bold shadow-xs">
            {admin.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-[#0b1c30] leading-none truncate max-w-[120px]">
              {admin.name}
            </span>
            <span className="text-[10px] text-[#006c49] font-semibold mt-0.5">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
