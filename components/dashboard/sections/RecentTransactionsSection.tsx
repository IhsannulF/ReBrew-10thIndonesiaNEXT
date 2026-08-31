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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5; // Maksimal 5 riwayat per tampilan halaman

  const filterTabs: { key: string; label: string; activeColor: string }[] = [
    { key: "all", label: "Semua", activeColor: "bg-[#006c49]" },
    { key: "cup_plastik", label: "Cup Plastik", activeColor: "bg-[#006c49]" },
    { key: "botol_plastik", label: "Botol Plastik", activeColor: "bg-[#006c49]" },
    { key: "tutup_cup", label: "Tutup Cup", activeColor: "bg-[#006c49]" },
  ];

  const handleCategoryChange = (key: string) => {
    setSelectedCategory(key);
    setCurrentPage(1);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedCategory === "all") return true;
      return tx.categoryKey === selectedCategory;
    });
  }, [transactions, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const startRecord = filteredTransactions.length === 0 ? 0 : startIndex + 1;
  const endRecord = Math.min(startIndex + itemsPerPage, filteredTransactions.length);

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
              Riwayat setoran sampah
            </p>
          </div>
        </div>

        {/* 5-Category Filter Tabs - 1 Single Horizontal Row */}
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
      <div className="divide-y divide-[#bbcabf]/20 w-full mt-2 min-h-[300px]">
        {paginatedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center w-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#6c7a71] mb-3">
              <GoogleIcon name="folder_open" size={28} />
            </div>
            <p className="text-sm font-bold text-[#0b1c30]">
              Belum ada transaksi di kategori ini
            </p>
            <p className="text-xs text-[#3c4a42] mt-1">
              Pilih filter lain atau lakukan setoran sampah baru.
            </p>
          </div>
        ) : (
          paginatedTransactions.map((tx) => {
            const categoryInfo =
              WASTE_CATEGORIES[tx.categoryKey] || WASTE_CATEGORIES.botol_plastik;

            return (
              <div
                key={tx.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-3.5 transition-all rounded-2xl hover:bg-[#f8f9ff] w-full"
              >
                {/* Left: Icon & Material Information */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shadow-2xs"
                    style={{
                      backgroundColor: categoryInfo.bgColor,
                      color: categoryInfo.color,
                      border: `1px solid ${categoryInfo.borderColor}`,
                    }}
                  >
                    <GoogleIcon name={categoryInfo.icon} size={22} />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm sm:text-base font-bold text-[#0b1c30] truncate">
                        {tx.material}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#006c49] bg-[#eff4ff] border border-[#adedd3] px-2 py-0.5 rounded-md">
                        {tx.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-[#3c4a42] flex-wrap">
                      <span>{tx.date}</span>
                      <span className="text-[#bbcabf]">•</span>
                      <span className="font-bold text-[#0b1c30] bg-[#f8f9ff] px-2 py-0.5 rounded border border-[#bbcabf]/30">
                        {formatWeight(tx.weightKg)}
                      </span>
                      <span className="text-[#bbcabf]">•</span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#306d58] font-medium bg-[#eff4ff] px-2.5 py-0.5 rounded-md">
                        <GoogleIcon
                          name={tx.method === "drop_point" ? "storefront" : "local_shipping"}
                          size={13}
                        />
                        {tx.method === "drop_point" ? "Drop Point" : "Dijemput (Pickup)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Points Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-2xs ${
                      tx.status === "confirmed"
                        ? "bg-[#eff4ff] text-[#006c49] border border-[#adedd3]"
                        : tx.status === "pending"
                        ? "bg-[#fff8e1] text-[#92400e] border border-[#fde68a]"
                        : "bg-[#ffe4e8] text-[#f43f5e] border border-[#f43f5e]/30"
                    }`}
                  >
                    <GoogleIcon
                      name={tx.status === "confirmed" ? "check_circle" : tx.status === "pending" ? "schedule" : "cancel"}
                      size={14}
                      filled
                    />
                    <span>
                      {tx.status === "confirmed"
                        ? "Terverifikasi"
                        : tx.status === "pending"
                        ? "Menunggu Timbang"
                        : "Ditolak"}
                    </span>
                  </span>

                  <div className="flex items-center gap-1.5 font-black text-[#92400e] bg-gradient-to-br from-[#ffffff] to-[#fef3c7] px-3 py-1.5 rounded-xl border border-[#fde68a] shadow-2xs">
                    <span className="text-sm sm:text-base">+{tx.coins}</span>
                    <GoogleIcon
                      name="monetization_on"
                      size={17}
                      filled
                      className="text-[#d97706]"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar (Max 5 items per page) */}
      <div className="mt-5 pt-4 border-t border-[#bbcabf]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm w-full">
        <span className="text-[#3c4a42]">
          Menampilkan <strong className="text-[#0b1c30]">{startRecord} - {endRecord}</strong> dari <strong className="text-[#0b1c30]">{filteredTransactions.length}</strong> transaksi
        </span>

        <div className="flex items-center gap-3">
          {/* Pagination Buttons if more than 1 page */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#bbcabf]/40 bg-white text-[#3c4a42] hover:bg-[#eff4ff] hover:text-[#006c49] disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Halaman Sebelumnya"
              >
                <GoogleIcon name="chevron_left" size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-bold transition ${
                    currentPage === pg
                      ? "bg-[#006c49] text-white shadow-xs"
                      : "border border-[#bbcabf]/40 bg-white text-[#3c4a42] hover:bg-[#eff4ff]"
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#bbcabf]/40 bg-white text-[#3c4a42] hover:bg-[#eff4ff] hover:text-[#006c49] disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Halaman Berikutnya"
              >
                <GoogleIcon name="chevron_right" size={18} />
              </button>
            </div>
          )}

          <Link
            href="/dashboard/riwayat"
            className="font-bold text-[#006c49] hover:underline flex items-center gap-1 ml-2"
          >
            <span>Lihat Riwayat Lengkap</span>
            <GoogleIcon name="arrow_forward" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
