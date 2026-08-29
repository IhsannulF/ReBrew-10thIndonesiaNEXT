"use client";

import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { TransactionSummaryCards } from "@/components/riwayat/TransactionSummaryCards";
import { TransactionFilters } from "@/components/riwayat/TransactionFilters";
import { TransactionList } from "@/components/riwayat/TransactionList";
import { TransactionDetailModal } from "@/components/riwayat/TransactionDetailModal";

export default function RiwayatTransaksiPage() {
  const {
    filteredTransactions,
    paginatedTransactions,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    filters,
    summaryStats,
    selectedTransaction,
    isDetailModalOpen,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    setMethodFilter,
    setSortBy,
    resetFilters,
    openDetailModal,
    closeDetailModal,
    transactions,
  } = useTransactionHistory(undefined, 5); // Maksimal 5 riwayat per halaman

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#006c49] mb-1">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#6c7a71]">Riwayat Transaksi</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
            Riwayat Setoran & Tiket Daur Ulang
          </h1>
          <p className="text-sm text-[#3c4a42] mt-0.5">
            Pantau seluruh log transaksi setor sampah, penimbangan fisik, dan mutasi perolehan poin.
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/setor"
            className="flex items-center gap-2 bg-[#006c49] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-[#2b6954] transition-all"
          >
            <GoogleIcon name="add" size={18} />
            <span>Setor Sampah Baru</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Metrik Cards */}
      <TransactionSummaryCards stats={summaryStats} />

      {/* Filter Controls (Search, Categories, Status, Sorting) */}
      <TransactionFilters
        filters={filters}
        setSearchQuery={setSearchQuery}
        setStatusFilter={setStatusFilter}
        setCategoryFilter={setCategoryFilter}
        setMethodFilter={setMethodFilter}
        setSortBy={setSortBy}
        resetFilters={resetFilters}
        totalFiltered={filteredTransactions.length}
        totalOriginal={transactions.length}
      />

      {/* Transaction List with 5 Items per Page & Pagination Controls */}
      <TransactionList
        transactions={paginatedTransactions}
        totalFiltered={filteredTransactions.length}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onNextPage={goToNextPage}
        onPrevPage={goToPrevPage}
        onOpenDetail={openDetailModal}
        onResetFilters={resetFilters}
      />

      {/* Detail & QR Ticket Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
}
