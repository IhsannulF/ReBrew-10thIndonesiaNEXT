"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export interface AdminHeaderProps {
  admin: {
    name: string;
    email: string;
    role: string;
  };
  notifications?: {
    pendingTickets: number;
    pendingPayouts: number;
  };
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  admin,
  notifications = { pendingTickets: 0, pendingPayouts: 0 },
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMarkedRead, setIsMarkedRead] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPending = isMarkedRead
    ? 0
    : notifications.pendingTickets + notifications.pendingPayouts;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#bbcabf]/30 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Title & Status indicator / Mobile Logo */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile View Brand Logo */}
        <Link href="/admin" className="flex md:hidden items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="ReBrew Logo"
            width={90}
            height={26}
            className="h-6 w-auto object-contain"
            priority
          />
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#006c49] text-white uppercase">
            ADMIN
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[#006c49] uppercase tracking-wider">
            Admin Live Operation
          </span>
        </div>
        <span className="text-gray-300 hidden md:inline">|</span>
        <div className="text-xs text-[#6c7a71] truncate hidden sm:block">
          Micro-Hub Surabaya Timur (Jl. Raya Gn. Anyar Sawah No.15)
        </div>
      </div>

      {/* Right: Quick actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Tooltip & Dropdown Popover */}
        <div className="relative" ref={dropdownRef}>
          {/* Notification Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              setShowTooltip(false);
            }}
            onMouseEnter={() => !isOpen && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#bbcabf]/40 bg-white text-[#3c4a42] hover:bg-[#f8f9ff] hover:text-[#006c49] transition-all cursor-pointer shadow-2xs"
            aria-label="Notifikasi Operasional Admin"
            aria-expanded={isOpen}
          >
            <GoogleIcon name="notifications" size={19} />
            
            {/* Red / Emerald Alert Dot & Badge */}
            {totalPending > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ba1a1a] px-1 text-[9px] font-extrabold text-white shadow-xs animate-in zoom-in">
                {totalPending > 9 ? "9+" : totalPending}
              </span>
            )}
          </button>

          {/* Hover Tooltip */}
          {showTooltip && !isOpen && (
            <div className="absolute right-0 top-11 z-50 whitespace-nowrap rounded-lg bg-[#0b1c30] px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg animate-fade-in pointer-events-none">
              {totalPending > 0
                ? `${totalPending} Notifikasi Operasional Baru`
                : "Tidak ada notifikasi baru"}
              {/* Arrow */}
              <div className="absolute -top-1 right-3.5 h-2 w-2 rotate-45 bg-[#0b1c30]" />
            </div>
          )}

          {/* Notification Dropdown Popover */}
          {isOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-[#bbcabf]/40 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Popover Header */}
              <div className="flex items-center justify-between border-b border-[#bbcabf]/20 bg-linear-to-r from-[#f8f9ff] to-[#eff4ff] p-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#0b1c30]">
                    Pusat Notifikasi Admin
                  </span>
                  {totalPending > 0 ? (
                    <span className="rounded-full bg-[#eff4ff] border border-[#adedd3] px-2 py-0.5 text-[10px] font-extrabold text-[#006c49]">
                      {totalPending} Baru
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                      Semua Terbaca
                    </span>
                  )}
                </div>

                {totalPending > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsMarkedRead(true)}
                    className="text-[11px] font-semibold text-[#006c49] hover:underline cursor-pointer"
                  >
                    Tandai Dibaca
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="divide-y divide-[#bbcabf]/15 max-h-80 overflow-y-auto">
                {/* 1. Antrean Verifikasi Tiket */}
                <Link
                  href="/admin/verifikasi"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-3.5 hover:bg-[#f8f9ff] transition-colors group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49] group-hover:bg-[#006c49] group-hover:text-white transition-colors">
                    <GoogleIcon name="fact_check" size={18} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0b1c30]">
                        Verifikasi Tiket Setoran
                      </span>
                      <span className="text-[10px] text-[#6c7a71]">Live</span>
                    </div>
                    <p className="text-[11px] text-[#3c4a42] mt-0.5 leading-relaxed">
                      {notifications.pendingTickets > 0
                        ? `Terdapat ${notifications.pendingTickets} tiket setoran menunggu penimbangan fisik di Micro-Hub.`
                        : "Seluruh tiket setoran telah selesai diverifikasi."}
                    </p>
                    <span className="text-[10px] font-bold text-[#006c49] mt-1 group-hover:underline flex items-center gap-1">
                      <span>Buka Antrean Verifikasi</span>
                      <GoogleIcon name="arrow_forward" size={11} />
                    </span>
                  </div>
                </Link>

                {/* 2. Permintaan Approval Payout */}
                <Link
                  href="/admin/payout"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-3.5 hover:bg-[#f8f9ff] transition-colors group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fffdf5] text-[#d97706] group-hover:bg-[#d97706] group-hover:text-white transition-colors">
                    <GoogleIcon name="payments" size={18} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0b1c30]">
                        Pencairan Saldo Mitra
                      </span>
                      <span className="text-[10px] text-[#6c7a71]">Keuangan</span>
                    </div>
                    <p className="text-[11px] text-[#3c4a42] mt-0.5 leading-relaxed">
                      {notifications.pendingPayouts > 0
                        ? `Ada ${notifications.pendingPayouts} permintaan payout saldo mitra kafe menunggu approval transfer.`
                        : "Tidak ada permintaan pencairan saldo yang tertunda."}
                    </p>
                    <span className="text-[10px] font-bold text-[#d97706] mt-1 group-hover:underline flex items-center gap-1">
                      <span>Kelola Approval Payout</span>
                      <GoogleIcon name="arrow_forward" size={11} />
                    </span>
                  </div>
                </Link>

                {/* 3. Operasional Logistik & Penjemputan */}
                <Link
                  href="/admin/logistik"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-3.5 hover:bg-[#f8f9ff] transition-colors group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white transition-colors">
                    <GoogleIcon name="local_shipping" size={18} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0b1c30]">
                        Jadwal Armada & Micro-Hub
                      </span>
                      <span className="text-[10px] text-[#6c7a71]">Logistik</span>
                    </div>
                    <p className="text-[11px] text-[#3c4a42] mt-0.5 leading-relaxed">
                      Armada penjemputan Micro-Hub Surabaya Timur beroperasi aktif untuk rute kafe terdaftar.
                    </p>
                    <span className="text-[10px] font-bold text-[#0284c7] mt-1 group-hover:underline flex items-center gap-1">
                      <span>Lihat Rute Logistik</span>
                      <GoogleIcon name="arrow_forward" size={11} />
                    </span>
                  </div>
                </Link>
              </div>

              {/* Popover Footer */}
              <div className="bg-[#f8f9ff] p-2.5 text-center border-t border-[#bbcabf]/20">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] font-bold text-[#006c49] hover:underline"
                >
                  Lihat Ringkasan Platform Control Center
                </Link>
              </div>
            </div>
          )}
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
