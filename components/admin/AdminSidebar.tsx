"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { signout } from "@/app/actions/auth";

export interface AdminSidebarProps {
  admin: {
    name: string;
    email: string;
    role: string;
    hubLocation?: string;
  };
  notifications?: {
    pendingTickets: number;
    pendingPayouts: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ admin, notifications }) => {
  const pathname = usePathname();

  const pendingTickets = notifications?.pendingTickets ?? 0;
  const pendingPayouts = notifications?.pendingPayouts ?? 0;

  const navItems = [
    {
      label: "Ringkasan Platform",
      href: "/admin",
      icon: "dashboard",
      badge: undefined,
    },
    {
      label: "Verifikasi Setoran",
      href: "/admin/verifikasi",
      icon: "fact_check",
      badge: pendingTickets > 0 ? `${pendingTickets}` : undefined,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      label: "Penjualan Offtaker",
      href: "/admin/offtaker",
      icon: "factory",
      badge: undefined,
    },
    {
      label: "Manajemen Mitra Kafe",
      href: "/admin/mitra",
      icon: "storefront",
      badge: undefined,
    },
    {
      label: "Armada & Logistik",
      href: "/admin/logistik",
      icon: "local_shipping",
      badge: undefined,
    },
    {
      label: "Approval Payout",
      href: "/admin/payout",
      icon: "payments",
      badge: pendingPayouts > 0 ? `${pendingPayouts}` : undefined,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      label: "Laporan ESG & Sertifikat",
      href: "/admin/laporan-esg",
      icon: "verified",
      badge: undefined,
    },
  ];

  return (
    <aside className="flex flex-col h-full w-full bg-[#0b1c30] text-white select-none border-r border-[#1e3a5f]/40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e3a5f]/40">
        <Link href="/admin" className="flex items-center gap-3 min-w-0 group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md shadow-[#006c49]/30 group-hover:scale-105 transition-transform">
            <Image
              src="/logo-mark.png"
              alt="ReBrew Logo"
              width={32}
              height={32}
              className="h-7 w-7 object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white">ReBrew</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#006c49] text-emerald-100 uppercase tracking-wider">
                ADMIN
              </span>
            </div>
            <span className="text-[11px] text-[#94a3b8] truncate">Platform Control Center</span>
          </div>
        </Link>
      </div>

      {/* Hub Location Badge */}
      <div className="px-4 py-2.5 mx-3 mt-3 rounded-xl bg-[#132842] border border-[#1e3a5f]/60 flex items-center gap-2">
        <GoogleIcon name="location_on" size={16} className="text-[#00a86b] shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Central Micro-Hub</span>
          <span className="text-xs font-semibold text-white truncate">Surabaya Timur</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
          Menu Utama Admin
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-[#006c49] text-white shadow-sm shadow-[#006c49]/40 font-bold"
                  : "text-[#cbd5e1] hover:bg-[#132842] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <GoogleIcon
                  name={item.icon}
                  size={19}
                  className={isActive ? "text-white" : "text-[#94a3b8] group-hover:text-emerald-400"}
                  filled={isActive}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#006c49]/30 text-emerald-300 border border-[#006c49]/40"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Admin User Footer & Signout */}
      <div className="p-3 border-t border-[#1e3a5f]/40 bg-[#081525]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#132842]/80 border border-[#1e3a5f]/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white text-xs font-bold">
              {admin.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{admin.name}</span>
              <span className="text-[10px] text-[#94a3b8] truncate">{admin.email}</span>
            </div>
          </div>

          <form action={signout}>
            <button
              type="submit"
              title="Keluar"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <GoogleIcon name="logout" size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
};
