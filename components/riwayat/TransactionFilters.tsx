"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import {
  TransactionFilterState,
  TransactionStatus,
  WasteCategoryKey,
  DepositMethod,
} from "@/types/transaction";
import { CATEGORY_OPTIONS } from "@/constants/transactionHistoryData";

interface TransactionFiltersProps {
  filters: TransactionFilterState;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (status: "all" | TransactionStatus) => void;
  setCategoryFilter: (cat: WasteCategoryKey) => void;
  setMethodFilter: (method: "all" | DepositMethod) => void;
  setSortBy: (sort: TransactionFilterState["sortBy"]) => void;
  resetFilters: () => void;
  totalFiltered: number;
  totalOriginal: number;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  setSearchQuery,
  setStatusFilter,
  setCategoryFilter,
  setMethodFilter,
  setSortBy,
  resetFilters,
  totalFiltered,
  totalOriginal,
}) => {
  const statusTabs: { key: "all" | TransactionStatus; label: string; countColor?: string }[] = [
    { key: "all", label: "Semua Transaksi" },
    { key: "confirmed", label: "Terverifikasi" },
    { key: "pending", label: "Menunggu Timbang" },
    { key: "rejected", label: "Ditolak" },
  ];

  const hasActiveFilter =
    filters.searchQuery.trim() !== "" ||
    filters.statusFilter !== "all" ||
    filters.categoryFilter !== "all" ||
    filters.methodFilter !== "all" ||
    filters.sortBy !== "latest";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-xs w-full">
      {/* Top Bar: Search Bar & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6c7a71]">
            <GoogleIcon name="search" size={20} />
          </span>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID tiket, nama material, atau lokasi drop point..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] text-sm text-[#0b1c30] placeholder-[#6c7a71] focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6c7a71] hover:text-[#0b1c30]"
              title="Hapus pencarian"
            >
              <GoogleIcon name="close" size={16} />
            </button>
          )}
        </div>

        {/* Filters Controls Group */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Method Filter Dropdown */}
          <select
            value={filters.methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as "all" | DepositMethod)}
            className="text-xs font-semibold text-[#0b1c30] bg-[#f8f9ff] border border-[#bbcabf]/40 rounded-xl px-3 py-2.5 outline-none focus:border-[#006c49] cursor-pointer"
          >
            <option value="all">Semua Metode</option>
            <option value="drop_point">Drop Point (Antar)</option>
            <option value="dijemput">Dijemput Armada</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as TransactionFilterState["sortBy"])
            }
            className="text-xs font-semibold text-[#0b1c30] bg-[#f8f9ff] border border-[#bbcabf]/40 rounded-xl px-3 py-2.5 outline-none focus:border-[#006c49] cursor-pointer"
          >
            <option value="latest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="highest_points">Poin Terbanyak</option>
            <option value="highest_weight">Berat Terbesar</option>
          </select>

          {/* Reset Filter Button */}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-bold text-[#ba1a1a] bg-[#ffdad6]/40 hover:bg-[#ffdad6] border border-[#ffdad6] px-3 py-2.5 rounded-xl transition-colors shrink-0"
              title="Reset semua filter"
            >
              <GoogleIcon name="restart_alt" size={16} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Scrollable Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-[#bbcabf]/20 pt-3.5">
        <span className="text-xs font-bold text-[#6c7a71] shrink-0 mr-1 flex items-center gap-1">
          <GoogleIcon name="tune" size={15} />
          Kategori:
        </span>
        {CATEGORY_OPTIONS.map((cat) => {
          const isActive = filters.categoryFilter === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategoryFilter(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? "bg-[#006c49] text-white shadow-2xs"
                  : "bg-[#f8f9ff] text-[#3c4a42] border border-[#bbcabf]/30 hover:bg-[#eff4ff] hover:text-[#006c49]"
              }`}
            >
              <GoogleIcon name={cat.icon} size={15} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Filter Tab Pills & Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusTabs.map((tab) => {
            const isActive = filters.statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#0b1c30] text-white"
                    : "text-[#6c7a71] hover:text-[#0b1c30] hover:bg-[#f8f9ff]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-[#6c7a71]">
          Menampilkan <strong className="text-[#0b1c30]">{totalFiltered}</strong> dari {totalOriginal} riwayat
        </span>
      </div>
    </div>
  );
};
