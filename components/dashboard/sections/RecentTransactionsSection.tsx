"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { TransactionItem } from "@/types/dashboard";
import { WASTE_CATEGORIES } from "@/lib/constants";
import { formatWeight } from "@/lib/dashboard-utils";

interface RecentTransactionsSectionProps {
  transactions: TransactionItem[];
}

export const RecentTransactionsSection: React.FC<RecentTransactionsSectionProps> = ({
  transactions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const maxHomeItems = 3; // Maksimal 3 riwayat terbaru di beranda

  const filterTabs: { key: string; label: string; activeColor: string }[] = [
    { key: "all", label: "Semua", activeColor: "bg-[#006c49]" },
    { key: "cup_plastik", label: "Cup Plastik", activeColor: "bg-[#006c49]" },
    { key: "botol_plastik", label: "Botol Plastik", activeColor: "bg-[#006c49]" },
  ];

  const handleCategoryChange = (key: string) => {
    setSelectedCategory(key);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedCategory === "all") return true;
      return tx.categoryKey === selectedCategory;
    });
  }, [transactions, selectedCategory]);

  const displayTransactions = filteredTransactions.slice(0, maxHomeItems);

  return (
    <section
      className="w-full flex flex-col rounded-2xl border border-[#bbcabf]/40 bg-white p-4 sm:p-6 lg:p-7 shadow-xs min-w-0"
      aria-labelledby="recent-transactions-heading"
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-[#bbcabf]/20 pb-4 sm:pb-5 w-full">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49] shrink-0 shadow-2xs">
            <GoogleIcon name="receipt_long" size={20} />
          </div>
          <div>
            <h2
              id="recent-transactions-heading"
              className="text-base sm:text-lg font-bold text-[#0b1c30] tracking-tight"
            >
              Transaksi Daur Ulang
            </h2>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {filterTabs.map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleCategoryChange(tab.key)}
                className={`rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${isActive
                    ? `${tab.activeColor} text-white shadow-xs`
                    : "bg-[#eff4ff] text-[#3c4a42] hover:bg-[#dce9ff] hover:text-[#006c49]"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col gap-2.5 w-full mt-3.5">
        {displayTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#6c7a71] mb-2.5">
              <GoogleIcon name="folder_open" size={24} />
            </div>
            <p className="text-sm font-bold text-[#0b1c30]">
              Belum Ada Transaksi
            </p>
            <p className="text-xs text-[#6c7a71] mt-0.5">
              Mulai setoran pertama Anda untuk mendapatkan koin.
            </p>
            <Link
              href="/dashboard/setor"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#006c49] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#005236] transition"
            >
              <GoogleIcon name="add" size={16} />
              <span>Setor Sampah Sekarang</span>
            </Link>
          </div>
        ) : (
          displayTransactions.map((tx) => {
            const category = WASTE_CATEGORIES[tx.categoryKey] || WASTE_CATEGORIES.cup_plastik;
            const cleanMaterial = (tx.material || "").replace(/\s*\([^)]*\)/g, "").trim();

            return (
              <Link
                key={tx.id}
                href="/dashboard/riwayat"
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[#bbcabf]/30 bg-white hover:bg-[#f8f9ff] hover:border-[#006c49]/40 hover:shadow-xs transition-all gap-3 w-full cursor-pointer"
              >
                {/* Left: Category Icon & Main Info */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <div
                    className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shadow-2xs mt-0.5 sm:mt-0"
                    style={{
                      backgroundColor: category.bgColor,
                      color: category.color,
                      borderColor: category.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <GoogleIcon name={category.icon} size={20} />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-[#0b1c30] group-hover:text-[#006c49] transition-colors truncate">
                        {cleanMaterial}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#006c49] bg-[#eff4ff] px-2 py-0.5 rounded-md border border-[#adedd3] shrink-0">
                        {tx.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#6c7a71] flex-wrap">
                      <span className="flex items-center gap-1 shrink-0">
                        <GoogleIcon name="calendar_today" size={12} className="text-[#6c7a71]" />
                        <span>{tx.date}</span>
                      </span>
                      <span className="text-[#bbcabf]">•</span>
                      <span className="font-bold text-[#0b1c30] shrink-0">
                        {formatWeight(tx.weightKg)}
                      </span>
                      <span className="text-[#bbcabf]">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#3c4a42] bg-[#f0fdf4] px-2 py-0.5 rounded-md border border-[#adedd3]/60 shrink-0">
                        <GoogleIcon
                          name={tx.method === "drop_point" ? "store" : "local_shipping"}
                          size={13}
                        />
                        <span>{tx.method === "drop_point" ? "Drop Point" : "Dijemput"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right / Bottom on Mobile: Status & Coins */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#bbcabf]/20 w-full sm:w-auto">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-2xs border shrink-0 ${tx.status === "confirmed"
                        ? "bg-[#eff4ff] text-[#006c49] border-[#adedd3]"
                        : "bg-[#fff8e1] text-[#92400e] border-[#fde68a]"
                      }`}
                  >
                    <GoogleIcon
                      name={tx.status === "confirmed" ? "check_circle" : "schedule"}
                      size={12}
                      filled
                    />
                    <span>{tx.status === "confirmed" ? "Terverifikasi" : "Menunggu"}</span>
                  </span>

                  <span className="text-xs sm:text-sm font-black text-[#d97706] bg-gradient-to-br from-white to-[#fef3c7] px-2.5 sm:px-3 py-1 rounded-xl border border-[#fde68a] shadow-2xs flex items-center gap-1 shrink-0">
                    <span>+{tx.coins}</span>
                    <GoogleIcon name="monetization_on" size={14} filled className="text-[#d97706]" />
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Footer Navigation to Full History Page */}
      <div className="mt-4 pt-4 border-t border-[#bbcabf]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm w-full">
        <span className="text-[#3c4a42]">
          Menampilkan <strong className="text-[#0b1c30]">{Math.min(maxHomeItems, filteredTransactions.length)}</strong> dari <strong className="text-[#0b1c30]">{filteredTransactions.length}</strong> transaksi
        </span>

        <Link
          href="/dashboard/riwayat"
          className="font-bold text-[#006c49] hover:underline flex items-center gap-1"
        >
          <span>Lihat Riwayat Lengkap</span>
          <GoogleIcon name="arrow_forward" size={16} />
        </Link>
      </div>
    </section>
  );
};
