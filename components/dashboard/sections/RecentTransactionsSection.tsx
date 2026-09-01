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
      className="w-full flex flex-col rounded-2xl border border-[#bbcabf]/40 bg-white p-6 sm:p-7 shadow-xs min-w-0"
      aria-labelledby="recent-transactions-heading"
    >
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-[#bbcabf]/20 pb-5 w-full">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49] shrink-0 shadow-2xs">
            <GoogleIcon name="receipt_long" size={20} />
          </div>
          <div>
            <h2
              id="recent-transactions-heading"
              className="text-base sm:text-lg font-bold text-[#0b1c30]"
            >
              Transaksi Daur Ulang
            </h2>
            <p className="text-xs sm:text-sm text-[#3c4a42] mt-0.5">
              3 setoran sampah terbaru
            </p>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0 max-w-full">
          {filterTabs.map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleCategoryChange(tab.key)}
                className={`rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
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
      <div className="divide-y divide-[#bbcabf]/20 w-full mt-2">
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

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-4 first:pt-3 last:pb-2 gap-3 transition-colors hover:bg-[#f8f9ff]/70 rounded-xl px-2 -mx-2"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform hover:scale-105"
                    style={{
                      backgroundColor: category.bgColor,
                      color: category.color,
                      borderColor: category.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <GoogleIcon name={category.icon} size={22} />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#0b1c30] truncate">
                        {tx.material}
                      </span>
                      <span className="text-[10px] font-mono text-[#6c7a71] bg-[#f1f5f9] px-2 py-0.5 rounded-md border border-[#bbcabf]/30">
                        {tx.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6c7a71] mt-1 flex-wrap">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#0b1c30]">
                        {formatWeight(tx.weightKg)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px] text-[#3c4a42]">
                        <GoogleIcon
                          name={tx.method === "drop_point" ? "storefront" : "local_shipping"}
                          size={13}
                        />
                        <span>{tx.method === "drop_point" ? "Drop Point" : "Dijemput (Pickup)"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Coins Earned & Status */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        tx.status === "confirmed"
                          ? "bg-[#eff4ff] text-[#006c49] border border-[#adedd3]"
                          : "bg-[#fff8e1] text-[#92400e] border border-[#fde68a]"
                      }`}
                    >
                      <GoogleIcon
                        name={tx.status === "confirmed" ? "check_circle" : "schedule"}
                        size={12}
                        filled
                      />
                      <span>{tx.status === "confirmed" ? "Terverifikasi" : "Menunggu"}</span>
                    </span>

                    <span className="text-xs sm:text-sm font-black text-[#d97706] bg-[#fef3c7] px-2.5 py-0.5 rounded-full border border-[#fde68a]">
                      +{tx.coins} 🪙
                    </span>
                  </div>
                </div>
              </div>
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
