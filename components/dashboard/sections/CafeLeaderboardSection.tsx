"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { LeaderboardEntry } from "@/types/dashboard";
import { formatNumber, formatWeight } from "@/lib/dashboard-utils";

interface CafeLeaderboardSectionProps {
  entries: LeaderboardEntry[];
  currentCity?: string;
}

export const CafeLeaderboardSection: React.FC<CafeLeaderboardSectionProps> = ({
  entries,
  currentCity = "Surabaya",
}) => {
  const [period, setPeriod] = useState<"monthly" | "all_time">("monthly");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(entries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = entries.slice(startIndex, startIndex + itemsPerPage);

  const handlePeriodChange = (newPeriod: "monthly" | "all_time") => {
    setPeriod(newPeriod);
    setCurrentPage(1);
  };

  return (
    <section
      className="w-full flex flex-col rounded-2xl border border-[#bbcabf]/40 bg-white p-6 shadow-xs min-w-0"
      aria-labelledby="leaderboard-heading"
    >
      {/* Header & Period Switcher */}
      <div className="flex flex-col gap-3 pb-4 border-b border-[#bbcabf]/20 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706] shadow-2xs">
              <GoogleIcon name="leaderboard" size={18} filled />
            </div>
            <div>
              <h2
                id="leaderboard-heading"
                className="text-sm sm:text-base font-bold text-[#0b1c30]"
              >
                Leaderboard
              </h2>
            </div>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => handlePeriodChange("monthly")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                period === "monthly"
                  ? "bg-[#006c49] text-white shadow-xs"
                  : "text-[#3c4a42] hover:text-[#006c49]"
              }`}
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => handlePeriodChange("all_time")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                period === "all_time"
                  ? "bg-[#006c49] text-white shadow-xs"
                  : "text-[#3c4a42] hover:text-[#006c49]"
              }`}
            >
              Semua
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard List (Max 10 Items per page) */}
      <div className="mt-3 divide-y divide-[#bbcabf]/20 w-full">
        {paginatedEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6c7a71]">
            Belum ada data peringkat mitra.
          </div>
        ) : (
          paginatedEntries.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const medalTheme =
              entry.rank === 1
                ? "text-[#92400e] bg-gradient-to-br from-[#ffffff] to-[#fef3c7] border border-[#fde68a]"
                : entry.rank === 2
                ? "text-[#475569] bg-gradient-to-br from-[#ffffff] to-[#e2e8f0] border border-[#cbd5e1]"
                : entry.rank === 3
                ? "text-[#7c2d12] bg-gradient-to-br from-[#ffffff] to-[#ffedd5] border border-[#fed7aa]"
                : "text-[#6c7a71] bg-[#f8f9ff]";

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between py-3.5 px-2.5 rounded-xl transition-all w-full gap-2 my-0.5 ${
                  entry.isCurrentCafe
                    ? "bg-[#eff4ff] border border-[#adedd3] shadow-2xs"
                    : "hover:bg-[#f8f9ff]"
                }`}
              >
                {/* Left: Rank & Cafe Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black shadow-2xs ${medalTheme}`}
                  >
                    {entry.rank}
                  </span>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="truncate text-xs sm:text-sm font-bold text-[#0b1c30]">
                        {entry.cafeName}
                      </span>
                      {entry.isCurrentCafe && (
                        <span className="shrink-0 text-[10px] font-bold text-[#006c49] bg-[#adedd3]/50 px-1.5 py-0.2 rounded">
                          Kafe Anda
                        </span>
                      )}
                    </div>
                    {entry.tierLabel ? (
                      <span className="text-[11px] font-bold text-[#92400e] truncate">
                        {entry.tierLabel}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#6c7a71] truncate">
                        {entry.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Waste Weight & Points */}
                <div className="flex items-center gap-2 shrink-0 pl-1 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-xs sm:text-sm font-black text-[#0b1c30]">
                      {formatWeight(entry.totalKg)}
                    </span>
                    <span className="text-[10px] font-bold text-[#92400e]">
                      +{formatNumber(entry.totalPoints)} koin
                    </span>
                  </div>

                  {isTop3 && (
                    <GoogleIcon
                      name="workspace_premium"
                      size={18}
                      filled
                      className={
                        entry.rank === 1
                          ? "text-[#d97706]"
                          : entry.rank === 2
                          ? "text-[#64748b]"
                          : "text-[#b45309]"
                      }
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer Controls (when > 10 items) */}
      {totalPages > 1 && (
        <div className="mt-4 pt-3.5 border-t border-[#bbcabf]/20 flex items-center justify-between gap-2 w-full text-xs">
          <span className="text-[#6c7a71]">
            Menampilkan <strong className="text-[#0b1c30]">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, entries.length)}</strong> dari <strong className="text-[#0b1c30]">{entries.length}</strong> mitra
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#bbcabf]/40 bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#eff4ff] hover:border-[#006c49] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
              aria-label="Halaman Sebelumnya"
            >
              <GoogleIcon name="chevron_left" size={18} />
            </button>

            <span className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#006c49] font-bold text-xs border border-[#adedd3]">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#bbcabf]/40 bg-[#f8f9ff] text-[#0b1c30] hover:bg-[#eff4ff] hover:border-[#006c49] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
              aria-label="Halaman Berikutnya"
            >
              <GoogleIcon name="chevron_right" size={18} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
