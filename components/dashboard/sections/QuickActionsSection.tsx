import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

interface QuickActionsSectionProps {
  onOpenShareModal?: () => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onOpenShareModal,
}) => {
  return (
    <section
      className="flex w-full flex-col rounded-2xl border border-[#bbcabf]/40 bg-white p-6 shadow-xs"
      aria-labelledby="quick-actions-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#bbcabf]/20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49] shadow-2xs">
            <GoogleIcon name="bolt" size={18} filled />
          </div>
          <h2
            id="quick-actions-heading"
            className="text-base font-bold text-[#0b1c30]"
          >
            Aksi & Layanan Cepat
          </h2>
        </div>

        {onOpenShareModal && (
          <button
            type="button"
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006c49] bg-[#eff4ff] border border-[#adedd3] px-3 py-1.5 rounded-xl hover:bg-[#dce9ff] transition-colors"
          >
            <GoogleIcon name="share" size={15} />
            <span>Share Dampak</span>
          </button>
        )}
      </div>

      {/* 2x2 Action Grid */}
      <div className="mt-5 grid grid-cols-2 gap-3.5">
        {/* 1. Setor Sampah (Primary Emerald Theme) */}
        <Link
          href="/dashboard/setor"
          className="flex flex-col items-center justify-center text-center p-5 rounded-2xl border border-[#adedd3] bg-gradient-to-br from-white via-[#f0fdf4] to-[#adedd3]/30 transition-all hover:shadow-md hover:-translate-y-0.5 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#006c49] text-white mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
            <GoogleIcon name="recycling" size={24} />
          </div>
          <span className="text-sm font-bold text-[#006c49] mb-0.5">
            Setor Sampah
          </span>
          <span className="text-xs text-[#306d58] leading-snug">
            Input timbangan
          </span>
        </Link>

        {/* 2. Tarik Saldo (Amber Theme) */}
        <Link
          href="/dashboard/saldo"
          className="flex flex-col items-center justify-center text-center p-5 rounded-2xl border border-[#fde68a] bg-gradient-to-br from-white via-[#fffdf5] to-[#fef3c7]/40 transition-all hover:shadow-md hover:-translate-y-0.5 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d97706] text-white mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
            <GoogleIcon name="payments" size={24} />
          </div>
          <span className="text-sm font-bold text-[#92400e] mb-0.5">
            Tarik Saldo
          </span>
          <span className="text-xs text-[#78350f] leading-snug">
            Transfer kas
          </span>
        </Link>

        {/* 3. AI Insight (Forest Green / Secondary) */}
        <Link
          href="/dashboard/insight"
          className="flex flex-col items-center justify-center text-center p-5 rounded-2xl border border-[#bbcabf]/60 bg-gradient-to-br from-white via-[#f8f9ff] to-[#eff4ff] transition-all hover:shadow-md hover:-translate-y-0.5 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2b6954] text-white mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
            <GoogleIcon name="auto_awesome" size={24} />
          </div>
          <span className="text-sm font-bold text-[#2b6954] mb-0.5">
            AI Insight
          </span>
          <span className="text-xs text-[#3c4a42] leading-snug">
            Analisis kafe
          </span>
        </Link>

        {/* 4. Riwayat (Primary Container Theme) */}
        <Link
          href="/dashboard/riwayat"
          className="flex flex-col items-center justify-center text-center p-5 rounded-2xl border border-[#adedd3] bg-gradient-to-br from-white via-[#f0fdf4] to-[#adedd3]/30 transition-all hover:shadow-md hover:-translate-y-0.5 group"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10b981] text-[#00422b] mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
            <GoogleIcon name="receipt_long" size={24} />
          </div>
          <span className="text-sm font-bold text-[#00422b] mb-0.5">
            Riwayat
          </span>
          <span className="text-xs text-[#306d58] leading-snug">
            Semua data
          </span>
        </Link>
      </div>
    </section>
  );
};
