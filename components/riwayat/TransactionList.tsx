"use client";

import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { TransactionDetail } from "@/types/transaction";
import { TransactionItemCard } from "./TransactionItemCard";
import { TransactionPagination } from "./TransactionPagination";

interface TransactionListProps {
  transactions: TransactionDetail[];
  totalFiltered: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onOpenDetail: (tx: TransactionDetail) => void;
  onResetFilters: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  totalFiltered,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onNextPage,
  onPrevPage,
  onOpenDetail,
  onResetFilters,
}) => {
  if (totalFiltered === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[#bbcabf] bg-white text-center w-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#6c7a71] mb-4">
          <GoogleIcon name="manage_search" size={32} />
        </div>
        <h3 className="text-base font-bold text-[#0b1c30]">
          Tidak Ada Transaksi yang Cocok
        </h3>
        <p className="text-xs sm:text-sm text-[#3c4a42] mt-1 max-w-sm">
          Coba ganti kata kunci pencarian atau setel ulang filter untuk melihat transaksi lainnya.
        </p>
        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors"
          >
            Reset Filter
          </button>
          <Link
            href="/dashboard/setor"
            className="px-4 py-2 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#2b6954] transition-colors inline-flex items-center gap-1.5"
          >
            <GoogleIcon name="add" size={16} />
            <span>Setor Sampah Baru</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 5 Transaction Cards for Current Page */}
      {transactions.map((tx) => (
        <TransactionItemCard
          key={tx.id}
          transaction={tx}
          onOpenDetail={onOpenDetail}
        />
      ))}

      {/* Pagination Controls */}
      <TransactionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalFiltered={totalFiltered}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
      />
    </div>
  );
};
