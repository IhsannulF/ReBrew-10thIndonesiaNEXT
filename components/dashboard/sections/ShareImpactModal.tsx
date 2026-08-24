"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { CafeProfile, DashboardStats } from "@/types/dashboard";
import { formatWeight } from "@/lib/dashboard-utils";

interface ShareImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CafeProfile;
  stats: DashboardStats;
}

export const ShareImpactModal: React.FC<ShareImpactModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(
      `https://rebrew.id/eco-partner/${user.id || "kopiselamat"}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-50 flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border border-[#bbcabf]/30">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#bbcabf]/20 p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <GoogleIcon name="share" size={20} className="text-[#006c49]" />
            <h3 className="text-sm font-bold text-[#0b1c30]">
              Bagikan Dampak Hijau Kafe
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#6c7a71] hover:bg-[#eff4ff] hover:text-[#0b1c30]"
          >
            ×
          </button>
        </div>

        {/* Shareable Card Canvas Preview */}
        <div className="p-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00422b] via-[#006c49] to-[#002113] p-6 text-white shadow-lg border border-[#adedd3]/30">
            {/* Top Brand & Partner */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="ReBrew"
                  width={80}
                  height={24}
                  className="h-6 w-auto brightness-0 invert object-contain"
                />
              </div>
              <span className="rounded-full bg-white/20 border border-white/30 px-3 py-0.5 text-[10px] font-bold tracking-wide uppercase text-[#adedd3]">
                Verified Eco-Partner
              </span>
            </div>

            {/* Center Cafe Branding */}
            <div className="mt-6 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white mb-2 shadow-inner">
                <GoogleIcon name="storefront" size={28} />
              </div>
              <h4
                className="text-xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-fraunces, serif)" }}
              >
                {user.cafeName}
              </h4>
              <p className="text-xs text-[#adedd3] mt-1 font-medium">
                Bulan Ini Berhasil Memilah & Mendaur Ulang:
              </p>
            </div>

            {/* Stat Counters */}
            <div className="mt-5 grid grid-cols-2 gap-3 bg-black/25 rounded-xl p-3.5 border border-white/15">
              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] uppercase font-bold text-white/70">
                  Limbah Terpilah
                </span>
                <span
                  className="text-xl font-extrabold text-[#6ffbbe] mt-0.5"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {formatWeight(stats.wasteKgThisMonth)}
                </span>
              </div>

              <div className="flex flex-col items-center text-center border-l border-white/15">
                <span className="text-[10px] uppercase font-bold text-white/70">
                  Reduksi Karbon
                </span>
                <span
                  className="text-xl font-extrabold text-white mt-0.5"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {stats.co2SavedKg.toFixed(1)} kg CO₂
                </span>
              </div>
            </div>

            {/* Bottom Tagline */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-white/80 border-t border-white/15 pt-3">
              <span>🌱 Bersama ReBrew WMaaS</span>
              <span className="font-mono">#PilahSampahCiptakanDampak</span>
            </div>
          </div>

          {/* Action Share Buttons */}
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#006c49] py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#005236]"
            >
              <GoogleIcon name="content_copy" size={16} />
              <span>{copied ? "Link Profil Tersalin! ✔" : "Salin Link Kartu Sertifikat"}</span>
            </button>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Kedai ${user.cafeName} telah mendaur ulang ${stats.wasteKgThisMonth} kg limbah plastik bersama @rebrew.id! Cek aksi kami di https://rebrew.id`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#bbcabf]/50 bg-[#f8f9ff] py-2 text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff]"
              >
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => alert("Kartu siap dibagikan ke Instagram Story!")}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#bbcabf]/50 bg-[#f8f9ff] py-2 text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff]"
              >
                <span>Instagram Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
